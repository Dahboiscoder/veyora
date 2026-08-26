import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { CAN_LIST_ROLES } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { getStripe, SUBSCRIPTION_PLANS } from "@/lib/payments/stripe";
import { env } from "@/lib/env";

const schema = z.object({ plan: z.enum(["PRO", "BUSINESS"]) });

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser(CAN_LIST_ROLES);
  const { plan } = schema.parse(await req.json());
  const planConfig = SUBSCRIPTION_PLANS[plan];

  const existing = await prisma.subscription.findFirst({
    where: user.companyId ? { companyId: user.companyId } : { userId: user.id },
  });
  if (existing?.plan === plan && existing.status === "ACTIVE") {
    return jsonError(`You're already on the ${planConfig.label} plan`, 409);
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: planConfig.monthlyUsd,
      currencyCode: "USD",
      purpose: user.companyId ? "COMPANY_SUBSCRIPTION" : "AGENT_SUBSCRIPTION",
      status: "PENDING",
      metadata: { plan, companyId: user.companyId },
    },
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      planConfig.priceId
        ? { price: planConfig.priceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: planConfig.monthlyUsd * 100,
              recurring: { interval: "month" },
              product_data: { name: `VEYORA ${planConfig.label} plan` },
            },
            quantity: 1,
          },
    ],
    metadata: { paymentId: payment.id, plan, userId: user.id, companyId: user.companyId ?? "" },
    success_url: `${env.appUrl}/dashboard/billing?upgraded=1`,
    cancel_url: `${env.appUrl}/pricing`,
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: session.id } });

  return NextResponse.json({ url: session.url });
});

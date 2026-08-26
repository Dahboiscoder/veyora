import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nyumba/db";
import { CAN_LIST_ROLES } from "@nyumba/shared";
import { requireUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";
import { canManageProperty } from "@/lib/properties/getProperty";
import { getStripe, FEATURED_LISTING_USD_PER_DAY } from "@/lib/payments/stripe";
import { env } from "@/lib/env";

const schema = z.object({
  propertyId: z.string(),
  days: z.number().int().min(3).max(60).default(7),
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser(CAN_LIST_ROLES);
  const { propertyId, days } = schema.parse(await req.json());

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return jsonError("Property not found", 404);
  if (!canManageProperty(property, user)) return jsonError("You cannot promote this property", 403);

  const amount = days * FEATURED_LISTING_USD_PER_DAY;

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount,
      currencyCode: "USD",
      purpose: "FEATURED_LISTING",
      status: "PENDING",
      metadata: { propertyId, days },
    },
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount * 100,
          product_data: { name: `Featured listing — ${property.title} (${days} days)` },
        },
        quantity: 1,
      },
    ],
    metadata: { paymentId: payment.id, propertyId, days: String(days) },
    success_url: `${env.appUrl}/dashboard/properties/${propertyId}/edit?promoted=1`,
    cancel_url: `${env.appUrl}/dashboard/properties/${propertyId}/edit`,
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: session.id } });

  return NextResponse.json({ url: session.url });
});

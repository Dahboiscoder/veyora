import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@nyumba/db";
import { getStripe, isPaymentsConfigured } from "@/lib/payments/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const paymentId = session.metadata?.paymentId;
  if (!paymentId) return;

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "SUCCEEDED" },
  });

  if (session.mode === "payment" && session.metadata?.propertyId) {
    const days = Number(session.metadata.days ?? 7);
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.featuredListing.create({
      data: { propertyId: session.metadata.propertyId, paymentId: payment.id, startAt, endAt },
    });
    await prisma.property.update({
      where: { id: session.metadata.propertyId },
      data: { isFeatured: true, featuredUntil: endAt },
    });
  }

  if (session.mode === "subscription" && session.metadata?.plan) {
    const plan = session.metadata.plan as "PRO" | "BUSINESS";
    const companyId = session.metadata.companyId || null;
    const userId = session.metadata.userId ?? payment.userId;

    await prisma.subscription.upsert({
      where: companyId ? { companyId } : { userId },
      create: {
        userId: companyId ? undefined : userId,
        companyId: companyId ?? undefined,
        plan,
        status: "ACTIVE",
        provider: "stripe",
        providerRef: typeof session.subscription === "string" ? session.subscription : undefined,
        lastPaymentId: payment.id,
      },
      update: {
        plan,
        status: "ACTIVE",
        providerRef: typeof session.subscription === "string" ? session.subscription : undefined,
        lastPaymentId: payment.id,
      },
    });
  }
}

export async function POST(req: Request) {
  if (!isPaymentsConfigured()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    console.error("[stripe webhook] handler failed", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

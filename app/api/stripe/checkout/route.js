import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // Get user from Supabase auth header
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Get or create Stripe customer
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabaseAdmin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=1`,
    locale: "fr",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
  });

  return Response.json({ url: session.url });
}

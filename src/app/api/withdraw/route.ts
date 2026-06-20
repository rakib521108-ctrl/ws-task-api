import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MIN_WITHDRAW_AMOUNT } from "@/lib/constants";

const VALID_METHODS = ["usdt", "bank", "mobile_banking"];
const VALID_NETWORKS = ["TRC20", "ERC20", "BEP20", "Polygon", "Arbitrum"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    usdt_address,
    amount,
    withdraw_method = "usdt",
    usdt_network = "TRC20",
  } = await request.json();

  if (!usdt_address || !amount || amount <= 0) {
    return NextResponse.json(
      { error: "Valid address and amount required" },
      { status: 400 }
    );
  }

  if (amount < MIN_WITHDRAW_AMOUNT) {
    return NextResponse.json(
      { error: "Minimum withdrawal amount is $10" },
      { status: 400 }
    );
  }

  if (!VALID_METHODS.includes(withdraw_method)) {
    return NextResponse.json({ error: "Invalid withdraw method" }, { status: 400 });
  }

  if (withdraw_method === "usdt" && !VALID_NETWORKS.includes(usdt_network)) {
    return NextResponse.json({ error: "Invalid USDT network" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("total_balance")
    .eq("id", user.id)
    .single();

  if (!profile || Number(profile.total_balance) < amount) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("withdraw_requests")
    .insert({
      user_id: user.id,
      usdt_address,
      amount,
      withdraw_method,
      usdt_network: withdraw_method === "usdt" ? usdt_network : "TRC20",
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

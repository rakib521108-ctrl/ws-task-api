import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("withdraw_requests")
    .select("*, users(username, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id, status, admin_note } = await request.json();

  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("withdraw_requests")
    .select("id, user_id, amount, status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
  }

  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "This request has already been processed" },
      { status: 400 }
    );
  }

  if (status === "approved") {
    const { data: userProfile } = await admin
      .from("users")
      .select("total_balance")
      .eq("id", existing.user_id)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (Number(userProfile.total_balance) < Number(existing.amount)) {
      return NextResponse.json(
        { error: "Insufficient user balance" },
        { status: 400 }
      );
    }

    await admin
      .from("users")
      .update({
        total_balance:
          Number(userProfile.total_balance) - Number(existing.amount),
        last_update_time: new Date().toISOString(),
      })
      .eq("id", existing.user_id);
  }

  const { data, error } = await admin
    .from("withdraw_requests")
    .update({
      status,
      admin_note: admin_note || "",
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

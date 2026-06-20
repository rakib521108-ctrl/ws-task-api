import { createAdminClient } from "@/lib/supabase/admin";

interface UserRow {
  username: string;
  api_key: string;
  status: string;
  lifetime_registration: number;
  lifetime_valid_users: number;
  lifetime_sms_sent: number;
  lifetime_income: number;
  total_balance: number;
  today_registration: number;
  today_valid_users: number;
  today_sms_sent: number;
  today_income: number;
}

export interface IncrementalUpdateInput {
  username?: string;
  api_key?: string;
  status?: string;
  add_registration?: number;
  add_valid_users?: number;
  add_sms_sent?: number;
  add_income?: number;
}

export async function applyIncrementalUserUpdate(
  userId: string,
  input: IncrementalUpdateInput
) {
  const admin = createAdminClient();

  const { data: current, error: fetchError } = await admin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !current) {
    return { error: fetchError?.message || "User not found", status: 404 };
  }

  const user = current as UserRow;
  const addReg = Number(input.add_registration) || 0;
  const addValid = Number(input.add_valid_users) || 0;
  const addSms = Number(input.add_sms_sent) || 0;
  const addIncome = Number(input.add_income) || 0;

  const statsChanged =
    addReg !== 0 || addValid !== 0 || addSms !== 0 || addIncome !== 0;

  const updates: Record<string, unknown> = {};

  if (input.username !== undefined) updates.username = input.username;
  if (input.api_key !== undefined) updates.api_key = input.api_key;
  if (input.status !== undefined) updates.status = input.status;

  if (statsChanged) {
    updates.lifetime_registration = user.lifetime_registration + addReg;
    updates.lifetime_valid_users = user.lifetime_valid_users + addValid;
    updates.lifetime_sms_sent = user.lifetime_sms_sent + addSms;
    updates.lifetime_income = Number(user.lifetime_income) + addIncome;
    updates.today_registration = user.today_registration + addReg;
    updates.today_valid_users = user.today_valid_users + addValid;
    updates.today_sms_sent = user.today_sms_sent + addSms;
    updates.today_income = Number(user.today_income) + addIncome;
    updates.total_balance = Number(user.total_balance) + addIncome;
    updates.last_update_time = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return { data: current };
  }

  const { data, error } = await admin
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return { error: error.message, status: 500 };
  }

  const today = new Date().toISOString().split("T")[0];

  if (statsChanged) {
    const { data: existingDaily } = await admin
      .from("history")
      .select("id")
      .eq("user_id", userId)
      .eq("record_date", today)
      .eq("record_type", "daily")
      .maybeSingle();

    const dailyPayload = {
      user_id: userId,
      record_date: today,
      record_type: "daily" as const,
      today_registration: data.today_registration,
      today_valid_users: data.today_valid_users,
      today_sms_sent: data.today_sms_sent,
      today_income: data.today_income,
      added_income: 0,
    };

    if (existingDaily) {
      await admin.from("history").update(dailyPayload).eq("id", existingDaily.id);
    } else {
      await admin.from("history").insert(dailyPayload);
    }
  }

  if (addIncome > 0) {
    await admin.from("history").insert({
      user_id: userId,
      record_date: today,
      record_type: "income_add",
      added_income: addIncome,
      balance_after: data.total_balance,
      today_registration: 0,
      today_valid_users: 0,
      today_sms_sent: 0,
      today_income: 0,
    });
  }

  return { data };
}

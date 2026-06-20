export type UserRole = "admin" | "user";
export type WithdrawStatus = "pending" | "approved" | "rejected";
export type UserStatus = "active" | "inactive" | "suspended";
export type WithdrawMethod = "usdt" | "bank" | "mobile_banking";
export type UsdtNetwork = "TRC20" | "ERC20" | "BEP20" | "Polygon" | "Arbitrum";
export type HistoryRecordType = "daily" | "income_add";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  api_key: string;
  status: UserStatus;
  lifetime_registration: number;
  lifetime_valid_users: number;
  lifetime_sms_sent: number;
  lifetime_income: number;
  total_balance: number;
  today_registration: number;
  today_valid_users: number;
  today_sms_sent: number;
  today_income: number;
  last_update_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  record_date: string;
  record_type: HistoryRecordType;
  today_registration: number;
  today_valid_users: number;
  today_sms_sent: number;
  today_income: number;
  added_income: number;
  balance_after: number | null;
  created_at: string;
}

export interface WithdrawRequest {
  id: string;
  user_id: string;
  usdt_address: string;
  amount: number;
  withdraw_method: WithdrawMethod;
  usdt_network: UsdtNetwork;
  status: WithdrawStatus;
  admin_note: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  users?: Pick<User, "username" | "email">;
}

export interface IncrementalUserUpdate {
  username?: string;
  api_key?: string;
  status?: UserStatus;
  add_registration?: number;
  add_valid_users?: number;
  add_sms_sent?: number;
  add_income?: number;
}

export interface WithdrawPayload {
  usdt_address: string;
  amount: number;
  withdraw_method: WithdrawMethod;
  usdt_network: UsdtNetwork;
}

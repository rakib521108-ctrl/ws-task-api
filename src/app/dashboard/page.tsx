import { createClient } from "@/lib/supabase/server";
import DashboardSection from "@/components/DashboardSection";
import TodayStatTile from "@/components/TodayStatTile";
import StatsChart from "@/components/StatsChart";
import StatusBadge from "@/components/StatusBadge";
import WithdrawSection from "@/components/WithdrawSection";
import { HistoryRecord } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";
import {
  UserCheck,
  MessageSquare,
  DollarSign,
  Wallet,
  User as UserIcon,
  Key,
} from "lucide-react";

function groupHistoryByMonth(history: HistoryRecord[]) {
  const daily = history.filter((h) => h.record_type === "daily");
  const months = new Map<
    string,
    { name: string; income: number; registrations: number }
  >();

  for (const h of daily) {
    const date = new Date(h.record_date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const name = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    const existing = months.get(key) || { name, income: 0, registrations: 0 };
    existing.income += Number(h.today_income);
    existing.registrations += h.today_registration;
    months.set(key, existing);
  }

  return Array.from(months.values());
}

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: history } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", user!.id)
    .order("record_date", { ascending: false })
    .limit(90);

  const { data: withdraws } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!profile) return null;

  const monthlyChartData = groupHistoryByMonth(history || []);
  const chartData =
    monthlyChartData.length > 0
      ? monthlyChartData
      : [
          {
            name: "Current",
            income: Number(profile.today_income),
            registrations: profile.today_registration,
          },
        ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="dashboard-header animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 glow-purple">
            <UserIcon className="h-6 w-6 text-accent-light" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{APP_NAME}</p>
            <p className="text-xl font-bold text-white">{profile.username}</p>
          </div>
        </div>
      </div>

      {profile.api_key && (
        <div className="glass-card px-5 py-4 glow-blue">
          <div className="mb-2 flex items-center gap-2">
            <Key className="h-4 w-4 text-accent-light" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              API Key
            </p>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
            {profile.api_key}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TodayStatTile
          label="Today's Registrations"
          value={profile.today_registration}
          icon={UserCheck}
          delay={0}
        />
        <TodayStatTile
          label="Today's Valid Users"
          value={profile.today_valid_users}
          icon={UserCheck}
          delay={100}
        />
        <TodayStatTile
          label="Today's SMS Sent"
          value={profile.today_sms_sent}
          icon={MessageSquare}
          delay={200}
        />
        <TodayStatTile
          label="Today's Income"
          value={formatCurrency(Number(profile.today_income))}
          icon={DollarSign}
          delay={300}
        />
      </div>

      <div className="balance-hero glow-purple">
        <div className="relative">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 border border-accent/30">
            <Wallet className="h-7 w-7 text-accent-light" />
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
            Current Balance
          </p>
          <p className="mt-2 text-4xl font-bold text-gradient sm:text-5xl">
            {formatCurrency(Number(profile.balance))}
          </p>
          {profile.last_update_time && (
            <p className="mt-3 text-xs text-gray-500">
              Updated {formatDateTime(profile.last_update_time)}
            </p>
          )}
        </div>
      </div>

      <DashboardSection title="Monthly Statistics">
        <StatsChart
          data={chartData}
          dataKey="income"
          title=""
          color="#818cf8"
        />
      </DashboardSection>

      <DashboardSection title="Withdrawal History" id="history">
        <div className="table-container overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="table-header">Date</th>
                <th className="table-header">Amount</th>
                <th className="table-header">USDT Address</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {(withdraws || []).map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-glass-border/50 hover:bg-glass-50"
                >
                  <td className="table-cell">{formatDate(w.created_at)}</td>
                  <td className="table-cell font-medium text-white">
                    {formatCurrency(Number(w.amount))}
                  </td>
                  <td className="table-cell font-mono text-xs">
                    {w.usdt_address.slice(0, 16)}...
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={w.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!withdraws || withdraws.length === 0) && (
            <p className="py-10 text-center text-sm text-gray-500">
              No withdrawal history yet
            </p>
          )}
        </div>
      </DashboardSection>

      <DashboardSection title="Withdraw" id="withdraw">
        <WithdrawSection initialBalance={Number(profile.balance)} />
      </DashboardSection>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import DashboardSection from "@/components/DashboardSection";
import AnalyticsMetricGroup from "@/components/AnalyticsMetricGroup";
import AnalyticsMetricCard from "@/components/AnalyticsMetricCard";
import ComparisonStat from "@/components/ComparisonStat";
import StatsChart from "@/components/StatsChart";
import StatusBadge from "@/components/StatusBadge";
import WithdrawSection from "@/components/WithdrawSection";
import { computeDashboardAnalytics } from "@/lib/analytics";
import { APP_NAME } from "@/lib/constants";
import HistoryTable from "@/components/HistoryTable";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "@/lib/utils";
import type { IncomeHistory, SmsHistory, WithdrawHistory } from "@/lib/types";
import {
  MessageSquare,
  UserCheck,
  DollarSign,
  Wallet,
  User as UserIcon,
  Key,
  ArrowDownCircle,
  Hourglass,
} from "lucide-react";

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
    .eq("record_type", "daily")
    .order("record_date", { ascending: true })
    .limit(400);

  const { data: withdraws } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: smsHistory } = await supabase
    .from("sms_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: incomeHistory } = await supabase
    .from("income_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: withdrawHistory } = await supabase
    .from("withdraw_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  if (!profile) return null;

  const smsRows = (smsHistory || []) as SmsHistory[];
  const incomeRows = (incomeHistory || []) as IncomeHistory[];
  const withdrawRows = (withdrawHistory || []) as WithdrawHistory[];

  const analytics = computeDashboardAnalytics(profile, history || [], withdraws || []);

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      {/* Header */}
      <div className="dashboard-header animate-fade-in glow-purple">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
            <UserIcon className="h-6 w-6 text-accent-light" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{APP_NAME} Analytics</p>
            <p className="text-xl font-bold text-white">{profile.username}</p>
          </div>
        </div>
        {profile.last_update_time && (
          <p className="text-xs text-gray-500">
            Last sync {formatDateTime(profile.last_update_time)}
          </p>
        )}
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

      {/* SMS Analytics */}
      <AnalyticsMetricGroup
        title="SMS Analytics"
        icon={MessageSquare}
        metrics={[
          { label: "Total SMS Sent", value: analytics.sms.total.toLocaleString(), icon: MessageSquare, accent: "purple" },
          { label: "SMS Today", value: analytics.sms.today.toLocaleString(), icon: MessageSquare, accent: "blue" },
          { label: "SMS This Week", value: analytics.sms.week.toLocaleString(), icon: MessageSquare, accent: "violet" },
          { label: "SMS This Month", value: analytics.sms.month.toLocaleString(), icon: MessageSquare, accent: "purple" },
          { label: "SMS This Year", value: analytics.sms.year.toLocaleString(), icon: MessageSquare, accent: "blue" },
        ]}
      />

      {/* Valid Users Analytics */}
      <AnalyticsMetricGroup
        title="Valid Users Analytics"
        icon={UserCheck}
        metrics={[
          { label: "Total Valid Users", value: analytics.users.total.toLocaleString(), icon: UserCheck, accent: "purple" },
          { label: "Users Today", value: analytics.users.today.toLocaleString(), icon: UserCheck, accent: "blue" },
          { label: "Users This Week", value: analytics.users.week.toLocaleString(), icon: UserCheck, accent: "violet" },
          { label: "Users This Month", value: analytics.users.month.toLocaleString(), icon: UserCheck, accent: "purple" },
          { label: "Users This Year", value: analytics.users.year.toLocaleString(), icon: UserCheck, accent: "blue" },
        ]}
      />

      {/* Income Analytics */}
      <AnalyticsMetricGroup
        title="Income Analytics"
        icon={DollarSign}
        metrics={[
          { label: "Total Income", value: formatCurrency(analytics.income.total), icon: DollarSign, accent: "emerald" },
          { label: "Income Today", value: formatCurrency(analytics.income.today), icon: DollarSign, accent: "purple" },
          { label: "Income This Week", value: formatCurrency(analytics.income.week), icon: DollarSign, accent: "blue" },
          { label: "Income This Month", value: formatCurrency(analytics.income.month), icon: DollarSign, accent: "violet" },
          { label: "Income This Year", value: formatCurrency(analytics.income.year), icon: DollarSign, accent: "emerald" },
        ]}
      />

      {/* Balance & Withdrawals */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent-light" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Balance & Withdrawals
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AnalyticsMetricCard
            label="Current Balance"
            value={formatCurrency(analytics.balance.current)}
            icon={Wallet}
            accent="emerald"
          />
          <AnalyticsMetricCard
            label="Total Withdrawn"
            value={formatCurrency(analytics.balance.totalWithdrawn)}
            icon={ArrowDownCircle}
            accent="violet"
          />
          <AnalyticsMetricCard
            label="Pending Withdrawals"
            value={`${formatCurrency(analytics.balance.pendingWithdrawals)} (${analytics.balance.pendingCount})`}
            icon={Hourglass}
            accent="blue"
          />
        </div>
      </section>

      {/* Month-over-Month Comparison */}
      <DashboardSection title="Month vs Month Comparison">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ComparisonStat
            title="SMS — Last Month vs This Month"
            lastMonth={analytics.comparison.sms.lastMonth}
            thisMonth={analytics.comparison.sms.thisMonth}
            changePercent={analytics.comparison.sms.changePercent}
          />
          <ComparisonStat
            title="Valid Users — Last Month vs This Month"
            lastMonth={analytics.comparison.users.lastMonth}
            thisMonth={analytics.comparison.users.thisMonth}
            changePercent={analytics.comparison.users.changePercent}
          />
          <ComparisonStat
            title="Income — Last Month vs This Month"
            lastMonth={analytics.comparison.income.lastMonth}
            thisMonth={analytics.comparison.income.thisMonth}
            changePercent={analytics.comparison.income.changePercent}
            format="currency"
          />
        </div>
      </DashboardSection>

      {/* Charts */}
      <DashboardSection title="Performance Charts">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StatsChart
            data={analytics.charts.dailySms}
            dataKey="sms"
            type="area"
            title="Daily SMS Trend"
            color="#818cf8"
            chartId="daily-sms"
            height={260}
          />
          <StatsChart
            data={analytics.charts.monthlySms}
            dataKey="sms"
            type="bar"
            title="Monthly SMS Trend"
            color="#a78bfa"
            chartId="monthly-sms"
            height={260}
          />
          <StatsChart
            data={analytics.charts.incomeTrend}
            dataKey="income"
            type="area"
            title="Income Trend"
            color="#34d399"
            chartId="income"
            valueFormat="currency"
            height={260}
          />
          <StatsChart
            data={analytics.charts.userGrowth}
            dataKey="validUsers"
            type="line"
            title="User Growth Trend"
            color="#60a5fa"
            chartId="users"
            height={260}
          />
        </div>
      </DashboardSection>

      {/* History Sections */}
      <DashboardSection title="SMS History" id="sms-history">
        <HistoryTable
          rows={smsRows}
          emptyMessage="No SMS history yet"
          columns={[
            {
              key: "date",
              header: "Date",
              render: (row) => formatDate(row.created_at),
            },
            {
              key: "time",
              header: "Time",
              render: (row) => formatTime(row.created_at),
            },
            {
              key: "sms_sent",
              header: "SMS Sent",
              render: (row) => row.sms_sent.toLocaleString(),
              className: "font-medium text-white",
            },
            {
              key: "income",
              header: "Income",
              render: (row) => formatCurrency(Number(row.income)),
              className: "font-medium text-emerald-400",
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Income History" id="income-history">
        <HistoryTable
          rows={incomeRows}
          emptyMessage="No income history yet"
          columns={[
            {
              key: "date",
              header: "Date",
              render: (row) => formatDate(row.created_at),
            },
            {
              key: "time",
              header: "Time",
              render: (row) => formatTime(row.created_at),
            },
            {
              key: "sms_count",
              header: "SMS Count",
              render: (row) => row.sms_count.toLocaleString(),
            },
            {
              key: "amount_added",
              header: "Amount Added",
              render: (row) => formatCurrency(Number(row.amount_added)),
              className: "font-medium text-emerald-400",
            },
            {
              key: "admin_name",
              header: "Admin Name",
              render: (row) => row.admin_name || "—",
            },
            {
              key: "notes",
              header: "Notes",
              render: (row) => (
                <span className="max-w-[200px] truncate block" title={row.notes}>
                  {row.notes || "—"}
                </span>
              ),
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Withdrawal History" id="withdraw-history">
        <HistoryTable
          rows={withdrawRows}
          emptyMessage="No withdrawal history yet"
          columns={[
            {
              key: "date",
              header: "Date",
              render: (row) => formatDate(row.created_at),
            },
            {
              key: "time",
              header: "Time",
              render: (row) => formatTime(row.created_at),
            },
            {
              key: "amount",
              header: "Amount",
              render: (row) => formatCurrency(Number(row.amount)),
              className: "font-medium text-white",
            },
            {
              key: "wallet_address",
              header: "Wallet Address",
              render: (row) => (
                <span className="font-mono text-xs">
                  {row.wallet_address.length > 20
                    ? `${row.wallet_address.slice(0, 16)}...`
                    : row.wallet_address}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "admin_response",
              header: "Admin Response",
              render: (row) => (
                <span className="max-w-[180px] truncate block" title={row.admin_response}>
                  {row.admin_response || "—"}
                </span>
              ),
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection title="Withdraw" id="withdraw">
        <WithdrawSection initialBalance={analytics.balance.current} />
      </DashboardSection>
    </div>
  );
}

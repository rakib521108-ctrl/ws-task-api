import { createAdminClient } from "@/lib/supabase/admin";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import StatsChart from "@/components/StatsChart";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserCheck,
  MessageSquare,
  DollarSign,
  Wallet,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const { data: users } = await admin.from("users").select("*");
  const { data: withdraws } = await admin
    .from("withdraw_requests")
    .select("*")
    .eq("status", "pending");

  const totals = (users || []).reduce(
    (acc, u) => ({
      registrations: acc.registrations + u.lifetime_registration,
      validUsers: acc.validUsers + u.lifetime_valid_users,
      sms: acc.sms + u.lifetime_sms_sent,
      income: acc.income + Number(u.lifetime_income),
      balance: acc.balance + Number(u.total_balance),
    }),
    { registrations: 0, validUsers: 0, sms: 0, income: 0, balance: 0 }
  );

  const chartData = (users || []).slice(0, 7).map((u) => ({
    name: u.username.slice(0, 8),
    income: Number(u.lifetime_income),
    registrations: u.lifetime_registration,
  }));

  return (
    <div>
      <PageHeader
        title="WS Task API — Admin"
        description="Platform overview and pending actions"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Total Users" value={users?.length || 0} icon={Users} delay={0} />
        <StatCard title="Lifetime Registrations" value={totals.registrations} icon={UserCheck} delay={100} />
        <StatCard title="Lifetime Valid Users" value={totals.validUsers} icon={UserCheck} delay={200} />
        <StatCard title="Lifetime SMS Sent" value={totals.sms} icon={MessageSquare} delay={300} />
        <StatCard title="Lifetime Income" value={formatCurrency(totals.income)} icon={DollarSign} delay={400} />
        <StatCard title="Total Balance" value={formatCurrency(totals.balance)} icon={Wallet} delay={500} />
      </div>

      {withdraws && withdraws.length > 0 && (
        <div className="mb-8 glass-card border-amber-400/20 bg-amber-400/5 p-4 glow-blue">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <p className="text-amber-400">
              {withdraws.length} pending withdrawal{withdraws.length > 1 ? "s" : ""}
            </p>
            <Link href="/admin/withdrawals" className="ml-auto text-sm text-accent-light hover:underline">
              Review →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatsChart
          data={chartData}
          dataKey="income"
          title="Lifetime Income by User"
          color="#818cf8"
        />
        <StatsChart
          data={chartData}
          dataKey="registrations"
          type="bar"
          title="Lifetime Registrations by User"
          color="#a78bfa"
        />
      </div>
    </div>
  );
}

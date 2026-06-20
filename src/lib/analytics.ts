import { HistoryRecord, WithdrawRequest } from "@/lib/types";

export interface PeriodMetrics {
  sms: number;
  validUsers: number;
  income: number;
}

export interface DashboardAnalytics {
  sms: {
    total: number;
    today: number;
    week: number;
    month: number;
    year: number;
  };
  users: {
    total: number;
    today: number;
    week: number;
    month: number;
    year: number;
  };
  income: {
    total: number;
    today: number;
    week: number;
    month: number;
    year: number;
  };
  balance: {
    current: number;
    totalWithdrawn: number;
    pendingWithdrawals: number;
    pendingCount: number;
  };
  comparison: {
    sms: { lastMonth: number; thisMonth: number; changePercent: number };
    users: { lastMonth: number; thisMonth: number; changePercent: number };
    income: { lastMonth: number; thisMonth: number; changePercent: number };
  };
  charts: {
    dailySms: { name: string; sms: number }[];
    monthlySms: { name: string; sms: number }[];
    incomeTrend: { name: string; income: number }[];
    userGrowth: { name: string; validUsers: number }[];
  };
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = parseDate(dateStr);
  return d >= start && d <= end;
}

function sumDailyInRange(
  records: HistoryRecord[],
  start: Date,
  end: Date
): PeriodMetrics {
  return records.reduce(
    (acc, r) => {
      if (!isInRange(r.record_date, start, end)) return acc;
      return {
        sms: acc.sms + r.today_sms_sent,
        validUsers: acc.validUsers + r.today_valid_users,
        income: acc.income + Number(r.today_income),
      };
    },
    { sms: 0, validUsers: 0, income: 0 }
  );
}

function sumMonth(records: HistoryRecord[], year: number, month: number): PeriodMetrics {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return sumDailyInRange(records, start, end);
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatDayLabel(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function computeDashboardAnalytics(
  profile: {
    lifetime_sms_sent: number;
    lifetime_valid_users: number;
    lifetime_income: number;
    total_balance: number;
    today_sms_sent: number;
    today_valid_users: number;
    today_income: number;
  },
  history: HistoryRecord[],
  withdraws: WithdrawRequest[]
): DashboardAnalytics {
  const now = new Date();
  const todayEnd = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const daily = history.filter((h) => h.record_type === "daily");
  const sortedDaily = [...daily].sort(
    (a, b) => parseDate(a.record_date).getTime() - parseDate(b.record_date).getTime()
  );

  const weekMetrics = sumDailyInRange(daily, weekStart, todayEnd);
  const monthMetrics = sumDailyInRange(daily, monthStart, todayEnd);
  const yearMetrics = sumDailyInRange(daily, yearStart, todayEnd);

  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
  const lastMonthMetrics = sumMonth(
    daily,
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth()
  );
  const thisMonthMetrics = sumMonth(daily, thisYear, thisMonth);

  const approved = withdraws.filter((w) => w.status === "approved");
  const pending = withdraws.filter((w) => w.status === "pending");

  const last30 = sortedDaily.slice(-30);
  const dailySms = last30.map((r) => ({
    name: formatDayLabel(r.record_date),
    sms: r.today_sms_sent,
  }));

  const monthlyMap = new Map<string, { year: number; month: number; sms: number }>();
  for (const r of sortedDaily) {
    const d = parseDate(r.record_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = monthlyMap.get(key) || {
      year: d.getFullYear(),
      month: d.getMonth(),
      sms: 0,
    };
    existing.sms += r.today_sms_sent;
    monthlyMap.set(key, existing);
  }
  const monthlySms = Array.from(monthlyMap.values())
    .slice(-12)
    .map((m) => ({
      name: formatMonthLabel(m.year, m.month),
      sms: m.sms,
    }));

  const incomeTrend = last30.map((r) => ({
    name: formatDayLabel(r.record_date),
    income: Number(r.today_income),
  }));

  const userGrowth = last30.map((r) => ({
    name: formatDayLabel(r.record_date),
    validUsers: r.today_valid_users,
  }));

  return {
    sms: {
      total: profile.lifetime_sms_sent,
      today: profile.today_sms_sent,
      week: weekMetrics.sms,
      month: monthMetrics.sms,
      year: yearMetrics.sms,
    },
    users: {
      total: profile.lifetime_valid_users,
      today: profile.today_valid_users,
      week: weekMetrics.validUsers,
      month: monthMetrics.validUsers,
      year: yearMetrics.validUsers,
    },
    income: {
      total: Number(profile.lifetime_income),
      today: Number(profile.today_income),
      week: weekMetrics.income,
      month: monthMetrics.income,
      year: yearMetrics.income,
    },
    balance: {
      current: Number(profile.total_balance || 0),
      totalWithdrawn: approved.reduce((s, w) => s + Number(w.amount), 0),
      pendingWithdrawals: pending.reduce((s, w) => s + Number(w.amount), 0),
      pendingCount: pending.length,
    },
    comparison: {
      sms: {
        lastMonth: lastMonthMetrics.sms,
        thisMonth: thisMonthMetrics.sms,
        changePercent: percentChange(thisMonthMetrics.sms, lastMonthMetrics.sms),
      },
      users: {
        lastMonth: lastMonthMetrics.validUsers,
        thisMonth: thisMonthMetrics.validUsers,
        changePercent: percentChange(
          thisMonthMetrics.validUsers,
          lastMonthMetrics.validUsers
        ),
      },
      income: {
        lastMonth: lastMonthMetrics.income,
        thisMonth: thisMonthMetrics.income,
        changePercent: percentChange(thisMonthMetrics.income, lastMonthMetrics.income),
      },
    },
    charts: {
      dailySms: dailySms.length > 0 ? dailySms : [{ name: "Today", sms: profile.today_sms_sent }],
      monthlySms:
        monthlySms.length > 0
          ? monthlySms
          : [{ name: formatMonthLabel(thisYear, thisMonth), sms: profile.today_sms_sent }],
      incomeTrend:
        incomeTrend.length > 0
          ? incomeTrend
          : [{ name: "Today", income: Number(profile.today_income) }],
      userGrowth:
        userGrowth.length > 0
          ? userGrowth
          : [{ name: "Today", validUsers: profile.today_valid_users }],
    },
  };
}

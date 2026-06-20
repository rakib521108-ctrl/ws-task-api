"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { UsdtNetwork, WithdrawMethod, WithdrawRequest } from "@/lib/types";
import { MIN_WITHDRAW_AMOUNT } from "@/lib/constants";
import {
  formatCurrency,
  formatDateTime,
  formatWithdrawMethod,
} from "@/lib/utils";
import { Wallet, Loader2, Send } from "lucide-react";

interface WithdrawSectionProps {
  initialBalance: number;
}

export default function WithdrawSection({ initialBalance }: WithdrawSectionProps) {
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [balance, setBalance] = useState(initialBalance);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    usdt_address: "",
    amount: "",
    withdraw_method: "usdt" as WithdrawMethod,
    usdt_network: "TRC20" as UsdtNetwork,
  });

  async function fetchData() {
    const [withdrawRes, profileRes] = await Promise.all([
      fetch("/api/withdraw"),
      fetch("/api/user/profile"),
    ]);

    const withdrawData = await withdrawRes.json();
    if (Array.isArray(withdrawData)) setWithdraws(withdrawData);

    if (profileRes.ok) {
      const profile = await profileRes.json();
      setBalance(Number(profile.balance));
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      setSubmitting(false);
      return;
    }

    if (amount < MIN_WITHDRAW_AMOUNT) {
      setError("Minimum withdrawal amount is $10");
      setSubmitting(false);
      return;
    }

    if (amount > balance) {
      setError("Amount exceeds your balance");
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usdt_address: form.usdt_address,
        amount,
        withdraw_method: form.withdraw_method,
        usdt_network: form.usdt_network,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Withdrawal request failed");
      setSubmitting(false);
      return;
    }

    setSuccess("Withdrawal request submitted!");
    setForm({
      usdt_address: "",
      amount: "",
      withdraw_method: "usdt",
      usdt_network: "TRC20",
    });
    setSubmitting(false);
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent-light" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Wallet className="h-4 w-4" />
          Available:{" "}
          <span className="font-semibold text-white">
            {formatCurrency(balance)}
          </span>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Method</label>
            <select
              value={form.withdraw_method}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  withdraw_method: e.target.value as WithdrawMethod,
                }))
              }
              className="glass-input"
            >
              <option value="usdt">USDT</option>
              <option value="bank">Bank Transfer</option>
              <option value="mobile_banking">Mobile Banking</option>
            </select>
          </div>
          {form.withdraw_method === "usdt" && (
            <div>
              <label className="mb-1 block text-sm text-gray-400">Network</label>
              <select
                value={form.usdt_network}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    usdt_network: e.target.value as UsdtNetwork,
                  }))
                }
                className="glass-input"
              >
                <option value="TRC20">TRC20</option>
                <option value="ERC20">ERC20</option>
                <option value="BEP20">BEP20</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">USDT Address</label>
          <input
            type="text"
            value={form.usdt_address}
            onChange={(e) =>
              setForm((f) => ({ ...f, usdt_address: e.target.value }))
            }
            className="glass-input font-mono"
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">
            Amount (USD) — min ${MIN_WITHDRAW_AMOUNT}
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="glass-input"
            required
            min={MIN_WITHDRAW_AMOUNT}
            step="0.01"
            max={balance}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || balance < MIN_WITHDRAW_AMOUNT}
          className="btn-primary w-full"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Withdraw Request
            </>
          )}
        </button>
      </form>

      <div className="glass-card p-6">
        <p className="mb-4 text-sm font-medium text-gray-400">Recent Requests</p>
        {withdraws.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No requests yet</p>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-y-auto">
            {withdraws.slice(0, 5).map((w) => (
              <div
                key={w.id}
                className="rounded-xl border border-glass-border bg-glass-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {formatCurrency(Number(w.amount))}
                  </span>
                  <StatusBadge status={w.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {w.usdt_address.slice(0, 18)}...
                </p>
                <p className="text-xs text-gray-600">
                  {formatDateTime(w.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

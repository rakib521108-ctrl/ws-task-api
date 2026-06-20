"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import { WithdrawRequest } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Check, X, Loader2 } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionModal, setActionModal] = useState<{
    withdraw: WithdrawRequest;
    action: "approved" | "rejected";
  } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchWithdraws() {
    const res = await fetch("/api/admin/withdrawals");
    const data = await res.json();
    if (Array.isArray(data)) setWithdraws(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchWithdraws();
  }, []);

  async function handleAction() {
    if (!actionModal) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/admin/withdrawals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: actionModal.withdraw.id,
        status: actionModal.action,
        admin_note: adminNote,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Action failed");
      setSubmitting(false);
      return;
    }

    setActionModal(null);
    setAdminNote("");
    setSubmitting(false);
    fetchWithdraws();
  }

  const filtered = withdraws.filter(
    (w) => filter === "all" || w.status === filter
  );

  if (loading) return <LoadingSpinner message="Loading withdrawals..." />;

  return (
    <div>
      <PageHeader
        title="Withdraw Request Management"
        description="WS Task API — approve or reject payout requests"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm capitalize transition-all ${
              filter === f
                ? "bg-accent/20 text-accent-light border border-accent/30"
                : "bg-glass-100 text-gray-400 border border-glass-border hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="table-container overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="table-header">User</th>
              <th className="table-header">Amount</th>
              <th className="table-header">USDT Address</th>
              <th className="table-header">Date</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr
                key={w.id}
                className="border-b border-glass-border/50 transition-colors hover:bg-glass-50"
              >
                <td className="table-cell font-medium text-white">
                  {w.users?.username || "—"}
                </td>
                <td className="table-cell font-semibold text-white">
                  {formatCurrency(Number(w.amount))}
                </td>
                <td className="table-cell font-mono text-xs">
                  {w.usdt_address.slice(0, 14)}...{w.usdt_address.slice(-6)}
                </td>
                <td className="table-cell text-xs">
                  {formatDateTime(w.created_at)}
                </td>
                <td className="table-cell">
                  <StatusBadge status={w.status} />
                </td>
                <td className="table-cell">
                  {w.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActionModal({ withdraw: w, action: "approved" });
                          setAdminNote("");
                          setError("");
                        }}
                        className="btn-success"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setActionModal({ withdraw: w, action: "rejected" });
                          setAdminNote("");
                          setError("");
                        }}
                        className="btn-danger"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-gray-500">No withdrawal requests</p>
        )}
      </div>

      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={
          actionModal?.action === "approved" ? "Approve Withdrawal" : "Reject Withdrawal"
        }
      >
        {actionModal && (
          <div className="space-y-4">
            <div className="glass-card bg-glass-50 p-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-400">User: </span>
                <span className="text-white">{actionModal.withdraw.users?.username}</span>
              </p>
              <p>
                <span className="text-gray-400">Amount: </span>
                <span className="text-white">
                  {formatCurrency(Number(actionModal.withdraw.amount))}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Address: </span>
                <span className="font-mono text-xs text-white break-all">
                  {actionModal.withdraw.usdt_address}
                </span>
              </p>
              {actionModal.action === "approved" && (
                <p className="text-xs text-amber-400">
                  Balance will be deducted automatically on approval.
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-400">Admin note (optional)</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="glass-input min-h-[80px]"
                placeholder="Transaction reference..."
              />
            </div>

            <button
              onClick={handleAction}
              disabled={submitting}
              className={
                actionModal.action === "approved" ? "btn-success w-full" : "btn-danger w-full"
              }
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : actionModal.action === "approved" ? (
                "Confirm Approval"
              ) : (
                "Confirm Rejection"
              )}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

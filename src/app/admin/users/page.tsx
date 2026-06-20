"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User, UserStatus } from "@/lib/types";
import { formatCurrency, formatDateTime, getUserStatusColor } from "@/lib/utils";
import { Plus, Pencil, Trash2, KeyRound, Loader2 } from "lucide-react";

const defaultCreateForm = {
  email: "",
  username: "",
  password: "",
  role: "user" as "admin" | "user",
  api_key: "",
};

const defaultEditForm = {
  username: "",
  api_key: "",
  status: "active" as UserStatus,
  add_registration: "",
  add_valid_users: "",
  add_sms_sent: "",
  add_income: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "reset" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [newPassword, setNewPassword] = useState("");

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openCreate() {
    setCreateForm(defaultCreateForm);
    setFormError("");
    setModal("create");
  }

  function openEdit(user: User) {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      api_key: user.api_key,
      status: user.status,
      add_registration: "",
      add_valid_users: "",
      add_sms_sent: "",
      add_income: "",
    });
    setFormError("");
    setModal("edit");
  }

  function openReset(user: User) {
    setSelectedUser(user);
    setNewPassword("");
    setFormError("");
    setModal("reset");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || "Failed to create user");
      setSubmitting(false);
      return;
    }

    setModal(null);
    setSubmitting(false);
    fetchUsers();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setFormError("");

    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: editForm.username,
        api_key: editForm.api_key,
        status: editForm.status,
        add_registration: editForm.add_registration
          ? Number(editForm.add_registration)
          : 0,
        add_valid_users: editForm.add_valid_users
          ? Number(editForm.add_valid_users)
          : 0,
        add_sms_sent: editForm.add_sms_sent ? Number(editForm.add_sms_sent) : 0,
        add_income: editForm.add_income ? Number(editForm.add_income) : 0,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || "Failed to update user");
      setSubmitting(false);
      return;
    }

    setModal(null);
    setSubmitting(false);
    fetchUsers();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setFormError("");

    const res = await fetch(
      `/api/admin/users/${selectedUser.id}/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      setFormError(data.error || "Failed to reset password");
      setSubmitting(false);
      return;
    }

    setModal(null);
    setSubmitting(false);
  }

  async function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  }

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div>
      <PageHeader
        title="User Management"
        description="WS Task API — incremental stat updates & add income"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-5 w-5" />
            Create User
          </button>
        }
      />

      <div className="table-container overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="table-header">User</th>
              <th className="table-header">Status</th>
              <th className="table-header">Today Reg</th>
              <th className="table-header">Balance</th>
              <th className="table-header">Lifetime Reg</th>
              <th className="table-header">Lifetime SMS</th>
              <th className="table-header">Lifetime Income</th>
              <th className="table-header">Last Update</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-glass-border/50 hover:bg-glass-50"
              >
                <td className="table-cell">
                  <p className="font-medium text-white">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="table-cell">
                  <span className={`badge ${getUserStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="table-cell">{user.today_registration}</td>
                <td className="table-cell font-medium text-white">
                  {formatCurrency(Number(user.total_balance || 0))}
                </td>
                <td className="table-cell">{user.lifetime_registration}</td>
                <td className="table-cell">{user.lifetime_sms_sent}</td>
                <td className="table-cell">
                  {formatCurrency(Number(user.lifetime_income))}
                </td>
                <td className="table-cell text-xs">
                  {user.last_update_time
                    ? formatDateTime(user.last_update_time)
                    : "—"}
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="rounded-lg p-2 text-gray-400 hover:text-accent-light"
                      title="Edit / Add stats"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openReset(user)}
                      className="rounded-lg p-2 text-gray-400 hover:text-amber-400"
                      title="Reset password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal === "create"} onClose={() => setModal(null)} title="Create User" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-400">Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="glass-input"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Username</label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="glass-input"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Password</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="glass-input"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-400">Role</label>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    role: e.target.value as "admin" | "user",
                  })
                }
                className="glass-input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">API Key</label>
            <textarea
              value={createForm.api_key}
              onChange={(e) => setCreateForm({ ...createForm, api_key: e.target.value })}
              className="glass-input min-h-[80px] font-mono"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create User"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={modal === "edit"}
        onClose={() => setModal(null)}
        title={`Update Stats — ${selectedUser?.username}`}
        size="lg"
      >
        {selectedUser && (
          <form onSubmit={handleEdit} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            <div className="glass-card bg-glass-50 p-4 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-gray-500">Current Balance: </span>
                <span className="text-white font-semibold">
                  {formatCurrency(Number(selectedUser.total_balance || 0))}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Lifetime Reg: </span>
                <span className="text-white">{selectedUser.lifetime_registration}</span>
              </p>
              <p>
                <span className="text-gray-500">Lifetime SMS: </span>
                <span className="text-white">{selectedUser.lifetime_sms_sent}</span>
              </p>
              <p>
                <span className="text-gray-500">Lifetime Income: </span>
                <span className="text-white">
                  {formatCurrency(Number(selectedUser.lifetime_income))}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as UserStatus })
                  }
                  className="glass-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">API Key</label>
              <textarea
                value={editForm.api_key}
                onChange={(e) => setEditForm({ ...editForm, api_key: e.target.value })}
                className="glass-input min-h-[80px] font-mono"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Add to existing values (incremental)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Add Registrations</label>
                <input
                  type="number"
                  value={editForm.add_registration}
                  onChange={(e) =>
                    setEditForm({ ...editForm, add_registration: e.target.value })
                  }
                  className="glass-input"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Add Valid Users</label>
                <input
                  type="number"
                  value={editForm.add_valid_users}
                  onChange={(e) =>
                    setEditForm({ ...editForm, add_valid_users: e.target.value })
                  }
                  className="glass-input"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Add SMS Sent</label>
                <input
                  type="number"
                  value={editForm.add_sms_sent}
                  onChange={(e) =>
                    setEditForm({ ...editForm, add_sms_sent: e.target.value })
                  }
                  className="glass-input"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Add Income ($) — adds to balance
                </label>
                <input
                  type="number"
                  value={editForm.add_income}
                  onChange={(e) =>
                    setEditForm({ ...editForm, add_income: e.target.value })
                  }
                  className="glass-input"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply Updates"}
            </button>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={modal === "reset"}
        onClose={() => setModal(null)}
        title={`Reset Password — ${selectedUser?.username}`}
      >
        <form onSubmit={handleReset} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="glass-input"
            required
            minLength={6}
            placeholder="New password"
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

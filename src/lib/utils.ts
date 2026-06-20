import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatWithdrawMethod(method: string): string {
  switch (method) {
    case "usdt":
      return "USDT";
    case "bank":
      return "Bank Transfer";
    case "mobile_banking":
      return "Mobile Banking";
    default:
      return method;
  }
}

export function getUserStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "inactive":
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    case "suspended":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "approved":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "rejected":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    case "completed":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "failed":
      return "text-red-400 bg-red-400/10 border-red-400/20";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
}

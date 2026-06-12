export function formatCurrencyLkr(value) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-LK").format(Number(value || 0));
}

export function statusBadgeClass(status) {
  const normalized = String(status || "").toUpperCase();

  if (["PAID", "SUCCESS", "COMPLETED"].includes(normalized)) {
    return "badge badge-success";
  }

  if (["PENDING", "PROCESSING"].includes(normalized)) {
    return "badge badge-warning";
  }

  if (["CANCELLED", "FAILED", "REJECTED"].includes(normalized)) {
    return "badge badge-danger";
  }

  return "badge";
}
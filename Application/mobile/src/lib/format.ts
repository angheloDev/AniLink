const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatPeso(n: number): string {
  const whole = Number.isInteger(n);
  const [int, dec] = Math.abs(n).toFixed(whole ? 0 : 2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}₱${grouped}${dec ? `.${dec}` : ''}`;
}

/** "Dec 1, 2026". Date-only ISO strings are read as calendar dates so the day never shifts with timezone. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  let y: number, m: number, d: number;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    [y, m, d] = value.split('-').map(Number);
    m -= 1;
  } else {
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) return '';
    y = dt.getFullYear();
    m = dt.getMonth();
    d = dt.getDate();
  }
  if (m < 0 || m > 11) return '';
  return `${MONTHS[m]} ${d}, ${y}`;
}

/** Short chat/inbox time: "3:45 PM" today, otherwise "Dec 1". */
export function formatChatTime(value: string | Date): string {
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const now = new Date();
  if (dt.toDateString() === now.toDateString()) {
    const h = dt.getHours();
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

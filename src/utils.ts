/**
 * Returns the given date in the format "DD.MM.YYYY".
 */
export function formatDate(date: Date): string {
  function padded(n: number) {
    return String(n).padStart(2, "0");
  }

  const day = padded(date.getDate());
  const month = padded(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export const PATHS = {
  ROOT: "/",
  WORK: "/work",
  BLOG: "/blog",
} as const;

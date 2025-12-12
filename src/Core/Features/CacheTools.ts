export const formatCacheAge = (ageMs: number | null): string => {
  if (!ageMs) return "recently";

  const minutes = Math.floor(ageMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
};

export const formatCacheStatus = (info: { hasCache: boolean; age: number | null }) => {
  if (!info.hasCache) return "none";
  return `cached ${formatCacheAge(info.age)}`;
};

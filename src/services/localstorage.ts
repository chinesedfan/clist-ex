const EXPIRE_LIMIT_MS = 24 * 3600 * 1000; // 1 day

export function isCacheExpired(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return true;

    const a = (new Date()).getTime();
    const b = (new Date(value)).getTime();
    return a - b > EXPIRE_LIMIT_MS;
}
export function touchCache(key: string) {
    localStorage.setItem(key, (new Date()).toString());
}

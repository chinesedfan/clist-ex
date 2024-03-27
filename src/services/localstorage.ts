const EXPIRE_LIMIT_MS = 24 * 3600 * 1000; // 1 day

export const LOCAL_HIDE_ALERT_RETRY = 'local-hide-alert-retry';
export const LOCAL_ACCOUNTS = 'local-accounts';
export const LOCAL_CLIST_APIKEY = 'local-clist-apikey';

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

export function loadLocalObject(key: string, path?: string) {
    try {
        const obj = JSON.parse(localStorage.getItem(key) || '');
        return path ? obj[path] : obj;
    } catch (e) {
        return null;
    }
}
export function saveLocalObject(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

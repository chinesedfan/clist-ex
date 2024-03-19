export function getAlignedOffset(n: number, page: number) {
    return n - (n % page);
}

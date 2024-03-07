const LC_RATINGS = [0, 1200, 1400, 1600, 1900, 2100, 2400, 3000];
const LC_COLORS = [
    'gray', 'green', '#03a89e' /* cyan */, 'blue', '#a0a' /* violet */,
    '#ff8c00' /* orange */, 'red'
];

export function getRatingColor(rating: number): string {
    for (let i = 1; i < LC_RATINGS.length; i++) {
        if (rating < LC_RATINGS[i]) {
            return LC_COLORS[i - 1];
        }
    }
    return 'black';
}
export function getRatingPercent(rating: number): number {
    let r = 100;
    for (let i = 1; i < LC_RATINGS.length; i++) {
        if (rating < LC_RATINGS[i]) {
            r = (rating - LC_RATINGS[i - 1]) / (LC_RATINGS[i] - LC_RATINGS[i - 1]);
            r = Math.floor(r * 100);
            break;
        }
    }
    return r;
}

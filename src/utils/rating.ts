import { R_LC } from "../apis";

const LC_RATINGS = [0, 1200, 1400, 1600, 1900, 2100, 2400, 3000];
const LC_COLORS = [
    'gray', 'green', '#03a89e' /* cyan */, 'blue', '#a0a' /* violet */,
    '#ff8c00' /* orange */, 'red'
];
const CC_RATINGS = [0, 1400, 1600, 1800, 2000, 2200, 2500, 3000];
const CC_COLORS = [
    'gray', 'green', 'blue', '#a0a' /* violet */, '#bb0' /* yellow */,
    '#ff8c00' /* orange */, 'red'
];

export function getRatingColor(resource: string, rating: number): string {
    const ratingList = resource === R_LC ? LC_RATINGS : CC_RATINGS;
    const colorList = resource === R_LC ? LC_COLORS : CC_COLORS;
    for (let i = 1; i < ratingList.length; i++) {
        if (rating < ratingList[i]) {
            return colorList[i - 1];
        }
    }
    return 'black';
}
export function getRatingPercent(resource: string, rating: number): number {
    const ratingList = resource === R_LC ? LC_RATINGS : CC_RATINGS;
    let r = 100;
    for (let i = 1; i < ratingList.length; i++) {
        if (rating < ratingList[i]) {
            r = (rating - ratingList[i - 1]) / (ratingList[i] - ratingList[i - 1]);
            r = Math.floor(r * 100);
            break;
        }
    }
    return r;
}

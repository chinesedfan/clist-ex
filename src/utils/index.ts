export function getRatingColor(rating: number): string {
    if (rating < 1200) {
        return 'gray';
    } else if (rating < 1400) {
        return 'green';
    } else if (rating < 1600) {
        return 'cyan';
    } else if (rating < 1900) {
        return 'blue';
    } else if (rating < 2100) {
        return 'violet';
    } else if (rating < 2400) {
        return 'orange';
    } else {
        return 'red';
    }
}

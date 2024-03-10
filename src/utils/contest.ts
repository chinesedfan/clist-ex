/**
 * 
 * @param url i.e. https://leetcode.com/contest/weekly-contest-387/problems/distribute-elements-into-two-arrays-ii
 * @returns i.e. Weekly Contest 387
 */
export function getEventByUrl(url: string) {
    const contest = url.split('/')[4];
    const parts = contest.split('-').map(updateFirstLetter);
    return parts.join(' ');
}
function updateFirstLetter(s: string) {
    return s[0].toUpperCase() + s.slice(1);
}

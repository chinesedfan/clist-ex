import Contest, { CCContest, CCContestProblem, CCDiv, ContestProblem, LCContest } from '../types/Contest';
import Statistics, { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { R_CC, R_LC } from '../apis';

export interface ContestItemData {
    id: number;
    event: string;
    n_problems: number;
    // parsed from Statistics
    n_problems_solved?: number;
    n_problems_upsolved?: number;
    place?: number;
    new_rating?: number;
    rating_change?: number;
}
export interface ProblemItemData {
    problem: ContestProblem;
    result?: StatisticsResult;
}

export type RowData = {
    contest: ContestItemData;
} & Record<string, ProblemItemData>;

export function buildContestMap(contests: Contest<any>[], resource: string, eventKeyword: string): {
    contestMap: Record<string, RowData>;
    contestIds: number[];
    maxProblemCount: number;
} {
    let maxProblemCount = 4;
    const contestIds: number[] = [];
    const contestMap = contests.reduce((o, c) => {
        if (!c.problems || !(new RegExp(eventKeyword)).test(c.event)) return o;

        contestIds.push(c.id);
        o[c.id] = {
            contest: {
                id: c.id,
                event: c.event,
                n_problems: c.n_problems,
            },
        } as RowData; 

        if (resource === R_LC) {
            (c as LCContest).problems!.reduce((rowData, p) => {
                rowData[p.short] = {
                    problem: p,
                }
                return rowData;
            }, o[c.id]);
        } else if (resource === R_CC) {
            const { division, divisions_order} = (c as CCContest).problems!;
            const problemMap: Record<string, CCContestProblem> = {};
            // reverse
            divisions_order.reverse();
            for (const div of divisions_order) {
                for (const p of division[div as CCDiv]) {
                    if (!problemMap[p.short]) {
                        problemMap[p.short] = p;
                        p.divisions = []
                    }
                    problemMap[p.short].divisions!.unshift(div as CCDiv);
                }
            }
            let index = 0;
            for (const short in problemMap) {
                // copy to `short` as key
                o[c.id]['Q' + (++index)] = o[c.id][short] = {
                    problem: problemMap[short],
                };
            }
            maxProblemCount = Math.max(maxProblemCount, index);
        }
        
        return o;
    }, {} as Record<string, RowData>);

    return { contestMap, contestIds, maxProblemCount };
}

export function updateContestMapWithStatistics(
    contestMap: Record<string, RowData>,
    statistics: Statistics[]
): void {
    for (const s of statistics) {
        if (!contestMap[s.contest_id]) continue;

        const contestItem = contestMap[s.contest_id].contest;
        contestItem.place = s.place;
        contestItem.new_rating = s.new_rating;
        contestItem.rating_change = s.rating_change;
        let solvedCount = 0, upsolvedCount = 0
        for (const title in s.problems) {
            const problemItem = contestMap[s.contest_id][title]
            problemItem.result = s.problems[title];
            if (isUpsolvingResult(problemItem.result)) {
                upsolvedCount++
            } else {
                solvedCount++;
            }
        }
        contestItem.n_problems_solved = solvedCount;
        contestItem.n_problems_upsolved = upsolvedCount;
    }
}

export function clearStatisticsFromContestMap(contestMap: Record<string, RowData>): void {
    for (const contestId in contestMap) {
        const rowData = contestMap[contestId];
        const contestItem = rowData.contest;
        delete contestItem.place;
        delete contestItem.new_rating;
        delete contestItem.rating_change;
        delete contestItem.n_problems_solved;
        delete contestItem.n_problems_upsolved;
        for (const key in rowData) {
            delete rowData[key].result;
        }
    }
}

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

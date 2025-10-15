import { LeetCode, Credential, fetcher, ProblemList } from 'leetcode-query';
import { log } from '../utils/log';
import { jsonp } from '../utils/jsonp';
import { notification } from 'antd';

const LIMIT = 1000;
const DELAY_MS = 1500;
// const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json';

export type LCRawProblem = ProblemList['questions'][0];
export interface LCRawRating {
    Rating: number;
    ID: number;
    Title: string;
    TitleZH: string;
    TitleSlug: string;
    ContestSlug: string;
    ProblemIndex: string;
    ContestID_en: string;
    ContestID_zh: string;
}

export async function fetchLeetCodeProblems() {
    let skip = 0;
    let total = null;
    const all: LCRawProblem[] = [];

    fetcher.set(async (...args) => {
        // args[0] = PROXY_URL + args[0];
        const res = await fetch(...args);
        return new Response(res.body, res);
    })
    // @ts-ignore
    window.setImmediate = window.setTimeout; // stupid hack for leetcode-query

    const credential = new Credential();
    const cookie = localStorage.getItem('local-leetcode-cookie') || '';
    await credential.init(cookie);
    const lc = new LeetCode(credential);
    while (true) {
        const res = await lc.problems({
            offset: skip,
            limit: LIMIT,
            // filters: { difficulty: "HARD" },
        });

        if (total === null) total = res.total;
        all.push(...res.questions);

        notification.info({
            message: `...${all.length}/${total} problems fetched.`,
        });
        if (all.length >= total) break;

        skip += LIMIT;
        await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    return all
}

export async function fetchLeetCodeRatings(): Promise<LCRawRating[]> {
    try {
        const data = await jsonp(GITHUB_DATA_URL);
        log(`Fetched ${Object.keys(data).length} problem ratings from GitHub`);
        return data;
    } catch (error) {
        console.error('Failed to fetch problem ratings:', error);
        return [];
    }
}

import { LeetCode, Credential, fetcher, ProblemList } from 'leetcode-query';
import { log } from '../utils/log';

const LIMIT = 100;
const DELAY_MS = 1500;
// const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const PROXY_URL = 'https://cors-anywhere.com/';

export type LCRawProblem = ProblemList['questions'][0];

export async function fetchLeetCodeProblems() {
    let skip = 0;
    let total = null;
    const all: LCRawProblem[] = [];

    fetcher.set(async (...args) => {
        args[0] = PROXY_URL + args[0];
        const res = await fetch(...args);
        return new Response(res.body, res);
    })
    const credential = new Credential();
    const cookie = localStorage.getItem('local-leetcode-cookie') || '';
    await credential.init(cookie);
    const lc = new LeetCode(credential);
    while (true) {
        const res = await lc.problems({
            offset: skip,
            limit: LIMIT,
            filters: { difficulty: "HARD" },
        });

        if (total === null) total = res.total;
        all.push(...res.questions);

        log(`...${all.length}/${total} leetcode problems fetched.`);
break; // FIXME:
        if (all.length >= total) break;

        skip += LIMIT;
        await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    return all
}

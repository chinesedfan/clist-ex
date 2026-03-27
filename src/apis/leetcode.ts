import { LeetCode, Credential, fetcher, ProblemList } from 'leetcode-query';
import { log } from '../utils/log';
import { jsonp } from '../utils/jsonp';
import { notification } from 'antd';

const LIMIT = 1000;
const DELAY_MS = 1500;
// const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json';

// Supabase REST API page size (max 1000 per request)
const SUPABASE_PAGE_SIZE = 1000;

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

export interface SupabaseConfig {
    url: string;
    anonKey: string;
}

/**
 * Fetch all LeetCode problems from a Supabase table named `leetcode_problems`.
 *
 * Supabase REST API supports CORS natively — no proxy needed.
 * Authentication is done via the public `anon` key passed as a query param
 * (or header), so no cookies / credentials are required.
 *
 * Table DDL (run once in Supabase SQL Editor):
 *
 *   CREATE TABLE leetcode_problems (
 *     "questionFrontendId" TEXT PRIMARY KEY,
 *     "acRate"             DOUBLE PRECISION,
 *     "difficulty"         TEXT,
 *     "freqBar"            DOUBLE PRECISION,
 *     "isFavor"            BOOLEAN,
 *     "isPaidOnly"         BOOLEAN,
 *     "status"             TEXT,
 *     "title"              TEXT,
 *     "titleSlug"          TEXT,
 *     "hasSolution"        BOOLEAN,
 *     "hasVideoSolution"   BOOLEAN,
 *     "topicTags"          JSONB
 *   );
 *
 *   ALTER TABLE leetcode_problems ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Allow public read" ON leetcode_problems FOR SELECT USING (true);
 */
export async function fetchLeetCodeProblemsFromSupabase(
    config: SupabaseConfig
): Promise<LCRawProblem[]> {
    const { url, anonKey } = config;
    // Normalise: strip trailing slash
    const base = url.replace(/\/$/, '');
    const endpoint = `${base}/rest/v1/leetcode_problems_progress`;

    const headers: Record<string, string> = {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        // Ask PostgREST to return the total row count in the Content-Range header
        Prefer: 'count=exact',
    };

    const all: LCRawProblem[] = [];
    let offset = 0;
    let total: number | null = null;

    while (true) {
        const rangeEnd = offset + SUPABASE_PAGE_SIZE - 1;
        const res = await fetch(
            `${endpoint}?select=*&order=questionFrontendId.asc&offset=${offset}&limit=${SUPABASE_PAGE_SIZE}`,
            {
                method: 'GET',
                headers: {
                    ...headers,
                    // PostgREST range header for pagination
                    Range: `${offset}-${rangeEnd}`,
                },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Supabase request failed (${res.status}): ${text}`);
        }

        // Parse total count from Content-Range: 0-999/3456
        if (total === null) {
            const contentRange = res.headers.get('Content-Range');
            if (contentRange) {
                const match = contentRange.match(/\/(\d+)$/);
                if (match) total = parseInt(match[1], 10);
            }
        }

        const page: LCRawProblem[] = await res.json();
        all.push(...page);

        notification.info({
            message: `...${all.length}${total !== null ? `/${total}` : ''} problems fetched from Supabase.`,
        });

        if (page.length < SUPABASE_PAGE_SIZE) break;
        if (total !== null && all.length >= total) break;

        offset += SUPABASE_PAGE_SIZE;
    }

    log(`[supabase] fetchLeetCodeProblemsFromSupabase: total=${all.length}`);
    return all;
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

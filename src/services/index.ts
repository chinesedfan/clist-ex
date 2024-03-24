import { GetContestListParams, R_CC, R_LC, getContestList, getContestTotalCount, getStatisticsByAccountId } from "../apis";
import Contest from "../types/Contest";
import Statistics from "../types/Statistics";
import { getAlignedOffset } from "../utils/pagination";
import { loadAllData, openDatabase, saveData } from "./db";
import { isCacheExpired, touchCache } from "./localstorage";

const PAGE_SIZE = 200;
const DB_NAME = 'clist-ex';
export const STORE_LC = 'contest-lc';
export const STORE_CC = 'contest-cc';

let db: IDBDatabase

function pify(fn: () => IDBTransaction) {
    return new Promise<void>((resolve, reject) => {
        const transaction = fn();
        transaction.oncomplete = () => resolve();
        transaction.onerror = reject;
    });
}

function openClistExDatabase() {
    return openDatabase(DB_NAME, async (db) => {
        await Promise.all([
            pify(() => db.createObjectStore(STORE_LC, {
                keyPath: 'id',
            }).transaction),
            pify(() => db.createObjectStore(STORE_CC, {
                keyPath: 'id',
            }).transaction),
        ])
    });
}

export async function loadContestList(resource: string) {
    if (!db) db = await openClistExDatabase();

    const params: GetContestListParams = {
        resource,
        limit: PAGE_SIZE,
        with_problems: 'true',
        upcoming: 'false',
        order_by: 'start',
    };
    let storeName = STORE_LC;
    if (resource === R_CC) {
        storeName = STORE_CC;
        // bad regex makes api returns slower
        params.event__regex = '^(CodeChef )?Starters';
    }

    let cacheContests = await loadAllData<Contest<any>[]>(db, storeName);
    if (!isCacheExpired(storeName)) {
        cacheContests.sort((a, b) => -(a.start < b.start ? -1 : (a.start > b.start ? 1 : 0)));
        return cacheContests;
    }

    const totalCount = await getContestTotalCount(resource, params.event__regex) || 0;
    params.offset = getAlignedOffset(cacheContests.length, PAGE_SIZE);
    let fetchedCount = 0;
    while (params.offset < totalCount) {
        // TODO: in parallel
        const fetchedContests = await getContestList(params);
        if (!fetchedContests.length) break;
        fetchedCount += fetchedContests.length;
        cacheContests = cacheContests.concat(fetchedContests);
        params.offset += PAGE_SIZE;
    }
    if (fetchedCount) {
        for (const contest of cacheContests) {
            // no await
            saveData(db, storeName, contest);
        }
        touchCache(storeName);
    }

    cacheContests.sort((a, b) => -(a.start < b.start ? -1 : (a.start > b.start ? 1 : 0)));
    return cacheContests;
}

export async function loadStatistics(account_id: number, contestIds: number[]) {
    const storeName = 'statistics';
    const db = await openDatabase(`statistics-${account_id}`, async (db) => {
        pify(() => db.createObjectStore(storeName, {
            keyPath: 'id',
        }).transaction);
    });
    // TODO: handle bad db?

    let cacheStatistics = await loadAllData<Statistics[]>(db, storeName);
    const cacheContestIds = cacheStatistics.reduce<Record<number, number>>((o, s) => {
        o[s.contest_id] = 1;
        return o;
    }, {});
    const fetchContestIds = contestIds.filter(x => !cacheContestIds[x]);
    if (fetchContestIds.length) {
        const statistics = await getStatisticsByAccountId(account_id, fetchContestIds);    
        cacheStatistics = cacheStatistics.concat(statistics);
        for (const s of statistics) {
            saveData(db, storeName, s);
        }
    }
    return cacheStatistics;
}

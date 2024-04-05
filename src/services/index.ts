import { GetContestListParams, R_CC, getContestList, getContestTotalCount, getStatisticsByAccountId } from "../apis";
import Contest from "../types/Contest";
import Statistics from "../types/Statistics";
import { getAlignedOffset } from "../utils/pagination";
import { loadAllData, openDatabase, saveData } from "./db";
import { LOCAL_STATISTICS_STRATEGY, StatisticsStrategy, isCacheExpired, touchCache } from "./localstorage";
import { log } from "../utils/log";
import { notification } from "antd";

const PAGE_SIZE = 200;
const DB_NAME = 'clist-ex';
export const STORE_LC = 'contest-lc';
export const STORE_CC = 'contest-cc';

function createObjectStorePromise(db: IDBDatabase, name: string, options?: IDBObjectStoreParameters) {
    return new Promise<void>((resolve, reject) => {
        if (db.objectStoreNames.contains(name)) {
            db.deleteObjectStore(name);
        }

        const transaction = db.createObjectStore(name, options).transaction;
        transaction.oncomplete = () => resolve();
        transaction.onerror = reject;
    });
}

function openClistExDatabase() {
    return openDatabase(DB_NAME, async (db) => {
        await Promise.all([
            createObjectStorePromise(db, STORE_LC, {
                keyPath: 'id',
            }),
            createObjectStorePromise(db, STORE_CC, {
                keyPath: 'id',
            }),
        ])
    });
}

export async function loadContestList(resource: string) {
    const db = await openClistExDatabase();

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

    const cacheContestIds = cacheContests.map(c => c.id);
    const totalCount = await getContestTotalCount(resource, params.event__regex) || 0;
    params.offset = getAlignedOffset(cacheContests.length, PAGE_SIZE);
    let fetchedCount = 0;
    while (params.offset < totalCount) {
        // TODO: in parallel
        notification.info({
            message: `loading contest ${params.offset}/${totalCount}`,
        });
        const fetchedContests = await getContestList(params);
        if (!fetchedContests.length) break;

        for (const c of fetchedContests) {
            if (cacheContestIds.indexOf(c.id) < 0) {
                fetchedCount++;
                cacheContests.push(c);
                saveData(db, storeName, c);
            }
        }
        params.offset += PAGE_SIZE;
    }
    if (fetchedCount) {
        touchCache(storeName);
    }
    log(`[service] loadContestList: fetchedCount=${fetchedCount}.`);

    cacheContests.sort((a, b) => -(a.start < b.start ? -1 : (a.start > b.start ? 1 : 0)));
    return cacheContests;
}

function isEmptyStatistics(s: Statistics) {
    return s.id === undefined; // internal design
}

export async function loadStatistics(account_id: number, contestIds: number[]) {
    const storeName = 'statistics';
    const db = await openDatabase(`statistics-${account_id}`, async (db) => {
        await createObjectStorePromise(db, storeName, {
            keyPath: 'contest_id',
        });
    });
    // TODO: handle bad db?

    const strategy = localStorage.getItem(LOCAL_STATISTICS_STRATEGY) || StatisticsStrategy.CacheFirstIfNonEmpty;
    const statisticsMap: Record<number, Statistics> = {}

    const cacheContestIds: number[] = [];
    const nonEmptyCacheContestIds: number[] = [], emptyCacheContestIds: number[] = [];
    const cacheStatistics = await loadAllData<Statistics[]>(db, storeName);
    for (const s of cacheStatistics) {
        if (isEmptyStatistics(s)) {
            emptyCacheContestIds.push(s.contest_id);
        } else {
            nonEmptyCacheContestIds.push(s.contest_id);
            statisticsMap[s.contest_id] = s;
        }
        cacheContestIds.push(s.contest_id);
    }
    const fetchContestIds = contestIds.filter(cid => {
        switch (strategy) {
            case StatisticsStrategy.CacheFirst:
                return cacheContestIds.indexOf(cid) < 0;
            case StatisticsStrategy.CacheFirstIfNonEmpty:
                return nonEmptyCacheContestIds.indexOf(cid) < 0;
            case StatisticsStrategy.NetworkFirst:
            default:
                return true;
        }
    });
    if (fetchContestIds.length) {
        const fetchStatistics = await getStatisticsByAccountId(account_id, fetchContestIds);    
        const succFetchContestIds = fetchStatistics.map(s => s.contest_id);
        for (const s of fetchStatistics) {
            statisticsMap[s.contest_id] = s;
            saveData(db, storeName, s);
        }
        for (const cid of fetchContestIds) {
            if (succFetchContestIds.indexOf(cid) < 0 && nonEmptyCacheContestIds.indexOf(cid) < 0) {
                saveData(db, storeName, {
                    contest_id: cid,
                });
            }
        }
    }
    return Object.keys(statisticsMap).map(cid => statisticsMap[cid as any]);
}

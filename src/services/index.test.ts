import { StatisticsStrategy } from "./localstorage";

const account_id = 42;

describe('loadStatistics', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it('network first', async () => {
        mockDbAndApis([1, 2], [3, 4], [1, 3]);
        mockStrategy(StatisticsStrategy.NetworkFirst);
        const loadStatistics = require('./index').loadStatistics;
        const saveData = require('./db').saveData;
        const getStatisticsByAccountId = require('../apis').getStatisticsByAccountId;

        const statistics = await loadStatistics(account_id, [1, 2, 3, 4, 5, 6]);
        // query all ids
        expect(getStatisticsByAccountId).toHaveBeenCalledWith(account_id, [1, 2, 3, 4, 5, 6]);
        // return fetched and nonempty cached
        expect(statistics.map((s: any) => s.contest_id)).toEqual([1, 2, 3]);
        expect(statistics.map((s: any) => s.event)).toEqual(['from api', 'from cache', 'from api']);
        // save fetched [1, 3] or empty [4, 5, 6] in cache
        expect(saveData).toHaveBeenCalledTimes(5);
    });
    it('cache first (if nonempty)', async () => {
        mockDbAndApis([1, 2], [3, 4], [3]);
        mockStrategy(StatisticsStrategy.CacheFirstIfNonEmpty);
        const loadStatistics = require('./index').loadStatistics;
        const saveData = require('./db').saveData;
        const getStatisticsByAccountId = require('../apis').getStatisticsByAccountId;

        const statistics = await loadStatistics(account_id, [1, 2, 3, 4, 5, 6]);
        // query partial ids
        expect(getStatisticsByAccountId).toHaveBeenCalledWith(account_id, [3, 4, 5, 6]);
        // return fetched and nonempty cached
        expect(statistics.map((s: any) => s.contest_id)).toEqual([1, 2, 3]);
        expect(statistics.map((s: any) => s.event)).toEqual(['from cache', 'from cache', 'from api']);
        // save fetched [3] or empty [4, 5, 6] in cache
        expect(saveData).toHaveBeenCalledTimes(4);
    });
    it('cache first', async () => {
        mockDbAndApis([1, 2], [3, 4], []);
        mockStrategy(StatisticsStrategy.CacheFirst);
        const loadStatistics = require('./index').loadStatistics;
        const saveData = require('./db').saveData;
        const getStatisticsByAccountId = require('../apis').getStatisticsByAccountId;

        const statistics = await loadStatistics(account_id, [1, 2, 3, 4, 5, 6]);
        // query partial ids
        expect(getStatisticsByAccountId).toHaveBeenCalledWith(account_id, [5, 6]);
        // return fetched and nonempty cached
        expect(statistics.map((s: any) => s.contest_id)).toEqual([1, 2]);
        expect(statistics.map((s: any) => s.event)).toEqual(['from cache', 'from cache']);
        // save fetched [] or empty [5, 6] in cache
        expect(saveData).toHaveBeenCalledTimes(2);
    });
});

function mockDbAndApis(nonEmptyCacheIds: number[], emptyCacheIds: number[], mockApiIds: number[]) {
    const cacheItems: any[] = [];
    let mockid = 0;
    for (const cid of nonEmptyCacheIds) {
        cacheItems.push({
            id: ++mockid,
            contest_id: cid,
            event: 'from cache',
        });
    }
    for (const cid of emptyCacheIds) {
        cacheItems.push({
            contest_id: cid,
            event: 'from cache',
        });
    }
    jest.mock('./db', () => ({
        loadAllData: jest.fn().mockResolvedValue(cacheItems),
        openDatabase: jest.fn(),
        saveData: jest.fn(),
    }));
    jest.mock('../apis', () => ({
        getStatisticsByAccountId: jest.fn().mockResolvedValue(mockApiIds.map(cid => ({
            id: ++mockid,
            contest_id: cid,
            event: 'from api',
        }))),
    }));
}
function mockStrategy(strategy: StatisticsStrategy) {
    Object.defineProperty(global, 'localStorage', {
        value: {
            getItem: jest.fn().mockReturnValue(strategy),
        },
        writable: true, // who freezed it?
    });
}

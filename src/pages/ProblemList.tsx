import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table, TablePaginationConfig } from 'antd';
import '../styles/problem.scss';
import { loadContestList, loadStatistics } from '../services';
import { LOCAL_STATISTICS_STRATEGY, StatisticsStrategy, useLocalStorage } from '../services/localstorage';
import Account from '../types/Account';
import { ContestItem } from '../components/ContestItem';
import { ProblemItem } from '../components/ProblemItem';
import { 
    ContestItemData, 
    ProblemItemData, 
    RowData, 
    buildContestMap, 
    updateContestMapWithStatistics, 
    clearStatisticsFromContestMap 
} from '../utils/contest';

const { Column } = Table;

interface Props {
    resource: string;
    account?: Account;
    eventKeyword: string;
    refreshKey: number;
}

export const ProblemList: React.FC<Props> = (props) => {
    const { resource, account, eventKeyword, refreshKey } = props;

    const prevResourceRef = useRef<string>();
    const prevEventKeywordRef = useRef<string>();
    const prevAccountRef = useRef<Account>();
    const contestMapRef = useRef<Record<string, RowData>>({});
    const contestIdsRef = useRef<number[]>([]);

    const [maxProblemCount, setMaxProblemCount] = useState<number>(4);
    const [dataSource, setDataSource] = useState<RowData[]>([]);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
    });
    const [loading, setLoading] = useState(false);
    const [strategy, setStrategy] = useLocalStorage(LOCAL_STATISTICS_STRATEGY, StatisticsStrategy.CacheFirstIfNonEmpty, {
        raw: true,
    });

    async function updateContestsData() {
        const contests = await loadContestList(resource);
        if (!contests) return;

        const { contestMap, contestIds, maxProblemCount } = buildContestMap(contests, resource, eventKeyword);
        contestMapRef.current = contestMap;
        contestIdsRef.current = contestIds;

        setMaxProblemCount(maxProblemCount);
        setPagination(pagination => ({
            ...pagination,
            current: 1,
        }));
    }
    async function updateStatistics(pagination: TablePaginationConfig) {
        const contestIds = contestIdsRef.current;
        if (!account || !contestIds.length) return;

        const { current, pageSize } = pagination;
        const startIndex = (current! - 1) * pageSize!;
        const statistics = await loadStatistics(account.id,
            contestIds.slice(startIndex, startIndex + pageSize!));
        updateContestMapWithStatistics(contestMapRef.current, statistics);
    }

    useEffect(() => {
        (async function() {
            const resourceChanged = resource !== prevResourceRef.current;
            const eventKeywordChanged = eventKeyword !== prevEventKeywordRef.current;
            const accountChanged = account?.id !== prevAccountRef.current?.id;
            setLoading(true);
            if (accountChanged) {
                clearStatisticsFromContestMap(contestMapRef.current);
            }
            if (resourceChanged || eventKeywordChanged) {
                await updateContestsData();
            }
            await updateStatistics(pagination);

            const contestMap = contestMapRef.current;
            setDataSource(contestIdsRef.current.map(key => contestMap[key]));
            setLoading(false);

            prevResourceRef.current = resource;
            prevEventKeywordRef.current = eventKeyword;
        })();
    }, [resource, account, eventKeyword]);
    useEffect(() => {
        if (!refreshKey) return; // first render

        (async function() {
            setLoading(true);
            setStrategy(StatisticsStrategy.NetworkFirst);
            await updateStatistics(pagination);
            setStrategy(strategy);
            setPagination(pagination);
            setLoading(false);
        })();
    }, [refreshKey]);

    const onTableChange = useCallback((pagination: TablePaginationConfig) => {
        (async function() {
            // no setter called, make sure rerender is triggered
            setLoading(true);
            await updateStatistics(pagination);
            setPagination(pagination);
            setLoading(false);
        })();
    }, [resource]);
    const contestItemRender = useCallback((data: ContestItemData) => {
        return <ContestItem data={data} resource={resource} />;
    }, [resource]);

    const problemItemRender = useCallback((data?: ProblemItemData) => {
        return <ProblemItem data={data} resource={resource} />;
    }, [resource]);

    return <Table
        dataSource={dataSource}
        rowKey={(rowData) => rowData.contest.id}
        onChange={onTableChange}
        pagination={pagination}
        loading={loading}
    >
        <Column className="problem-cell" title="Contest" dataIndex="contest" render={contestItemRender} />
        {
            Array(maxProblemCount)
                .fill(0)
                .map((_, index) => {
                    const title = 'Q' + (index + 1);
                    return <Column className="problem-cell" ellipsis
                        title={title} dataIndex={title} key={title} render={problemItemRender} />
                })
        }
    </Table>;
};

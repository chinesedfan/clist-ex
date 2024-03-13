import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Table, TablePaginationConfig, Tooltip } from 'antd';
import { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils';
import '../styles/problem.scss';
import { getAccountByHandle, getContestList, getStatisticsByAccountId } from '../apis';
import { ContestProblem } from '../types/Contest';
import Account from '../types/Account';

const { Column } = Table;

interface Props {
    resource: string;
    handle: string;
    eventKeyword: string;
}
type RowData = {
    contest: ContestItem;
} & Record<string, ProblemItem>;

interface ContestItem {
    event: string;
    place?: number;
    new_rating?: number;
    rating_change?: number;
}
interface ProblemItem {
    problem: ContestProblem;
    result?: StatisticsResult;
}

export const ProblemList: React.FC<Props> = (props) => {
    const { resource, handle, eventKeyword } = props;
    const [account, setAccount] = useState<Account>();
    const [contestMap, setContestMap] = useState<Record<string, RowData>>({});
    const [contestIds, setContestIds] = useState<number[]>([]);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });
    async function loadContestList(currentPage: number) {
        const res = await getContestList(resource, eventKeyword, currentPage - 1);
        if (!res) return;

        const { meta, objects } = res.data;
        setPagination({
            ...pagination,
            current: currentPage,
            total: meta.total_count,
        });

        const contestIds: number[] = [];
        const contestMap = objects.reduce((o, c) => {
            if (!c.problems) return o;

            contestIds.push(c.id);
            o[c.event] = c.problems.reduce((rowData, p) => {
                rowData[p.short] = {
                    problem: p,
                }
                return rowData;
            }, {
                contest: {
                    event: c.event,
                },
            } as RowData);
            return o;
        }, {} as Record<string, RowData>)
        setContestIds(contestIds);
        setContestMap(contestMap);
    }
    useEffect(() => {
        loadContestList(1);
    }, [resource, eventKeyword]);
    useEffect(() => {
        (async function loadAccount() {
            if (!handle) return;
    
            const account = await getAccountByHandle(resource, handle);
            if (!account) return;

            setAccount(account);
        })();
    }, [resource, handle]);
    useEffect(() => {
        (async function loadStatistics() {
            if (!account || !contestIds.length) return;
    
            const statistics = await getStatisticsByAccountId(account.id, contestIds);
            const newContestMap = { ...contestMap };
            for (const s of statistics) {
                if (!newContestMap[s.event]) continue;
    
                const contestItem = newContestMap[s.event].contest;
                contestItem.place = s.place;
                contestItem.new_rating = s.new_rating;
                contestItem.rating_change = s.rating_change;
                for (const title in s.problems) {
                    const problemItem = newContestMap[s.event][title]
                    problemItem.result = s.problems[title];
                }
            }
            setContestMap(newContestMap);
        })();
    }, [account, contestIds, contestMap]);
    const onTableChange = useCallback((pagination: TablePaginationConfig) => {
        (async function() {
            await loadContestList(pagination.current!);
            setPagination(pagination);
        })();
    }, [resource, eventKeyword]);
    const contentClassName = useCallback((item?: ProblemItem) => {
        if (!item || !item.result) return '';

        if (isUpsolvingResult(item.result)) {
            return 'upsolved';
        } else {
            return 'solved';
        }
    }, []);
    const contestItemRender = useCallback((item: ContestItem) => {
        return item.event;
    }, [])
    const problemItemRender = useCallback((item: ProblemItem) => {
        const problem = item.problem;
        const color = getRatingColor(problem.rating);
        const percent = getRatingPercent(problem.rating);
        const circleStyle = {
            borderColor: color,
            background: `linear-gradient(to top, ${color} ${percent}%, white ${percent}%)`,
        };
        const spanStyle = {
            color,
        };
        const problemTime = isUpsolvingResult(item.result)
            ? ''
            : item.result?.time
        const problemPenalty = isUpsolvingResult(item.result)
            ? ''
            : item.result?.result
        return <>
            <Flex className={'problem-content ' + contentClassName(item)} align="center">
                <Tooltip title={"Rating: " + problem.rating}>
                    <span className="difficult-circle " style={circleStyle}></span>
                </Tooltip>
                <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{problem.name}</a>
            </Flex>
            { !!item.result && 
                <div className="problem-statistics">
                    <span className="problem-time">{problemTime}</span>
                    { problemPenalty && problemPenalty !== '+' &&
                        <span className="problem-penalty">({problemPenalty})</span>
                    }
                </div>
            }
        </>;
    }, []);

    return <Table
        dataSource={Object.keys(contestMap).map(key => contestMap[key])}
        rowKey={(rowData) => rowData.contest.event}
        pagination={pagination} 
        onChange={onTableChange} 
    >
        <Column title="Contest" dataIndex="contest" render={contestItemRender} />
        {
            ['Q1', 'Q2', 'Q3', 'Q4'].map(title => (
                <Column className="problem-cell" ellipsis
                    title={title} dataIndex={title} key={title} render={problemItemRender} />
            ))
        }
    </Table>;
};

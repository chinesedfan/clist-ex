import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Table, TablePaginationConfig, Tag, Tooltip } from 'antd';
import { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils';
import '../styles/problem.scss';
import { R_CC, R_LC, getAccountByHandle, getContestList, getStatisticsByAccountId } from '../apis';
import { CCContest, CCContestProblem, CCDiv, ContestProblem, LCContest, LCContestProblem, isCCContestProblem } from '../types/Contest';
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
    // parsed from Statistics
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
    const [maxProblemCount, setMaxProblemCount] = useState<number>(4);
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

        let maxProblemCount = 4;
        const contestIds: number[] = [];
        const contestMap = objects.reduce((o, c) => {
            if (!c.problems) return o;

            contestIds.push(c.id);
            o[c.event] = {
                contest: {
                    event: c.event,
                },
            } as RowData; 

            if (resource === R_LC) {
                (c as LCContest).problems!.reduce((rowData, p) => {
                    rowData[p.short] = {
                        problem: p,
                    }
                    return rowData;
                }, o[c.event]);
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
                    o[c.event]['Q' + (++index)] = {
                        problem: problemMap[short],
                    };
                }
                maxProblemCount = Math.max(maxProblemCount, index);
            }
            
            return o;
        }, {} as Record<string, RowData>)
        setMaxProblemCount(maxProblemCount);
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
    const problemItemRender = useCallback((item?: ProblemItem) => {
        if (!item) return null;

        const { problem, result } = item;
        const color = getRatingColor(problem.rating);
        const percent = getRatingPercent(problem.rating);
        const circleStyle = {
            borderColor: color,
            background: `linear-gradient(to top, ${color} ${percent}%, white ${percent}%)`,
        };
        const spanStyle = {
            color,
        };
        const problemTime = isUpsolvingResult(result)
            ? ''
            : result?.time
        const problemPenalty = isUpsolvingResult(result)
            ? ''
            : result?.result
        const problemDivisions = isCCContestProblem(problem)
            ? problem.divisions!.reduce((s, x) => (s | (1 << +x[4])), 0)
            : 0;
        return <>
            <Flex className={'problem-content ' + contentClassName(item)} align="center">
                <Tooltip title={"Rating: " + problem.rating}>
                    <span className="difficult-circle " style={circleStyle}></span>
                </Tooltip>
                <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{problem.name}</a>
            </Flex>
            { !!result && 
                <div className="problem-statistics">
                    <span className="problem-time">{problemTime}</span>
                    { problemPenalty && problemPenalty !== '+' &&
                        <span className="problem-penalty">({problemPenalty})</span>
                    }
                </div>
            }
            { !!problemDivisions &&
                <div className="problem-divisions">
                    { [1, 2, 3, 4].map(x => {
                        const visibility = (problemDivisions & (1 << x)) ? 'visible' : 'hidden';
                        return <div className={'problem-div-' + x } key={x} style={{ visibility }}></div>;
                    }) }
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

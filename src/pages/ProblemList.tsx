import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Flex, Table, TablePaginationConfig, Tooltip } from 'antd';
import { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils/rating';
import '../styles/problem.scss';
import { R_CC, R_LC } from '../apis';
import { CCContest, CCContestProblem, CCDiv, ContestProblem, LCContest, isCCContestProblem } from '../types/Contest';
import { loadContestList, loadStatistics } from '../services';
import Account from '../types/Account';

const { Column } = Table;

interface Props {
    resource: string;
    account?: Account;
    eventKeyword: string;
}
type RowData = {
    contest: ContestItem;
} & Record<string, ProblemItem>;

interface ContestItem {
    event: string;
    n_problems: number;
    // parsed from Statistics
    ak?: boolean;
    ak_upsolved?: boolean;
    place?: number;
    new_rating?: number;
    rating_change?: number;
}
interface ProblemItem {
    problem: ContestProblem;
    result?: StatisticsResult;
}

export const ProblemList: React.FC<Props> = (props) => {
    const { resource, account, eventKeyword } = props;

    const prevResourceRef = useRef<string>();
    const prevEventKeywordRef = useRef<string>();
    const contestMapRef = useRef<Record<string, RowData>>({});
    const contestIdsRef = useRef<number[]>([]);

    const [maxProblemCount, setMaxProblemCount] = useState<number>(4);
    const [dataSource, setDataSource] = useState<RowData[]>([]);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);

    async function updateContestsData() {
        const contests = await loadContestList(resource);
        if (!contests) return;

        let maxProblemCount = 4;
        const contestIds: number[] = [];
        contestMapRef.current = contests.reduce((o, c) => {
            if (!c.problems || c.event.indexOf(eventKeyword) < 0) return o;

            contestIds.push(c.id);
            o[c.event] = {
                contest: {
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
                    // copy to `short` as key
                    o[c.event]['Q' + (++index)] = o[c.event][short] = {
                        problem: problemMap[short],
                    };
                }
                maxProblemCount = Math.max(maxProblemCount, index);
            }
            
            return o;
        }, {} as Record<string, RowData>)
        contestIdsRef.current = contestIds;

        setMaxProblemCount(maxProblemCount);
        setPagination({
            ...pagination,
            current: 1,
        });
    }
    async function updateStatistics(pagination: TablePaginationConfig) {
        const contestIds = contestIdsRef.current;
        if (!account || !contestIds.length) return;

        const { current, pageSize } = pagination;
        const startIndex = (current! - 1) * pageSize!;
        const statistics = await loadStatistics(account.id,
            contestIds.slice(startIndex, startIndex + pageSize!));
        const newContestMap = contestMapRef.current;
        for (const s of statistics) {
            if (!newContestMap[s.event]) continue;

            const contestItem = newContestMap[s.event].contest;
            contestItem.place = s.place;
            contestItem.new_rating = s.new_rating;
            contestItem.rating_change = s.rating_change;
            let solvedCount = 0, upsolvedCount = 0
            for (const title in s.problems) {
                const problemItem = newContestMap[s.event][title]
                problemItem.result = s.problems[title];
                if (isUpsolvingResult(problemItem.result)) {
                    upsolvedCount++
                } else {
                    solvedCount++;
                }
            }
            contestItem.ak = solvedCount === contestItem.n_problems;
            contestItem.ak_upsolved = solvedCount + upsolvedCount === contestItem.n_problems;
        }
    }
    useEffect(() => {
        (async function() {
            const resourceChanged = resource !== prevResourceRef.current;
            const eventKeywordChanged = eventKeyword !== prevEventKeywordRef.current;
            setLoading(true);
            if (resourceChanged || eventKeywordChanged) {
                await updateContestsData();
            }
            await updateStatistics(pagination);

            const contestMap = contestMapRef.current;
            setDataSource(Object.keys(contestMap).map(key => contestMap[key]));
            setLoading(false);

            prevResourceRef.current = resource;
            prevEventKeywordRef.current = eventKeyword;
        })();
    }, [resource, account, eventKeyword]);

    const onTableChange = useCallback((pagination: TablePaginationConfig) => {
        setPagination(pagination);
        updateStatistics(pagination);
    }, []);
    const contentClassName = useCallback((item?: ProblemItem) => {
        if (!item || !item.result) return '';

        if (isUpsolvingResult(item.result)) {
            return 'upsolved';
        } else {
            return 'solved';
        }
    }, []);
    const contestItemRender = useCallback((item: ContestItem) => {
        let className = 'problem-content';
        if (item.ak) {
            className += ' solved';
        } else if (item.ak_upsolved) {
            className += ' upsolved';
        }
        return <Flex className={className} align="center">{item.event}</Flex>;
    }, [])
    const problemItemRender = useCallback((item?: ProblemItem) => {
        if (!item) return null;

        const { problem, result } = item;
        const color = getRatingColor(resource, problem.rating);
        const percent = getRatingPercent(resource, problem.rating);
        const circleStyle = {
            borderColor: color,
            background: `linear-gradient(to top, ${color} ${percent}%, white ${percent}%)`,
        };
        const spanStyle = {
            color,
        };
        if (color === 'black') {
            circleStyle.borderColor = 'red';
            circleStyle.background = 'none';
            spanStyle.color = 'red';
        }
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
                    <span className={'difficult-circle ' + color} style={circleStyle}></span>
                </Tooltip>
                <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{isCCContestProblem(problem) ? problem.short : problem.name}</a>
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
    }, [resource]);

    return <Table
        dataSource={dataSource}
        rowKey={(rowData) => rowData.contest.event}
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

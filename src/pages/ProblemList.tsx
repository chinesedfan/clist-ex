import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Table, Tooltip } from 'antd';
import Problem from '../types/Problem';
import Statistics, { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils';
import { getEventByUrl } from '../utils/contest';
import '../styles/problem.scss';

const { Column } = Table;

export type ProblemItem = Problem & {
    statistics?: StatisticsResult 
}
interface Props {
    problems: ProblemItem[];
    statistics: Statistics[];
}
interface RowData {
    contest: string;
    [key: string]: string | ProblemItem;
}
export const ProblemList: React.FC<Props> = (props) => {
    const [data, setData] = useState<RowData[]>();
    useEffect(() => {
        const { problems, statistics } = props;
        const contestMap: {[key: string]: RowData} = {};
        problems.forEach(p => {
            const contest = getEventByUrl(p.url);
            contestMap[contest] = contestMap[contest] || {
                contest,
            };
            contestMap[contest][p.short || ''] = p
        });
        for (const s of statistics) {
            if (!contestMap[s.event]) continue;

            for (const title in s.problems) {
                const p = contestMap[s.event][title] as ProblemItem;
                p.statistics = s.problems[title];
            }
        }
        const data = Object.keys(contestMap)
            .map(contest => contestMap[contest]);
        setData(data);
    }, [props]);
    const contentClassName = useCallback((problem?: ProblemItem) => {
        if (!problem || !problem.statistics) return '';

        if (isUpsolvingResult(problem.statistics)) {
            return 'upsolved';
        } else {
            return 'solved';
        }
    }, []);
    const columnRender = useCallback((problem?: ProblemItem) => {
        if (!problem) return null;

        const color = getRatingColor(problem.rating);
        const percent = getRatingPercent(problem.rating);
        const circleStyle = {
            borderColor: color,
            background: `linear-gradient(to top, ${color} ${percent}%, white ${percent}%)`,
        };
        const spanStyle = {
            color,
        };
        const problemTime = isUpsolvingResult(problem.statistics)
            ? ''
            : problem.statistics?.time
        const problemPenalty = isUpsolvingResult(problem.statistics)
            ? ''
            : problem.statistics?.result
        return <>
            <Flex className={'problem-content ' + contentClassName(problem)} align="center">
                <Tooltip title={"Rating: " + problem.rating}>
                    <span className="difficult-circle " style={circleStyle}></span>
                </Tooltip>
                <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{problem.name}</a>
            </Flex>
            { !!problem.statistics && 
                <div className="problem-statistics">
                    <span className="problem-time">{problemTime}</span>
                    { problemPenalty && problemPenalty !== '+' &&
                        <span className="problem-penalty">({problemPenalty})</span>
                    }
                </div>
            }
        </>;
    }, []);

    return <Table dataSource={data} rowKey={(rowData) => rowData.contest}>
        <Column title="Contest" dataIndex="contest" />
        {
            ['Q1', 'Q2', 'Q3', 'Q4'].map(title => (
                <Column className="problem-cell" ellipsis
                    title={title} dataIndex={title} key={title} render={columnRender} />
            ))
        }
    </Table>;
};

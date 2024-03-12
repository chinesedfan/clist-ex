import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Table, Tooltip } from 'antd';
import Problem from '../types/Problem';
import Statistics, { StatisticsResult, isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils';
import { getEventByUrl } from '../utils/contest';
import '../styles/problem.scss';

const { Column } = Table;

interface Props {
    problems: Problem[];
    statistics: Statistics[];
}
type RowData = {
    contest: string;
} & Record<string, ProblemItem>;
type ProblemItem = {
    problem: Problem;
    result?: StatisticsResult;
}

export const ProblemList: React.FC<Props> = (props) => {
    const [data, setData] = useState<RowData[]>();
    useEffect(() => {
        const { problems, statistics } = props;
        const rowMap: Record<string, RowData> = {};
        problems.forEach(p => {
            const event = getEventByUrl(p.url);
            rowMap[event] = rowMap[event] || {
                contest: event,
            };
            rowMap[event][p.short] = {
                problem: p,
            };
        });
        for (const s of statistics) {
            if (!rowMap[s.event]) continue;

            for (const title in s.problems) {
                const item = rowMap[s.event][title]
                item.result = s.problems[title];
            }
        }
        const data = Object.keys(rowMap)
            .map(contest => rowMap[contest]);
        setData(data);
    }, [props]);
    const contentClassName = useCallback((item?: ProblemItem) => {
        if (!item || !item.result) return '';

        if (isUpsolvingResult(item.result)) {
            return 'upsolved';
        } else {
            return 'solved';
        }
    }, []);
    const columnRender = useCallback((item?: ProblemItem) => {
        if (!item) return null;

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

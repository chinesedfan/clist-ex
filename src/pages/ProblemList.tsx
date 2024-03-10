import React from 'react';
import { Flex, Table, Tooltip } from 'antd';
import Problem from '../types/Problem';
import { getRatingColor, getRatingPercent } from '../utils';
import '../styles/problem.scss';

const { Column } = Table;

interface Props {
    problems: Problem[];
}
interface RowData {
    contest: string;
    [key: string]: string | Problem;
}
export const ProblemList: React.FC<Props> = (props) => {
    const { problems } = props;
    const contestMap: {[key: string]: RowData} = {};
    problems.forEach(p => {
        const contest = p.url.split('/')[4];
        contestMap[contest] = contestMap[contest] || {
            contest,
        };
        contestMap[contest][p.short || ''] = p
    });
    const data = Object.keys(contestMap)
        .map(contest => contestMap[contest]);

    return <Table dataSource={data} rowKey={(rowData) => rowData.contest}>
        <Column title="Contest" dataIndex="contest" />
        {
            [1, 2, 3, 4].map(x => (
                <Column className="problem-cell" ellipsis title={"Q" + x} dataIndex={"Q" + x} key={x} render={(problem?: Problem) => {
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
                    return <>
                        <Flex className="problem-content" align="center">
                            <Tooltip title={"Rating: " + problem.rating}>
                                <span className="difficult-circle " style={circleStyle}></span>
                            </Tooltip>
                            <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{problem.name}</a>
                        </Flex>
                        <div className="problem-statistics">
                            <span className="problem-time">10:30</span>
                            <span className="problem-penalty">(+1)</span>
                        </div>
                    </>;
                }} />
            ))
        }
    </Table>;
};

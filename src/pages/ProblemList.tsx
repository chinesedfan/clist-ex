import React from 'react';
import { Table } from 'antd';
import Problem from '../types/Problem';
import { getRatingColor } from '../utils';
import '../styles/problem.scss';

const { Column } = Table;

interface Props {
    problems: Problem[];
}
export const ProblemList: React.FC<Props> = (props) => {
    const { problems } = props;
    const contestMap: {[key: string]: {[key: string]: Problem}} = {};
    problems.forEach(p => {
        const contest = p.url.split('/')[4];
        contestMap[contest] = contestMap[contest] || {
            contest,
        };
        contestMap[contest][p.short || ''] = p
    });
    const data = Object.keys(contestMap)
        .map(contest => contestMap[contest]);

    return <Table dataSource={data}>
        <Column title="Contest" dataIndex="contest" />
        {
            [1, 2, 3, 4].map(x => (
                <Column title={"Q" + x} dataIndex={"Q" + x} render={(problem?: Problem) => {
                    if (!problem) return null;

                    const color = getRatingColor(problem.rating);
                    return <>
                        <span className={"difficult-circle " + color}></span>
                        <span className={"problem-cell " + color}>{problem.name}</span>
                    </>;
                }} />
            ))
        }
    </Table>;
};

import React from 'react';
import { Table } from 'antd';
import Problem from '../types/Problem';

const { Column } = Table;

interface Props {
    problems: Problem[];
}
export const ProblemList: React.FC<Props> = (props) => {
    const { problems } = props;
    const contestMap: {[key: string]: {[key: string]: string}} = {};
    problems.forEach(p => {
        const contest = p.url.split('/')[4];
        contestMap[contest] = contestMap[contest] || {
            contest,
        };
        contestMap[contest][p.short || ''] = p.name || '';
    });
    const data = Object.keys(contestMap)
        .map(contest => contestMap[contest]);

    return <Table dataSource={data}>
        <Column title="Contest" dataIndex="contest" />
        <Column title="Q1" dataIndex="Q1" />
        <Column title="Q2" dataIndex="Q2" />
        <Column title="Q3" dataIndex="Q3" />
        <Column title="Q4" dataIndex="Q4" />
    </Table>;
};

import React, { useEffect, useState } from 'react';
import { Radio, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { getProblemList } from '../apis';
import { ProblemList } from './ProblemList';
import Problem from '../types/Problem';

const items: TabsProps['items'] = [
    {
        key: 'lc',
        label: 'LeetCode',
        children: (<Radio.Group>
            <Radio.Button value="all" defaultChecked>All</Radio.Button>
            <Radio.Button value="weekly">Weekly</Radio.Button>
            <Radio.Button value="biweekly">Biweekly</Radio.Button>
        </Radio.Group>),
    },
    {
        key: 'cc',
        label: 'CodeChef',
        children: (<Radio.Group>
            <Radio.Button value="all" defaultChecked>All</Radio.Button>
            <Radio.Button value="7">Rated for All</Radio.Button>
            <Radio.Button value="6">Rated till 6-stars</Radio.Button>
            <Radio.Button value="5">Rated till 5-stars</Radio.Button>
            <Radio.Button value="4">Rated for Divs 2, 3 & 4</Radio.Button>
        </Radio.Group>),
    },
];

export const ProblemPage: React.FC<any> = (props) => {
    const [problems, setProblems] = useState<Problem[]>([]);
    useEffect(() => {
        getProblemList()
            .then(setProblems)
            .catch(() => {});
    }, [])
    return (
        <div>
            <Tabs items={items} style={{ marginBottom: '16px' }}></Tabs>
            <ProblemList problems={problems} />
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Col, Flex, Input, Radio, Row, Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { getProblemList } from '../apis';
import { ProblemList } from './ProblemList';
import Problem from '../types/Problem';
import { ProblemFilter } from '../components/ProblemFilter';

const items: TabsProps['items'] = [
    {
        key: 'lc',
        label: 'LeetCode',
        children: (
            <ProblemFilter radios={[
                { label: 'All', value: 0 },
                { label: 'Weekly', value: 1 },
                { label: 'Biweekly', value: 2 },
            ]}></ProblemFilter>        
        ),
    },
    {
        key: 'cc',
        label: 'CodeChef',
        children: (
            <ProblemFilter radios={[
                { label: 'All', value: 0 },
                { label: 'Rated for All', value: 1 },
                { label: 'Rated till 6-stars', value: 2 },
                { label: 'Rated till 5-stars', value: 3 },
                { label: 'Rated for Divs 2, 3 & 4', value: 4 },
            ]}></ProblemFilter>        
        ),
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

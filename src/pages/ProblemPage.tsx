import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { getAccountByHandle, getProblemList, getStatisticsByAccountId } from '../apis';
import { ProblemItem, ProblemList } from './ProblemList';
import { ProblemFilter } from '../components/ProblemFilter';
import type Statistics from '../types/Statistics';

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

export const ProblemPage: React.FC = () => {
    const [problems, setProblems] = useState<ProblemItem[]>([]);
    const [statistics, setStatistics] = useState<Statistics[]>([]);
    useEffect(() => {
        (async function () {
            const account = await getAccountByHandle('chinesedfan');
            if (!account) return;

            const statistics = await getStatisticsByAccountId(account.id);
            const problems = await getProblemList();
            setProblems(problems);
            setStatistics(statistics);
        })();
    }, [])
    return (
        <div>
            <Tabs items={items} style={{ marginBottom: '16px' }}></Tabs>
            <ProblemList problems={problems} statistics={statistics} />
        </div>
    );
}

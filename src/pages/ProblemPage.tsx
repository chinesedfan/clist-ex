import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { ProblemFilter } from '../components/ProblemFilter';
import { getAccountByHandle, getProblemList, getStatisticsByAccountId } from '../apis';
import { ProblemList } from './ProblemList';
import type Statistics from '../types/Statistics';
import Problem from '../types/Problem';

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
    const [problems, setProblems] = useState<Problem[]>([]);
    const [statistics, setStatistics] = useState<Statistics[]>([]);
    useEffect(() => {
        (async function () {
            const problems = await getProblemList();
            setProblems(problems);

            const account = await getAccountByHandle('chinesedfan');
            if (account) {
                const statistics = await getStatisticsByAccountId(account.id);
                setStatistics(statistics);
            }
        })();
    }, [])
    return (
        <div>
            <Tabs items={items} style={{ marginBottom: '16px' }}></Tabs>
            <ProblemList problems={problems} statistics={statistics} />
        </div>
    );
}

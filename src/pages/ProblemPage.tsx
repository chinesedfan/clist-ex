import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { ProblemFilter } from '../components/ProblemFilter';
import { R_CC, R_LC, getAccountByHandle, getProblemList, getStatisticsByAccountId } from '../apis';
import { ProblemList } from './ProblemList';
import type Statistics from '../types/Statistics';
import Problem from '../types/Problem';
import { ProblemFilterContext } from '../components/ProblemFilterContext';
import { getEventByUrl } from '../utils/contest';

const items: TabsProps['items'] = [
    {
        key: R_LC,
        label: 'LeetCode',
        children: (
            <ProblemFilter radios={[
                { label: 'All', value: 0 },
                { label: 'Weekly', value: 'Weekly' },
                { label: 'Biweekly', value: 'Biweekly' },
            ]}></ProblemFilter>        
        ),
    },
    {
        key: R_CC,
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
    const [resource, setResource] = useState<string>(R_LC);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [showProblems, setShowProblems] = useState<Problem[]>([]);
    const [statistics, setStatistics] = useState<Statistics[]>([]);
    useEffect(() => {
        (async function () {
            const problems = await getProblemList(resource);
            setProblems(problems);
            setShowProblems(problems);

            const account = await getAccountByHandle('chinesedfan');
            if (account) {
                const statistics = await getStatisticsByAccountId(account.id);
                setStatistics(statistics);
            }
        })();
    }, [resource]);
    const contextValue = useMemo(() => ({
        onSearch: () => {},
        onRadioChange: (e: RadioChangeEvent) => {
            const keyword = e.target.value;
            if (keyword) {
                setShowProblems(problems.filter(p => {
                    return getEventByUrl(p.url).indexOf(keyword) >= 0;
                }));
            } else {
                setShowProblems(problems);
            }
        },
    }), [problems]);
    return (
        <div>
            <ProblemFilterContext.Provider value={contextValue}>
                <Tabs items={items} onChange={setResource} style={{ marginBottom: '16px' }}></Tabs>
            </ProblemFilterContext.Provider>
            <ProblemList problems={showProblems} statistics={statistics} />
        </div>
    );
}

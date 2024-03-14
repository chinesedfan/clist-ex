import React, { useMemo, useState } from 'react';
import { Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { R_CC, R_LC } from '../apis';
import { ProblemFilter } from '../components/ProblemFilter';
import { ProblemFilterContext } from '../components/ProblemFilterContext';
import { ProblemList } from './ProblemList';

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
                { label: 'Rated for All', value: 'All' },
                { label: 'Rated till 6-stars', value: '6-stars' },
                { label: 'Rated till 5-stars', value: '5-stars' },
                { label: 'Rated for Divs 2, 3 & 4', value: 'Divs 2' },
            ]}></ProblemFilter>        
        ),
    },
];

export const ProblemPage: React.FC = () => {
    const [resource, setResource] = useState<string>(R_LC);
    const [handle, setHandle] = useState<string>('');
    const [eventKeyword, setEventKeyword] = useState<string>('');
    const contextValue = useMemo(() => ({
        onSearch: (handle: string) => {
            setHandle(handle);
        },
        onRadioChange: (e: RadioChangeEvent) => {
            setEventKeyword(e.target.value);
        },
    }), []);
    return (
        <div>
            <ProblemFilterContext.Provider value={contextValue}>
                <Tabs items={items} onChange={setResource} style={{ marginBottom: '16px' }}></Tabs>
            </ProblemFilterContext.Provider>
            <ProblemList resource={resource} handle={handle} eventKeyword={eventKeyword} />
        </div>
    );
}

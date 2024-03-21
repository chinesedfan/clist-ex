import React, { ContextType, useCallback, useState } from 'react';
import { Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { R_CC, R_LC, getAccountByHandle } from '../apis';
import { ProblemFilter } from '../components/ProblemFilter';
import { ProblemFilterContext } from '../components/ProblemFilterContext';
import { ProblemList } from './ProblemList';
import Account from '../types/Account';
import { LOCAL_ACCOUNTS, loadLocalObject, saveLocalObject } from '../services/localstorage';

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
    const [account, setAccount] = useState<Account | undefined>(() => loadLocalObject(LOCAL_ACCOUNTS, resource));
    const [eventKeyword, setEventKeyword] = useState<string>('');

    const contextValue: ContextType<typeof ProblemFilterContext> = {
        onSearch: async (handle: string) => {
            if (!handle) return;
    
            const account = await getAccountByHandle(resource, handle);
            const obj = loadLocalObject(LOCAL_ACCOUNTS) || {};
            saveLocalObject(LOCAL_ACCOUNTS, {
                ...obj,
                [resource]: account,
            });
            setAccount(account);
        },
        onRadioChange: (e: RadioChangeEvent) => {
            setEventKeyword(e.target.value);
        },
        account,
    };
    const onTabChange = useCallback((activeKey: string) => {
        setResource(activeKey);
        setAccount(loadLocalObject(LOCAL_ACCOUNTS, activeKey));
        setEventKeyword('');
    }, []);
    return (
        <div>
            <ProblemFilterContext.Provider value={contextValue}>
                <Tabs items={items} destroyInactiveTabPane onChange={onTabChange} style={{ marginBottom: '16px' }}></Tabs>
            </ProblemFilterContext.Provider>
            <ProblemList resource={resource} account={account} eventKeyword={eventKeyword} />
        </div>
    );
}

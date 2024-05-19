import React, { ContextType, useCallback, useState } from 'react';
import { Alert, Tabs, notification } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { R_CC, R_LC, getAccountsByHandle } from '../apis';
import { ProblemFilter } from '../components/ProblemFilter';
import { ProblemFilterContext } from '../components/ProblemFilterContext';
import { ProblemList } from './ProblemList';
import Account from '../types/Account';
import { LOCAL_ACCOUNTS, LOCAL_HIDE_ALERT_RETRY, loadLocalObject, saveLocalObject } from '../services/localstorage';
import { AccountPicker } from '../components/AccountPicker';

const items: TabsProps['items'] = [
    {
        key: R_LC,
        label: 'LeetCode',
        children: (
            <ProblemFilter radios={[
                { label: 'All', value: '' },
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
                { label: 'All', value: '' },
                { label: 'Rated for All', value: 'All' },
                { label: 'Rated till 6-stars', value: '6.[Ss]tars' },
                { label: 'Rated till 5-stars', value: '5.[Ss]tars' },
                { label: 'Rated for Divs 2, 3 & 4', value: 'Divs 2' },
            ]}></ProblemFilter>        
        ),
    },
];

export const ProblemPage: React.FC = () => {
    const [resource, setResource] = useState<string>(R_LC);
    const [account, setAccount] = useState<Account | undefined>(() => loadLocalObject(LOCAL_ACCOUNTS, resource));
    const [eventKeyword, setEventKeyword] = useState<string>('');
    const [openAccountPicker, setOpenAccountPicker] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);

    function updateAccount(account: Account) {
        const obj = loadLocalObject(LOCAL_ACCOUNTS) || {};
        saveLocalObject(LOCAL_ACCOUNTS, {
            ...obj,
            [resource]: account,
        });
        setAccount(account);
    }

    const contextValue: ContextType<typeof ProblemFilterContext> = {
        onSearch: async (handle, setLoading) => {
            if (!handle) return;
    
            setLoading(true);
            const accounts = await getAccountsByHandle(resource, handle);
            if (accounts.length > 1) {
                setAccounts(accounts);
                setOpenAccountPicker(true);
            } else if (accounts.length === 1) {
                updateAccount(accounts[0]);
            } else {
                notification.error({
                    message: 'Not found any accounts.',
                });
            }
            setLoading(false);
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
    const onAccountPicked = useCallback((account: Account) => {
        updateAccount(account);
        setOpenAccountPicker(false);
    }, [updateAccount]);

    const hideAlertRetry = localStorage.getItem(LOCAL_HIDE_ALERT_RETRY);

    return (
        <div>
            { !hideAlertRetry && <Alert message="It may cost more time when loading contests at the first time. If failed, please switch LeetCode/CodeChef tabs to retry." type="info" showIcon closable onClose={() => localStorage.setItem(LOCAL_HIDE_ALERT_RETRY, '1')} />}
            <ProblemFilterContext.Provider value={contextValue}>
                <Tabs items={items} destroyInactiveTabPane onChange={onTabChange} style={{ marginBottom: '16px' }}></Tabs>
            </ProblemFilterContext.Provider>
            <AccountPicker open={openAccountPicker} accounts={accounts}
                onAccountPicked={onAccountPicked} onModalCancel={() => setOpenAccountPicker(false)}></AccountPicker> 
            <ProblemList resource={resource} account={account} eventKeyword={eventKeyword} />
        </div>
    );
}

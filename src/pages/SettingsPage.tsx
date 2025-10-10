import { Button, Flex, Input, Radio, RadioChangeEvent, Space, Typography, notification } from "antd";
import { useCallback, useState } from "react";
import { STORE_CC, STORE_LC } from "../services";
import { LOCAL_CLIST_APIKEY, LOCAL_LEETCODE_COOKIE, LOCAL_STATISTICS_STRATEGY, StatisticsStrategy, useLocalStorage } from "../services/localstorage";

const { Title } = Typography;

const strategyRadioItems = [
    { label: 'Network First', value: StatisticsStrategy.NetworkFirst },
    { label: 'Cache First (if Non-Empty)', value: StatisticsStrategy.CacheFirstIfNonEmpty },
    { label: 'Cache First', value: StatisticsStrategy.CacheFirst },
];

export const SettingsPage: React.FC<any> = (props) => {
    const [apiKey, setAPIKey] = useState(localStorage.getItem(LOCAL_CLIST_APIKEY) || '');
    const [leetcodeCookie, setLeetCodeCookie] = useState(localStorage.getItem(LOCAL_LEETCODE_COOKIE) || '');
    const [strategy, setStrategy] = useLocalStorage(LOCAL_STATISTICS_STRATEGY, StatisticsStrategy.CacheFirstIfNonEmpty, {
        raw: true,
    });
    const onBtnSaveKeyClicked = useCallback(() => {
        localStorage.setItem(LOCAL_CLIST_APIKEY, apiKey);
        notification.info({
            message: `Save ${LOCAL_CLIST_APIKEY} in local storage.`,
        });
    }, [apiKey]);
    const onBtnSaveCookieClicked = useCallback(() => {
        localStorage.setItem(LOCAL_LEETCODE_COOKIE, leetcodeCookie);
        notification.info({
            message: `Save ${LOCAL_LEETCODE_COOKIE} in local storage.`,
        });
    }, [leetcodeCookie]);
    const onBtnResetLockClicked = useCallback((storeName: string) => {
        localStorage.removeItem(storeName);
        notification.info({
            message: `Remove ${storeName} in local storage.`,
        });
    }, []);
    const onStrategyRadioChange = useCallback((e: RadioChangeEvent) => {
        setStrategy(e.target.value);
        notification.info({
            message: `Save ${LOCAL_STATISTICS_STRATEGY} in local storage.`,
        });
    }, []);

    return (<>
        <Title level={3}>API Key</Title>
        <p>Set your own key according to <a href="https://clist.by/api/v4/doc/" target="_blank">clist.by docs</a>. Leaving it empty will use the default API key, which only supports 10 request per minute. Users may face "Too many requests" errors easily.</p>
        <Space.Compact style={{ width: '600px' }}>
            <Input placeholder="ApiKey xxx:xxx" defaultValue={apiKey} onChange={(e) => setAPIKey(e.currentTarget.value)}></Input>
            <Button type="primary" onClick={onBtnSaveKeyClicked}>Save</Button>
        </Space.Compact>
        <Title level={3}>LeetCode Cookie</Title>
        <p>Set your LeetCode cookie to load accurate problem status from official websites, instead of clist.</p>
        <Flex>
            <Input.TextArea placeholder={'1. open leetcode.com/cn.\n2. print document.cookie in console.\n3. copy and paste here.'} defaultValue={leetcodeCookie} onChange={(e) => setLeetCodeCookie(e.currentTarget.value)} rows={4} style={{ resize: 'none', width: '527px', marginRight: '10px' }}></Input.TextArea>
            <Button type="primary" onClick={onBtnSaveCookieClicked}>Save</Button>
        </Flex>
        <Title level={3}>Contests Cache</Title>
        <p>By default, contests will only be loaded in every single day, and a timestamp is saved in local storage. If failed or want to reload immediately, click following buttons.</p>
        <Flex>
            <Button type="primary" onClick={() => onBtnResetLockClicked(STORE_LC)}>LeetCode Contests</Button>
            <Button type="primary" onClick={() => onBtnResetLockClicked(STORE_CC)} style={{ marginLeft: '20px' }}>CodeChef Contests</Button>
        </Flex>
        <Title level={3}>Statistics Cache</Title>
        <p>Switch different cache strategies for contest statistics data.</p>
        <Radio.Group defaultValue={strategy} onChange={onStrategyRadioChange}>
            { strategyRadioItems.map(item => (
                <Radio.Button value={item.value} key={item.value}>{item.label}</Radio.Button>
            ))}
        </Radio.Group>
    </>);
}

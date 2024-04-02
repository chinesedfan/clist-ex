import { Button, Flex, Input, Radio, RadioChangeEvent, Space, Typography, notification } from "antd";
import { useCallback, useState } from "react";
import { STORE_CC, STORE_LC } from "../services";
import { LOCAL_CLIST_APIKEY, LOCAL_STATISTICS_STRATEGY, StatisticsStrategy, useLocalStorage } from "../services/localstorage";

const { Title } = Typography;

const strategyRadioItems = [
    { label: 'Network Only', value: StatisticsStrategy.NetworkOnly },
    { label: 'Cache First (if Non-Empty)', value: StatisticsStrategy.CacheFirstIfNonEmpty },
    { label: 'Cache First', value: StatisticsStrategy.CacheFirst },
];

export const SettingsPage: React.FC<any> = (props) => {
    const [apiKey, setAPIKey] = useState(localStorage.getItem(LOCAL_CLIST_APIKEY) || '');
    const [strategy, setStrategy] = useLocalStorage(LOCAL_STATISTICS_STRATEGY, StatisticsStrategy.CacheFirstIfNonEmpty);
    const onBtnSaveKeyClicked = useCallback(() => {
        localStorage.setItem(LOCAL_CLIST_APIKEY, apiKey);
        notification.info({
            message: `Save ${LOCAL_CLIST_APIKEY} in local storage.`,
        });
    }, [apiKey]);
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
        <Title level={3}>Contests Cache</Title>
        <p>By default, contests will only be loaded in every 2 days, and a timestamp is saved in local storage. If failed or want to reload immediately, click following buttons.</p>
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

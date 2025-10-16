import { Button, Flex, Input, Radio, RadioChangeEvent, Space, Typography, notification } from "antd";
import { useCallback, useState } from "react";
import { STORE_CC, STORE_LC } from "../services";
import { defaultSettings, LOCAL_SETTINGS, SettingsKey, StatisticsStrategy, useLocalStorage } from "../services/localstorage";

const { Title } = Typography;

const strategyRadioItems = [
    { label: 'Network First', value: StatisticsStrategy.NetworkFirst },
    { label: 'Cache First (if Non-Empty)', value: StatisticsStrategy.CacheFirstIfNonEmpty },
    { label: 'Cache First', value: StatisticsStrategy.CacheFirst },
];

export const SettingsPage: React.FC<any> = (props) => {
    const [settings, setSettings] = useLocalStorage<Record<string, any> >(LOCAL_SETTINGS, defaultSettings);

    const [apiKey, setAPIKey] = useState(settings![SettingsKey.Apikey] || '');
    const [leetcodeUserName, setLeetCodeUserName] = useState(settings![SettingsKey.LeetCodeUserName] || '');
    const [leetcodeSession, setLeetCodeSession] = useState(settings![SettingsKey.LeetCodeSession] || '');

    const onBtnSaveKeyClicked = useCallback(() => {
        setSettings((prev) => ({ ...prev, [SettingsKey.Apikey]: apiKey }));
        notification.info({
            message: `Save ${SettingsKey.Apikey} in local storage.`,
        });
    }, [apiKey, settings]);
    const onBtnSaveCookieClicked = useCallback(() => {
        setSettings((prev) => ({
            ...prev,
            [SettingsKey.LeetCodeUserName]: leetcodeUserName,
            [SettingsKey.LeetCodeSession]: leetcodeSession,
        }));
        notification.info({
            message: `Save ${SettingsKey.LeetCodeSession} in local storage.`,
        });
    }, [leetcodeUserName, leetcodeSession, settings]);
    const onBtnResetLockClicked = useCallback((storeName: string) => {
        localStorage.removeItem(storeName);
        notification.info({
            message: `Remove ${storeName} in local storage.`,
        });
    }, []);
    const onStrategyRadioChange = useCallback((e: RadioChangeEvent) => {
        setSettings((prev) => ({ ...prev, [SettingsKey.StatisticsStrategy]: e.target.value }));
        notification.info({
            message: `Save ${SettingsKey.StatisticsStrategy} in local storage.`,
        });
    }, [settings]);

    return (<>
        <Title level={3}>API Key</Title>
        <p>Set your own key according to <a href="https://clist.by/api/v4/doc/" target="_blank">clist.by docs</a>. Leaving it empty will use the default API key, which only supports 10 request per minute. Users may face "Too many requests" errors easily.</p>
        <Space.Compact style={{ width: '600px' }}>
            <Input placeholder="ApiKey xxx:xxx" defaultValue={apiKey} onChange={(e) => setAPIKey(e.currentTarget.value)}></Input>
            <Button type="primary" onClick={onBtnSaveKeyClicked}>Save</Button>
        </Space.Compact>
        <Title level={3}>LeetCode Cookie</Title>
        <p>Set your LeetCode username and LEETCODE_SESSION cookie to load accurate problem status from official websites, instead of clist.</p>
        <Input placeholder="LeetCode UserName" defaultValue={leetcodeUserName} onChange={(e) => setLeetCodeUserName(e.currentTarget.value)} style={{ width: '527px', marginBottom: '10px' }}></Input>
        <Flex align="end">
            <Input.TextArea placeholder={'LeetCode Session\n1. open leetcode.com/cn in browser.\n2. find cookie LEETCODE_SESSION in Application -> Cookies.\n3. copy and paste here.'} defaultValue={leetcodeSession} onChange={(e) => setLeetCodeSession(e.currentTarget.value)} rows={5} style={{ resize: 'none', width: '527px', marginRight: '10px' }}></Input.TextArea>
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
        <Radio.Group defaultValue={settings![SettingsKey.StatisticsStrategy]} onChange={onStrategyRadioChange}>
            { strategyRadioItems.map(item => (
                <Radio.Button value={item.value} key={item.value}>{item.label}</Radio.Button>
            ))}
        </Radio.Group>
    </>);
}

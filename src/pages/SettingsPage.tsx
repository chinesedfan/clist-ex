import { Button, Flex, Typography, notification } from "antd";
import { useCallback } from "react";
import { STORE_CC, STORE_LC } from "../services";

const { Title } = Typography;

export const SettingsPage: React.FC<any> = (props) => {
    const onButtonClicked = useCallback((storeName: string) => {
        localStorage.removeItem(storeName);
        notification.info({
            message: `Remove ${storeName} in local storage.`,
        });
    }, []);

    return (<>
        <Title level={3}>Reset Cache</Title>
        <p>By default, contests will only be loaded in every 2 days, and a timestamp is saved in local storage. If failed or want to reload immediately, click following buttons.</p>
        <Flex>
            <Button type="primary" onClick={() => onButtonClicked(STORE_LC)}>LeetCode Contests</Button>
            <Button type="primary" onClick={() => onButtonClicked(STORE_CC)} style={{ marginLeft: '20px' }}>CodeChef Contests</Button>
        </Flex>
    </>);
}

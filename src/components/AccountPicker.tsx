import { useCallback, useState } from 'react';
import { Modal, Radio, RadioChangeEvent, Space } from 'antd';
import Account from '../types/Account';

interface Props {
    open: boolean;
    accounts: Account[];
    onAccountPicked: (account: Account) => void;
    onModalCancel: () => void;
}
export const AccountPicker: React.FC<Props> = props => {
    const { open, accounts, onAccountPicked, onModalCancel } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onChange = useCallback((e: RadioChangeEvent) => {
        setSelectedIndex(e.target.value);
    }, [])
    const onOk = () => {
        onAccountPicked(accounts[selectedIndex]);
    };

    return <>
        <Modal title="Pick your account" open={open} onOk={onOk} onCancel={onModalCancel}>
            <Radio.Group onChange={onChange} value={selectedIndex}>
                <Space direction="vertical">
                    {accounts.map((account, i) => {
                        return <Radio key={account.id} value={i}>{account.handle}</Radio>
                    })}
                </Space>
            </Radio.Group>
        </Modal>
    </>;
}

import React, { useContext, useState } from 'react';
import { Col, Input, Radio, Row } from 'antd';
import { ProblemFilterContext } from './ProblemFilterContext';
import { R_LC } from '../apis';

const { Search } = Input;

interface RadioItem {
    label: string;
    value: string | number;
}
interface Props {
    radios: RadioItem[];
}
export const ProblemFilter: React.FC<Props> = props => {
    const [loading, setLoading] = useState(false);
    const { onRadioChange, onSearch, account } = useContext(ProblemFilterContext);
    let defaultValue = account?.handle;
    if (account && account.resource === R_LC) {
        // handle in leetcode.com has extra letters
        // i.e. chinesedfan@.com
        defaultValue = account.name;
    }

    return (<Row justify="space-between">
        <Col span={4}>
            <Search placeholder="handle" onSearch={(key) => onSearch!(key, setLoading)} loading={loading} defaultValue={defaultValue}></Search>
        </Col>
        <Radio.Group defaultValue={''} onChange={onRadioChange}>
            { props.radios.map(item => (
                <Radio.Button value={item.value} key={item.value}>{item.label}</Radio.Button>
            ))}
        </Radio.Group>
    </Row>);
}

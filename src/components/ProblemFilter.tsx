import React, { useContext } from 'react';
import { Col, Input, Radio, Row } from 'antd';
import { ProblemFilterContext } from './ProblemFilterContext';

const { Search } = Input;

interface RadioItem {
    label: string;
    value: string | number;
}
interface Props {
    radios: RadioItem[];
}
export const ProblemFilter: React.FC<Props> = props => {
    const { onRadioChange, onSearch, account } = useContext(ProblemFilterContext);
    return (<Row justify="space-between">
        <Col span={4}>
            <Search placeholder="handle" onSearch={onSearch} defaultValue={account?.name}></Search>
        </Col>
        <Radio.Group defaultValue={0} onChange={onRadioChange}>
            { props.radios.map(item => (
                <Radio.Button value={item.value} key={item.value}>{item.label}</Radio.Button>
            ))}
        </Radio.Group>
    </Row>);
}

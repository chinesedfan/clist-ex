import React from 'react';
import { Col, Input, Radio, Row } from 'antd';

const { Search } = Input;

interface RadioItem {
    label: string;
    value: string | number;
}
interface Props {
    radios: RadioItem[];
}
export const ProblemFilter: React.FC<Props> = props => (
    <Row justify="space-between">
        <Col span={4}>
            <Search placeholder='handle'></Search>
        </Col>
        <Radio.Group defaultValue={0}>
            { props.radios.map(item => (
                <Radio.Button value={item.value} key={item.value}>{item.label}</Radio.Button>
            ))}
        </Radio.Group>
    </Row>
);

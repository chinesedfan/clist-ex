import React, { useEffect } from 'react';
import { Flex, Typography } from 'antd';
import { ProblemProgress } from '../components/ProblemProgress';
import data from '../mock/result.json';

const { Title } = Typography;

export const ProblemPage: React.FC = () => {
    return (<>
        <Title level={3}>LeetCode Problems</Title>
        <Flex wrap='wrap' gap={'20px'}>
            { data.map((item, index) => (
                <div key={index} style={{ width: 'calc(20% - 20px)' }}>
                    <ProblemProgress item={item} />
                </div>
            )) }
        </Flex>
    </>);
};

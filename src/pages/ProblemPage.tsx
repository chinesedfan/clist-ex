import React from 'react';
import { Flex, Progress } from 'antd';
import { LC_COLORS } from '../utils/rating';

export const ProblemPage: React.FC = () => {
    return (
        <Flex wrap='wrap' gap={'20px'}>
            { LC_COLORS.map((color, index) => (
                <div key={index} style={{ width: 'calc(25% - 15px)' }}>
                    <Progress type="circle" percent={20} strokeColor={color} size={120} />
                </div>
            )) }
        </Flex>
    );
};

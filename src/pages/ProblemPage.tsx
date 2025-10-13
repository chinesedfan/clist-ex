import React, { useEffect } from 'react';
import { Flex, Progress } from 'antd';
import { LC_COLORS } from '../utils/rating';
import { fetchLeetCodeProblems } from '../apis/leetcode';

export const ProblemPage: React.FC = () => {
    useEffect(() => {
        fetchLeetCodeProblems();
    }, []);
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

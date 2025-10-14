import React, { useEffect, useState } from 'react';
import { Flex, Typography } from 'antd';
import { ProblemProgress, ProblemProgressItem } from '../components/ProblemProgress';
import { loadLeetCodeProblems } from '../services';
import { fetchLeetCodeRatings } from '../apis/leetcode';

const { Title } = Typography;

const defaultData = [
    { "rating": 0, "range": 1200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 1200, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 1400, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 1600, "range": 300, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 1900, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 2100, "range": 300, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 2400, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 2600, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 2800, "range": 200, "total": 0, "solved": 0, "attempted": 0 },
    { "rating": 3000, "range": 0, "total": 0, "solved": 0, "attempted": 0 }
]

export const ProblemPage: React.FC = () => {
    const [data, setData] = useState<ProblemProgressItem[]>([]);
    useEffect(() => {
        (async () => {
            const ratings = await fetchLeetCodeRatings();
            const ratingsMap = ratings.reduce((map, item) => {
                map[item.ID] = item.Rating;
                return map;
            }, {} as Record<string, number>); 

            const currentData = defaultData
            const problems = await loadLeetCodeProblems();
            problems.forEach(p => {
                const rating = ratingsMap[p.questionFrontendId];
                for (let i = currentData.length - 1; i >= 0; i--) {
                    const o = currentData[i]
                    if (rating >= o.rating) {
                        o.total++;
                        if (p.status === 'ac') {
                            o.solved++;
                        } else if (p.status === 'notac') {
                            o.attempted++;
                        } 
                        break;
                    }
                }
            });
            setData(currentData);
        })();
    }, []);

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

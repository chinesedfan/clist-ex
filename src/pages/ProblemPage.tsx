import React, { useEffect, useState } from 'react';
import { Alert, Flex, Typography } from 'antd';
import { ProblemProgress, ProblemProgressItem } from '../components/ProblemProgress';
import { loadLeetCodeProblems } from '../services';
import { fetchLeetCodeRatings } from '../apis/leetcode';
import { log } from '../utils/log';

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
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            const ratings = await fetchLeetCodeRatings();
            const ratingsMap = ratings.reduce((map, item) => {
                map[item.ID] = item.Rating;
                return map;
            }, {} as Record<string, number>); 

            const currentData = defaultData
            const problems = await loadLeetCodeProblems();
            let unknownCount = 0;
            problems.forEach(p => {
                const rating = ratingsMap[p.questionFrontendId];
                if (rating === undefined) {
                    unknownCount++;
                }
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
            log(`Unknown ratings count: ${unknownCount}`);
            setData(currentData);
            setLoading(false);
        })();
    }, []);

    return (<>
        <Title level={3}>LeetCode Problems</Title>
        { loading && <Alert message="Loading may take 1-2 mins (make sure you solved CORS problem and set LeetCode cookie in Settings page)..." type="info" showIcon /> }
        <Flex wrap='wrap' gap={'20px'}>
            { data.map((item, index) => (
                <div key={index} style={{ width: 'calc(20% - 20px)' }}>
                    <ProblemProgress item={item} />
                </div>
            )) }
        </Flex>
    </>);
};

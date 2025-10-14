import React from 'react';
import { Progress } from 'antd';
import { SinglePieChart } from './SinglePieChart';
import { getRatingColor } from '../utils/rating';
import { R_LC } from '../apis';
import '../styles/problem-progress.scss';

export interface ProblemProgressItem {
    total: number;
    solved: number;
    attempted: number;
    rating: number;
    range?: number;
}

interface Props {
    item: ProblemProgressItem;
}

function calPercent(total: number, current: number): number {
    return Math.round((current / total) * 100);
}

export const ProblemProgress: React.FC<Props> = ({ item: e }) => {
    return (
        <div>
            <SinglePieChart
                data={[
                    { name: "AC", color: getRatingColor(R_LC, e.rating), value: e.solved },
                    { name: "Non-AC", color: "#fd9", value: e.attempted },
                    {
                    name: "NoSub",
                    color: "#58616a",
                    value: e.total - e.solved - e.attempted,
                    },
                ]}
            />
            <h5 className="text-muted">{`${e.solved} / ${e.total}`}</h5>
            <h5>{e.rating + '-' + (e.range ? e.rating + e.range - 1 : '')}</h5>
        </div>
    );
};

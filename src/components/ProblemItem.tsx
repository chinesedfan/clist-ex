import React from 'react';
import { Flex, Tooltip } from 'antd';
import { isCCContestProblem } from '../types/Contest';
import { isUpsolvingResult } from '../types/Statistics';
import { getRatingColor, getRatingPercent } from '../utils/rating';
import { ProblemItemData } from '../utils/contest';

interface Props {
    data?: ProblemItemData;
    resource: string;
}

export const ProblemItem: React.FC<Props> = ({ data, resource }) => {
    if (!data) return null;

    const { problem, result } = data;
    let contestClassName = 'problem-content';
    if (result) {
        if (isUpsolvingResult(result)) {
            contestClassName += ' upsolved';
        } else {
            contestClassName += ' solved';
        }
    }

    const color = getRatingColor(resource, problem.rating);
    const percent = getRatingPercent(resource, problem.rating);
    const circleStyle = {
        borderColor: color,
        background: `linear-gradient(to top, ${color} ${percent}%, white ${percent}%)`,
    };
    const spanStyle = {
        color,
    };
    if (color === 'black') {
        circleStyle.borderColor = 'red';
        circleStyle.background = 'none';
        spanStyle.color = 'red';
    }
    const problemTime = isUpsolvingResult(result)
        ? ''
        : result?.time
    const problemPenalty = isUpsolvingResult(result)
        ? ''
        : result?.result
    const problemDivisions = isCCContestProblem(problem)
        ? problem.divisions!.reduce((s, x) => (s | (1 << +x[4])), 0)
        : 0;
    return <>
        <Flex className={contestClassName} align="center">
            <Tooltip title={"Rating: " + problem.rating}>
                <span className={'difficult-circle ' + color} style={circleStyle}></span>
            </Tooltip>
            <a className="problem-link" style={spanStyle} href={problem.url} target="_blank">{isCCContestProblem(problem) ? problem.short : problem.id + '. ' + problem.name}</a>
        </Flex>
        { !!result && 
            <div className="problem-statistics">
                <span className="problem-time">{problemTime}</span>
                { problemPenalty && problemPenalty !== '+' &&
                    <span className="problem-penalty">({problemPenalty})</span>
                }
            </div>
        }
        { !!problemDivisions &&
            <div className="problem-divisions">
                { [1, 2, 3, 4].map(x => {
                    const visibility = (problemDivisions & (1 << x)) ? 'visible' : 'hidden';
                    return <div className={'problem-div-' + x } key={x} style={{ visibility }}></div>;
                }) }
            </div>
        }
    </>;
};
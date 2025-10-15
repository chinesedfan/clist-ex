import React from 'react';
import { Flex } from 'antd';
import { R_CC } from '../apis';
import { ReactComponent as IconUp } from '../styles/anticon-up.svg';
import { ReactComponent as IconDown } from '../styles/anticon-down.svg';
import { getRatingColor } from '../utils/rating';
import { ContestItemData } from '../utils/contest';

interface Props {
    data: ContestItemData;
    resource: string;
}

export const ContestItem: React.FC<Props> = ({ data, resource }) => {
    const  {
        n_problems, n_problems_solved, n_problems_upsolved,
        place, new_rating, rating_change
    } = data;
    // FIXME: lots of type assert
    let className = 'contest-content';
    if (n_problems_solved === n_problems) {
        className += ' solved';
    } else if (n_problems_solved! + n_problems_upsolved! === n_problems) {
        className += ' upsolved';
    }
    let statisticsClassName = 'contest-statistics' 
    if (resource === R_CC) statisticsClassName += ' code-chef';

    let ratingColor = new_rating ? getRatingColor(resource, new_rating) : 'grey';
    let ratingClassName = '';
    if (ratingColor === 'black') {
        ratingColor = 'red';
        ratingClassName = 'rating-legendary';
    }
    let ratingChangeSegment = <></>;
    if (rating_change !== undefined) {
        const ratingChangeIcon = rating_change >= 0 ? <IconUp /> : <IconDown />;
        const ratingChangeColor = rating_change >= 0 ? 'green' : 'red';
        ratingChangeSegment = <>
            { ratingChangeIcon }
            <div style={{ marginLeft: '1px', color: ratingChangeColor, fontWeight: 'bold' }}>{Math.abs(rating_change!)}</div>
        </>;
    }

    return <Flex className={className} align="center">
        <div className="contest-name">{data.event}</div>
        { n_problems_solved! > 0 && <Flex className={statisticsClassName} align="center">
            <div className={ratingClassName} style={{ fontWeight: 'bold', color: ratingColor, marginRight: '5px' }}>{new_rating || '-'}</div>
            { ratingChangeSegment }
            <div className="contest-place">rank {place}</div>
        </Flex>
        }
    </Flex>;
};
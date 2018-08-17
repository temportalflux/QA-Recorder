// https://github.com/video-react/video-react/blob/master/src/components/control-bar/PlayProgressBar.js
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {formatTime} from "video-react/lib/utils/index";

const propTypes = {
    currentTime: PropTypes.number,
    duration: PropTypes.number,
    percentage: PropTypes.string,
    className: PropTypes.string,
};

// Shows play progress
export default function PlayProgressBar({ currentTime, duration, percentage, className }) {
    return (
        <div
            data-current-time={formatTime(currentTime, duration)}
            className={classNames('video-react-play-progress video-react-slider-bar', className)}
            style={{
                width: percentage,
                backgroundColor: 'rgba(0, 0, 0, 0)',
            }}
        >
            <span className="video-react-control-text"><span>Progress</span>: {percentage}</span>
        </div>
    );
}

PlayProgressBar.propTypes = propTypes;
PlayProgressBar.displayName = 'PlayProgressBar';

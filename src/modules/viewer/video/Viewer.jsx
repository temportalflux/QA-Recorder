import React from 'react';
import PropTypes from 'prop-types';
import {Player} from 'video-react';
import TimestampDisplayBar, {TIMESTAMP_DEFAULT_DURATION} from './TimestampDisplayBar';
import ControlBar from "./monkeypatch/ControlBar";
import {Header, Message, Segment} from "semantic-ui-react";
import moment from "moment";
import * as shortid from "shortid";
import * as lodash from "lodash";

// https://video-react.js.org/components/player/
export default class Viewer extends React.Component {

    constructor(props) {
        super(props);

        this._getPlaybackTime = this._getPlaybackTime.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.load = this.load.bind(this);
        this.changeCurrentTime = this.changeCurrentTime.bind(this);
        this.seek = this.seek.bind(this);
        this.changePlaybackRateRate = this.changePlaybackRateRate.bind(this);
        this.changeVolume = this.changeVolume.bind(this);
        this.setMuted = this.setMuted.bind(this);
        this.renderTimestampBar = this.renderTimestampBar.bind(this);
        this.getTimestampsFor = this.getTimestampsFor.bind(this);

        this.state = {
            player: undefined,
        };

    }

    componentDidMount() {
        // subscribe state change
        this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
    }

    handleStateChange(state, prevState) {
        // copy player state to this component's state
        this.setState({
            player: state
        });
    }

    play() {
        this.refs.player.play();
    }

    pause() {
        this.refs.player.pause();
    }

    load() {
        this.refs.player.load();
    }

    changeCurrentTime(seconds) {
        return () => {
            const { player } = this.refs.player.getState();
            const currentTime = player.currentTime;
            this.refs.player.seek(currentTime + seconds);
        };
    }

    _getPlaybackTime() {
        return this.refs.player.getState().player.currentTime * 1000;
    }

    seek(seconds) {
        return () => {
            this.refs.player.seek(seconds);
        };
    }

    changePlaybackRateRate(steps) {
        return () => {
            const { player } = this.refs.player.getState();
            const playbackRate = player.playbackRate;
            this.refs.player.playbackRate = playbackRate + steps;
        };
    }

    changeVolume(steps) {
        return () => {
            const { player } = this.refs.player.getState();
            const volume = player.volume;
            this.refs.player.volume = volume + steps;
        };
    }

    setMuted(muted) {
        return () => {
            this.refs.player.muted = muted;
        };
    }

    static requestDuration(fileUrl) {
        return new Promise(resolve => {
            let video = document.createElement('video');
            video.src = fileUrl;
            video.addEventListener('loadedmetadata', (e) => {
                document.body.removeChild(video);
                let seconds = Math.floor(video.duration);
                let ms = (video.duration - seconds) * 1000;
                resolve({
                    seconds: seconds,
                    ms: ms,
                });
            });
            document.body.appendChild(video);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.source !== prevProps.source) {
            this.refs.player.load();
        }
    }

    renderTimestampBar(info) {
        return (
            <TimestampDisplayBar
                {...info}
                totalTimeMs={this.props.duration}
                timestamps={this.props.timestamps}
                getPlaybackTime={this._getPlaybackTime}
            />
        );
    }

    getTimestampsFor(time) {
        return lodash.filter(this.props.timestamps, (timestamp) => {
            const duration = timestamp.duration !== undefined ? timestamp.duration : TIMESTAMP_DEFAULT_DURATION;
            return timestamp.start <= time &&
                (timestamp.end !== undefined ? timestamp.end : timestamp.start + duration) >= time;
        });
    }

    static formatMs(ms) {
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        seconds -= minutes * 60;
        ms -= seconds * 1000;
        return `${hours}:${minutes}:${seconds}:${ms}`;
    }

    render() {
        let {player} = this.state;
        let currentTime = (player && player.currentTime ? player.currentTime : 0) * 1000;
        let timestamps = this.getTimestampsFor(currentTime);

        return (
            <div>

                <Player
                    ref="player"
                    src={this.props.source}
                    //autoPlay
                >
                    <ControlBar
                        autoHide={false}
                        renderUnderlay={this.renderTimestampBar}
                    />
                </Player>

                <Header>Comment(s):</Header>
                <Segment>
                    {timestamps.length <= 0 && <p>No comments at this timestamp.</p>}
                    {timestamps.map((timestamp) => {
                        let start = timestamp.start;
                        let duration = timestamp.duration !== undefined ? timestamp.duration : TIMESTAMP_DEFAULT_DURATION;
                        let end = timestamp.end !== undefined ? timestamp.end : start + duration;
                        start = Viewer.formatMs(start);//moment(start).format('HH:mm:ss');
                        end = Viewer.formatMs(end);//moment(end).format('HH:mm:ss');
                        return (
                            <div key={shortid.generate()}>
                                <Header>{start} - {end}</Header>
                                <Message>{timestamp.comment}</Message>
                            </div>
                        );
                    })}
                </Segment>

                <Header>Form Response:</Header>
                <Segment>
                    No form data loaded.
                </Segment>

            </div>
        );
    }

}

Viewer.defaultProps = {
    source: undefined, // 'http://media.w3.org/2010/05/bunny/movie.mp4'
    duration: 0,
    timestamps: [],
};

Viewer.propTypes = {
    source: PropTypes.string,
    duration: PropTypes.number,
    timestamps: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.shape({
            start: PropTypes.number.isRequired,
            end: PropTypes.number,
            comment: PropTypes.string,
        }),
        PropTypes.shape({
            start: PropTypes.number.isRequired,
            duration: PropTypes.number,
            comment: PropTypes.string,
        }),
    ])),
};

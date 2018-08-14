import React from 'react';
import { ControlBar, Player } from 'video-react';
import TimestampDisplayBar from './TimestampDisplayBar';

// https://video-react.js.org/components/player/
export default class Viewer extends React.Component {

    constructor(props) {
        super(props);

        this._loadVideo = this._loadVideo.bind(this);
        this._getPlaybackTime = this._getPlaybackTime.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.load = this.load.bind(this);
        this.changeCurrentTime = this.changeCurrentTime.bind(this);
        this.seek = this.seek.bind(this);
        this.changePlaybackRateRate = this.changePlaybackRateRate.bind(this);
        this.changeVolume = this.changeVolume.bind(this);
        this.setMuted = this.setMuted.bind(this);

        this.state = {
            source: undefined,
            duration: 0,
            timestamps: [],
        };
    }

    componentDidMount() {
        // subscribe state change
        this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
        this._loadVideo().then(data => {
            data.timestamps = [
                {
                    start: 0,
                    end: 0.15 * data.duration,
                },
                {
                    start: 0.20 * data.duration,
                    duration: 0.15 * data.duration,
                },
                {
                    start: 0.40 * data.duration,
                    duration: 0.15 * data.duration,
                },
                {
                    start: 0.60 * data.duration,
                    duration: 0.15 * data.duration,
                },
                {
                    start: 0.80 * data.duration,
                    duration: 0.15 * data.duration,
                },
            ];
            this.setState(data);
        });
    }

    async _loadVideo() {
        let url = 'http://media.w3.org/2010/05/bunny/movie.mp4';
        let duration = await Viewer.requestDuration(url);
        return {
            source: url,
            duration: duration,
        };
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

    static async requestFileData(fileUrl, responseType='arraybuffer') {
        return await new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', fileUrl, true);
            xhr.responseType = responseType;
            xhr.onload = (e) => {
                let result = {
                    response: xhr.response,
                    status: xhr.status,
                };
                if (result.status === 200) {
                    resolve(result);
                }
                else {
                    reject(result);
                }
            };
            xhr.send();
        });
    }

    static async getDurationFromRequest(arraybufferData) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        let buffer = await audioCtx.decodeAudioData(arraybufferData);
        let durationInSeconds = buffer.duration;
        return durationInSeconds * 1000;
    }

    static async requestDuration(fileUrl) {
        let result = await Viewer.requestFileData(fileUrl, 'arraybuffer');
        if (result.status === 200)
        {
            return await Viewer.getDurationFromRequest(result.response);
        }
        return 0;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.source !== prevState.source) {
            this.refs.player.load();
        }
    }

    render() {
        return (
            <div>
                <Player
                    ref="player"
                    src={this.state.source}
                    //autoPlay
                >
                    <ControlBar autoHide={false}/>
                </Player>
                {/*
                <div className="py-3">
                    <Button onClick={this.play} className="mr-3">play()</Button>
                    <Button onClick={this.pause} className="mr-3">pause()</Button>
                    <Button onClick={this.load} className="mr-3">load()</Button>
                </div>
                <div className="pb-3">
                    <Button onClick={this.changeCurrentTime(10)} className="mr-3">currentTime +=
                        10</Button>
                    <Button onClick={this.changeCurrentTime(-10)} className="mr-3">currentTime -=
                        10</Button>
                    <Button onClick={this.seek(50)} className="mr-3">currentTime = 50</Button>
                </div>
                <div className="pb-3">
                    <Button onClick={this.changePlaybackRateRate(1)}
                            className="mr-3">playbackRate++</Button>
                    <Button onClick={this.changePlaybackRateRate(-1)}
                            className="mr-3">playbackRate--</Button>
                    <Button onClick={this.changePlaybackRateRate(0.1)}
                            className="mr-3">playbackRate+=0.1</Button>
                    <Button onClick={this.changePlaybackRateRate(-0.1)}
                            className="mr-3">playbackRate-=0.1</Button>
                </div>
                <div className="pb-3">
                    <Button onClick={this.changeVolume(0.1)} className="mr-3">volume+=0.1</Button>
                    <Button onClick={this.changeVolume(-0.1)} className="mr-3">volume-=0.1</Button>
                    <Button onClick={this.setMuted(true)} className="mr-3">muted=true</Button>
                    <Button onClick={this.setMuted(false)} className="mr-3">muted=false</Button>
                </div>
                */}
                <TimestampDisplayBar
                    totalTimeMs={this.state.duration}
                    timestamps={this.state.timestamps}
                    getPlaybackTime={this._getPlaybackTime}
                />
            </div>
        );
    }

}

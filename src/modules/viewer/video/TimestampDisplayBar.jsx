import React from 'react';
import * as shortid from 'shortid';

export default class TimestampDisplayBar extends React.Component {

    // TODO: L-Click bar seeks video to that timestamp
    // TODO: R-Click bookmark seeks video to start of bookmark or end of last bookmark (if no bookmark at position)
    constructor(props) {
        super(props);

        this._fetchCurrentPlaybackTime = this._fetchCurrentPlaybackTime.bind(this);
        this._getTotalTime = this._getTotalTime.bind(this);
        this._getTimestamps = this._getTimestamps.bind(this);
        this._recompileBookmarks = this._recompileBookmarks.bind(this);
        this._renderBookmarks = this._renderBookmarks.bind(this);

        this.state = {
            bookmarks: this._recompileBookmarks(),
            currentPlaybackTime: 0,
            currentPlaybackPercent: 0,
        };

        this.fetchCurrentPlaybackTimeInterval = setInterval(this._fetchCurrentPlaybackTime, 100);
    }

    _fetchCurrentPlaybackTime() {
        let playbackTime = this.props.getPlaybackTime();
        this.setState({
            currentPlaybackTime: playbackTime,
            currentPlaybackPercent: playbackTime / this._getTotalTime(),
        });
    }

    _getTotalTime() {
        return this.props.totalTimeMs;
    }

    _getTimestamps() {
        return this.props.timestamps;
    }

    _recompileBookmarks() {
        return this._getTimestamps().map((timestamp) => {
            let start = timestamp.start / this._getTotalTime();
            let end = timestamp.end !== undefined ? timestamp.end : timestamp.start + timestamp.duration;
            end /= this._getTotalTime();
            return { start: start, end: end, };
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.timestamps !== this.props.timestamps)
        {
            this.setState({
                bookmarks: this._recompileBookmarks(),
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.fetchCurrentPlaybackTimeInterval);
    }

    _renderBookmarks() {
        return this.state.bookmarks.map((bookmark) => {
            return (
                <div
                    key={shortid.generate()}
                    style={{
                        position: 'absolute',
                        height: '100%',
                        left: `${bookmark.start * 100}%`,
                        width: `${(bookmark.end - bookmark.start) * 100}%`,
                        backgroundColor: this.props.bookmarkColor,
                    }}
                />
            );
        });
    }

    render() {
        return (
            <div
                id={'timestamp-display'}
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                }}
            >
                {this._renderBookmarks()}
            </div>
        );
    }

}

TimestampDisplayBar.defaultProps = {
    bookmarkColor: 'rgba(0, 255, 255, 1.0)',
    height: '1.0em',
    cursorWidth: 0.5,

    totalTimeMs: 0,
    timestamps: [],
    getPlaybackTime: () => 0,
};

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
                        backgroundColor: this.props.bookmarkColor,
                        height: this.props.height,
                        position: 'absolute',
                        left: `${bookmark.start * 100}%`,
                        width: `${(bookmark.end - bookmark.start) * 100}%`,
                    }}
                />
            );
        });
    }

    render() {
        return (
            <div
                style={{
                    backgroundColor: this.props.backgroundColor,
                    height: this.props.height,
                }}
            >
                {this._renderBookmarks()}
                <div
                    style={{
                        backgroundColor: '#000000',
                        height: this.props.height,
                        position: 'absolute',
                        left: `${this.state.currentPlaybackPercent * 100 - this.props.cursorWidth * 0.5}%`,
                        width: `${this.props.cursorWidth}%`,
                    }}
                />
            </div>
        );
    }

}

TimestampDisplayBar.defaultProps = {
    backgroundColor: 'rgba(115, 133, 159, 1.0)',
    bookmarkColor: 'yellow',
    height: '1.0em',
    cursorWidth: 0.5,

    totalTimeMs: 0,
    timestamps: [],
    getPlaybackTime: () => 0,
};

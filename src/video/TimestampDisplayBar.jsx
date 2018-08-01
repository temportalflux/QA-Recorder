import React from 'react';
import * as shortid from 'shortid';

export default class TimestampDisplayBar extends React.Component {

    constructor(props) {
        super(props);

        this._getTotalTime = this._getTotalTime.bind(this);
        this._getTimestamps = this._getTimestamps.bind(this);
        this._recompileBookmarks = this._recompileBookmarks.bind(this);
        this._renderBookmarks = this._renderBookmarks.bind(this);

        this._recompileBookmarks();
    }

    _getTotalTime() {
        return this.props.totalTimeMs;
    }

    _getTimestamps() {
        return this.props.timestamps;
    }

    _recompileBookmarks() {
        this.bookmarks = this._getTimestamps().map((timestamp) => {
            let start = timestamp.start / this._getTotalTime();
            let end = timestamp.end !== undefined ? timestamp.end : timestamp.start + timestamp.duration;
            end /= this._getTotalTime();
            return { start: start, end: end, };
        });
    }

    _renderBookmarks() {
        return this.bookmarks.map((bookmark) => {
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
            </div>
        );
    }

}

TimestampDisplayBar.defaultProps = {
    backgroundColor: 'rgba(115, 133, 159, 1.0)',
    bookmarkColor: 'yellow',
    height: '1.0em',
    totalTimeMs: 10*60*1000,// 10 minutes in ms = 600000ms
    timestamps: [
        {
            start: 0,
            end: 0.15 * 600000,
        },
        {
            start: 0.20 * 600000,
            duration: 0.15 * 600000,
        },
        {
            start: 0.40 * 600000,
            duration: 0.15 * 600000,
        },
        {
            start: 0.60 * 600000,
            duration: 0.15 * 600000,
        },
        {
            start: 0.80 * 600000,
            duration: 0.15 * 600000,
        },
    ],
};

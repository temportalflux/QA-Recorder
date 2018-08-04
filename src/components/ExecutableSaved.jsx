import React from 'react';
import {Tab} from "semantic-ui-react";
import BrowseBar from "./BrowseBar";
import PropTypes from 'prop-types';
import * as shortid from "shortid";

export default class ExecutableSaved extends React.Component {

    constructor(props) {
        super(props);

        this._renderUnix = this._renderUnix.bind(this);
        this._renderMac = this._renderMac.bind(this);
        this._renderWindows = this._renderWindows.bind(this);
        this._renderWindows32 = this._renderWindows32.bind(this);
        this._renderWindows64 = this._renderWindows64.bind(this);

        this._windowsPanes = [
            { menuItem: '32-bit', render: this._renderWindows32 },
            { menuItem: '64-bit', render: this._renderWindows64 },
        ];

    }

    render() {
        switch (process.platform) {
            case 'aix':
            case 'freebsd':
            case 'linux':
            case 'openbsd':
            case 'sunos':
                return this._renderUnix();
            case 'darwin':
                return this._renderMac();
            case 'win32':
                return this._renderWindows();
            default:
                break;
        }
    }

    _renderUnix() {
        return (
            <BrowseBar
                path={`${this.props.path}.unix`}
            />
        );
    }

    _renderMac() {
        return (
            <BrowseBar
                filters={[
                    {name: 'Application', extensions: ['app']},
                ]}
                path={`${this.props.path}.osx`}
            />
        );
    }

    _renderWindows() {
        return (
            <Tab
                panes={this._windowsPanes}
            />
        );
    }

    _renderWindows32() {
        return (
            <Tab.Pane key={shortid.generate()}>
                <BrowseBar
                    filters={[
                        {name: 'Executable', extensions: ['exe']},
                    ]}
                    path={`${this.props.path}.windows32`}
                />
            </Tab.Pane>
        );
    }

    _renderWindows64() {
        return (
            <Tab.Pane key={shortid.generate()}>
                <BrowseBar
                    filters={[
                        {name: 'Executable', extensions: ['exe']},
                    ]}
                    path={`${this.props.path}.windows64`}
                />
            </Tab.Pane>
        );
    }

}

ExecutableSaved.defaultProps = {

};
ExecutableSaved.propTypes = {
    path: PropTypes.string.isRequired,
};

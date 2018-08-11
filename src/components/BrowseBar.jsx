import React from 'react';
import {Button, Checkbox, Input} from "semantic-ui-react";
import {FaFolder} from "react-icons/fa";
import FileSystem from "../singletons/FileSystem";
import PropTypes from 'prop-types';
import path from 'path';
import {GetLocalData} from "../singletons/LocalData";
import * as lodash from "lodash";

export default class BrowseBar extends React.Component {

    constructor(props) {
        super(props);

        this._handlePath = this._handlePath.bind(this);
        this._handleBrowse = this._handleBrowse.bind(this);
        this._handleToggleRelative = this._handleToggleRelative.bind(this);
        this._setPath = this._setPath.bind(this);

        let pathValue = GetLocalData().get(`${this.props.path}.path`, '');
        let isRelative = GetLocalData().get(`${this.props.path}.relative`, false);
        this.state = {
            value: !isRelative ? pathValue : path.resolve(FileSystem.cwd(), pathValue),
            isRelative: isRelative,
        };

    }

    _handlePath(e, { name, value }) {
        this._setPath(value, this.state.isRelative);
    }

    async _handleBrowse() {
        let currentValue = GetLocalData().get(this.props.path);
        let startLocation = currentValue ? FileSystem.resolvePotentialRelative(currentValue) : FileSystem.appData();
        let options = lodash.defaults(this.props.options, {
            title: 'Executable File',
            defaultPath: startLocation,
            properties: ['openFile'],
        });
        if (this.props.filters !== undefined) {
            options.filters = this.props.filters;
        }
        let filePaths = await FileSystem.displayDialog(options);
        if (filePaths !== undefined && Array.isArray(filePaths) && filePaths.length > 0) {
            this._setPath(filePaths[0], this.state.isRelative);
        }
    }

    _handleToggleRelative(e, {checked}) {
        if (checked !== this.state.isRelative) {
            this._setPath(this.state.value, checked);
            GetLocalData().set(`${this.props.path}.relative`, checked);
        }
        this.setState({
            isRelative: checked,
        });
    }

    _setPath(value, isRelative) {
        this.setState({ value: value });
        value = path.normalize(value);
        if (isRelative) {
            value = path.relative(FileSystem.cwd(), value);
        }
        GetLocalData().set(`${this.props.path}.path`, value);
    }

    render() {
        return (
            <div>
                <Input
                    labelPosition={'right'}
                    label={<Button onClick={this._handleBrowse}><FaFolder /></Button>}
                    value={this.state.value}
                    onChange={this._handlePath}
                />
                <Checkbox
                    label='Use relative path'
                    checked={this.state.isRelative}
                    onChange={this._handleToggleRelative}
                />
            </div>
        );
    }

}

BrowseBar.defaultProps = {
    options: {},
    filters: [],
};

BrowseBar.propTypes = {
    /**
     * Options for the browse dialog
     */
    options: PropTypes.object,
    /**
     * File filters
     */
    filters: PropTypes.array,

    /**
     * The initial path
     */
    path: PropTypes.string.isRequired,
};

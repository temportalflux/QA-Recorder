import React from 'react';
import {Input} from "semantic-ui-react";
import {GetLocalData} from "../singletons/LocalData";
import PropTypes from 'prop-types';

export default class InputSaved extends React.Component {

    constructor(props) {
        super(props);

        this._handleChange = this._handleChange.bind(this);

        this.state = {
            value: GetLocalData().get(this.props.path, this.defaultValue || ''),
        };
    }

    _handleChange(e, data) {
        GetLocalData().set(this.props.path, data.value);
        this.setState({ value: data.value });
    }

    render() {
        return (
            <Input
                value={this.state.value}
                onChange={this._handleChange}
            />
        );
    }

}

InputSaved.defaultProps = {
    defaultValue: '',
};

InputSaved.propTypes = {
    path: PropTypes.string.isRequired,

    defaultValue: PropTypes.string,
};

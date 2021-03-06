import React from 'react';
import {Checkbox} from "semantic-ui-react";
import {GetLocalData} from "../singletons/LocalData";
import PropTypes from 'prop-types';

export default class ToggleSaved extends React.Component {

    constructor(props) {
        super(props);

        this._handleChange = this._handleChange.bind(this);

        this.state = {
            value: GetLocalData().get(this.props.path, false),
        };
    }

    _handleChange(e, data) {
        GetLocalData().set(this.props.path, data.checked);
        this.setState({ value: data.checked });
    }

    render() {
        return (
            <Checkbox
                label={this.props.label}
                checked={this.state.value}
                onChange={this._handleChange}
            />
        );
    }

}

ToggleSaved.defaultProps = {
    label: '',
};

ToggleSaved.propTypes = {
    path: PropTypes.string.isRequired,

    label: PropTypes.string,

};

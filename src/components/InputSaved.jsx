import React from 'react';
import {Input} from "semantic-ui-react";
import {LOCAL_DATA} from "../singletons/LocalData";
import PropTypes from 'prop-types';

export default class InputSaved extends React.Component {

    constructor(props) {
        super(props);

        this._handleChange = this._handleChange.bind(this);

        this.state = {
            value: LOCAL_DATA.get(this.props.path, ''),
        };
    }

    _handleChange(e, data) {
        LOCAL_DATA.set(this.props.path, data.value);
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

};

InputSaved.propTypes = {
    path: PropTypes.string.isRequired,
};

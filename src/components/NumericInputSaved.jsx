import React from 'react';
import PropTypes from 'prop-types';
import NumericInput from 'react-numeric-input';
import {GetLocalData} from "../singletons/LocalData";

export default class NumericInputSaved extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
            value: GetLocalData().get(this.props.path, this.defaultValue || 0),
        };
    }

    handleChange(valueAsNumber) {
        GetLocalData().set(this.props.path, valueAsNumber);
        this.setState({ value: valueAsNumber });
    }

    render() {
        console.log(this.props);
        return (
            <NumericInput
                strict
                className="form-control"
                value={this.state.value}
                min={this.props.min}
                max={this.props.max}
                step={this.props.step}
                precision={this.props.precision}
                snap={this.props.snap}
                onChange={this.handleChange}
            />
        );
    }

}

NumericInputSaved.defaultProps = {
    defaultValue: 0,
    min: undefined,
    max: undefined,
    step: 1,
    precision: 0,
    snap: false,
};

NumericInputSaved.propTypes = {
    path: PropTypes.string.isRequired,

    defaultValue: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    precision: PropTypes.number,
    snap: PropTypes.bool,

};
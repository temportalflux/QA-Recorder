import React from 'react';
import PropTypes from 'prop-types';
import {GetLocalData} from "../singletons/LocalData";
import * as shortid from "shortid";

export default class LocalDataText extends React.Component {

    constructor(props) {
        super(props);

        this.getValue = this.getValue.bind(this);

        this.state = {
            id: shortid.generate(),
            value: this.getValue(),
        };
    }

    getValue() {
        return GetLocalData().get(this.props.path, 'null');
    }

    componentDidMount() {
        GetLocalData().subscribe(this.props.path, this.state.id, (value) => {
            this.setState({ value: value });
        });
    }

    componentWillUnmount() {
        GetLocalData().unsubscribe(this.props.path, this.state.id);
    }

    render() {
        return <label>{this.getValue()}</label>;
    }

}

LocalDataText.defaultProps = {};

LocalDataText.propTypes = {
    path: PropTypes.string.isRequired
};
import React from 'react';
import PropTypes from 'prop-types';
import {EVENTS} from "../singletons/EventSystem";
import {LOCAL_DATA} from "../singletons/LocalData";
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
        return LOCAL_DATA.get(this.props.path, 'null');
    }

    componentDidMount() {
        LOCAL_DATA.subscribe(this.props.path, this.state.id, (value) => {
            this.setState({ value: value });
        });
    }

    componentWillUnmount() {
        LOCAL_DATA.unsubscribe(this.props.path, this.state.id);
    }

    render() {
        return <label>{this.getValue()}</label>;
    }

}

LocalDataText.defaultProps = {};

LocalDataText.propTypes = {
    path: PropTypes.string.isRequired
};
import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from "./Loading";

export default class DynamicFrame extends React.Component {

    constructor(props) {
        super(props);

        this.handleOnLoad = this.handleOnLoad.bind(this);

    }

    handleOnLoad() {
        if (this.props.fluid) {
            this.refs.frame.height = this.refs.frame.contentWindow.document.body.scrollHeight + "px";
        }
    }

    render() {
        let style = {};
        if (this.props.width) {
            style.width = this.props.width;
        }
        else if (this.props.fluid) {
            style.width = '100%';
        }
        if (this.props.height) {
            style.height = this.props.height;
        }

        return (
            <iframe
                ref={'frame'}
                src={this.props.src}
                style={style}
                onLoad={this.handleOnLoad}
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
            >
                <Loading>
                    Loading...
                </Loading>
            </iframe>
        );
    }

}

DynamicFrame.defaultProps = {
    fluid: false,
    width: undefined,
    height: undefined,

};

DynamicFrame.propTypes = {
    src: PropTypes.string.isRequired,

    fluid: PropTypes.bool,
    width: PropTypes.string,
    height: PropTypes.string,

};
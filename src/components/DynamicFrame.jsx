import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from "./Loading";
import FileSystem from "../singletons/FileSystem";
import path from 'path';

export default class DynamicFrame extends React.Component {

    constructor(props) {
        super(props);

        this.handleOnLoad = this.handleOnLoad.bind(this);
        this.loadFile = this.loadFile.bind(this);

        this.frame = React.createRef();

        this.state = {
            html: "",
            height: undefined,
        };
    }

    componentDidMount() {
        let promise = this.loadFile();
    }

    async loadFile() {
        let contents = await FileSystem.readFile(this.props.src);
        contents = contents.replace(
            new RegExp('\\\${dir}', 'g'), path.dirname(this.props.src)
        );
        this.setState({
            html: contents,
        });
    }

    handleOnLoad() {
        if (this.props.fluid) {
            this.setState({
                height: this.frame.current.contentWindow.document.body.scrollHeight,
            });
        }
    }

    render() {
        let style = {
            overflow: "hidden",
        };
        if (this.props.width) {
            style.width = this.props.width;
        }
        else if (this.props.fluid) {
            style.width = '100%';
        }
        if (this.props.height) {
            style.height = this.props.height;
        }
        else if (this.state.height) {
            style.height = `${this.state.height}px`;
        }

        return (
            <iframe
                ref={this.frame}
                scrolling="no"
                src={`data:text/html;charset=utf-8,${this.state.html}`}
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
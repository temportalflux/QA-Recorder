import React from 'react';
import PropTypes from 'prop-types';
import Viewer from "./video/Viewer";
import {Container, Dropdown, Form} from "semantic-ui-react";
import {Settings} from "../../settings/Settings";
import FileSystem from "../../singletons/FileSystem";
import {GetLocalData} from "../../singletons/LocalData";

export class AppModuleViewer extends React.Component {

    constructor(props) {
        super(props);

        this.getRecordingFolderDataPath = this.getRecordingFolderDataPath.bind(this);
        this.getRecordingFolderDataValue = this.getRecordingFolderDataValue.bind(this);
        this.getRecordingFolderPath = this.getRecordingFolderPath.bind(this);
        this.onChangedRecordingFolderDataValue = this.onChangedRecordingFolderDataValue.bind(this);

        this.state = {
            recordingsFolder: undefined,
            recordingsList: [],
        };
    }

    componentDidMount() {
        GetLocalData().subscribe(this.getRecordingFolderDataPath(), "module|viewer", this.onChangedRecordingFolderDataValue);
        this.onChangedRecordingFolderDataValue();
    }

    componentWillUnmount() {
        GetLocalData().unsubscribe(this.getRecordingFolderDataPath(), "module|viewer");
    }

    getRecordingFolderDataPath() {
        return Settings.getDataPath(`record.outputDirectory`);
    }

    getRecordingFolderDataValue() {
        return GetLocalData().get(this.getRecordingFolderDataPath(), undefined);
    }

    getRecordingFolderPath() {
        return FileSystem.resolvePotentialRelative(this.getRecordingFolderDataValue());
    }

    async onChangedRecordingFolderDataValue() {
        let recordingsPath = this.getRecordingFolderPath();
        let contents = await FileSystem.readDir(recordingsPath);
        console.log(contents);
        this.setState({
            recordingsFolder: recordingsPath,
        });
    }

    render() {
        return (
            <Container>
                <Form>

                    <Dropdown

                    />

                    <Viewer />

                </Form>
            </Container>
        );
    }

}

AppModuleViewer.defaultProps = {};

AppModuleViewer.propTypes = {};

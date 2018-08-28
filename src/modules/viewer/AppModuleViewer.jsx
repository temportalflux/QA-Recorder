import React from 'react';
import PropTypes from 'prop-types';
import Viewer from "./video/Viewer";
import {Container, Dropdown, Form} from "semantic-ui-react";
import {Settings} from "../../settings/Settings";
import FileSystem from "../../singletons/FileSystem";
import {GetLocalData} from "../../singletons/LocalData";
import {listify} from "../../util/listify";
import path from 'path';

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
        let promise = this.onChangedRecordingFolderDataValue();
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
        contents = contents.filter(item => path.extname(item) === '');
        contents.unshift({});
        this.setState({
            recordingsFolder: recordingsPath,
            recordingsList: listify(contents),
        });
    }

    handleSelectRecording(e, {value}) {
        // selected none
        if (value === undefined) return;

        let fullPath = path.resolve(this.state.recordingsFolder, value);

    }

    render() {
        console.log(this.state);
        return (
            <Container>
                <Form>

                    <Form.Group inline widths='equal'>
                        <Form.Field inline={false}>
                            <label>Recording</label>
                            <Dropdown
                                fluid
                                search selection
                                options={this.state.recordingsList}
                                onChange={this.handleSelectRecording}
                            />
                        </Form.Field>
                    </Form.Group>

                    <Viewer />

                </Form>
            </Container>
        );
    }

}

AppModuleViewer.defaultProps = {};

AppModuleViewer.propTypes = {};

import React from 'react';
import Viewer from "./video/Viewer";
import {Container, Dropdown, Form} from "semantic-ui-react";
import {Settings} from "../../settings/Settings";
import FileSystem from "../../singletons/FileSystem";
import {GetLocalData} from "../../singletons/LocalData";
import {listify} from "../../util/listify";
import path from 'path';
import * as lodash from "lodash";

export class AppModuleViewer extends React.Component {

    constructor(props) {
        super(props);

        this.getRecordingFolderDataPath = this.getRecordingFolderDataPath.bind(this);
        this.getRecordingFolderDataValue = this.getRecordingFolderDataValue.bind(this);
        this.getRecordingFolderPath = this.getRecordingFolderPath.bind(this);
        this.onChangedRecordingFolderDataValue = this.onChangedRecordingFolderDataValue.bind(this);
        this.handleSelectRecording = this.handleSelectRecording.bind(this);

        this.state = {
            recordingsFolder: undefined,
            recordingsList: [],

            currentRecordingPath: undefined,
            currentRecordingUrl: undefined,
            currentRecordingDuration: 0,
            currentRecordingTimestamps: [],
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

    async handleSelectRecording(e, {value}) {
        // selected none
        if (value === undefined) {
            this.setState({
                currentRecordingPath: undefined,
                currentRecordingUrl: undefined,
                currentRecordingDuration: 0,
                currentRecordingTimestamps: [],
            });
            return;
        }

        let fullPath = path.resolve(this.state.recordingsFolder, value);
        let contents = await FileSystem.readDir(fullPath);
        contents = lodash.keyBy(contents, (fileExtName) => path.basename(fileExtName, path.extname(fileExtName)));

        let videoPath = path.resolve(fullPath, contents[value]);

        let duration = await Viewer.requestDuration(videoPath);
        duration = duration.seconds * 1000 + duration.ms;

        let timestamps = await FileSystem.readFile(path.resolve(fullPath, contents['bookmarks']));
        timestamps = JSON.parse(timestamps);

        ///*
        this.setState({
            currentRecordingPath: fullPath,
            currentRecordingUrl: videoPath,
            currentRecordingDuration: duration,
            currentRecordingTimestamps: timestamps,
        });
        //*/
    }

    render() {
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

                    <Viewer
                        source={this.state.currentRecordingUrl}
                        duration={this.state.currentRecordingDuration}
                        timestamps={this.state.currentRecordingTimestamps}
                    />

                </Form>
            </Container>
        );
    }

}

AppModuleViewer.defaultProps = {};

AppModuleViewer.propTypes = {};

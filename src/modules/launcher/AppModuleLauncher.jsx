import React from 'react';
import {Button, Header, Segment} from "semantic-ui-react";
import LocalDataDisplay from "../../components/LocalDataDisplay";
import OBSInterface from "../../applications/OBSInterface";
import {GetLocalData} from "../../singletons/LocalData";
import CreateApplicationController from "../../applications/CreateApplicationController";
import DynamicFrame from "../../components/DynamicFrame";
import {GetEvents} from "../../singletons/EventSystem";
import {EVENT_LIST} from "../../singletons/EventList";
import FileSystem from "../../singletons/FileSystem";
import path from "path";

export const LAUNCHER_STATUS = Object.freeze(Object.keys({
    AWAITING_LAUNCH: 0,
    LOADING_OBS_SETTINGS_FILES: 0,
    LAUNCHING_OBS: 0,
    LOADING_OBS_SETTINGS: 0,
    LAUNCHING_TARGET: 0,
    START_RECORDING: 0,
    START_STREAMING: 0,
    AWAITING_GAME_CLOSE: 0,
    STOP_RECORDING: 0,
    STOP_STREAMING: 0,
    REMOVE_OBS_SETTINGS_FILES: 0,
    CLOSING_OBS: 0,
    SESSION_COMPLETE: 0,
}).reduce((states, key, i) => { states[key] = key; return states; }, {}));

export class AppModuleLauncher extends React.Component {

    static setStatus(status) {
        GetLocalData().set('launcher.state', status);
    }

    constructor(props) {
        super(props);

        this.launch = this.launch.bind(this);
        this.onTargetClose = this.onTargetClose.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.reset = this.reset.bind(this);
        this.renderLauncherStateAsStatus = this.renderLauncherStateAsStatus.bind(this);
        this.renderLauncherStateAsPanel = this.renderLauncherStateAsPanel.bind(this);
        this.onObsOutputChanged = this.onObsOutputChanged.bind(this);
        this.generateRandomTimestampFile = this.generateRandomTimestampFile.bind(this);

        this.obs = null;
        this.target = null;
        this.obsOutputDirectory = undefined;

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.AWAITING_LAUNCH);
    }

    componentDidMount() {
        GetLocalData().subscribe('launcher.state', 'launcher', this.onStateChanged);
        GetEvents().subscribe(EVENT_LIST.NOTIFY_OBS_SET_OUTPUT_DIR, 'launcher', this.onObsOutputChanged);
    }

    componentWillUnmount() {
        GetLocalData().unsubscribe('launcher.state', 'launcher');
        GetEvents().unsubscribe(EVENT_LIST.NOTIFY_OBS_SET_OUTPUT_DIR, 'launcher');
    }

    onObsOutputChanged(dir) {
        console.log(dir);
        this.obsOutputDirectory = dir;
    }

    async launch() {
        // TODO: disable setting editting while app is active

        this.obs = new OBSInterface(GetLocalData().get('settings.obs.executable'));
        this.target = CreateApplicationController(GetLocalData().get('settings.application.executable'), {
            close: this.onTargetClose,
        });

        // GOTTA IMPORT THOSE ASSETS
        AppModuleLauncher.setStatus(LAUNCHER_STATUS.LOADING_OBS_SETTINGS_FILES);
        await this.obs.addFileSettings();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.LAUNCHING_OBS);
        await this.obs.start();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.LOADING_OBS_SETTINGS);
        await this.obs.loadFromSettings();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.LAUNCHING_TARGET);
        await this.target.spawn();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.START_RECORDING);
        await this.obs.startRecording();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.START_STREAMING);
        await this.obs.startStreaming();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.AWAITING_GAME_CLOSE);
    }

    async onTargetClose() {
        this.target = null;

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.STOP_RECORDING);
        await this.obs.stopRecording();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.STOP_STREAMING);
        await this.obs.stopStreaming();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.CLOSING_OBS);
        this.obs.stop();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.REMOVE_OBS_SETTINGS_FILES);
        await this.obs.cleanup();

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.SESSION_COMPLETE);
    }

    onStateChanged(state) {
        console.log(state);
    }

    async reset() {
        GetLocalData().update("settings.tester.number", 0, (value) => value + 1);
        AppModuleLauncher.setStatus(LAUNCHER_STATUS.AWAITING_LAUNCH);
        this.obsOutputDirectory = undefined;
    }

    async generateRandomTimestampFile() {
        let outputDir = this.obsOutputDirectory;

        let files = await FileSystem.readDir(outputDir);
        let footageFile = files.find((file) => path.basename(file, path.extname(file)) === path.basename(outputDir));
        //console.log(footageFile);
        // TODO: Maybe use https://github.com/evictor/get-blob-duration for files which dont have audio (mac recordings)
        //let duration = await Viewer.requestDuration(footageFile);
        //console.log(duration);
    }

    render() {
        return (
            <div>
                <Header size={'large'} textAlign='center'>
                    Welcome to <LocalDataDisplay path={'settings.application.name'}/>!
                    <Header.Subheader>
                        <LocalDataDisplay
                            path={'launcher.state'}
                            parseValue={this.renderLauncherStateAsStatus}
                        />
                    </Header.Subheader>
                </Header>
                <Segment>
                    <LocalDataDisplay
                        path={'launcher.state'}
                        parseValue={this.renderLauncherStateAsPanel}
                    />
                </Segment>
            </div>
        );
    }

    renderLauncherStateAsStatus(state) {
        let text;
        switch (state) {
            case LAUNCHER_STATUS.LOADING_OBS_SETTINGS_FILES:
            case LAUNCHER_STATUS.LAUNCHING_OBS:
            case LAUNCHER_STATUS.LOADING_OBS_SETTINGS:
            case LAUNCHER_STATUS.LAUNCHING_TARGET:
                text = 'Loading applications...';
                break;
            case LAUNCHER_STATUS.START_RECORDING:
            case LAUNCHER_STATUS.START_STREAMING:
            case LAUNCHER_STATUS.AWAITING_GAME_CLOSE:
            case LAUNCHER_STATUS.STOP_RECORDING:
            case LAUNCHER_STATUS.STOP_STREAMING:
                let recording = GetLocalData().get('settings.record.enabled', false);
                let streaming = GetLocalData().get('settings.stream.enabled', false);
                let activities = [];
                if (recording) activities.push('Recording');
                if (streaming) activities.push('Streaming');
                if (activities.length === 0) activities.push("I'm not doing anything. Why have you started me?");
                text = activities.join(' and ');
                break;
            case LAUNCHER_STATUS.REMOVE_OBS_SETTINGS_FILES:
            case LAUNCHER_STATUS.CLOSING_OBS:
                text = 'Closing applications...';
                break;
            case LAUNCHER_STATUS.SESSION_COMPLETE:
                text = 'Hope you enjoyed your play session ;D';
                break;
            case LAUNCHER_STATUS.AWAITING_LAUNCH:
            default:
                text = 'Lets get started!';
                break;
        }
        return <label>{text}</label>;
    }

    renderLauncherStateAsPanel(state) {
        switch (state) {
            case LAUNCHER_STATUS.LOADING_OBS_SETTINGS_FILES:
            case LAUNCHER_STATUS.LAUNCHING_OBS:
            case LAUNCHER_STATUS.LOADING_OBS_SETTINGS:
            case LAUNCHER_STATUS.LAUNCHING_TARGET:
                return (
                    <div>
                        <Header size={'medium'} textAlign='center'>
                            Loading your game
                        </Header>
                    </div>
                );
            case LAUNCHER_STATUS.START_RECORDING:
            case LAUNCHER_STATUS.START_STREAMING:
            case LAUNCHER_STATUS.AWAITING_GAME_CLOSE:
                return (
                    <div>
                        <Header size={'medium'} textAlign='center'>
                            Enjoy your play session!
                        </Header>
                    </div>
                );
            case LAUNCHER_STATUS.STOP_RECORDING:
            case LAUNCHER_STATUS.STOP_STREAMING:
            case LAUNCHER_STATUS.REMOVE_OBS_SETTINGS_FILES:
            case LAUNCHER_STATUS.CLOSING_OBS:
                return (
                    <div>
                        <Header size={'medium'} textAlign='center'>
                            Welcome back! Processing your play session...
                        </Header>
                    </div>
                );
            case LAUNCHER_STATUS.SESSION_COMPLETE:
                return (
                    <div>
                        <Header size={'medium'} textAlign='center'>
                            Welcome back! I hope you enjoyed our game.
                        </Header>

                        <LocalDataDisplay
                            path={`settings.tester.formLink`}
                            defaultValue={undefined}
                            parseValue={(value) => {
                                if (!value) return <div/>;
                                return (
                                    <DynamicFrame
                                        fluid
                                        src={value}
                                    />
                                );
                            }}
                        />

                        <Button
                            fluid
                            size='small'
                            color='orange'
                            attached='bottom'
                            onClick={this.generateRandomTimestampFile}
                        >
                            Generate Random Timestamps
                        </Button>

                        <Button
                            fluid
                            size='small'
                            color='green'
                            attached='bottom'
                            onClick={this.reset}
                        >
                            Reset
                        </Button>
                    </div>
                );
            case LAUNCHER_STATUS.AWAITING_LAUNCH:
            default:
                return (
                    <div>
                        <Header size={'medium'} textAlign='center'>
                            Launch the game to get started!
                        </Header>

                        <Button
                            fluid
                            size='massive'
                            color='green'
                            attached='bottom'
                            onClick={this.launch}
                        >
                            Launch
                        </Button>
                    </div>
                );
        }
    }

}

AppModuleLauncher.defaultProps = {};

AppModuleLauncher.propTypes = {};

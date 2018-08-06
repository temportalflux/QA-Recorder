import React from 'react';
import {Button, Header, Segment} from "semantic-ui-react";
import LocalDataDisplay from "../components/LocalDataDisplay";
import OBSInterface from "../applications/OBSInterface";
import {GetLocalData} from "../singletons/LocalData";
import CreateApplicationController from "../applications/CreateApplicationController";
import FileSystem from "../singletons/FileSystem";
import path from "path";
import DynamicFrame from "../components/DynamicFrame";

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

export default class PanelLauncher extends React.Component {

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

        this.obs = null;
        this.target = null;

        PanelLauncher.setStatus(LAUNCHER_STATUS.AWAITING_LAUNCH);
    }

    componentDidMount() {
        GetLocalData().subscribe('launcher.state', 'launcher', this.onStateChanged);
    }

    componentWillUnmount() {
        GetLocalData().unsubscribe('launcher.state', 'launcher');
    }

    async launch() {
        // TODO: disable setting editting while app is active

        this.obs = new OBSInterface(GetLocalData().get('settings.obs.executable'));
        this.target = CreateApplicationController(GetLocalData().get('settings.application.executable'), {
            close: this.onTargetClose,
        });

        // GOTTA IMPORT THOSE ASSETS
        PanelLauncher.setStatus(LAUNCHER_STATUS.LOADING_OBS_SETTINGS_FILES);
        await this.obs.addFileSettings();

        PanelLauncher.setStatus(LAUNCHER_STATUS.LAUNCHING_OBS);
        await this.obs.start();

        PanelLauncher.setStatus(LAUNCHER_STATUS.LOADING_OBS_SETTINGS);
        await this.obs.loadFromSettings();

        PanelLauncher.setStatus(LAUNCHER_STATUS.LAUNCHING_TARGET);
        await this.target.spawn();

        PanelLauncher.setStatus(LAUNCHER_STATUS.START_RECORDING);
        await this.obs.startRecording();

        PanelLauncher.setStatus(LAUNCHER_STATUS.START_STREAMING);
        await this.obs.startStreaming();

        PanelLauncher.setStatus(LAUNCHER_STATUS.AWAITING_GAME_CLOSE);
    }

    async onTargetClose() {
        this.target = null;

        PanelLauncher.setStatus(LAUNCHER_STATUS.STOP_RECORDING);
        await this.obs.stopRecording();

        PanelLauncher.setStatus(LAUNCHER_STATUS.STOP_STREAMING);
        await this.obs.stopStreaming();

        PanelLauncher.setStatus(LAUNCHER_STATUS.CLOSING_OBS);
        this.obs.stop();

        PanelLauncher.setStatus(LAUNCHER_STATUS.REMOVE_OBS_SETTINGS_FILES);
        await this.obs.removeFileSettings();

        PanelLauncher.setStatus(LAUNCHER_STATUS.SESSION_COMPLETE);
    }

    onStateChanged(state) {
        console.log(state);
    }

    async reset() {
        this.GetLocalData().update("settings.tester.number", 0, (value) => value + 1);
        PanelLauncher.setStatus(LAUNCHER_STATUS.AWAITING_LAUNCH);
    }

    render() {
        /*<Viewer />
        */
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

PanelLauncher.defaultProps = {};

PanelLauncher.propTypes = {};
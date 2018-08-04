import React from 'react';
import {Button, Header, Segment} from "semantic-ui-react";
import LocalDataText from "../components/LocalDataText";
import OBSInterface from "../applications/OBSInterface";
import {GetLocalData} from "../singletons/LocalData";
import CreateApplicationController from "../applications/CreateApplicationController";

const STATUS = Object.freeze(Object.keys({
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
}).reduce((states, key, i) => { states[key] = i; return states; }, {}));
const STATUS_ARRAY = Object.freeze((Object.keys(STATUS).map((key) => key)));

export default class PanelLauncher extends React.Component {

    static setStatus(status) {
        GetLocalData().set('launcher.state', STATUS_ARRAY[status]);
    }

    constructor(props) {
        super(props);

        this.launch = this.launch.bind(this);
        this.onTargetClose = this.onTargetClose.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.renderPanel = this.renderPanel.bind(this);

        this.obs = null;
        this.target = null;

        PanelLauncher.setStatus(STATUS.AWAITING_LAUNCH);
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
        PanelLauncher.setStatus(STATUS.LOADING_OBS_SETTINGS_FILES);
        await this.obs.addFileSettings();

        PanelLauncher.setStatus(STATUS.LAUNCHING_OBS);
        await this.obs.start();

        PanelLauncher.setStatus(STATUS.LOADING_OBS_SETTINGS);
        await this.obs.loadFromSettings();

        PanelLauncher.setStatus(STATUS.LAUNCHING_TARGET);
        await this.target.spawn();

        PanelLauncher.setStatus(STATUS.START_RECORDING);
        await this.obs.startRecording();

        PanelLauncher.setStatus(STATUS.START_STREAMING);
        await this.obs.startStreaming();

        PanelLauncher.setStatus(STATUS.AWAITING_GAME_CLOSE);
    }

    async onTargetClose() {
        this.target = null;

        PanelLauncher.setStatus(STATUS.STOP_RECORDING);
        await this.obs.stopRecording();

        PanelLauncher.setStatus(STATUS.STOP_STREAMING);
        await this.obs.stopStreaming();

        PanelLauncher.setStatus(STATUS.CLOSING_OBS);
        this.obs.stop();

        PanelLauncher.setStatus(STATUS.REMOVE_OBS_SETTINGS_FILES);
        await this.obs.removeFileSettings();

        PanelLauncher.setStatus(STATUS.AWAITING_LAUNCH);
    }

    onStateChanged(state) {
        console.log(state);
    }

    render() {
        /*<Viewer />
        */
        return (
            <div>
                <Header size={'large'} textAlign='center'>
                    Welcome to <LocalDataText path={'settings.application.name'}/>!
                    <Header.Subheader>Lets get started!</Header.Subheader>
                </Header>
                <Segment>
                    {this.renderPanel()}
                </Segment>
            </div>
        );
    }

    renderPanel() {
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

PanelLauncher.defaultProps = {};

PanelLauncher.propTypes = {};
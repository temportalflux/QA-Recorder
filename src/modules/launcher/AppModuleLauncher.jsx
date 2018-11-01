import React from 'react';
import {Button, Checkbox, Divider, Form, Header, Segment} from "semantic-ui-react";
import LocalDataDisplay from "../../components/LocalDataDisplay";
import OBSInterface from "../../applications/OBSInterface";
import {GetLocalData, LocalData} from "../../singletons/LocalData";
import CreateApplicationController from "../../applications/CreateApplicationController";
import DynamicFrame from "../../components/DynamicFrame";
import {GetEvents} from "../../singletons/EventSystem";
import {EVENT_LIST} from "../../singletons/EventList";
import FileSystem from "../../singletons/FileSystem";
import path from "path";
import Viewer from "../viewer/video/Viewer";
import * as shortid from "shortid";
import {Settings} from "../../settings/Settings";

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

        this.handleCheckedFormSubmitted = this.handleCheckedFormSubmitted.bind(this);

        this.obs = null;
        this.target = null;
        this.obsOutputDirectory = undefined;

        AppModuleLauncher.setStatus(LAUNCHER_STATUS.AWAITING_LAUNCH);
        //AppModuleLauncher.setStatus(LAUNCHER_STATUS.SESSION_COMPLETE);

        this.state = {
            formSubmitted: false,
        };
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

        this.setState({
            formSubmitted: false,
        });
    }

    async generateRandomTimestampFile() {
        let outputDir = this.obsOutputDirectory;

        let files = await FileSystem.readDir(outputDir);
        let footageFile = files.find((file) => path.basename(file, path.extname(file)) === path.basename(outputDir));
        let fullFootagePath = path.resolve(outputDir, footageFile);
        let {seconds, ms} = await Viewer.requestDuration(fullFootagePath);
        let totalDuration = Math.floor(seconds * 1000 + ms);

        let rng = {
            timestampCountRange: {
                max: 10,
                min: 1,
            },
            msBetweenBookmarks: {
                min: 0,
                max: 2 * 1000,
            },
            msBookmarkDuration: {
                min: 5 * 1000,
                max: 5 * 1000,
            },
        };

        let rngInRange = (range) => {
            return Math.floor(Math.random() * ((range.max || 1) - (range.min || 0))) + (range.min || 0)
        };

        let bookmarks = [];

        let totalTimeStamps = rngInRange(rng.timestampCountRange);

        console.log(totalDuration);
        console.log(totalTimeStamps);

        let bookmarkStart = 0;
        console.log('Gen Start', bookmarkStart);
        for (let iBookmark = 0; iBookmark < totalTimeStamps; iBookmark++) {
            console.log('Loop Start', bookmarkStart);

            // ensure still in range
            if (bookmarkStart >= totalDuration) break;

            console.log('Rng Start for', bookmarkStart);

            // Add a random buffer before
            bookmarkStart += rngInRange(rng.msBetweenBookmarks);
            bookmarkStart = Math.min(bookmarkStart, totalDuration);

            console.log('Generating at', bookmarkStart);

            // Create a bookmark duration
            let bookmark = {
                start: bookmarkStart,
                end: bookmarkStart + rngInRange(rng.msBookmarkDuration),
                comment: shortid.generate(),
            };
            // ensure end is within range
            bookmark.end = Math.min(bookmark.end, totalDuration);

            bookmarks.push(bookmark);

            console.log('Push', bookmark);

            // assign end to start
            bookmarkStart = bookmark.end;
        }

        console.log('All', bookmarks);

        await FileSystem.writeFile(path.resolve(outputDir, 'bookmarks.json'), JSON.stringify(bookmarks));
    }

    handleCheckedFormSubmitted(e, {checked}) {
        this.setState({
            formSubmitted: checked,
        });
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

    static ValidURL(str) {
        var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
            '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
            '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
            '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
            '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
            '(\#[-a-z\d_]*)?$','i'); // fragment locater
        if(!pattern.test(str)) {
            alert("Please enter a valid URL.");
            return false;
        } else {
            return true;
        }
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
                let formLink = GetLocalData().get('settings.tester.formLink', undefined);
                let canShowReset = !formLink || this.state.formSubmitted;
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
                                let recordingFilenameKey = Settings.getRegexForKey('recordingFilename');
                                let recordingFilenameValue = path.basename(this.obsOutputDirectory || "");
                                let formattedLink = Settings.formatString(value).replace(recordingFilenameKey, recordingFilenameValue);
                                return (
                                    <DynamicFrame
                                        fluid
                                        type={'url'}
                                        src={formattedLink}
                                    />
                                );
                            }}
                        />

                        {/*
                        <Button
                            fluid
                            size='small'
                            color='orange'
                            attached='bottom'
                            onClick={this.generateRandomTimestampFile}
                        >
                            Generate Random Timestamps
                        </Button>
                        */}

                        <Divider />

                        {formLink &&
                            <Form>
                                <center>
                                    <Form.Field>
                                        <Checkbox label='I have submitted my survey' onClick={this.handleCheckedFormSubmitted}/>
                                    </Form.Field>
                                </center>
                            </Form>
                        }

                        <Divider hidden />

                        {canShowReset &&
                            <Button
                                fluid
                                size='small'
                                color='green'
                                attached='bottom'
                                onClick={this.reset}
                            >
                                Reset
                            </Button>
                        }

                    </div>
                );
            case LAUNCHER_STATUS.AWAITING_LAUNCH:
            default:
                return (
                    <div>
                        <LocalDataDisplay
                            path={`settings.tester.launchDisplay`}
                            defaultValue={undefined}
                            parseValue={(value) => {
                                let rawPath = value && value.hasOwnProperty('path') ? value.path : undefined;
                                if (!rawPath) return <div/>;
                                let resolved = FileSystem.resolvePotentialRelative(value);
                                return (
                                    <DynamicFrame
                                        fluid
                                        type={"url"}
                                        src={resolved}
                                    />
                                );
                            }}
                        />

                        <Divider hidden />

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

import React from 'react';
import {Button, Header, Modal} from "semantic-ui-react";
import FileSystem from "../singletons/FileSystem";
import * as lodash from "lodash";
import {GetLocalData} from "../singletons/LocalData";
import {GetEvents} from "../singletons/EventSystem";
import {LAUNCHER_STATUS} from "../modules/launcher/AppModuleLauncher";
import path from "path";
import {FaDownload, FaSave, FaSync, FaUpload} from "react-icons/fa/index";
import {SettingsDisplay} from "./SettingsDisplay";
import {SettingsBtnChangeSensitive} from "./SettingsBtnChangeSensitive";
import moment from 'moment';
import {EVENT_LIST} from "../singletons/EventList";

function makeFilenameFormat(momentFormat, description) {
    return {
        key: momentFormat, description: description,
        getValue: () => moment().format(momentFormat),
    };
}

export const FILENAME_FORMATS = {
    obs: [
        makeFilenameFormat('YYYY', 'Year, 4-digit'),
        makeFilenameFormat('YY', 'Year, last 2-digits'),
        makeFilenameFormat('M', 'Month (1-12)'),
        makeFilenameFormat('MM', 'Month (01-12)'),
        makeFilenameFormat('MMM', 'Short month name (Jan-Dec)'),
        makeFilenameFormat('MMMM', 'Long month name (January-December)'),
        makeFilenameFormat('D', 'Date (1-31)'),
        makeFilenameFormat('DD', 'Date (01-31)'),
        makeFilenameFormat('ddd', 'Short day name (SUN-SAT)'),
        makeFilenameFormat('dddd', 'Long day name (Sunday-Saturday)'),
        makeFilenameFormat('h', 'Hour (1-12)'),
        makeFilenameFormat('hh', 'Hour (01-12)'),
        makeFilenameFormat('H', 'Hour (0-23)'),
        makeFilenameFormat('HH', 'Hour (00-23)'),
        makeFilenameFormat('m', 'Minute (0-59)'),
        makeFilenameFormat('mm', 'Minute (00-59)'),
        makeFilenameFormat('s', 'Second (0-59)'),
        makeFilenameFormat('ss', 'Second (00-59)'),
        makeFilenameFormat('a', 'am/pm'),
        makeFilenameFormat('A', 'AM/PM'),
        makeFilenameFormat('Z', 'Timezone (-07:00 ... +07:00)'),
        makeFilenameFormat('ZZ', 'Timezone (-0700 ... +0700)'),
    ],
    custom: [
        {
            key: 'name', path: 'settings.application.name', defaultValue: '',
            description: 'Application name',
        },
        {
            key: 'tester', path: 'settings.tester.name', defaultValue: '',
            description: 'Tester name',
        },
        {
            key: 'test#', path: 'settings.tester.number', defaultValue: 0,
            description: 'Tester number',
        },
        {
            key: 'appFile', description: 'Executable file name',
            defaultValue: 0,
            path: 'settings.application.executable',
            parseValue: (value) => {
                value = FileSystem.resolvePlatformPath(value);
                return path.basename(value, path.extname(value));
            },
        },
    ],
};

export class Settings extends React.Component {

    static getSettings() {
        return GetLocalData().get('settings', {});
    }

    static getSettingsPath() {
        return path.join(FileSystem.cwd(), 'config.json');
    }

    static setSettings(settings) {
        return GetLocalData().set('settings', settings);
    }

    static getDataPath(settingsPath) {
        return `settings.${settingsPath}`;
    }

    static async loadSettings() {
        let settingsPath = Settings.getSettingsPath();
        let exists = await FileSystem.exists(settingsPath);
        if (exists) {
            await Settings.importSystemSettings(settingsPath);
        }
        else {
            await Settings.saveSystemSettings(settingsPath);
        }
    }

    static async importSystemSettings(filePath) {
        let settings = Settings.getSettings();
        let loadedData = JSON.parse(await FileSystem.readFile(filePath));
        settings = Settings.setSettings(lodash.defaultsDeep(loadedData, settings));
        console.log("Loaded system settings", settings);
        GetEvents().dispatch(EVENT_LIST.NOTIFY_SETTINGS_IMPORTED);
    }

    static async saveSystemSettings(filePath) {
        await Settings.exportSystemSettings(filePath);
    }

    static async exportSystemSettings(filePath) {
        await FileSystem.ensureDirectoryExists(filePath);
        let settings = Settings.getSettings();
        console.log("Saving system settings to", filePath, settings);
        await FileSystem.writeFile(filePath, JSON.stringify(settings, undefined, 4));
    }

    constructor(props) {
        super(props);

        this.handleOpen = this.handleOpen.bind(this);
        this.handleChangeInLauncherState = this.handleChangeInLauncherState.bind(this);
        this.handleChangeInField = this.handleChangeInField.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSaveAndClose = this.handleSaveAndClose.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleImport = this.handleImport.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.renderSettings = this.renderSettings.bind(this);

        this.state = {
            isOpen: false,
            snapshot: undefined,
            launcherIsRunning: false,
        };
        this.changedFields = {};
    }

    componentDidMount() {
        GetEvents().subscribe(EVENT_LIST.REQUEST_OPEN_SETTINGS, "settings", this.handleOpen);
        GetLocalData().subscribe('launcher.state', 'settings', this.handleChangeInLauncherState);
        GetLocalData().subscribe('settings', 'settings', this.handleChangeInField);
    }

    componentWillUnmount() {
        GetEvents().unsubscribe(EVENT_LIST.REQUEST_OPEN_SETTINGS, "settings");
        GetLocalData().unsubscribe('launcher.state', 'settings');
        GetLocalData().unsubscribe('settings', 'settings');
    }

    handleOpen() {
        this.setState({
            isOpen: true,
            snapshot: this.state.snapshot || lodash.cloneDeep(Settings.getSettings()),
        });
    }

    handleClose() {
        this.setState({
            isOpen: false,
        });
    }

    handleCancel() {
        GetLocalData().set('settings', this.state.snapshot);
        this.setState({
            isOpen: false,
            snapshot: undefined,
        });
    }

    handleSaveAndClose() {
        let promise = Settings.saveSystemSettings(Settings.getSettingsPath());
        this.setState({
            isOpen: false,
            snapshot: undefined,
        });
    }

    handleChangeInLauncherState(state) {
        let launcherIsRunning = state !== LAUNCHER_STATUS.AWAITING_LAUNCH;
        if (launcherIsRunning !== this.state.launcherIsRunning)
        {
            this.setState({ launcherIsRunning: launcherIsRunning });
        }
    }

    handleChangeInField(value, pathKey) {
        if (!pathKey.startsWith('settings.')) return;

        let hasChangedFields = () => !lodash.isEmpty(this.changedFields);
        let hadChangedFields = hasChangedFields();

        let snapshotValue = lodash.get(this.state.snapshot, pathKey.substring('settings.'.length), undefined);
        let valueMatchesSnapshot = lodash.isEqual(value, snapshotValue);
        if (!valueMatchesSnapshot)
        {
            this.changedFields[pathKey] = !valueMatchesSnapshot;
        }
        else if (this.changedFields.hasOwnProperty(pathKey)) {
            delete this.changedFields[pathKey];
        }

        let hasChangedFieldsAfterUpdate = hasChangedFields();
        if (hasChangedFieldsAfterUpdate !== hadChangedFields) {
            GetEvents().dispatch(EVENT_LIST.NOTIFY_SETTINGS_HAS_CHANGED_FIELDS, hasChangedFieldsAfterUpdate, this.changedFields);
        }
    }

    async handleExport() {
        let filePath = await FileSystem.displaySaveDialog({
            title: 'Export File',
            defaultPath: FileSystem.desktop(),
            filters: [{name: 'JSON', extensions: ['json']}],
        });
        if (!filePath) return;
        await Settings.exportSystemSettings(filePath);
    }

    async handleImport() {
        let filePath = await FileSystem.displayDialog({
            title: 'Export File',
            defaultPath: FileSystem.desktop(),
            filters: [{name: 'JSON', extensions: ['json']}],
            properties: ['openFile'],
        });
        if (!filePath[0]) return;
        await Settings.importSystemSettings(filePath[0], Settings.getSettings());
        await Settings.saveSystemSettings(Settings.getSettingsPath());
    }

    async handleReset() {
        Settings.setSettings({});
        GetEvents().dispatch(EVENT_LIST.NOTIFY_SETTINGS_IMPORTED);
        await Settings.saveSystemSettings(Settings.getSettingsPath());
    }

    render() {
        return (
            <Modal
                trigger={<div/>}
                open={this.state.isOpen}
                onClose={this.handleClose}
            >
                <Header>
                    <FaSave /> Settings
                    <SettingsBtnChangeSensitive
                        uniqueKey={'cancel'}
                        disabled={this.state.launcherIsRunning}
                        onClick={this.handleCancel}
                        secondary floated={'right'} size={'mini'}
                    >
                        &times;
                    </SettingsBtnChangeSensitive>
                </Header>
                <Modal.Content scrolling>
                    {this.renderSettings()}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.handleReset} disabled={this.state.launcherIsRunning} color='red'>
                        Reset <FaSync />
                    </Button>
                    <Button onClick={this.handleImport} disabled={this.state.launcherIsRunning}>
                        Import <FaUpload />
                    </Button>
                    <Button onClick={this.handleExport} disabled={this.state.launcherIsRunning}>
                        Export <FaDownload />
                    </Button>
                    <SettingsBtnChangeSensitive
                        uniqueKey={'save'}
                        disabled={this.state.launcherIsRunning}
                        onClick={this.handleSaveAndClose}
                        primary
                    >
                        Save <FaSave />
                    </SettingsBtnChangeSensitive>
                </Modal.Actions>
            </Modal>
        );
    }

    renderSettings() {
        return (
            <SettingsDisplay launcherIsRunning={this.state.launcherIsRunning}/>
        );
    }

    static getFilenameFormatting() {
        let filename = GetLocalData().get(`settings.record.filename`, '${YYYY}-${MM}-${DD}_${HH}-${mm}-${ss}_${ZZ}');

        filename = FILENAME_FORMATS.obs.reduce((filenameFormat, format) => {
            return filenameFormat.replace(new RegExp(`\\\${${format.key}}`, 'g'), format.getValue());
        }, filename);

        filename = FILENAME_FORMATS.custom.reduce((filenameFormat, keyPath) => {
            // TODO: Do OBS settings too
            let value = GetLocalData().get(keyPath.path, keyPath.defaultValue);
            if (keyPath.parseValue) {
                value = keyPath.parseValue(value);
            }
            return filenameFormat.replace(new RegExp(`\\\${${keyPath.key}}`, 'g'), value);
        }, filename);

        return filename;
    }

}

Settings.defaultProps = {
};

Settings.propTypes = {
};

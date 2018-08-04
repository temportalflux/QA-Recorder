import React from 'react';
import {Button, Form, Header, Modal, Tab} from "semantic-ui-react";
import FileSystem from "../singletons/FileSystem";
import * as lodash from "lodash";
import {SettingsModuleTester} from "./SettingsModuleTester";
import {SettingsModuleObs} from "./SettingsModuleObs";
import {SettingsModuleRecording} from "./SettingsModuleRecording";
import {SettingsModuleStreaming} from "./SettingsModuleStreaming";
import {SettingsModuleApplication} from "./SettingsModuleApplication";
import {GetLocalData} from "../singletons/LocalData";
import {GetEvents} from "../singletons/EventSystem";

export const FILENAME_FORMATS = {
    obs: [
        { key: '%Y or %CCYY', description: 'Year, 4-digit' },
        { key: '%y or %YY', description: 'Year, last 2-digits' },
        { key: '%m or %MM', description: 'Month (1-12)' },
        { key: '%b', description: 'Short month name (JAN-DEC)' },
        { key: '%B', description: 'Long month name (January-December)' },
        { key: '%d or %DD', description: 'Day (01-31)' },
        { key: '%a', description: 'Short day name (SUN-SAT)' },
        { key: '%A', description: 'Long day name (Sunday-Saturday)' },
        { key: '%I', description: 'Hour (1-12)' },
        { key: '%H or %hh', description: 'Hour (00-23)' },
        { key: '%mm or %M', description: 'Minute (00-59)' },
        { key: '%ss or %S', description: 'Second (00-59)' },
        { key: '%p', description: 'AM or PM' },
        { key: '%z', description: 'ISO 8601 offset from UTC' },
        { key: '%Z', description: 'Timezone' },
        { key: '%%', description: 'The % sign' },
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
            key: 'tester#', path: 'settings.tester.number', defaultValue: 0,
            description: 'Tester number',
        },
    ],
};

export class Settings extends React.Component {

    static getSettings() {
        return GetLocalData().get('settings', {});
    }

    static async loadSettings() {
        let exists = await FileSystem.existsRelative('config.json');
        let settings = Settings.getSettings();
        let loadedData = settings;
        if (exists) {
            loadedData = JSON.parse(await FileSystem.readFileRelative('config.json'));
        }
        else {
            await Settings.saveSystemSettings();
        }
        settings = GetLocalData().set('settings', lodash.defaultsDeep(loadedData, settings));
        console.log("Loaded system settings", settings);
    }

    static async saveSystemSettings() {
        let settings = Settings.getSettings();
        console.log("Saving system settings", settings);
        await FileSystem.writeFileRelative('config.json', JSON.stringify(settings, undefined, 4));
    }

    constructor(props) {
        super(props);

        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._handleCancel = this._handleCancel.bind(this);
        this._handleSaveAndClose = this._handleSaveAndClose.bind(this);
        this._renderSettings = this._renderSettings.bind(this);

        this.state = {
            isOpen: false,
            snapshot: undefined,
            categories: [
                {title: 'Tester', path: 'tester', component: SettingsModuleTester},
                {title: 'Application', path: 'application', component: SettingsModuleApplication},
                {title: 'OBS', path: 'obs', component: SettingsModuleObs},
                {title: 'Recording', path: 'record', component: SettingsModuleRecording},
                {title: 'Streaming', path: 'stream', component: SettingsModuleStreaming},
            ].map((tab) => {
                return {
                    menuItem: tab.title,
                    render: () => React.createElement(tab.component, {
                        path: `settings.${tab.path}`
                    }),
                };
            }),
        };
    }

    componentDidMount() {
        GetEvents().subscribe("open|settings", "settings", this._handleOpen);
    }

    componentWillUnmount() {
        GetEvents().unsubscribe("open|settings", "settings");
    }

    _handleOpen() {
        this.setState({
            isOpen: true,
            snapshot: this.state.snapshot || lodash.cloneDeep(Settings.getSettings()),
        });
    }

    _handleClose() {
        this.setState({
            isOpen: false,
        });
    }

    _handleCancel() {
        GetLocalData().set('settings', this.state.snapshot);
        this.setState({
            isOpen: false,
            snapshot: undefined,
        });
    }

    _handleSaveAndClose() {
        let promise = Settings.saveSystemSettings();
        this.setState({
            isOpen: false,
            snapshot: undefined,
        });
    }

    render() {
        return (
            <Modal
                trigger={<div/>}
                open={this.state.isOpen}
                onClose={this._handleClose}
            >
                <Header icon='save' content='Settings'/>
                <Modal.Content scrolling>
                    {this._renderSettings()}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={this._handleCancel} secondary>
                        Cancel
                    </Button>
                    <Button color='green' onClick={this._handleSaveAndClose} primary>
                        Save
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }

    _renderSettings() {
        return (
            <Form>
                <Tab
                    panes={this.state.categories}
                />
            </Form>
        );
    }

    static getFilenameFormatting() {
        let filename = GetLocalData().get(`settings.record.filename`, '');

        // TODO: Move to a central place with the other formats
        filename = FILENAME_FORMATS.custom.reduce((filenameFormat, keyPath) => {
            return filenameFormat.replace(
                new RegExp(`%${keyPath.key}`, 'g'),
                GetLocalData().get(keyPath.path, keyPath.defaultValue)
            );
        }, filename);

        return filename;
    }

}

Settings.defaultProps = {
};

Settings.propTypes = {
};

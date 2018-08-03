import React from 'react';
import PropTypes from 'prop-types';
import {Button, Form, Header, Modal} from "semantic-ui-react";
import FileSystem from "./FileSystem";
import * as lodash from "lodash";
import {LOCAL_DATA} from "./LocalData";
import ExecutableSettings from "./settings/ExecutableSettings";

export class Settings extends React.Component {

    static getSettings() { return LOCAL_DATA.get('settings', {}); }

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
        settings = LOCAL_DATA.set('settings', lodash.defaultsDeep(loadedData, settings));
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
        };
    }

    componentDidMount() {
        this.props.events.subscribe("openSettings", "settings", this._handleOpen);
    }

    componentWillUnmount() {
        this.props.events.unsubscribe("openSettings", "settings");
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
        LOCAL_DATA.set('settings', this.state.snapshot);
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
                <Header icon='save' content='Settings' />
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

                <Form.Field>
                    <label>Target Executable</label>
                    <ExecutableSettings
                        saveKey={`settings.target`}
                    />
                </Form.Field>

            </Form>
        );
    }

}

Settings.defaultProps = {
    events: {},
};

Settings.propTypes = {
    events: PropTypes.object.isRequired,
};

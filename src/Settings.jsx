import React from 'react';
import PropTypes from 'prop-types';
import {Button, Header, Modal} from "semantic-ui-react";
import FileSystem from "./FileSystem";
import * as lodash from "lodash";

export let SYSTEM_SETTINGS = {
};

export class Settings extends React.Component {

    static async loadSettings() {
        let exists = await FileSystem.existsRelative('config.json');
        let loadedData = SYSTEM_SETTINGS;
        if (exists) {
            loadedData = JSON.parse(await FileSystem.readFileRelative('config.json'));
        }
        else {
            await Settings.saveSystemSettings();
        }
        SYSTEM_SETTINGS = lodash.defaultsDeep(loadedData, SYSTEM_SETTINGS);
        console.log("Loaded system settings", SYSTEM_SETTINGS);
    }

    static async saveSystemSettings() {
        console.log("Saving system settings", SYSTEM_SETTINGS);
        await FileSystem.writeFileRelative('config.json', JSON.stringify(SYSTEM_SETTINGS));
    }

    constructor(props) {
        super(props);

        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._handleSaveAndClose = this._handleSaveAndClose.bind(this);
        this._renderSettings = this._renderSettings.bind(this);

        this.state = {
            isOpen: false,
        };
    }

    componentDidMount() {
        this.props.events.subscribe("openSettings", "settings", this._handleOpen);
    }

    componentWillUnmount() {
        this.props.events.unsubscribe("openSettings", "settings");
    }

    _handleOpen() {
        this.setState({ isOpen: true });
    }

    _handleClose() {
        this.setState({ isOpen: false });
    }

    _handleSaveAndClose() {
        let promise = Settings.saveSystemSettings();
        this._handleClose();
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
                    <Button color='green' onClick={this._handleSaveAndClose} primary>
                        Save and Return
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }

    _renderSettings() {
        return (
            <div>

            </div>
        );
    }

}

Settings.defaultProps = {
    events: {},
};

Settings.propTypes = {
    events: PropTypes.object.isRequired,
};

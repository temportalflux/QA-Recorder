import React from 'react';
import PropTypes from 'prop-types';
import {Form, Tab} from "semantic-ui-react";
import {SettingsModuleStreaming} from "./SettingsModuleStreaming";
import {SettingsModuleTester} from "./SettingsModuleTester";
import {SettingsModuleApplication} from "./SettingsModuleApplication";
import {SettingsModuleObs} from "./SettingsModuleObs";
import {SettingsModuleRecording} from "./SettingsModuleRecording";
import {SettingsModule} from "./SettingsModule";

export class SettingsDisplay extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            categories: [
                SettingsModuleTester,
                SettingsModuleApplication,
                SettingsModuleObs,
                SettingsModuleRecording,
                SettingsModuleStreaming,
            ].map((tab) => {
                return {
                    menuItem: tab.title,
                    render: () => (
                        <SettingsModule>
                            {React.createElement(tab.component, {
                                path: `settings.${tab.path}`,
                                shouldBeDisabled: () => {
                                    return this.props.launcherIsRunning;
                                },
                            })}
                        </SettingsModule>
                    ),
                };
            }),
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Form>
                <Tab
                    panes={this.state.categories}
                />
            </Form>
        );
    }

}

SettingsDisplay.defaultProps = {

};

SettingsDisplay.propTypes = {
    launcherIsRunning: PropTypes.bool.isRequired,
};

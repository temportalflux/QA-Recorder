import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import ExecutableSaved from "../components/ExecutableSaved";
import BrowseBar from "../components/BrowseBar";
import InputSaved from "../components/InputSaved";

export const SettingsModuleObs = (props) => {
    return (
        <div>
            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Executable</label>
                <ExecutableSaved
                    path={`${props.path}.executable`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Profile</label>
                <BrowseBar
                    options={{
                        title: 'OBS Profile',
                        properties: ['openDirectory'],
                    }}
                    path={`${props.path}.profile`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Scene Collection</label>
                <BrowseBar
                    filters={[
                        {name: 'Config', extensions: ['json']},
                    ]}
                    path={`${props.path}.sceneCollection`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Scene Name</label>
                <InputSaved
                    path={`${props.path}.sceneName`}
                />
            </Form.Field>

        </div>
    );
};

SettingsModuleObs.defaultProps = {

};

SettingsModuleObs.propTypes = {
    path: PropTypes.string.isRequired,
    shouldBeDisabled: PropTypes.func.isRequired,
};

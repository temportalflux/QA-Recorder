import React from 'react';
import PropTypes from 'prop-types';
import {Form, Segment} from "semantic-ui-react";
import ToggleSaved from "../components/ToggleSaved";
import InputSaved from "../components/InputSaved";

export const SettingsModuleStreaming = (props) => {
    return (
        <div>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <ToggleSaved
                    path={`${props.path}.enabled`}
                    label={'Enabled'}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Server</label>
                <InputSaved
                    path={`${props.path}.server`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Stream Key</label>
                <InputSaved
                    path={`${props.path}.key`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Authentication</label>
                {/* TODO: Move this to a component (AuthenticationSaved) */}
                <Segment>

                    <ToggleSaved
                        path={`${props.path}.authentication.enabled`}
                        label={'Enabled'}
                    />

                    <Form.Field>
                        <label>Username</label>
                        <InputSaved
                            path={`${props.path}.authentication.user`}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Password</label>
                        <InputSaved
                            path={`${props.path}.authentication.password`}
                        />
                    </Form.Field>

                </Segment>
            </Form.Field>

        </div>
    );
};

SettingsModuleStreaming.title = "Streaming";
SettingsModuleStreaming.path = "stream";
SettingsModuleStreaming.component = SettingsModuleStreaming;

SettingsModuleStreaming.defaultProps = {

};

SettingsModuleStreaming.propTypes = {
    path: PropTypes.string.isRequired,
    shouldBeDisabled: PropTypes.func.isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import InputSaved from "../components/InputSaved";
import ExecutableSaved from "../components/ExecutableSaved";

export const SettingsModuleApplication = (props) => {
    return (
        <div>

            <Form.Field>
                <label>Name</label>
                <InputSaved path={`${props.path}.name`} />
            </Form.Field>

            <Form.Field>
                <label>Target Executable</label>
                <ExecutableSaved
                    path={`${props.path}.executable`}
                />
            </Form.Field>

        </div>
    );
};

SettingsModuleApplication.defaultProps = {};

SettingsModuleApplication.propTypes = {
    path: PropTypes.string.isRequired,
};
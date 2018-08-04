import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import ExecutableSaved from "./components/ExecutableSaved";

export const SettingsModuleTarget = (props) => {
    return (
        <div>

            <Form.Field>
                <label>Target Executable</label>
                <ExecutableSaved
                    path={`${props.path}.executable`}
                />
            </Form.Field>

        </div>
    );
};

SettingsModuleTarget.defaultProps = {

};

SettingsModuleTarget.propTypes = {
    path: PropTypes.string.isRequired,
};

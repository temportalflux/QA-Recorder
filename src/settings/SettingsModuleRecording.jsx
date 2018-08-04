import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import ToggleSaved from "./components/ToggleSaved";
import BrowseBar from "./components/BrowseBar";

export const SettingsModuleRecording = (props) => {
    return (
        <div>

            <Form.Field>
                <ToggleSaved
                    path={`${props.path}.enabled`}
                    label={'Enabled'}
                />
            </Form.Field>

            <Form.Field>
                <label>Output Folder</label>
                <BrowseBar
                    path={`${props.path}.outputDirectory`}
                    options={{
                        title: 'Output Folder',
                        properties: [ 'openDirectory' ],
                    }}
                />
            </Form.Field>

        </div>
    );
};

SettingsModuleRecording.defaultProps = {

};

SettingsModuleRecording.propTypes = {
    path: PropTypes.string.isRequired,
};

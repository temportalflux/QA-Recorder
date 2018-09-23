import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import InputSaved from "../components/InputSaved";
import NumericInputSaved from "../components/NumericInputSaved";
import BrowseBar from "../components/BrowseBar";

export const SettingsModuleTester = (props) => {
    return (
        <div>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Name</label>
                <InputSaved path={`${props.path}.name`} />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Number</label>
                <NumericInputSaved
                    path={`${props.path}.number`}
                    min={0}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Launch Display</label>
                <BrowseBar
                    filters={[
                        {name: 'HTML', extensions: ['html']},
                    ]}
                    path={`${props.path}.launchDisplay`}
                />
            </Form.Field>

            <Form.Field disabled={props.shouldBeDisabled()}>
                <label>Form Link</label>
                <InputSaved path={`${props.path}.formLink`} />
            </Form.Field>

        </div>
    );
};

SettingsModuleTester.title = "Tester";
SettingsModuleTester.path = "tester";
SettingsModuleTester.component = SettingsModuleTester;

SettingsModuleTester.defaultProps = {

};

SettingsModuleTester.propTypes = {
    path: PropTypes.string.isRequired,
    shouldBeDisabled: PropTypes.func.isRequired,
};

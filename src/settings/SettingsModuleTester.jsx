import React from 'react';
import PropTypes from 'prop-types';
import {Form} from "semantic-ui-react";
import InputSaved from "../components/InputSaved";
import NumericInputSaved from "../components/NumericInputSaved";

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

        </div>
    );
};

SettingsModuleTester.defaultProps = {

};

SettingsModuleTester.propTypes = {
    path: PropTypes.string.isRequired,
    shouldBeDisabled: PropTypes.func.isRequired,
};

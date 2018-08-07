import React from 'react';
import PropTypes from 'prop-types';
import {Button} from "semantic-ui-react";
import {GetEvents} from "../singletons/EventSystem";
import * as lodash from "lodash";

export class SettingsBtnChangeSensitive extends React.Component {

    constructor(props) {
        super(props);

        this.handleChangeInHasChangedFields = this.handleChangeInHasChangedFields.bind(this);

        this.uniqueKey = '';
        this.state = {
            hasChangedFields: false,
        };
    }

    componentDidMount() {
        this.uniqueKey = `settingsBtnChangeSensitive_${this.props.uniqueKey}`;
        GetEvents().subscribe('settings|hasChangedFields', this.uniqueKey, this.handleChangeInHasChangedFields)
    }

    componentWillUnmount() {
        GetEvents().unsubscribe('settings|hasChangedFields', this.uniqueKey);
    }

    handleChangeInHasChangedFields(hasChangedFields) {
        this.setState({ hasChangedFields: hasChangedFields });
    }

    render() {
        let btnProps = lodash.omit(this.props, ['children', 'uniqueKey']);
        btnProps.disabled = !this.state.hasChangedFields || btnProps.disabled;
        return (
            <Button {...btnProps}>
                {this.props.children}
            </Button>
        );
    }

}

SettingsBtnChangeSensitive.defaultProps = {
};

SettingsBtnChangeSensitive.propTypes = {
    disabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    uniqueKey: PropTypes.string.isRequired,
};
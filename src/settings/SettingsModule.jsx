import React from 'react';
import PropTypes from 'prop-types';
import {GetEvents} from "../singletons/EventSystem";
import * as shortid from "shortid";
import {Tab} from "semantic-ui-react";
import {EVENT_LIST} from "../singletons/EventList";

export class SettingsModule extends React.Component {

    constructor(props) {
        super(props);

        this.handleImport = this.handleImport.bind(this);

        this.state = {
            refreshFlag: undefined,
        };
    }

    componentDidMount() {
        // TODO: This is not actually unique because componentDidMount doesn't unmount and mount its different panes, even with renderActiveOnly=true
        GetEvents().subscribe(EVENT_LIST.NOTIFY_SETTINGS_IMPORTED, 'settings|module', this.handleImport);
    }

    componentWillUnmount() {
        GetEvents().unsubscribe(EVENT_LIST.NOTIFY_SETTINGS_IMPORTED, 'settings|module');
    }

    handleImport() {
        this.setState({ refreshFlag: shortid.generate() });
    }

    render() {
        return (
            <Tab.Pane key={this.state.refreshFlag}>
                {this.props.children}
            </Tab.Pane>
        )
    }

}

SettingsModule.defaultProps = {

};

SettingsModule.propTypes = {
};

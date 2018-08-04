import React from 'react';
import PropTypes from 'prop-types';
import {Button, Header} from "semantic-ui-react";
import OBS from "../applications/obs/OBSInterface";
import {LOCAL_DATA} from "../singletons/LocalData";
import LocalDataText from "../components/LocalDataText";

export default class PanelLauncher extends React.Component {

    constructor(props) {
        super(props);

        this._launchOBS = this._launchOBS.bind(this);

    }

    async _launchOBS() {
        await OBS.start();
        setTimeout(() => { OBS.stop(); }, 5000);
    }

    render() {
        /*

<Button onClick={this._launchOBS}>Launch</Button>
                <Viewer />
        */
        return (
            <div>
                <Header size={'large'} textAlign='center'>Welcome to <LocalDataText path={'settings.application.name'}/>!</Header>

            </div>
        );
    }

}

PanelLauncher.defaultProps = {};

PanelLauncher.propTypes = {};
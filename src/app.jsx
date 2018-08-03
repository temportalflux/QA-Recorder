import React from 'react';
import {initMenu} from './AppMenu';
import OBS from './OBS';
import EventSystem from "./EventSystem";
import {Settings} from "./Settings";
import LocalData from "./LocalData";

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this._launchOBS = this._launchOBS.bind(this);

        this.obs = new OBS();

        this.events = new EventSystem();
        this.localData = new LocalData(this.events);

        initMenu(this.events);
    }

    componentDidMount() {
        let promise = Settings.loadSettings();
    }

    async _launchOBS() {
        await this.obs.start();
        setTimeout(() => { this.obs.stop(); }, 5000);
    }

    render() {
        /*

                <Button onClick={this._launchOBS}>Launch</Button>
                <Viewer />
        */
        return (
            <div>
                <Settings
                    events={this.events}
                />

                <h2>Welcome to React!</h2>
            </div>
        );
    }

}

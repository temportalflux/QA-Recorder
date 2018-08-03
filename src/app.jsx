import React from 'react';
import {initMenu} from './AppMenu';
import OBS from './OBS';
import {Settings} from "./Settings";
import {EVENTS} from "./EventSystem";

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this._launchOBS = this._launchOBS.bind(this);

        this.obs = new OBS();

        initMenu(EVENTS);
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
                    events={EVENTS}
                />

                <h2>Welcome to React!</h2>
            </div>
        );
    }

}

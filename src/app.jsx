import React from 'react';
import { initMenu } from './AppMenu';
import { Button } from 'semantic-ui-react';
import OBS from './OBS';
import Viewer from './video/Viewer';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this._launchOBS = this._launchOBS.bind(this);

        initMenu();

        this.obs = new OBS();

    }

    async _launchOBS() {
        await this.obs.start();
        setTimeout(() => { this.obs.stop(); }, 5000);
    }

    render() {
        return (
            <div>
                <h2>Welcome to React!</h2>
                <Button onClick={this._launchOBS}>Launch</Button>
                <Viewer />
            </div>
        );
    }

}

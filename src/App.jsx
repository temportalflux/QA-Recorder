import React from 'react';
import {initMenu} from './AppMenu';
import {Settings} from "./settings/Settings";
import {Header} from "semantic-ui-react";
import FileSystem from "./singletons/FileSystem";
import {GetEvents} from "./singletons/EventSystem";
import {Loading} from "./components/Loading";
import {AppModules} from "./modules/AppModule";

/**
 * Core component module
 */
export class App extends React.Component {

    constructor(props) {
        super(props);

        initMenu();

        this.state = {
            module: undefined,
        };

    }

    componentDidMount() {
        console.log("Loaded app with data path", FileSystem.cwd());

        GetEvents().subscribe('open|module', 'app', (module) => {
            if (this.state.module !== module)
                this.setState({module: module});
        });

        Settings.loadSettings().then(() => {
            this.setState({module: 'launcher'});
        });
    }

    componentWillUnmount() {
        GetEvents().unsubscribe('open|module', 'app');
    }

    render() {
        return (
            <div>
                <Settings />
                {this._renderPanel()}
            </div>
        );
    }

    _renderPanel() {
        if (AppModules.hasOwnProperty(this.state.module)) {
            return AppModules[this.state.module]();
        }
        else {
            return (
                <Loading>
                    <Header as='h2' icon>
                        Something is loading
                        <Header.Subheader>Please be patient</Header.Subheader>
                    </Header>
                </Loading>
            );
        }
    }

}

import React from 'react';
import {initMenu} from './AppMenu';
import {Settings} from "./settings/Settings";
import {Dimmer, Header, Loader} from "semantic-ui-react";
import PanelLauncher from "./windows/PanelLauncher";
import PanelViewer from "./windows/PanelViewer";
import FileSystem from "./singletons/FileSystem";
import {GetEvents} from "./singletons/EventSystem";
import {Loading} from "./components/Loading";

export class App extends React.Component {

    constructor(props) {
        super(props);

        initMenu(GetEvents());

        this.state = {
            panel: undefined,
        };

    }

    componentDidMount() {
        console.log("Loaded app with data path", FileSystem.cwd());

        GetEvents().subscribe('open|launcher', 'app', () => {
            if (this.state.panel !== 'launcher')
                this.setState({panel: 'launcher'});
        });
        GetEvents().subscribe('open|viewer', 'app', () => {
            if (this.state.panel !== 'viewer')
                this.setState({panel: 'viewer'});
        });

        Settings.loadSettings().then(() => {
            this.setState({panel: 'launcher'});
        });
    }

    componentWillUnmount() {
        GetEvents().unsubscribe('open|launcher', 'app');
        GetEvents().unsubscribe('open|viewer', 'app');
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
        switch (this.state.panel) {
            case 'launcher':
                return <PanelLauncher path={'launch'}/>;
            case 'viewer':
                return <PanelViewer path={'view'}/>;
            default:
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

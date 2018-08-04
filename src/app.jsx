import React from 'react';
import {initMenu} from './AppMenu';
import {Settings} from "./settings/Settings";
import {EVENTS} from "./singletons/EventSystem";
import {Dimmer, Header, Loader, Segment} from "semantic-ui-react";
import PanelLauncher from "./windows/PanelLauncher";
import PanelViewer from "./windows/PanelViewer";

export default class App extends React.Component {

    constructor(props) {
        super(props);

        initMenu(EVENTS);

        this.state = {
            panel: undefined,
        };
    }

    componentDidMount() {
        EVENTS.subscribe('open|launcher', 'app', () => {
            if (this.state.panel !== 'launcher')
                this.setState({ panel: 'launcher' });
        });
        EVENTS.subscribe('open|viewer', 'app', () => {
            if (this.state.panel !== 'viewer')
                this.setState({ panel: 'viewer' });
        });

        Settings.loadSettings().then(() => {
            this.setState({ panel: 'launcher' });
        });
    }

    componentWillUnmount() {
        EVENTS.unsubscribe('open|launcher', 'app');
        EVENTS.unsubscribe('open|viewer', 'app');
    }

    render() {
        return (
            <div>
                <Settings
                    events={EVENTS}
                />
                {this._renderPanel()}
            </div>
        );
    }

    _renderPanel() {
        switch (this.state.panel) {
            case 'launcher':
                return <PanelLauncher path={'launch'} />;
            case 'viewer':
                return <PanelViewer path={'view'} />;
            default:
                return (
                    <Dimmer active inverted>
                        <Loader inverted>
                            <Header as='h2' icon>
                                Something is loading
                                <Header.Subheader>Please be patient</Header.Subheader>
                            </Header>
                        </Loader>
                    </Dimmer>
                );
        }
    }

}

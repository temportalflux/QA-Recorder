import React from 'react';
import { initMenu } from './AppMenu';

export default class App extends React.Component {

    constructor(props) {
        super(props);

        initMenu();

    }

    render() {
        return (
            <div>
                <h2>Welcome to React!</h2>
            </div>
        );
    }

}

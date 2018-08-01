import CreateApplicationController from './CreateApplicationController';
import OBSWebSocket from 'obs-websocket-js';

export default class OBS {

    constructor() {
        this._onConnectionOpened = this._onConnectionOpened.bind(this);
        this._onConnectionClosed = this._onConnectionClosed.bind(this);

        this.processController = CreateApplicationController({
            location: '/Applications',
            name: "OBS",
        });
        this.connection = new OBSWebSocket();
        this.connectionTimeout = null;
        this.connectionInterval = null;
    }

    async start() {
        this.processController.spawn();
        await this._connect(); // continue if resolved, throw if rejected

        // https://github.com/Palakis/obs-websocket/blob/4.3-maintenance/docs/generated/protocol.md#events
        // DO EVENT SUBSCRIPTIONS

    }

    _connect(timeout = 60000) {
        return new Promise((resolve, reject) => {
            this.connectionTimeout = setTimeout(() => {
                clearInterval(this.connectionInterval);
                clearTimeout(this.connectionTimeout);
                reject("Connection attempts timed out");
            }, timeout);
            this.connectionInterval = setInterval(() => {
                this.connection.connect({})
                    .catch((e) => {
                    })
                    .then(() => {
                        clearInterval(this.connectionInterval);
                        clearTimeout(this.connectionTimeout);
                        resolve();
                    });
            }, 100);
        });
    }

    _onConnectionOpened() {
        console.log("Connected to OBS");
    }

    _onConnectionClosed() {
        console.log("Disconnected from OBS");
    }

    stop() {
        this.processController.kill();
    }

}

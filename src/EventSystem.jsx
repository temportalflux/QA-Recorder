import * as lodash from "lodash";

class EventSystem {

    constructor() {
        this.events = {};
    }

    subscribe(event, handle, func) {
        let handles = lodash.get(this.events, event, {});
        if (handles.hasOwnProperty(event)) {
            throw new Error(`Handle ${handle} for event ${event} already exists.`);
        }
        handles[handle] = func;
        lodash.set(this.events, event, handles);
    }

    unsubscribe(event, handle) {
        let handles = lodash.get(this.events, event, {});
        if (!handles.hasOwnProperty(handle)) {
            throw new Error(`Handle ${handle} does not exist for event ${event}.`);
        }
        delete handles[handle];
        lodash.set(this.events, event);
    }

    dispatch(event, data) {
        let pathCurrent = [];
        for (const pathEntry of lodash.toPath(event)) {
            pathCurrent.push(pathEntry);
            let handlers = lodash.get(this.events, pathCurrent, {});
            lodash.values(handlers).forEach((handler) => handler(data));
        }
    }

}

export const EVENTS = new EventSystem();

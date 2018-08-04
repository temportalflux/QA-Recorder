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
        let currentPath = lodash.toPath(event);
        while (currentPath.length > 0) {
            let handlers = lodash.get(this.events, currentPath, {});
            lodash.values(handlers).forEach((handlerOrObject) => {
                if (typeof handlerOrObject === 'function') {
                    handlerOrObject(data);
                }
            });
            currentPath.pop();
        }
    }

}

export const EVENTS = new EventSystem();

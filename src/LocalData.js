import * as lodash from "lodash";
import {EVENTS} from "./EventSystem";

class LocalData {

    constructor() {
        this._getEventKey = this._getEventKey.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);

        this.data = {};
    }

    _getEventKey(pathArray) {
        return `localData|${pathArray.join('.')}`;
    }

    subscribe(path, handle, func) {
        EVENTS.subscribe(this._getEventKey(lodash.toPath(path)), handle, func);
    }

    unsubscribe(path, handle) {
        EVENTS.unsubscribe(this._getEventKey(lodash.toPath(path)), handle);
    }

    set(path, value) {
        lodash.set(this.data, path, value);
        let currentPath = [];
        for (const pathEntry of lodash.toPath(path))
        {
            currentPath.push(pathEntry);
            EVENTS.dispatch(this._getEventKey(currentPath), value);
        }
        return value;
    }

    get(path, defaultValue) {
        if (!lodash.has(this.data, path)) return defaultValue;
        return lodash.get(this.data, path, defaultValue);
    }

}

export const LOCAL_DATA  = new LocalData();

import * as lodash from "lodash";

export default class LocalData {

    constructor(events) {
        this.events = events;

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
        this.events.subscribe(this._getEventKey(lodash.toPath(path)), handle, func);
    }

    unsubscribe(path, handle) {
        this.events.unsubscribe(this._getEventKey(lodash.toPath(path)), handle);
    }

    set(path, value) {
        lodash.set(this.data, path, value);
        let currentPath = [];
        for (const pathEntry of lodash.toPath(path))
        {
            currentPath.push(pathEntry);
            this.events.dispatch(this._getEventKey(currentPath), value);
        }
    }

    get(path, defaultValue) {
        return lodash.get(this.data, path, defaultValue);
    }

}
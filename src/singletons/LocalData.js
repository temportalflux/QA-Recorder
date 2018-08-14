import * as lodash from "lodash";
import {GetEvents} from "./EventSystem";

export class LocalData {

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
        GetEvents().subscribe(this._getEventKey(lodash.toPath(path)), handle, func);
    }

    unsubscribe(path, handle) {
        GetEvents().unsubscribe(this._getEventKey(lodash.toPath(path)), handle);
    }

    set(path, value) {
        lodash.set(this.data, path, value);
        let currentPath = lodash.toPath(path);
        while (currentPath.length > 0)
        {
            GetEvents().dispatch(this._getEventKey(currentPath), value, path);
            currentPath.pop();
        }
        // TODO: this probably doesn't account for all the possible children of value that may have changed.
        return value;
    }

    get(path, defaultValue) {
        return lodash.get(this.data, path, defaultValue);
    }

    update(path, defaultValue, doUpdate) {
        this.set(path, doUpdate(this.get(path, defaultValue)));
    }

}

export const LOCAL_DATA = new LocalData(); // TODO: when system soft-reloads, statics are reloaded. Move this to an electron global
export function GetLocalData() {
    return LOCAL_DATA;
}

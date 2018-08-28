import * as shortid from "shortid";
import * as lodash from "lodash";

export function listify(value) {
    if (Array.isArray(value)) {
        return value.map(listify);
    }
    else if (typeof value === 'object') {
        return lodash.defaultsDeep(value, { key: shortid.generate(), text: 'None', value: undefined });
    }
    else {
        return { key: shortid.generate(), text: value.toString(), value: value };
    }
}
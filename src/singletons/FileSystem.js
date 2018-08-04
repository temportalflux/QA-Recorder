import * as electron from "electron";
import {remote} from 'electron';
import fs from 'fs';
import path from 'path';
import * as lodash from "lodash";

export default class FileSystem {

    static cwd() {
        return path.normalize(remote.app.getAppPath());
    }

    static exists(filePath) {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    static async existsRelative(filePath) {
        return await FileSystem.exists(path.join(FileSystem.cwd(), filePath));
    }

    static readFile(filePath) {
        return new Promise((resolve, reject) => {
           fs.readFile(filePath, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    static async readFileRelative(filePath) {
        return await FileSystem.readFile(path.join(FileSystem.cwd(), filePath));
    }

    static writeFile(filePath, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    static async writeFileRelative(filePath, data) {
        return await FileSystem.writeFile(path.join(FileSystem.cwd(), filePath), data);
    }

    static displayDialog(options) {
        options = lodash.defaultsDeep(options, {});
        return new Promise((resolve) => {
            remote.dialog.showOpenDialog(options, resolve);
        });
    }

}
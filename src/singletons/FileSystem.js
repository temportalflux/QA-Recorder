import {remote} from "electron";
import fs from 'fs';
import path from 'path';
import * as lodash from "lodash";
import fsextra from 'fs-extra';

export default class FileSystem {

    static getAppPath() {
        return remote.app.getAppPath();
    }

    static getPath(key) {
        return path.normalize(remote.app.getPath(key));
    }

    static cwd() {
        //return FileSystem.getPath('userData');
        return `${FileSystem.appData()}/QARecorder`;
    }

    static appData() {
        return FileSystem.getPath('appData');
    }

    static desktop() {
        return FileSystem.getPath('desktop');
    }

    static resolvePlatformPath(pathObject) {
        switch (process.platform) {
            case 'aix':
            case 'freebsd':
            case 'linux':
            case 'openbsd':
            case 'sunos':
                pathObject = pathObject['linux'];
                break;
            case 'darwin':
                pathObject = pathObject['osx'];
                break;
            case 'win32':
                pathObject = pathObject[process.arch === 'x64' ? 'windows64' : 'windows32'];
                break;
            default:
                break;
        }
        return FileSystem.resolvePotentialRelative(pathObject);
    }

    static resolvePotentialRelative(pathObject) {
        if (pathObject.isRelative)
            console.log(FileSystem.getPath('exe'), pathObject.path, path.resolve(FileSystem.getPath('exe'), pathObject.path));
        return pathObject.isRelative ? path.resolve(FileSystem.getPath('exe'), pathObject.path) : pathObject.path;
    }

    static exists(filePath) {
        return new Promise(resolve => fs.access(filePath, fs.constants.F_OK, (err) => resolve(!err)));
    }

    static async existsRelative(filePath) {
        return await FileSystem.exists(path.join(FileSystem.getPath('exe'), filePath));
    }

    static readFile(filePath) {
        return new Promise((resolve, reject) => {
           fs.readFile(filePath, "utf8", (err, data) => {
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
        return await FileSystem.readFile(path.join(FileSystem.getPath('exe'), filePath));
    }

    static readDir(filePath) {
        return new Promise((resolve, reject) => {
            fs.readdir(filePath, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
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
        return await FileSystem.writeFile(path.join(FileSystem.getPath('exe'), filePath), data);
    }

    static displayDialog(options) {
        options = lodash.defaultsDeep(options, {});
        return new Promise((resolve) => {
            remote.dialog.showOpenDialog(options, resolve);
        });
    }

    static displaySaveDialog(options) {
        options = lodash.defaultsDeep(options, {});
        return new Promise((resolve) => {
            remote.dialog.showSaveDialog(options, resolve);
        })
    }

    static chmodWrite(filePath) {
        return new Promise((resolve, reject) => fs.chmod(filePath, '777', (err) => {
            if (!err) resolve();
            else reject(err);
        }));
    }

    // https://stackoverflow.com/questions/13542667/create-directory-when-writing-to-file-in-node-js
    static async ensureDirectoryExists(filePath) {
        let dirname = path.dirname(filePath);
        if (await FileSystem.exists(dirname)) {
            return true;
        }
        await FileSystem.ensureDirectoryExists(dirname);
        await new Promise((resolve, reject) => fs.mkdir(dirname, 0o777, (err) => {
            if (!err) resolve();
            else reject(err);
        }));
    }

    static copyTo(src, dest) {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dest, (err) => {
                if (!err) resolve();
                else reject(err);
            });
        });
    }

    static async remove(filePath) {
        await fsextra.remove(filePath);
    }

    static rename(src, destination) {
        return new Promise((resolve, reject) => {
            fs.rename(src, destination, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static waitUntilAvailable(filePath, frequency=100) {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                fs.open(filePath, 'r+', function(err, fd) {
                    fs.close(fd, (errClose) => {});
                    if (err && err.code === 'EBUSY') {
                        //do nothing till next loop
                    } else if (err) {
                        clearInterval(interval);
                        reject(err);
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                });
            }, frequency);
        });
    }

}

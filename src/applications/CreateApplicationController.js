import { spawn } from "child_process";
import FileSystem from "../singletons/FileSystem";
import path from 'path';

export default function CreateApplicationController(executable, args, events) {
    switch (process.platform) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'sunos':
            return new APUnix(executable['linux'], args, events);
        case 'darwin':
            return new APMac(executable['osx'], args, events);
        case 'win32':
            if (process.arch === 'x64')
                return new APWindows(executable['windows64'], args, events);
            else
                return new APWindows(executable['windows32'], args, events);
        default:
            break;
    }
}

class ApplicationController {

    constructor(executablePath, args, events) {
        this.eventCallbacks = events || {};
        this.executableArgs = args;

        this.spawn = this.spawn.bind(this);
        this.spawnProcess = this.spawnProcess.bind(this);
        this.doSpawnProcess = this.doSpawnProcess.bind(this);
        this.subscribeToProcess = this.subscribeToProcess.bind(this);
        this.kill = this.kill.bind(this);
        this._onClose = this._onClose.bind(this);

        this.executableInfo = undefined;
        if (executablePath !== undefined) {
            this.executableInfo = FileSystem.resolvePotentialRelative(executablePath);
        }
        if (this.executableInfo !== undefined) {
            this.executableInfo = path.parse(this.executableInfo);
        }

        this.subprocess = null;

    }

    spawn() {
        throw new Error("NotImplemented: spawn()");
    }

    spawnProcess(filePath, args = []) {
        this.subprocess = this.doSpawnProcess(filePath, args);
        this.subscribeToProcess();
    }

    doSpawnProcess(filePath, args = []) {
        return spawn(filePath, args, { cwd: this.executableInfo.dir, env: process.env });
    }

    subscribeToProcess() {
        this.subprocess.on('close', this._onClose);
    }

    kill() {
        if (!this.subprocess)
        {
            throw new Error("Cannot kill a process that has not been spawned");
        }
        console.log("Preparing to kill", this.executableInfo.name);

        this.subprocess.kill();

        if (this.subprocess.killed) {
            console.log("Killed", this.executableInfo.name);
            this.subprocess = null;
        }
    }

    _onClose() {
        this.subprocess = null;
        if (this.eventCallbacks.close)
            this.eventCallbacks.close();
    }

}

class APWindows extends ApplicationController {

    spawn() {
        console.log("Preparing to launch", this.executableInfo.name);
        this.spawnProcess(path.win32.normalize(`${this.executableInfo.dir}/${this.executableInfo.base}`), this.executableArgs);
        console.log("Launched", this.executableInfo.name);
    }

}

class APMac extends ApplicationController {

    spawn() {
        // https://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
        // https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
        console.log("Preparing to launch", this.executableInfo.name);
        this.spawnProcess(`${this.executableInfo.dir}/${this.executableInfo.base}/Contents/MacOS/${this.executableInfo.name}`, this.executableArgs);
        console.log("Launched", this.executableInfo.name);
    }

}

class APUnix extends ApplicationController {

}

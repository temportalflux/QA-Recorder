import { spawn, execFile } from "child_process";
import FileSystem from "../singletons/FileSystem";
import path from 'path';

export default function CreateApplicationController(executable, events) {
    switch (process.platform) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'sunos':
            return new APUnix(executable['linux'], events);
        case 'darwin':
            return new APMac(executable['osx'], events);
        case 'win32':
            if (process.arch === 'x64')
                return new APWindows(executable['windows64'], events);
            else
                return new APWindows(executable['windows32'], events);
        default:
            break;
    }
}

class ApplicationController {

    constructor(executablePath, events) {
        this.eventCallbacks = events || {};

        this.spawn = this.spawn.bind(this);
        this.spawnProcess = this.spawnProcess.bind(this);
        this.doSpawnProcess = this.doSpawnProcess.bind(this);
        this.subscribeToProcess = this.subscribeToProcess.bind(this);
        this.kill = this.kill.bind(this);
        this._onClose = this._onClose.bind(this);

        this.executableInfo = undefined;
        if (executablePath !== undefined) {
            this.executableInfo = executablePath.isRelative
                ? path.resolve(FileSystem.cwd(), executablePath.path)
                : executablePath.path;
        }
        if (this.executableInfo !== undefined) {
            this.executableInfo = path.parse(this.executableInfo);
        }

        this.subprocess = null;

    }

    spawn() {
        throw new Error("NotImplemented: spawn()");
    }

    spawnProcess(filePath) {
        this.subprocess = this.doSpawnProcess(filePath);
        this.subscribeToProcess();
    }

    doSpawnProcess(filePath) {
        return spawn(filePath, [], { cwd: this.executableInfo.dir, env: process.env });
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
        this.spawnProcess(path.win32.normalize(`${this.executableInfo.dir}/${this.executableInfo.base}`));
        console.log("Launched", this.executableInfo.name);
    }

}

class APMac extends ApplicationController {

    spawn() {
        // https://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
        // https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
        console.log("Preparing to launch", this.executableInfo.name);
        this.spawnProcess(`${this.executableInfo.dir}/${this.executableInfo.base}/Contents/MacOS/${this.executableInfo.name}`);
        console.log("Launched", this.executableInfo.name);
    }

}

class APUnix extends ApplicationController {

}

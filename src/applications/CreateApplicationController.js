import { spawn } from "child_process";

export default function CreateApplicationController(executable) {
    switch (process.platform)
    {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'sunos':
            return new APUnix(executable);
        case 'darwin':
            return new APMac(executable);
        case 'win32':
            return new APWindows(executable);
        default:
            break;
    }
}

class ApplicationController {

    constructor(executable) {
        this._spawnProcess = this._spawnProcess.bind(this);
        this.spawn = this.spawn.bind(this);
        this.kill = this.kill.bind(this);

        this.executableInfo = executable;
        this.subprocess = null;

    }

    _spawnProcess(filePath) {
        this.subprocess = spawn(filePath, [], { cwd: undefined, env: process.env });
    }

    spawn() {
        throw new Error("NotImplemented: spawn()");
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
        }
    }

}

class APWindows extends ApplicationController {



}

class APMac extends ApplicationController {

    spawn() {
        // https://ourcodeworld.com/articles/read/154/how-to-execute-an-exe-file-system-application-using-electron-framework
        // https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
        console.log("Preparing to launch", this.executableInfo.name);
        this._spawnProcess(`${this.executableInfo.location}/${this.executableInfo.name}.app/Contents/MacOS/${this.executableInfo.name}`);
        console.log("Launched", this.executableInfo.name);
    }

}

class APUnix extends ApplicationController {

}

import CreateApplicationController from './CreateApplicationController';
import OBSWebSocket from 'obs-websocket-js';
import path from "path";
import FileSystem from "../singletons/FileSystem";
import {GetLocalData} from "../singletons/LocalData";
import {Settings} from "../settings/Settings";
import * as lodash from 'lodash';
import {EVENTS, GetEvents} from "../singletons/EventSystem";
import {EVENT_LIST} from "../singletons/EventList";

export default class OBSInterface {

    constructor(location, name) {

        this.getSettingsPath = this.getSettingsPath.bind(this);
        this.getSettingsPathProfiles = this.getSettingsPathProfiles.bind(this);
        this.getSettingsPathScenes = this.getSettingsPathScenes.bind(this);

        this.addFileSettings = this.addFileSettings.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.moveOutputFile = this.moveOutputFile.bind(this);
        this.moveDataFiles = this.moveDataFiles.bind(this);
        this.getDataFilePaths = this.getDataFilePaths.bind(this);

        this.removeOldDataFiles = this.removeOldDataFiles.bind(this);
        this.addFileSettingsProfile = this.addFileSettingsProfile.bind(this);
        this.removeFileSettingsProfile = this.removeFileSettingsProfile.bind(this);
        this.getProfilePathSet = this.getProfilePathSet.bind(this);
        this.getProfileName = this.getProfileName.bind(this);
        this.getProfilePath = this.getProfilePath.bind(this);

        this.addFileSettingsScenes = this.addFileSettingsScenes.bind(this);
        this.removeFileSettingsScenes = this.removeFileSettingsScenes.bind(this);
        this.getSceneCollectionPathSet = this.getSceneCollectionPathSet.bind(this);
        this.getSceneCollectionName = this.getSceneCollectionName.bind(this);
        this.getSceneCollectionPath = this.getSceneCollectionPath.bind(this);

        this.start = this.start.bind(this);
        this.connect = this.connect.bind(this);
        this.tryToConnect = this.tryToConnect.bind(this);
        this.doConnect = this.doConnect.bind(this);
        this.stop = this.stop.bind(this);

        this.request = this.request.bind(this);
        this.loadFromSettings = this.loadFromSettings.bind(this);
        this.getRecordingOutputDirectory = this.getRecordingOutputDirectory.bind(this);
        this.loadFromSettingsRecord = this.loadFromSettingsRecord.bind(this);
        this.loadFromSettingsStream = this.loadFromSettingsStream.bind(this);

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording  = this.stopRecording.bind(this);
        this.startStreaming = this.startStreaming.bind(this);
        this.stopStreaming = this.stopStreaming.bind(this);

        this.processController = CreateApplicationController(location, [], name);
        this.connection = new OBSWebSocket();
        this.filenameFormatted = undefined;
    }

    getSettingsPath() {
        return path.resolve(FileSystem.appData(), 'obs-studio/basic');
    }

    getSettingsPathProfiles() {
        return path.resolve(this.getSettingsPath(), 'profiles/');
    }

    getSettingsPathScenes() {
        return path.resolve(this.getSettingsPath(), 'scenes/');
    }

    async addFileSettings() {
        await this.addFileSettingsProfile();
        await this.addFileSettingsScenes();
        await this.removeOldDataFiles();
    }

    async cleanup() {
        await this.removeFileSettingsProfile();
        await this.removeFileSettingsScenes();
        await this.moveOutputFile();
        await this.moveDataFiles();

        GetEvents().dispatch(EVENT_LIST.NOTIFY_OBS_UNSET_OUTPUT_DIR);
        this.filenameFormatted = undefined;
    }

    async addFileSettingsProfile() {
        let set = this.getProfilePathSet();
        if (set === undefined) return;
        let { profilePathSrc, profilePathDirDest, profilePathDest } = set;
        await FileSystem.ensureDirectoryExists(profilePathDest);
        await FileSystem.copyTo(path.resolve(profilePathSrc, 'basic.ini'), profilePathDest);
    }

    async removeFileSettingsProfile() {
        let set = this.getProfilePathSet();
        if (set === undefined) return;
        let { profilePathSrc, profilePathDirDest, profilePathDest } = set;
        await FileSystem.remove(profilePathDirDest);
    }

    async removeOldDataFiles() {
        let filePaths = this.getDataFilePaths();
        if (filePaths.length > 0)
        {
            for (const filePath of filePaths.values())
            {
                let exists = await FileSystem.exists(filePath);
                if (exists)
                {
                    console.log(`Removing file ${filePath}`);
                    await FileSystem.remove(filePath);
                }
            }
        }
    }

    getProfilePathSet() {
        let profilePathSrc = this.getProfilePath();
        if (profilePathSrc === undefined) return undefined;
        let profilePathDirDest = path.resolve(this.getSettingsPathProfiles(), this.getProfileName());
        let profilePathDest = path.resolve(profilePathDirDest, 'basic.ini');
        return {
            profilePathSrc: profilePathSrc,
            profilePathDirDest: profilePathDirDest,
            profilePathDest: profilePathDest,
        };
    }

    getProfileName() {
        let profilePath = this.getProfilePath();
        return profilePath !== undefined ? path.basename(profilePath) : undefined;
    }

    getProfilePath() {
        let pathSettings = GetLocalData().get('settings.obs.profile');
        console.log(pathSettings, FileSystem.resolvePotentialRelative(pathSettings));
        return pathSettings !== undefined ? FileSystem.resolvePotentialRelative(pathSettings): undefined;
    }

    async addFileSettingsScenes() {
        let set = this.getSceneCollectionPathSet();
        if (set === undefined) return;
        let { sceneCollectionPathSrc, sceneCollectionPathDest } = set;
        await FileSystem.ensureDirectoryExists(sceneCollectionPathDest);
        await FileSystem.copyTo(sceneCollectionPathSrc, sceneCollectionPathDest);
    }

    async removeFileSettingsScenes() {
        let set = this.getSceneCollectionPathSet();
        if (set === undefined) return;
        let { sceneCollectionPathSrc, sceneCollectionPathDest } = set;
        await FileSystem.remove(sceneCollectionPathDest);
        await FileSystem.remove(sceneCollectionPathDest + '.bak');
    }

    getSceneCollectionPathSet() {
        let sceneCollectionPathSrc = this.getSceneCollectionPath();
        if (sceneCollectionPathSrc === undefined) return undefined;
        let sceneCollectionPathDest = path.resolve(this.getSettingsPathScenes(), this.getSceneCollectionName());
        return {
            sceneCollectionPathSrc: sceneCollectionPathSrc,
            sceneCollectionPathDest: sceneCollectionPathDest,
        };
    }

    getSceneCollectionName(ext) {
        let pathSettings = this.getSceneCollectionPath();
        return pathSettings !== undefined ? path.basename(pathSettings, ext) : undefined;
    }

    getSceneCollectionPath() {
        let pathSettings = GetLocalData().get('settings.obs.sceneCollection');
        if (pathSettings === undefined) return undefined;
        return FileSystem.resolvePotentialRelative(pathSettings);
    }

    async start() {
        this.processController.spawn();
        await this.connect(); // continue if resolved, throw if rejected
    }

    connect(timeout = 60000) {
        let delay = 100;
        return this.tryToConnect(delay, timeout).then(() => {
            console.log("Connected to OBS");
        });
    }

    tryToConnect(delayBetweenAttempts, maxAttempts, totalAttempts = 0) {
        return this.doConnect(totalAttempts).catch((err) => {
            if (totalAttempts < maxAttempts) {
                console.log(`Failed obs connection attempt. Trying again in ${delayBetweenAttempts}ms.`);
                return new Promise(resolve => setTimeout(resolve, delayBetweenAttempts))
                    .then(() => this.tryToConnect(delayBetweenAttempts, totalAttempts + 1));
            }
            else {
                throw new Error("Total attempts reached. Failed connection");
            }
        });
    }

    doConnect(totalAttempts) {
        return this.connection.connect({
            address: 'localhost:4444'
        });
    }

    static runIntervalForTimeout(execute, intervalTime, maxAttempts) {
        return new Promise((resolve, reject) => {
            let hasMaxAttempts = (maxAttempts || 0) > 0;
            let makeAttempt;
            makeAttempt = (attempts) => {
                if (hasMaxAttempts && attempts >= maxAttempts) {
                    throw new Error("Max attempts reached.");
                }
                else {
                    return execute().catch(err => {
                        console.warn(err);
                        return new Promise(resolve => setTimeout(resolve, intervalTime)).then(() => makeAttempt(attempts + 1));
                    });
                }
            };
            makeAttempt(0);
        });
    }

    stop() {
        this.processController.kill();
        this.connected = false;
    }

    async request(request, data) {
        console.log("[OBS Req]", "Sending request", request, data);
        let response = await this.connection.send(request, data);
        console.log("[OBS Req]", "Received response for", request, data, response);
        return response;
    }

    async ezRequest(requestName, key, value) {
        if (value === undefined) return;
        await this.request(requestName, { [key]: value });
    }

    async loadFromSettings() {
        await this.ezRequest('SetCurrentProfile', 'profile-name', this.getProfileName());
        await this.ezRequest('SetCurrentSceneCollection', 'sc-name', this.getSceneCollectionName('.json'));
        await this.ezRequest('SetCurrentScene', 'scene-name', GetLocalData().get('settings.obs.sceneName'));
        await this.loadFromSettingsRecord();
        await this.loadFromSettingsStream();
    }

    getRecordingOutputDirectory() {
        let rootKey = 'settings.record';
        return path.join(
            FileSystem.resolvePotentialRelative(
                GetLocalData().get(`${rootKey}.outputDirectory`, {path: FileSystem.appData()})
            ),
            this.filenameFormatted
        );
    }

    async loadFromSettingsRecord() {
        this.filenameFormatted = Settings.getFilenameFormatting();
        let outputDir = this.getRecordingOutputDirectory();
        GetEvents().dispatch(EVENT_LIST.NOTIFY_OBS_SET_OUTPUT_DIR, outputDir);
        await this.request('SetRecordingFolder', { 'rec-folder': outputDir });
        await this.request('SetFilenameFormatting', { 'filename-formatting': 'footage' });
    }

    async moveOutputFile() {
        let outputDir = this.getRecordingOutputDirectory();
        let contents = await FileSystem.readDir(outputDir);
        await FileSystem.chmodWrite(outputDir);
        let footageFilePath = lodash.find(contents, (item) => path.basename(item, path.extname(item)) === 'footage');
        let srcFootagePath = path.resolve(outputDir, footageFilePath);
        let destFootagePath = path.resolve(outputDir, `${this.filenameFormatted}${path.extname(footageFilePath)}`);
        try {
            await FileSystem.waitUntilAvailable(srcFootagePath, 100);
            await FileSystem.chmodWrite(srcFootagePath);
            await FileSystem.rename(srcFootagePath, destFootagePath);
        }
        catch (e) {
            console.log(e);
            console.error(e);
        }
    }

    getDataFilePaths() {
        return GetLocalData().get(`settings.record.recordedData`, {path: ''}).path.split(";");
    }

    async moveDataFiles() {
        let outputDir = this.getRecordingOutputDirectory();
        let filePaths = this.getDataFilePaths();
        if (filePaths.length > 0)
        {
            for (const filePath of filePaths.values())
            {
                let exists = await FileSystem.exists(filePath);
                if (exists)
                {
                    let newFilePath = path.join(outputDir, path.parse(filePath).base);
                    console.log(`Moving file ${filePath} to ${newFilePath}`);
                    await FileSystem.rename(filePath, newFilePath);
                }
            }
        }
    }

    async loadFromSettingsStream() {
    }

    async startRecording() {
        if (GetLocalData().get(`settings.record.enabled`, false))
        {
            await this.request('StartRecording', {});
        }
    }

    async stopRecording() {
        if (GetLocalData().get(`settings.record.enabled`, false))
        {
            await this.request('StopRecording', {});
        }
    }

    async startStreaming() {
        let rootKey = 'settings.stream';
        if (GetLocalData().get(`${rootKey}.enabled`, false))
        {
            await this.request('StartStreaming', {
                stream: {
                    settings: {
                        server: GetLocalData().get(`${rootKey}.server`, ''),
                        key: GetLocalData().get(`${rootKey}.key`, ''),
                        'use-auth': GetLocalData().get(`${rootKey}.authentication.enabled`, false),
                        username: GetLocalData().get(`${rootKey}.authentication.user`, ''),
                        password: GetLocalData().get(`${rootKey}.authentication.password`, ''),
                    }
                }
            });
        }
    }

    async stopStreaming() {
        if (GetLocalData().get(`settings.stream.enabled`, false))
        {
            await this.request('StopStreaming', {});
        }
    }


}

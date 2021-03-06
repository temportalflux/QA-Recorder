import CreateApplicationController from './CreateApplicationController';
import OBSWebSocket from 'obs-websocket-js';
import path from "path";
import FileSystem from "../singletons/FileSystem";
import {GetLocalData} from "../singletons/LocalData";
import {Settings} from "../settings/Settings";

export default class OBSInterface {

    constructor(location, name) {

        this.getSettingsPath = this.getSettingsPath.bind(this);
        this.getSettingsPathProfiles = this.getSettingsPathProfiles.bind(this);
        this.getSettingsPathScenes = this.getSettingsPathScenes.bind(this);

        this.addFileSettings = this.addFileSettings.bind(this);
        this.removeFileSettings = this.removeFileSettings.bind(this);

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
        this.loadFromSettingsRecord = this.loadFromSettingsRecord.bind(this);
        this.loadFromSettingsStream = this.loadFromSettingsStream.bind(this);

        this.startRecording = this.startRecording.bind(this);
        this.stopRecording  = this.stopRecording.bind(this);
        this.startStreaming = this.startStreaming.bind(this);
        this.stopStreaming = this.stopStreaming.bind(this);

        this.processController = CreateApplicationController(location, name);
        this.connection = new OBSWebSocket();
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
    }

    async removeFileSettings() {
        await this.removeFileSettingsProfile();
        await this.removeFileSettingsScenes();
    }

    async addFileSettingsProfile() {
        let { profilePathSrc, profilePathDirDest, profilePathDest } = this.getProfilePathSet();
        await FileSystem.ensureDirectoryExists(profilePathDest);
        await FileSystem.copyTo(path.resolve(profilePathSrc, 'basic.ini'), profilePathDest);
    }

    async removeFileSettingsProfile() {
        let { profilePathSrc, profilePathDirDest, profilePathDest } = this.getProfilePathSet();
        await FileSystem.remove(profilePathDirDest);
    }

    getProfilePathSet() {
        let profilePathSrc = this.getProfilePath();
        let profilePathDirDest = path.resolve(this.getSettingsPathProfiles(), this.getProfileName());
        let profilePathDest = path.resolve(profilePathDirDest, 'basic.ini');
        return {
            profilePathSrc: profilePathSrc,
            profilePathDirDest: profilePathDirDest,
            profilePathDest: profilePathDest,
        };
    }

    getProfileName() {
        return path.basename(this.getProfilePath());
    }

    getProfilePath() {
        return FileSystem.resolvePotentialRelative(GetLocalData().get('settings.obs.profile'));
    }

    async addFileSettingsScenes() {
        let { sceneCollectionPathSrc, sceneCollectionPathDest } = this.getSceneCollectionPathSet();
        await FileSystem.copyTo(sceneCollectionPathSrc, sceneCollectionPathDest);
    }

    async removeFileSettingsScenes() {
        let { sceneCollectionPathSrc, sceneCollectionPathDest } = this.getSceneCollectionPathSet();
        await FileSystem.remove(sceneCollectionPathDest);
        await FileSystem.remove(sceneCollectionPathDest + '.bak');
    }

    getSceneCollectionPathSet() {
        let sceneCollectionPathSrc = this.getSceneCollectionPath();
        let sceneCollectionPathDest = path.resolve(this.getSettingsPathScenes(), this.getSceneCollectionName());
        return {
            sceneCollectionPathSrc: sceneCollectionPathSrc,
            sceneCollectionPathDest: sceneCollectionPathDest,
        };
    }

    getSceneCollectionName(ext) {
        return path.basename(this.getSceneCollectionPath(), ext);
    }

    getSceneCollectionPath() {
        return FileSystem.resolvePotentialRelative(GetLocalData().get('settings.obs.sceneCollection'));
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

    async loadFromSettings() {
        await this.request('SetCurrentProfile', { 'profile-name': this.getProfileName() });
        await this.request('SetCurrentSceneCollection', { 'sc-name': this.getSceneCollectionName('.json') });
        await this.request('SetCurrentScene', { 'scene-name': GetLocalData().get('settings.obs.sceneName') });
        await this.loadFromSettingsRecord();
        await this.loadFromSettingsStream();
    }

    async loadFromSettingsRecord() {
        let rootKey = 'settings.record';
        //let enabled = GetLocalData().get(`${rootKey}.enabled`);
        let outputDir = FileSystem.resolvePotentialRelative(GetLocalData().get(`${rootKey}.outputDirectory`));
        await this.request('SetRecordingFolder', { 'rec-folder': outputDir });
        await this.request('SetFilenameFormatting', { 'filename-formatting': Settings.getFilenameFormatting() });
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

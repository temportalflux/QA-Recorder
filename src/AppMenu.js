import electron from 'electron';
import {GetEvents} from "./singletons/EventSystem";

/**
 * Initializes the Electron window's menu bar.
 */
export function initMenu() {
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    click: () => GetEvents().dispatch("open|settings"),
                },
                {type: 'separator'},
                {role: 'minimize'},
                {role: 'close'},
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteandmatchstyle'},
            ]
        },
        {
            role: 'window',
            submenu: [
                {role: 'togglefullscreen'},
                {type: 'separator'},
                {
                    label: 'Open Launcher',
                    click: () => GetEvents().dispatch("open|module", "launcher"),
                },
                {
                    label: 'Open Viewer',
                    click: () => GetEvents().dispatch("open|module", "viewer"),
                },
            ]
        },
        {
            label: 'Editor',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {role: 'toggledevtools'},
            ]
        },
    ]));
}

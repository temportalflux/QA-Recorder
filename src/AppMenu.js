import electron from 'electron';
import {GetEvents} from "./singletons/EventSystem";
import {EVENT_LIST} from "./singletons/EventList";

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
                    click: () => GetEvents().dispatch(EVENT_LIST.REQUEST_OPEN_SETTINGS),
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
                    click: () => GetEvents().dispatch(EVENT_LIST.REQUEST_OPEN_MODULE, "launcher"),
                },
                {
                    label: 'Open Viewer',
                    click: () => GetEvents().dispatch(EVENT_LIST.REQUEST_OPEN_MODULE, "viewer"),
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

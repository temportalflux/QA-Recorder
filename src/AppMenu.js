import * as electron from 'electron';

export function initMenu(events) {
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    click: () => { events.dispatch("open|settings"); },
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
                    click: () => { events.dispatch("open|launcher"); },
                },
                {
                    label: 'Open Viewer',
                    click: () => { events.dispatch("open|viewer"); },
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

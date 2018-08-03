import * as electron from 'electron';

export function initMenu(events) {
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Settings',
                    click: () => { events.dispatch("openSettings"); },
                }
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
                {role: 'minimize'},
                {role: 'close'},
                {type: 'separator'},
                {role: 'togglefullscreen'},
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

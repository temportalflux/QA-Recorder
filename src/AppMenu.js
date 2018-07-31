import * as electron from 'electron';

export function initMenu() {
    electron.remote.Menu.setApplicationMenu(electron.remote.Menu.buildFromTemplate([
        {
            label: '--primary--',
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

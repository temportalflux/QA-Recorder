import React from "react";
import {AppModuleLauncher} from "./launcher/AppModuleLauncher";
import {AppModuleViewer} from "./viewer/AppModuleViewer";

export const AppModules = {
    launcher: () => {
        return <AppModuleLauncher path={'launch'} />;
    },
    viewer: () => {
        return <AppModuleViewer path={'view'} />;
    },
};

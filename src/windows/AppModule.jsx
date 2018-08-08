import React from "react";
import {AppModuleLauncher} from "./AppModuleLauncher";
import {AppModuleViewer} from "./AppModuleViewer";

export const AppModules = {
    launcher: () => {
        return <AppModuleLauncher path={'launch'} />;
    },
    viewer: () => {
        return <AppModuleViewer path={'view'} />;
    },
};

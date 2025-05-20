import { EventsOn, OnFileDrop } from "./wailsjs/runtime/runtime";

export interface DesktopEventsListener {
    secondLaunchCallback: (args: string[]) => void;
    dropFilesCallback: (x: number, y: number, files: string[]) => void;
}

export const initDesktopEvents = async (listener?: DesktopEventsListener) => {
    if (getPlatform() === "web") return;

    EventsOn("secondLaunchArgs", (args: string[]) => {
        listener?.secondLaunchCallback?.(args);
    });

    OnFileDrop((x, y, files) => {
        listener?.dropFilesCallback?.(x, y, files);
    }, true);

    console.log("initDesktopEvents");
};

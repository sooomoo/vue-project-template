import { EventsOn, OnFileDrop } from "./wailsjs/runtime/runtime";

export const initDesktopEvents = () => {
    EventsOn("secondLaunchArgs", (args: string[]) => {
        useAppEventBus().emit("secondLaunchArgs", args);
    });

    OnFileDrop((x, y, files) => {
        useAppEventBus().emit("dropFiles", { x, y, files });
    }, true);

    console.log("initDesktopEvents");
};

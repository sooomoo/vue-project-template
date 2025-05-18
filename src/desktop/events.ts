export interface DesktopEventsListener {
    secondLaunchCallback: (args: string[]) => void;
    dropFilesCallback: (x: number, y: number, files: string[]) => void;
}

export const initDesktopEvents = async (listener?: DesktopEventsListener) => {
    if (getPlatform() === "web") return;
    const { EventsOn, OnFileDrop } = await import("./wailsjs/runtime/runtime");

    EventsOn("secondLaunchArgs", (args: string[]) => {
        listener?.secondLaunchCallback?.(args);
    });

    OnFileDrop((x, y, files) => {
        listener?.dropFilesCallback?.(x, y, files);
    }, true);

    console.log("initDesktopEvents");
};

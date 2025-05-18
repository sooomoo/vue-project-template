import { EventsOn, OnFileDrop } from "./wailsjs/runtime/runtime";

EventsOn("secondLaunchArgs", (args: string[]) => {
    const secondLaunchArgs = args.join("|");
    console.log("secondLaunchArgs", secondLaunchArgs);
});

OnFileDrop((x, y, files) => {
    console.log("OnFileDrop 123", files);
    // dropFiles.push(...files);
}, true);

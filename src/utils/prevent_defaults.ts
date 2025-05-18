const preventDefaults = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (e instanceof DragEvent && e.dataTransfer) {
        e.dataTransfer.dropEffect = "none";
    }
};
const preventEvents = ["dragenter", "dragover", "dragleave"];

/**
 * 阻止默认行为（阻止浏览器打开文件）, 需严格测试在网页及桌面端是否生效
 */
export const preventDocumentDefaultEvents = () => {
    const events = [...preventEvents];
    if (getPlatform() !== "web") {
        events.push("contextmenu");
    }
    // 阻止默认行为（阻止浏览器打开文件）
    events.forEach((eventName) => {
        document.addEventListener(eventName, preventDefaults, false);
    });
};

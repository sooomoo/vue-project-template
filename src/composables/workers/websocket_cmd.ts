export type WebSocketCmd = string;

export interface IWebSocketCmd<T> {
    cmd: WebSocketCmd;

    data: T;
}

export interface WebSocketConnectCmdData {
    url: string;
    subprotocol: string[];
    heartbeatInterval: number;
    maxRetryAttempts: number;
}

export const isConnectCmd = (
    cmd: IWebSocketCmd<unknown>,
): cmd is IWebSocketCmd<WebSocketConnectCmdData> => {
    return cmd.cmd === WebSocketCmdConnect;
};

export const WebSocketCmdConnect: WebSocketCmd = "connect";
export const WebSocketCmdClose: WebSocketCmd = "close";

export enum WebSocketMsgType {
    ready = 1,
    ping = 5,
    pong = 6,
}

/// <reference lib="webworker" />

import { PacketProtocol } from "@/utils/bytes/packet";
import { ExponentialRetryStrategy } from "@/utils/retry_strategy";
import type { DeadReason } from "@/utils/websocket";
import { WebSocketClientBase } from "@/utils/websocket";
import { msgPackMarshaler } from "@/utils/bytes/marshaler";
import {
    isConnectCmd,
    type IWebSocketCmd,
    WebSocketCmdClose,
    type WebSocketConnectCmdData,
    WebSocketMsgType,
} from "./websocket_cmd";

const ports: MessagePort[] = [];
let websocket: WebSocketClient | undefined;

const scope = self as unknown as SharedWorkerGlobalScope;
if (!scope) {
    throw new Error("scope is not SharedWorkerGlobalScope");
}
const wlogger = logger.tag("WebSocketWorker");

scope.onconnect = (e: MessageEvent) => {
    const port = e.ports[0];
    ports.push(port);

    port.onmessage = (e: MessageEvent<IWebSocketCmd<unknown>>) => {
        wlogger.debug(" 收到消息 ", e.data);
        if (isConnectCmd(e.data)) {
            if (websocket) {
                wlogger.debug("websocket 已连接");
                return;
            }
            websocket = new WebSocketClient(e.data.data);
            websocket.onDead = (reason) => {
                websocket = undefined;
                wlogger.debug("websocket 连接彻底关闭，原因:", reason);
            };
            websocket.connect();
        } else if (e.data.cmd === WebSocketCmdClose) {
            const ws = websocket;
            websocket = undefined;
            ws?.close();
        }
    };
};

export class WebSocketClient extends WebSocketClientBase {
    private readonly protocal: PacketProtocol;
    private requestId = 0;
    private readonly logger = logger.tag("WebSocketClient");

    onDeadCallback?: (reason: DeadReason) => void;

    constructor(data: WebSocketConnectCmdData) {
        super(
            data.url,
            data.subprotocol,
            "arraybuffer",
            new ExponentialRetryStrategy(1000, data.maxRetryAttempts),
            data.heartbeatInterval,
        );
        this.protocal = new PacketProtocol(msgPackMarshaler);
    }

    onData(data: string | ArrayBuffer): void {
        if (typeof data == "string") {
            this.logger.debug("text message: ", data);
        } else if (data instanceof ArrayBuffer) {
            const { msgType, requestId, timestamp, code } = this.protocal.getResponseMeta(
                new Uint8Array(data),
            );
            this.logger.debug("[META] recv message: ", msgType, requestId, timestamp, code);
            if (msgType == WebSocketMsgType.pong) {
                this.logger.debug("pong message");
            }
        }
    }

    override onHeartbeatTick(): void {
        this.sendMsg(WebSocketMsgType.ping);
    }

    override onConnected(): void {
        this.logger.debug("connected");
    }

    override onWillReconnect(durationMs: number): void {
        this.logger.debug(`reconnect after ${durationMs}ms`);
    }

    override onError(error: Event): void {
        this.logger.debug("error", error);
    }

    override onDead(reason: DeadReason): void {
        this.logger.debug("onDead, reason: ", reason);
        this.onDeadCallback?.(reason);
    }

    sendMsg<T>(msgType: WebSocketMsgType, payload?: T): number {
        this.requestId = (this.requestId + 1) % 0xffffffff;
        const packet = this.protocal.encodeReq<T>(msgType, this.requestId, payload);
        this.logger.debug(
            "send message: ",
            msgType,
            this.requestId,
            payload,
            packet,
            this.readyState,
        );
        this.send(packet.buffer);
        return this.requestId;
    }
}

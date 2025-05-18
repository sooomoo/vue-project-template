export type EventBusListener<TData = unknown> = (data: TData) => void;

export class EventBus<TEvent> {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    events: Map<keyof TEvent, Function[]>;

    constructor(name: string) {
        this.name = name;
        this.events = new Map();
    }

    on<K extends keyof TEvent>(event: K, listener: EventBusListener<TEvent[K]>) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event)?.push(listener);
    }

    emit<K extends keyof TEvent>(event: K, data: TEvent[K]) {
        if (this.events.has(event)) {
            this.events.get(event)?.forEach((listener) => listener(data));
        }
    }

    off<K extends keyof TEvent>(event: K, listener: EventBusListener<TEvent[K]>) {
        if (!this.events.has(event)) return;
        const listeners = this.events.get(event);
        if (!listeners) return;
        this.events.set(
            event,
            listeners.filter((l) => l !== listener),
        );
    }
}

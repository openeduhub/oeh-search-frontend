export interface Env {
    RELAY_URL?: string;
}

export interface ExtendedWindow extends Window {
    __env?: Env;
}

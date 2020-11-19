export interface Env {
    RELAY_URL?: string;
    SHOW_EXPERIMENTS?: boolean;
}

export interface ExtendedWindow extends Window {
    __env?: Env;
}

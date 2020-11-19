export interface Env {
    RELAY_URL?: string;
    WORDPRESS_URL?: string;
    SHOW_EXPERIMENTS?: boolean;
}

export interface ExtendedWindow extends Window {
    __env?: Env;
}

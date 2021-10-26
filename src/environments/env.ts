export interface Env {
    EDU_SHARING_API_URL?: string;
    RELAY_URL?: string;
    WORDPRESS_URL?: string;
    SHOW_EXPERIMENTS?: string;
    ANALYTICS_URL?: string;
}

export interface ExtendedWindow extends Window {
    __env?: Env;
}

export function readBoolean(value: string, defaultValue: boolean): boolean {
    if (typeof value === 'string') {
        return ['true', '1', 'yes', 'enable', 'enabled'].includes(value.toLowerCase());
    } else {
        return defaultValue;
    }
}

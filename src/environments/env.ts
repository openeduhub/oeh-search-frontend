export interface Env {
    EDU_SHARING_API_URL?: string;
    WORDPRESS_URL?: string;
    EDU_SHARING_USERNAME?: string;
    EDU_SHARING_PASSWORD?: string;
}

export interface ExtendedWindow extends Window {
    __env?: Env;
}

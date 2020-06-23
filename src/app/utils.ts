export type Unpacked<T> = T extends (infer U)[] ? U : T;

export function assertUnreachable(x: never): never {
    throw new Error('Didn\'t expect to get here');
}

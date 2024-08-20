import uuid from 'uuid';
import { Method } from './method';

export class Phase {
    id: string;
    name: string;
    method: Method;
    itemString: string;

    constructor(name: string, itemString?: string) {
        this.id = uuid.v4();
        this.name = name;
        this.method = new Method('');
        this.itemString = itemString;
    }
}

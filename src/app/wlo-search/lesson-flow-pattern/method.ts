import uuid from 'uuid';
import { Activity } from './activity';

export class Method {
    id: string;
    name: string;
    description?: string;
    activities?: Activity[];

    constructor(name: string) {
        this.id = uuid.v4();
        this.name = name;
        this.description = '';
        this.activities = [new Activity('')];
    }
}

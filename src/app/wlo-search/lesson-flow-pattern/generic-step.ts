import uuid from 'uuid';

export class GenericStep {
    id: string;
    name: string;

    constructor(name: string) {
        this.id = uuid.v4();
        this.name = name;
    }
}

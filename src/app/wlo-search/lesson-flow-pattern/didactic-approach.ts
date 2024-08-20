import uuid from 'uuid';
import { Phase } from './phase';

export class DidacticApproach {
    id: string;
    name: string;
    phases: Phase[];

    constructor(name: string, phases?: Phase[]) {
        this.id = uuid.v4();
        this.name = name;
        this.phases = phases ?? [];
    }
}

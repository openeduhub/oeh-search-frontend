import uuid from 'uuid';
import { Phase } from './phase';

export class ApproachStepMatching {
    id: string;
    approachId: string;
    stepId: string;
    phases: Phase[];

    constructor(approachId: string, stepId: string, phases?: Phase[]) {
        this.id = uuid.v4();
        this.approachId = approachId;
        this.stepId = stepId;
        this.phases = phases ?? [];
    }
}

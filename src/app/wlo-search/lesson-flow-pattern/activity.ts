import uuid from 'uuid';

export class Activity {
    id: string;
    name: string;
    description?: string;
    time: number;
    lecturerTask: string;
    learnerTask: string;
    socialForm: string;
    learningFormat: string;
    synchronization: string;
    learningEnvironment?: string;
    interactionPrerequisites?: string;
    guidingMedium?: string;

    constructor(
        name: string,
        time?: number,
        lecturerTask?: string,
        learnerTask?: string,
        socialForm?: string,
        learningFormat?: string,
        synchronization?: string,
    ) {
        this.id = uuid.v4();
        this.name = name;
        this.description = '';
        this.time = time ?? 1;
        this.lecturerTask = lecturerTask ?? '';
        this.learnerTask = learnerTask ?? '';
        this.socialForm = socialForm ?? '';
        this.learningFormat = learningFormat ?? '';
        this.synchronization = synchronization ?? '';
    }
}

import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Input,
    OnInit,
    signal,
    ViewEncapsulation,
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService, Node, NodeService } from 'ngx-edu-sharing-api';
import { AiTextPromptsService } from 'ngx-edu-sharing-z-api';
import { GenericStep } from './generic-step';
import { DidacticApproach } from './didactic-approach';
import { SharedModule } from '../shared/shared.module';
import { ApproachStepMatching } from './approach-step-matching';
import { Phase } from './phase';
import { SelectOption } from '../shared/select-option';
import { Activity } from './activity';
import { Method } from './method';
import { NgOptimizedImage } from '@angular/common';

@Component({
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.Emulated,
    imports: [
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        NgOptimizedImage,
    ],
    selector: 'app-lesson-flow-template',
    templateUrl: './lesson-flow-template.component.html',
    styleUrls: ['./lesson-flow-template.component.scss'],
})
export class LessonFlowTemplateComponent implements OnInit {
    @Input() collectionNode: Node;

    defaultName: string = 'Beispiel-Titel eines Templates';
    templateName: string = this.defaultName;
    initialized: boolean = false;
    steps: GenericStep[] = [];
    selectedApproachId: string;
    approaches: DidacticApproach[] = [];
    approachesStepMatchingMap: Map<string, ApproachStepMatching> = new Map<
        string,
        ApproachStepMatching
    >();
    readonly separator: string = ',';
    approachesOptions: SelectOption[] = [];
    activityItems: (keyof Activity)[] = [];
    showDebug: boolean = false;
    images: string[] = [];
    statusCodes: number[] = [
        100, 101, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 214, 226, 300, 301, 302, 303,
        304, 305, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
        414, 415, 416, 417, 418, 420, 421, 422, 423, 424, 425, 426, 428, 429, 431, 444, 450, 451,
        497, 498, 499, 500, 501, 502, 503, 504, 506, 507, 508, 509, 510, 511, 521, 522, 523, 525,
        530, 599,
    ];
    favoriteCat: string;

    constructor(
        private fb: FormBuilder,
        private aiTextPromptsService: AiTextPromptsService,
        private authService: AuthenticationService,
        private nodeApi: NodeService,
        private snackBar: MatSnackBar,
    ) {}

    get totalTime(): number {
        const selectedApproach: DidacticApproach = this.approaches.find(
            (approach: DidacticApproach) => approach.id === this.selectedApproachId,
        );
        let timeCount: number = 0;
        this.steps.forEach((step: GenericStep) => {
            this.approachesStepMatchingMap
                .get(selectedApproach.id + this.separator + step.id)
                ?.phases?.forEach((phase: Phase) => {
                    phase.method?.activities?.forEach((activity: Activity) => {
                        timeCount += activity.time;
                    });
                });
        });
        return timeCount;
    }

    ngOnInit() {
        // define the initial form values
        const firstStep: GenericStep = new GenericStep('Lernen vorbereiten');
        const secondStep: GenericStep = new GenericStep('Lernen durchführen');
        const thirdStep: GenericStep = new GenericStep('Lernen nachbereiten');
        this.steps.push(firstStep);
        this.steps.push(secondStep);
        this.steps.push(thirdStep);

        // define approaches + select options
        const instructionDesign: DidacticApproach = new DidacticApproach(
            'Instructionsdesign (9 Steps of Instruction nach Gagné)',
        );
        this.approaches.push(instructionDesign);
        this.approachesOptions.push({
            value: instructionDesign.id,
            viewValue: instructionDesign.name,
        });
        const problemBasedLearning: DidacticApproach = new DidacticApproach(
            'Problembasiertes Lernen (PBL)',
        );
        this.approaches.push(problemBasedLearning);
        this.approachesOptions.push({
            value: problemBasedLearning.id,
            viewValue: problemBasedLearning.name,
        });
        // TODO: remove, if not longer used
        this.selectedApproachId = this.approachesOptions[0].value;

        // define the steps of the approaches
        this.approachesStepMatchingMap.set(
            instructionDesign.id + this.separator + firstStep.id,
            new ApproachStepMatching(instructionDesign.id, firstStep.id, [
                new Phase('Aufmerksamkeit wecken', '1.)'),
                new Phase('Ziele erläutern', '2.)'),
                new Phase('Vorwissen aktivieren', '3.)'),
            ]),
        );
        this.approachesStepMatchingMap.set(
            instructionDesign.id + this.separator + secondStep.id,
            new ApproachStepMatching(instructionDesign.id, secondStep.id, [
                new Phase('Darstellung Lehrstoff', '4.)'),
                new Phase('Lernen begleiten', '5.)'),
                new Phase('Ausführen und Anwenden', '6.)'),
                new Phase('Informative Rückmeldungen geben', '7.)'),
            ]),
        );
        this.approachesStepMatchingMap.set(
            instructionDesign.id + this.separator + thirdStep.id,
            new ApproachStepMatching(instructionDesign.id, thirdStep.id, [
                new Phase('Leistung kontrollieren/beobachten', '8.)'),
                new Phase('Behalten/Transferieren', '9.)'),
            ]),
        );

        this.approachesStepMatchingMap.set(
            problemBasedLearning.id + this.separator + firstStep.id,
            new ApproachStepMatching(instructionDesign.id, firstStep.id, [
                new Phase('Fallbeschreibung und Vorwissenaktivierung', '1.)'),
                new Phase('Problemdefinition', '2.)'),
                new Phase('Generierung von Fragen und Hypothesen', '3.)'),
                new Phase('Systematisierung', '4.)'),
                new Phase('Beschreibung (Lern-)Ziele', '5.)'),
            ]),
        );
        this.approachesStepMatchingMap.set(
            problemBasedLearning.id + this.separator + secondStep.id,
            new ApproachStepMatching(instructionDesign.id, secondStep.id, [
                new Phase('Wissenserweiterung', '6.)'),
            ]),
        );
        this.approachesStepMatchingMap.set(
            problemBasedLearning.id + this.separator + thirdStep.id,
            new ApproachStepMatching(instructionDesign.id, thirdStep.id, [
                new Phase('Synthese und Anwendung', '7.a.)'),
                new Phase('(Präsentation?)', '7.b.)'),
                new Phase('(Gegenseitiges Präsentieren)', '7.c.)'),
                new Phase('Reflexion und Bewertung', '8.)'),
            ]),
        );

        console.log(JSON.stringify(this.approachesStepMatchingMap));

        this.activityItems.push('lecturerTask' as keyof Activity);
        this.activityItems.push('learnerTask' as keyof Activity);
        this.activityItems.push('socialForm' as keyof Activity);
        this.activityItems.push('learningFormat' as keyof Activity);
        this.activityItems.push('synchronization' as keyof Activity);

        for (let i = 0; i < 3; i++) {
            const statusCode =
                this.statusCodes[Math.floor(Math.random() * this.statusCodes.length)];
            this.statusCodes = this.statusCodes.filter((code: number) => code !== statusCode);
            this.images.push('https://http.cat/images/' + statusCode + '.jpg');
        }

        this.initialized = true;
    }

    loadTemplate() {
        this.selectedApproachId = this.approaches[0].id;
        this.templateName = 'Ressourcenschonende Wissensvermittlung';
        let methodCounter: number = 0;
        const methodNames = [
            'Begrüßung mit Moderation',
            '',
            'Argumentative Themenentfaltung',
            'Argumentative Themenentfaltung',
            '',
            '',
            'Q&A mit Lernenden',
            '',
            'Thementische',
            'One-Minute Paper',
        ];
        const activitiesToMethodIndex: Map<number, Activity[]> = new Map<number, Activity[]>();
        const activityOne: Activity = new Activity(
            'Eröffnung der Veranstaltung',
            5,
            'erläutert',
            '-',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityTwo: Activity = new Activity(
            'Vortragende stellt sich vor',
            3,
            'erläutert',
            '-',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityThree: Activity = new Activity(
            'Vortragende leitet mit Eyecatcher ein',
            3,
            'präsentiert',
            '-',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityFour: Activity = new Activity(
            'Agenda vorstellen',
            5,
            'präsentiert',
            '-',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityFive: Activity = new Activity(
            'Problemdarstellung',
            5,
            'präsentiert',
            'rezipieren',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activitySix: Activity = new Activity(
            'Theoretischer Hintergrund',
            20,
            'präsentiert',
            'rezipieren',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activitySeven: Activity = new Activity(
            'Beobachtbarer Sachverhalt',
            15,
            'präsentiert',
            'rezipieren',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityEight: Activity = new Activity(
            'Empfehlungen (Normativ)',
            5,
            'präsentiert',
            'rezipieren',
            'Plenum',
            'Präsenz',
            'synchron',
        );

        const activityNine: Activity = new Activity(
            'Aufgabenstellung und Zuweisung von Themen zu Tischen',
            3,
            'erläutert',
            '-',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityTen: Activity = new Activity(
            'Zuteilung der Lernenden zu den Tischen mit Abzählen 1 - n',
            3,
            'erläutert',
            'abzählen, zu Tischen gehen',
            'Plenum',
            'Präsenz',
            'synchron',
        );
        const activityEleven: Activity = new Activity(
            'Austausch zum Thema an den Tischen',
            10,
            'beobachten',
            'diskutieren mit Peers',
            'Kleingruppe',
            'Präsenz',
            'synchron',
        );
        const activityTwelve: Activity = new Activity(
            'Rückruf ins Plenum',
            3,
            '-',
            'diskutieren mit Peers',
            'Kleingruppe',
            'Präsenz',
            'synchron',
        );
        const activityThirdteen: Activity = new Activity(
            'Bitte um anonymes Feedback über QR-Code',
            5,
            '',
            '',
            'Kleingruppe',
            'Präsenz',
            'synchron',
        );
        const activityFourteen: Activity = new Activity(
            'Empfehlungen (Normativ)',
            5,
            '',
            '',
            'Kleingruppe',
            'Präsenz',
            'synchron',
        );

        activitiesToMethodIndex.set(0, [activityOne, activityTwo, activityThree]);
        activitiesToMethodIndex.set(1, [activityFour]);
        activitiesToMethodIndex.set(2, [activityFive]);
        activitiesToMethodIndex.set(3, [activitySix, activitySeven]);
        activitiesToMethodIndex.set(6, [activityEight]);
        activitiesToMethodIndex.set(8, [
            activityNine,
            activityTen,
            activityEleven,
            activityTwelve,
            activityThirdteen,
            activityFourteen,
        ]);

        this.steps.forEach((step: GenericStep) => {
            this.approachesStepMatchingMap
                .get(this.selectedApproachId + this.separator + step.id)
                ?.phases?.forEach((phase: Phase) => {
                    phase.method.name = methodNames[methodCounter];
                    phase.method.activities = activitiesToMethodIndex.get(methodCounter);
                    methodCounter += 1;
                });
        });
    }

    addActivity(activities: Activity[]) {
        activities.push(new Activity(''));
    }

    removeActivity(activities: Activity[], index: number) {
        activities.splice(index, 1);
    }

    exportJSON() {
        const output: any = {};
        output.name =
            this.templateName !== ''
                ? this.templateName
                : this.defaultName + ' ' + new Date().toLocaleString();
        output.totalTime = this.totalTime + ' min';
        if (this.favoriteCat !== '') {
            output.favoriteCat = this.favoriteCat;
        }
        const methods: Method[] = [];
        const selectedApproach: DidacticApproach = this.approaches.find(
            (approach: DidacticApproach) => approach.id === this.selectedApproachId,
        );
        this.steps.forEach((step: GenericStep) => {
            this.approachesStepMatchingMap
                .get(selectedApproach.id + this.separator + step.id)
                ?.phases?.forEach((phase: Phase) => {
                    methods.push(phase.method);
                });
        });
        output.methods = methods;

        const jsonOutput: string = JSON.stringify(output);
        const blob: Blob = new Blob([jsonOutput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = Date.now() + '_export.json';
        a.textContent = 'Download export.json';

        document.getElementsByTagName('body')[0].appendChild(a);
        a.click();
    }
}

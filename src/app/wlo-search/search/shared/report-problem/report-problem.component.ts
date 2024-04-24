import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DialogData, problemKinds } from './report-problem.service';

@Component({
    selector: 'app-report-problem',
    templateUrl: './report-problem.component.html',
    styleUrls: ['./report-problem.component.scss'],
})
export class ReportProblemComponent {
    readonly problemKinds = problemKinds;

    form = new UntypedFormGroup({
        problemKind: new UntypedFormControl('', Validators.required),
        message: new UntypedFormControl(''),
        email: new UntypedFormControl('', Validators.email),
    });

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    readonly dummyCompare = () => 0;
}

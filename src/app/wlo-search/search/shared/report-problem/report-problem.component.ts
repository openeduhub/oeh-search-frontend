import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, problemKinds } from './report-problem.service';

@Component({
    selector: 'app-report-problem',
    templateUrl: './report-problem.component.html',
    styleUrls: ['./report-problem.component.scss'],
    standalone: false,
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

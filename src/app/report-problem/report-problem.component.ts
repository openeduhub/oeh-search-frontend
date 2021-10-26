import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, problemKinds } from './report-problem.service';

@Component({
    selector: 'app-report-problem',
    templateUrl: './report-problem.component.html',
    styleUrls: ['./report-problem.component.scss'],
})
export class ReportProblemComponent {
    readonly problemKinds = problemKinds;

    form = new FormGroup({
        problemKind: new FormControl('', Validators.required),
        message: new FormControl(''),
        email: new FormControl('', Validators.email),
    });

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    readonly dummyCompare = () => 0;
}

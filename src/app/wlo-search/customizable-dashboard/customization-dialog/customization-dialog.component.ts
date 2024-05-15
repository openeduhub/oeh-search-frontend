import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, Inject } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { SharedModule } from '../../shared/shared.module';
import { TemplateComponent } from '../../template/template.component';
import { DialogData } from './dialog-data';
import { TileDimension } from './tile-dimension';

@Component({
    selector: 'app-customization-dialog',
    templateUrl: './customization-dialog.component.html',
    styleUrls: ['./customization-dialog.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        MatDialogModule,
        MatGridListModule,
        ReactiveFormsModule,
        SharedModule,
        TemplateComponent,
        TextFieldModule,
    ],
})
export class CustomizationDialogComponent {
    // note: for better understanding, the index of the position is increased by 1
    form = new UntypedFormGroup({
        position: new UntypedFormControl(this.data.currentIndex + 1, Validators.required),
        cols: new UntypedFormControl(this.data.currentCols, Validators.required),
        rows: new UntypedFormControl(this.data.currentRows, Validators.required),
    });

    tileDimensions: TileDimension[] = [
        new TileDimension(1, 1),
        new TileDimension(1, 2),
        new TileDimension(1, 3),
        new TileDimension(2, 1),
        new TileDimension(2, 2),
        new TileDimension(2, 3),
        new TileDimension(3, 1),
        new TileDimension(3, 2),
        new TileDimension(3, 3),
    ];

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    patchDimensions(numberOfRows: number, numberOfCols: number) {
        this.form.patchValue({
            rows: numberOfRows,
            cols: numberOfCols,
        });
    }
}

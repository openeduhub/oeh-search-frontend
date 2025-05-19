import { A11yModule } from '@angular/cdk/a11y';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DisplayNamePipe } from './display-name.pipe';
import { FocusStateDirective } from './focus-state.directive';
import { ReportClickDirective } from './report-click.directive';
import { SkipTargetDirective } from './skip-target.directive';

@NgModule({
    declarations: [DisplayNamePipe, SkipTargetDirective, ReportClickDirective, FocusStateDirective],
    imports: [
        RouterModule,
        CommonModule,
        A11yModule,
        CdkAccordionModule,
        DragDropModule,
        EduSharingUiCommonModule,
        LayoutModule,
        OverlayModule,
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,
        SlickCarouselModule,
        TranslateModule,
    ],
    exports: [
        RouterModule,
        CommonModule,
        A11yModule,
        CdkAccordionModule,
        DragDropModule,
        EduSharingUiCommonModule,
        LayoutModule,
        OverlayModule,
        FormsModule,
        ReactiveFormsModule,
        DisplayNamePipe,
        FocusStateDirective,
        MatChipsModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,
        SkipTargetDirective,
        SlickCarouselModule,
        ReportClickDirective,
        TranslateModule,
    ],
})
export class SharedModule {}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EduSharingUiCommonModule } from 'ngx-edu-sharing-ui';
import { SharedModule } from '../../shared/shared.module';
import { swimlaneTypeOptions } from '../custom-definitions';
import { SelectOption } from '../swimlane/swimlane-settings-dialog/select-option';

@Component({
    standalone: true,
    imports: [EduSharingUiCommonModule, SharedModule],
    selector: 'app-add-swimlane-border-button',
    templateUrl: './add-swimlane-border-button.component.html',
    styleUrls: ['./add-swimlane-border-button.component.scss'],
})
export class AddSwimlaneBorderButtonComponent {
    @Input() position: string = 'top';
    @Input() requestInProgress: boolean = false;
    @Output() addSwimlaneTriggered: EventEmitter<string> = new EventEmitter<string>();

    protected readonly swimlaneTypeOptions: SelectOption[] = swimlaneTypeOptions.concat([
        { value: 'spacer', viewValue: 'Trennlinie' },
    ]);

    addSwimlane(type: string): void {
        this.addSwimlaneTriggered.emit(type);
    }
}

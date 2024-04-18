import {Component} from '@angular/core';
import {SharedModule} from "../shared/shared.module";

@Component({
    standalone: true,
    imports: [SharedModule],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent {
}

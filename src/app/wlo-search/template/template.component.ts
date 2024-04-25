import {Component} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {
    UserConfigurableComponent
} from "wlo-pages-lib";

@Component({
    standalone: true,
    imports: [SharedModule, UserConfigurableComponent],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent {
}

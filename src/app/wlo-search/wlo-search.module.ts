import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';
import { SwimlaneComponent } from './template/swimlane/swimlane.component';
import { SwimlaneSettingsDialogComponent } from './template/swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';
import { TemplateComponent } from './template/template.component';
import { WloSearchRoutingModule } from './wlo-search-routing.module';
import { WloSearchComponent } from './wlo-search.component';

@NgModule({
    declarations: [WloSearchComponent],
    imports: [
        CoreModule,
        PreferencesModule,
        SearchModule,
        SharedModule,
        SwimlaneComponent,
        SwimlaneSettingsDialogComponent,
        TemplateComponent,
        WloSearchRoutingModule,
    ],
})
export class WloSearchModule {}

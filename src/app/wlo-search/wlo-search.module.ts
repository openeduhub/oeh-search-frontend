import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';
import { WloSearchRoutingModule } from './wlo-search-routing.module';
import { WloSearchComponent } from './wlo-search.component';
import { TemplateComponent } from './template/template.component';
import { SwimlaneSettingsDialogComponent } from './template/swimlane/swimlane-settings-dialog/swimlane-settings-dialog.component';
import { SwimlaneComponent } from './template/swimlane/swimlane.component';

@NgModule({
    declarations: [WloSearchComponent],
    imports: [
        WloSearchRoutingModule,
        CoreModule,
        SharedModule,
        SearchModule,
        PreferencesModule,
        TemplateComponent,
        SwimlaneComponent,
        SwimlaneSettingsDialogComponent,
    ],
})
export class WloSearchModule {}

import { NgModule } from '@angular/core';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { CoreModule } from './core/core.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';
import { WloSearchRoutingModule } from './wlo-search-routing.module';
import { WloSearchComponent } from './wlo-search.component';
import { TemplateComponent } from "./template/template.component";

@NgModule({
    declarations: [WloSearchComponent],
    imports: [WloSearchRoutingModule, CoreModule, SharedModule, SearchModule, PreferencesModule, TemplateComponent],
})
export class WloSearchModule {}

import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoreModule } from './core/core.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';
import { WloSearchRoutingModule } from './wlo-search-routing.module';
import { WloSearchComponent } from './wlo-search.component';

@NgModule({
    declarations: [WloSearchComponent],
    imports: [WloSearchRoutingModule, CoreModule, SharedModule, SearchModule, PreferencesModule],
})
export class WloSearchModule {}

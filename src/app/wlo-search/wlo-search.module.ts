import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';
import { WloSearchRoutingModule } from './wlo-search-routing.module';
import { WloSearchComponent } from './wlo-search.component';
import { TemplateComponent } from './template/template.component';
import { ColumnSettingsDialogComponent } from './template/column-settings-dialog/column-settings-dialog.component';
import { ColumnGridComponent } from './template/column-grid/column-grid.component';
import { FilterBarComponent } from './template/filter-bar/filter-bar.component';

@NgModule({
    declarations: [WloSearchComponent],
    imports: [
        WloSearchRoutingModule,
        CoreModule,
        SharedModule,
        SearchModule,
        PreferencesModule,
        TemplateComponent,
        ColumnGridComponent,
        ColumnSettingsDialogComponent,
        FilterBarComponent,
    ],
})
export class WloSearchModule {}

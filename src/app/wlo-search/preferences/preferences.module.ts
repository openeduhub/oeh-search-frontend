import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ExperimentsTogglesComponent } from './experiments-toggles/experiments-toggles.component';

@NgModule({
    declarations: [ExperimentsTogglesComponent],
    imports: [SharedModule],
})
export class PreferencesModule {}

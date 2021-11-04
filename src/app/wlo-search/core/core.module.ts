import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ErrorPageComponent } from './error-page/error-page.component';
import { FooterbarComponent } from './footerbar/footerbar.component';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { MenubarComponent } from './menubar/menubar.component';
import { OerSliderComponent } from './oer-slider/oer-slider.component';
import { SearchFieldComponent } from './search-field/search-field.component';

@NgModule({
    declarations: [
        ErrorPageComponent,
        FooterbarComponent,
        HeaderbarComponent,
        MenubarComponent,
        OerSliderComponent,
        SearchFieldComponent,
    ],
    imports: [SharedModule],
    exports: [ErrorPageComponent, FooterbarComponent, HeaderbarComponent, MenubarComponent],
})
export class CoreModule {}

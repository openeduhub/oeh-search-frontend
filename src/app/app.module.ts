import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { TruncatePipe } from './truncate.pipe';
import { GenerateFiltersPipe } from './generate-filters.pipe';
import { DetailsComponent } from './details/details.component';

const appRoutes: Routes = [
    { path: 'search', component: SearchComponent },
    { path: 'details/:id', component: DetailsComponent },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
];

@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        TruncatePipe,
        GenerateFiltersPipe,
        DetailsComponent,
    ],
    imports: [
        AppRoutingModule,
        RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled' }),
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatPaginatorModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatSelectModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}

import { Component, computed, Input, OnInit, Signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import {
    AiTextWidgetComponent,
    CollectionChipsComponent,
    UserConfigurableComponent,
} from 'wlo-pages-lib';
import { GridTile } from '../grid-tile';
import { SharedModule } from '../../shared/shared.module';

@Component({
    imports: [
        AiTextWidgetComponent,
        CollectionChipsComponent,
        MatGridListModule,
        UserConfigurableComponent,
        SharedModule,
    ],
    selector: 'app-column-grid',
    templateUrl: './column-grid.component.html',
    styleUrls: ['./column-grid.component.scss'],
    standalone: true,
})
export class ColumnGridComponent implements OnInit {
    // https://stackoverflow.com/a/56006046/3623608
    private _backgroundColor = '#f4f4f4';
    @Input() get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value ?? '#f4f4f4';
    }
    @Input() editMode: boolean;
    @Input() generatedJobText: string;
    @Input() grid: GridTile[];
    @Input() gridType: string = 'smallGutter';
    @Input() jobsWidgetReady: boolean;
    @Input() topic: string;
    @Input() topicCollectionID: string;
    newestContentConfig: Signal<string>;
    jobsContentConfig: Signal<string>;

    selectDimensions = new Map();

    ngOnInit() {
        this.newestContentConfig = computed(() =>
            JSON.stringify({
                headline: 'Neueste Inhalte zum Thema ' + this.topic,
                layout: 'carousel',
                description: '',
                searchMode: 'collection',
                chosenColor: this.backgroundColor,
                collectionId: this.topicCollectionID,
            }),
        );
        this.jobsContentConfig = computed(() => {
            return JSON.stringify({
                headline: 'Das sind Berufe zum Thema ' + this.topic,
                layout: 'carousel',
                description: this.generatedJobText,
                searchMode: 'ngsearchword',
                chosenColor: this.backgroundColor,
                searchText: 'Berufe mit ' + this.topic,
            });
        });

        // TODO: This is currently just mockup data
        this.selectDimensions.set('$ZIELGRUPPE$', ['Lehrender', 'Lernender', 'Andere']);
        this.selectDimensions.set('$MUTTERSPRACHE$', [
            'Deutsch',
            'Englisch',
            'Französisch',
            'Spanisch',
        ]);
        this.selectDimensions.set('$HERKUNFTSLAND$', ['Deutschland', 'Österreich', 'Sonstige']);
        this.selectDimensions.set('$LEBENSALTER$', [
            '<= 20',
            '21 - 30',
            '31 - 40',
            '41 - 50',
            '> 50',
        ]);
        this.selectDimensions.set('$INTERESSENGEBIET$', [
            'Land-, Forst- und Tierwirtschaft und Gartenbau',
            'Rohstoffgewinnung, Produktion und Fertigung',
            'Bau, Architektur, Vermessung und Gebäudetechnik',
            'Naturwissenschaft, Geografie und Informatik',
            'Verkehr, Logistik, Schutz und Sicherheit',
            'Sonstige Berufsgruppen',
        ]);
    }
}

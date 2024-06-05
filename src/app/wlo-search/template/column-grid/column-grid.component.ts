import { Component, computed, Input, OnInit, Signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CollectionChipsComponent, UserConfigurableComponent } from 'wlo-pages-lib';
import { GridTile } from '../grid-tile';
import { SharedModule } from '../../shared/shared.module';

@Component({
    imports: [CollectionChipsComponent, MatGridListModule, UserConfigurableComponent, SharedModule],
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
    @Input() generatedJobText: string;
    @Input() grid: GridTile[];
    @Input() gridType: string = 'smallGutter';
    @Input() jobsWidgetReady: boolean;
    @Input() topic: string;
    @Input() topicCollectionID: string;
    newestContentConfig: Signal<string>;
    jobsContentConfig: Signal<string>;

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
    }
}

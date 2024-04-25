import {Component, computed, HostBinding, OnInit, signal, WritableSignal} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {
    CollectionChipsComponent,
    UserConfigurableComponent
} from "wlo-pages-lib";
import {ActivatedRoute} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
    standalone: true,
    imports: [SharedModule, UserConfigurableComponent, CollectionChipsComponent],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    constructor(private route: ActivatedRoute) {}
    @HostBinding('style.--topic-color') topicColor: string = '#182e5c';

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal('66c667bc-8777-4c57-b476-35f54ce9ff5d'); // Religion
    newestContentConfig = computed(() => JSON.stringify({
        headline: 'Neueste Inhalte zum Thema '+this.topic(),
        description: '',
        searchMode: 'collection',
        collectionID: this.topicCollectionID()
    }));
    jobsContentConfig = computed(() => JSON.stringify({
        headline: 'Das sind Berufe zum Thema '+this.topic(),
        description: 'Hier findest du eine Sammlung verschiedener spannender Berufe im Zusammenhang mit '+this.topic(),
        searchMode: 'ngsearchword',
        chosenColor: '#ffeec6',
        searchText: 'Berufe mit '+this.topic()
    }));

    ngOnInit(): void {
        // set the topic based on the query params "topic" and "collectionID"
        this.route.queryParams.pipe(
            filter(params => params.topic || params.collectionID)
        ).subscribe(params => {
            if (params.topic) {
                this.topic.set(params.topic);
                // set the background to some random (but deterministic) color, just for visuals
                this.topicColor = this.stringToColour(this.topic())
            }
            if (params.collectionID) {
                this.topicCollectionID.set(params.collectionID);
            }
        });
    }

    // https://stackoverflow.com/a/16348977
    stringToColour(str: string) {
        let hash = 0;
        str.split('').forEach(char => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let colour = '#'
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff
            colour += value.toString(16).padStart(2, '0')
        }
        return colour
    }
}

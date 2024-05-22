import {
    Component,
    computed,
    HostBinding,
    OnInit,
    signal,
    WritableSignal
} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {
    CollectionChipsComponent,
    UserConfigurableComponent
} from "wlo-pages-lib";
import {ActivatedRoute} from "@angular/router";
import { filter } from "rxjs/operators";
import {
    Node, NodeService
} from "ngx-edu-sharing-api";
import {AiTextPromptsService, ZApiModule} from "ngx-z-api";

@Component({
    standalone: true,
    imports: [
        SharedModule,
        UserConfigurableComponent,
        CollectionChipsComponent
    ],
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private aiTextPromptsService: AiTextPromptsService,
        private nodeApi: NodeService
    ) {}
    @HostBinding('style.--topic-color') topicColor: string = '#182e5c';

    topic: WritableSignal<string> = signal('$THEMA$');
    topicCollectionID: WritableSignal<string> = signal(null);
    generatedHeader: WritableSignal<string> = signal('');
    generatedJobText: WritableSignal<string> = signal('');
    // TODO: this is basically a workaround for widget components not updating when getting new
    //  config overrides for now; remove once they're able to do that
    jobsWidgetReady = true;

    newestContentConfig = computed(() => JSON.stringify({
        headline: 'Neueste Inhalte zum Thema '+this.topic(),
        layout: 'carousel',
        description: '',
        searchMode: 'collection',
        collectionId: this.topicCollectionID()
    }));
    jobsContentConfig = computed(() => {
        return JSON.stringify({
            headline: 'Das sind Berufe zum Thema '+this.topic(),
            layout: 'carousel',
            description: this.generatedJobText(),
            searchMode: 'ngsearchword',
            chosenColor: '#ffeec6',
            searchText: 'Berufe mit '+this.topic()
        })
    });

    ngOnInit(): void {
        // set the topic based on the query params "topic" and "collectionID"
        this.route.queryParams.pipe(
            filter(params => params.topic || params.collectionId)
        ).subscribe(params => {
            if (params.topic) {
                this.topic.set(params.topic);
                // set the background to some random (but deterministic) color, just for visuals
                this.topicColor = this.stringToColour(this.topic())
            }
            if (params.collectionId) {
                this.topicCollectionID.set(params.collectionId);
                // fetch the collection name
                this.nodeApi.getNode(params.collectionId).subscribe(
                    (node: Node) => {
                        this.topic.set(node.title);
                        // set the background to some random (but deterministic) color, just for visuals
                        this.topicColor = this.stringToColour(this.topic())
                    }
                );
            }

            this.generateFromPrompt()
        });
    }

    /** calls the Z-API to invoke ChatGPT */
    private generateFromPrompt() {
        this.aiTextPromptsService.publicPrompt({
            widgetNodeId: "c937cabf-5ffd-47f0-a5e8-ef0ed370baf0",
            contextNodeId: this.topicCollectionID(),
        }).subscribe((result: any) => {
            const response = result.responses[0];
            console.log("RESPONSE: ", response);
            this.generatedHeader.set(response);
        })
        this.aiTextPromptsService.publicPrompt({
            widgetNodeId: "a625a9d6-383d-4835-84f2-a8e2792ea13f",
            contextNodeId: this.topicCollectionID(),
        }).subscribe((result: any) => {
            const response = result.responses[0];
            console.log("RESPONSE 2: ", response);
            this.generatedJobText.set(response)
            // FIXME: the following is just a trick to re-instantiate the widgets for them to
            //  change to new override-configs
            this.jobsWidgetReady = false;
            setTimeout(() => {this.jobsWidgetReady = true; console.log("READY!")}, 2); // DEBUG
        })
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

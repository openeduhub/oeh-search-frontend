import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Node } from 'ngx-edu-sharing-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { CoreService } from 'src/app/wlo-search/core/core.service';
import { EduSharingService } from 'src/app/wlo-search/core/edu-sharing.service';

const REPOSITORY = 'local';

@Component({
    selector: 'app-details-embedded',
    templateUrl: './details-embedded.component.html',
    styleUrls: ['./details-embedded.component.scss'],
    standalone: false,
})
export class DetailsEmbeddedComponent implements OnInit {
    @Input()
    set nodeId(value: string) {
        this._nodeIdSubject.next(value);
    }
    get nodeId() {
        return this._nodeIdSubject.value as string;
    }
    private readonly _nodeIdSubject = new BehaviorSubject<string | null>(null);

    @Output() closed = new EventEmitter<void>();

    readonly _node: Observable<Node> = this._nodeIdSubject.pipe(
        filter((nodeId): nodeId is string => typeof nodeId === 'string'),
        switchMap((nodeId) => this._eduSharingService.getNode(nodeId)),
        shareReplay(1),
    );

    constructor(private _eduSharingService: EduSharingService, coreService: CoreService) {
        coreService.setUp();
    }

    ngOnInit(): void {}

    _onClosed(): void {
        this.closed.emit();
    }
}

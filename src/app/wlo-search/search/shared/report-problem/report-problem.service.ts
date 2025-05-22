import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Node } from 'ngx-edu-sharing-api';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { reportProblemItemKey } from '../../../template/shared/custom-definitions';
import { WrappedResponse, wrapResponse } from '../wrap-observable.pipe';
import { ReportProblemComponent } from './report-problem.component';

export interface DialogData {
    element: Node;
}

export const problemKinds = {
    UNAVAILABLE: 'UNAVAILABLE',
    INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
    INVALID_METADATA: 'INVALID_METADATA',
    OTHER: 'OTHER',
};

export interface ResultData {
    problemKind: keyof typeof problemKinds;
    message?: string;
    email: string;
}

const eduSharingRepository = 'local';

@Injectable({
    providedIn: 'root',
})
export class ReportProblemService {
    constructor(
        private dialog: MatDialog,
        private httpClient: HttpClient,
        private translate: TranslateService,
    ) {}

    openDialog(element: Node): Observable<WrappedResponse<void> | null> {
        // open dialog
        const dialogRef = this.dialog.open(ReportProblemComponent, {
            width: '600px',
            maxHeight: '100vh',
            panelClass: 'report-problem-panel',
            data: {
                element,
            },
        });
        // reset localStorage item
        localStorage.setItem(reportProblemItemKey, null);
        // return Observable of WrappedResponse
        return dialogRef.afterClosed().pipe(
            switchMap((result) => {
                if (result) {
                    return this.sendReport(element, result).pipe(wrapResponse());
                } else {
                    return of(null);
                }
            }),
        );
    }

    private sendReport(element: Node, data: ResultData): Observable<void> {
        // set localStorage item
        localStorage.setItem(reportProblemItemKey, JSON.stringify({ element, data }));
        // return report response
        return this.apiSendReport(eduSharingRepository, element.ref.id, {
            reason:
                this.translate.instant(
                    'TOPIC_PAGE.PREVIEW_PANEL.REPORT_PROBLEM.' + problemKinds[data.problemKind],
                ) +
                ' (' +
                data.problemKind +
                ')',
            userComment: data.message,
            userEmail: data.email,
        });
    }

    private apiSendReport(
        repository: string,
        id: string,
        params: { reason: string; userEmail: string; userComment: string },
    ): Observable<void> {
        // TODO: Replace by possible existing service?
        const url =
            environment.eduSharingApiUrl + '/node/v1/nodes/' + repository + '/' + id + '/report';
        return this.httpClient.post<void>(url, null, { params });
    }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchHitFragment } from '../../generated/graphql';
import { WrappedResponse, wrapResponse } from '../wrap-observable.pipe';
import { ReportProblemComponent } from './report-problem.component';

export interface DialogData {
    element: SearchHitFragment;
}

export const problemKinds = {
    UNAVAILABLE: $localize`Object not available`,
    INAPPROPRIATE_CONTENT: $localize`Problematic content`,
    INVALID_METADATA: $localize`Incorrect description`,
    OTHER: $localize`Something else`,
};

interface ResultData {
    problemKind: keyof typeof problemKinds;
    message?: string;
    email: string;
}

const eduSharingRepository = 'local';

@Injectable({
    providedIn: 'root',
})
export class ReportProblemService {
    constructor(private dialog: MatDialog, private httpClient: HttpClient) {}

    openDialog(element: SearchHitFragment): Observable<WrappedResponse<void> | null> {
        const dialogRef = this.dialog.open(ReportProblemComponent, {
            width: '600px',
            maxHeight: '100vh',
            panelClass: 'report-problem-panel',
            data: {
                element,
            },
        });
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

    private sendReport(element: SearchHitFragment, data: ResultData): Observable<void> {
        return this.apiSendReport(eduSharingRepository, element.id, {
            reason: `${problemKinds[data.problemKind]} (${data.problemKind})`,
            userComment: data.message,
            userEmail: data.email,
        });
    }

    private apiSendReport(
        repository: string,
        id: string,
        params: { reason: string; userEmail: string; userComment: string },
    ): Observable<void> {
        const url =
            environment.eduSharingApiUrl + '/node/v1/nodes/' + repository + '/' + id + '/report';
        return this.httpClient.post<void>(url, null, { params });
    }
}

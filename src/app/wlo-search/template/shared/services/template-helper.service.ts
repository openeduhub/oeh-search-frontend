import { Injectable } from '@angular/core';
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
    TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { Node, NodeEntries, NodeService } from 'ngx-edu-sharing-api';
import { firstValueFrom } from 'rxjs';
import { widgetConfigAspect } from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class TemplateHelperService {
    private readonly SAVE_CONFIG_ACTION: string = 'Schließen';
    private readonly SAVE_CONFIG_MESSAGE: string = 'Ihre Änderungen werden gespeichert.';
    private readonly SAVE_CONFIG_ERROR_ACTION: string = 'Seite neuladen';
    private readonly SAVE_CONFIG_ERROR_MESSAGE: string =
        'Beim Laden einer Ressource ist ein Fehler aufgetreten. Bitte laden Sie die Seite neu.';

    constructor(private nodeApi: NodeService, private snackbar: MatSnackBar) {}

    /**
     * Helper function to handle an error by opening a toast container for the error.
     */
    commonCatchFunction(): void {
        // display toast that an error occurred
        // this has to be done manually to also take the processing time into account
        const config: MatSnackBarConfig = {
            duration: 200000,
            panelClass: 'error-snackbar',
        };
        const errorToastContainer: MatSnackBarRef<TextOnlySnackBar> = this.snackbar?.open(
            this.SAVE_CONFIG_ERROR_MESSAGE,
            this.SAVE_CONFIG_ERROR_ACTION,
            config,
        );
        errorToastContainer.onAction().subscribe((): void => {
            window.location.reload();
        });
    }

    /**
     * Helper function to open a toast for indicating that the config is being saved.
     */
    openSaveConfigToast(message?: string): MatSnackBarRef<TextOnlySnackBar> {
        const toastMessage: string = message ? message : this.SAVE_CONFIG_MESSAGE;
        return this.snackbar?.open(toastMessage, this.SAVE_CONFIG_ACTION);
    }

    /**
     * Helper function to create a child for an existing node.
     */
    async createChild(
        parentId: string,
        type: string,
        name: string,
        aspect?: string,
    ): Promise<Node> {
        const aspects: string[] = aspect ? [aspect] : [widgetConfigAspect];
        return await firstValueFrom(
            this.nodeApi.createChild({
                repository: '-home-',
                node: parentId,
                type,
                aspects,
                body: {
                    'cm:name': [name],
                },
            }),
        );
    }

    /**
     * Helper function to set a property to an existing node.
     */
    async setProperty(nodeId: string, propertyName: string, value: string): Promise<Node> {
        return firstValueFrom(this.nodeApi.setProperty('-home-', nodeId, propertyName, [value]));
    }

    /**
     * Another helper function due to setProperty not returning a node currently.
     */
    async setPropertyAndRetrieveUpdatedNode(
        nodeId: string,
        propertyName: string,
        value: string,
    ): Promise<Node> {
        await this.setProperty(nodeId, propertyName, value);
        return firstValueFrom(this.nodeApi.getNode(nodeId));
    }

    /**
     * Helper function to retrieve the children of a given node.
     */
    async getNodeChildren(nodeId: string): Promise<NodeEntries> {
        // TODO: Pagination vs. large maxItems number
        return firstValueFrom(this.nodeApi.getChildren(nodeId, { maxItems: 500 }));
    }
}

import { Injectable } from '@angular/core';
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarRef,
    TextOnlySnackBar,
} from '@angular/material/snack-bar';
import {
    ApiRequestConfiguration,
    AuthenticationService,
    Node,
    NodeEntries,
    NodeService,
} from 'ngx-edu-sharing-api';
import { ParentEntries } from 'ngx-edu-sharing-api/lib/api/models/parent-entries';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ViewService } from '../../../core/view.service';
import { initialLocaleString, widgetConfigAspect } from '../custom-definitions';

@Injectable({
    providedIn: 'root',
})
export class TemplateHelperService {
    private readonly SAVE_CONFIG_ACTION: string = 'Schließen';
    private readonly SAVE_CONFIG_MESSAGE: string = 'Ihre Änderungen werden gespeichert.';
    private readonly SAVE_CONFIG_ERROR_ACTION: string = 'Seite neuladen';
    private readonly SAVE_CONFIG_ERROR_MESSAGE: string =
        'Beim Laden einer Ressource ist ein Fehler aufgetreten. Bitte laden Sie die Seite neu.';

    constructor(
        private apiRequestConfig: ApiRequestConfiguration,
        private authService: AuthenticationService,
        private nodeApi: NodeService,
        private snackbar: MatSnackBar,
        private viewService: ViewService,
    ) {}

    /**
     * Helper function to handle login for local development.
     */
    async localLogin(): Promise<void> {
        const username = environment?.eduSharingUsername;
        const password = environment?.eduSharingPassword;
        // TODO: This fix for local development currently only works in Firefox
        if (username && password) {
            await firstValueFrom(this.authService.login(username, password));
        }
    }

    /**
     * Helper function to set the locale for API requests.
     */
    setDefaultLocale(): void {
        this.apiRequestConfig.setLocale(initialLocaleString);
    }

    /**
     * Helper function to retrieve a node with a given ID.
     */
    async getNode(nodeId: string): Promise<Node> {
        return firstValueFrom(this.nodeApi.getNode(nodeId));
    }

    /**
     * Helper function to retrieve the parents of a given node ID.
     */
    async getNodeParents(nodeId: string): Promise<ParentEntries> {
        return firstValueFrom(
            this.nodeApi.getParents(nodeId, {
                propertyFilter: ['-all-'],
                fullPath: false,
            }),
        );
    }

    /**
     * Helper function to retrieve the children of a given node ID.
     */
    async getNodeChildren(nodeId: string): Promise<NodeEntries> {
        // TODO: Pagination vs. large maxItems number
        return firstValueFrom(this.nodeApi.getChildren(nodeId, { maxItems: 500 }));
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
        return this.getNode(nodeId);
    }

    /**
     * Helper function to delete a node with a given ID.
     */
    async deleteNode(nodeId: string): Promise<void> {
        return firstValueFrom(this.nodeApi.deleteNode(nodeId));
    }

    /**
     * Helper function to handle the unselection of the current node and the selection of the clicked node.
     *
     * @param node
     */
    handleNodeChange(node: Node): void {
        // TODO: there might be better ways to work with the Observable, however, using
        //       subscribe resulted in circulation
        firstValueFrom(this.viewService.getSelectedItem()).then((currentNode: Node): void => {
            let selectedNode: Node;
            // no node was selected yet
            if (!currentNode) {
                this.viewService.selectItem(node);
                selectedNode = node;
            }
            // another node was selected
            else if (currentNode !== node) {
                this.viewService.unselectItem();
                this.viewService.selectItem(node);
                selectedNode = node;
            }
            // the same node was selected again
            else {
                this.viewService.unselectItem();
                selectedNode = null;
            }
            // send CustomEvent back as acknowledgement
            const customEvent = new CustomEvent('selectedNodeUpdated', {
                detail: {
                    selectedNode,
                },
            });
            // dispatch the event
            document.getElementsByTagName('body')[0].dispatchEvent(customEvent);
        });
    }

    /**
     * Helper function to handle an error by opening a toast container for the error.
     */
    displayErrorToast(): void {
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
}

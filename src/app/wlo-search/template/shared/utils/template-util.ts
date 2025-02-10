import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { Node } from 'ngx-edu-sharing-api';
import {
    pageConfigPropagateType,
    pageConfigRefType,
    pageConfigType,
    pageVariantConfigType,
    workspaceSpacesStorePrefix,
} from '../custom-definitions';
import { GridTile } from '../types/grid-tile';
import { PageConfig } from '../types/page-config';
import { PageVariantConfig } from '../types/page-variant-config';
import { Swimlane } from '../types/swimlane';

/**
 * Helper function to retrieve the search URL.
 */
export const retrieveSearchUrl = (): string => {
    // take into account potential sub-paths, e.g., due to language switch
    const pathNameArray: string[] = window.location.pathname.split('/');
    // example pathNameArray = [ "", "de", "template" ]
    const suffix: string =
        pathNameArray.length > 2 && pathNameArray[1] !== '' ? '/' + pathNameArray[1] : '';
    return window.location.origin + suffix + '/search';
};

/**
 * Retrieves a background color for a given topic name (just for visuals).
 *
 * @param topicName
 */
export const getTopicColor = (topicName: string): string => {
    let topicColor: string = stringToColour(topicName);

    // TODO: later, this will be stored as variable that can be changed by the user
    // check, if dark mode is preferred (https://stackoverflow.com/a/57795495)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // check, if the color is too light
        // https://stackoverflow.com/a/12043228
        const c: string = topicColor.substring(1); // strip #
        const rgb: number = parseInt(c, 16); // convert rrggbb to decimal
        const r: number = (rgb >> 16) & 0xff; // extract red
        const g: number = (rgb >> 8) & 0xff; // extract green
        const b: number = (rgb >> 0) & 0xff; // extract blue

        const luma: number = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
        if (luma > 100) {
            // darken the color
            topicColor = shadeColor(topicColor, -60);
        }
    }
    return topicColor;
};

/**
 * Creates a hexadecimal color based on a string.
 * Reference: https://stackoverflow.com/a/16348977
 *
 * @param str
 */
const stringToColour = (str: string): string => {
    let hash = 0;
    str.split('').forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += value.toString(16).padStart(2, '0');
    }
    return colour;
};

/**
 * Shades a given color code by a given percentage number.
 * Reference: https://stackoverflow.com/a/13532993
 *
 * @param color
 * @param percent
 */
const shadeColor = (color: string, percent: number): string => {
    let r: number = parseInt(color.substring(1, 3), 16);
    let g: number = parseInt(color.substring(3, 5), 16);
    let b: number = parseInt(color.substring(5, 7), 16);

    r = Math.round((r * (100 + percent)) / 100);
    g = Math.round((g * (100 + percent)) / 100);
    b = Math.round((b * (100 + percent)) / 100);

    r = r < 255 ? r : 255;
    g = g < 255 ? g : 255;
    b = b < 255 ? b : 255;

    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    const RR: string = r.toString(16).length == 1 ? '0' + r.toString(16) : r.toString(16);
    const GG: string = g.toString(16).length == 1 ? '0' + g.toString(16) : g.toString(16);
    const BB: string = b.toString(16).length == 1 ? '0' + b.toString(16) : b.toString(16);

    return '#' + RR + GG + BB;
};

/**
 * Prepends the workspace spaces store prefix to a given node ID.
 *
 * @param nodeId
 */
export const prependWorkspacePrefix = (nodeId: string): string => {
    if (!nodeId.includes(workspaceSpacesStorePrefix)) {
        return workspaceSpacesStorePrefix + nodeId;
    }
    return nodeId;
};

/**
 * Converts a given node ref including the workspace prefix into its node ID.
 * Example: workspace://SpacesStore/UUID -> UUID
 *
 * @param nodeRef
 */
export const convertNodeRefIntoNodeId = (nodeRef: string): string => {
    if (nodeRef?.includes(workspaceSpacesStorePrefix)) {
        return nodeRef.split('/')?.[nodeRef.split('/').length - 1];
    }
    return nodeRef;
};

/**
 * Retrieves the page config ref from a given (collection) node.
 *
 * @param node
 */
export const retrievePageConfigRef = (node: Node): string => {
    return node.properties?.[pageConfigRefType]?.[0];
};

/**
 * Retrieves the page config from a given page config node.
 *
 * @param node
 */
export const retrievePageConfig = (node: Node): PageConfig => {
    if (node.properties?.[pageConfigType]?.[0]) {
        return JSON.parse(node.properties[pageConfigType][0]);
    }
    return {};
};

/**
 * Checks, whether a given (collection) node propagates its config to the children.
 *
 * @param node
 */
export const checkPageConfigPropagate = (node: Node): boolean => {
    return node.properties?.[pageConfigPropagateType]?.[0] === 'true';
};

/**
 * Retrieves the variant config from a given variant node.
 *
 * @param variantNode
 */
export const retrievePageVariantConfig = (variantNode: Node): PageVariantConfig => {
    if (variantNode.properties[pageVariantConfigType]?.[0]) {
        return JSON.parse(variantNode.properties[pageVariantConfigType][0]);
    }
    return null;
};

/**
 * Helper function to remove possible existing headerNodeId + nodeIds from page variant config.
 */
export const removeNodeIdsFromPageVariantConfig = (pageVariant: PageVariantConfig): void => {
    pageVariant.structure.swimlanes?.forEach((swimlane: Swimlane): void => {
        swimlane.grid?.forEach((gridItem: GridTile): void => {
            if (gridItem.nodeId) {
                delete gridItem.nodeId;
            }
        });
    });
    if (pageVariant.structure.headerNodeId) {
        delete pageVariant.structure.headerNodeId;
    }
};

/**
 * Helper function to update the nodeId of given indexes or of the header within the structure of a page variant config.
 */
export const updatePageVariantConfig = (
    pageVariant: PageVariantConfig,
    swimlaneIndex?: number,
    gridIndex?: number,
    widgetNodeId?: string,
    isHeaderNode?: boolean,
): void => {
    // modify header nodeId
    if (isHeaderNode) {
        pageVariant.structure.headerNodeId = widgetNodeId;
    }
    // modify nodeId of swimlane grid tile
    else if (pageVariant.structure?.swimlanes?.[swimlaneIndex]?.grid?.[gridIndex] && widgetNodeId) {
        pageVariant.structure.swimlanes[swimlaneIndex].grid[gridIndex].nodeId = widgetNodeId;
    }
};

/**
 * Helper function to close a given toast container with a delay.
 *
 * @param toastContainer
 */
export const closeToastWithDelay = (toastContainer: MatSnackBarRef<TextOnlySnackBar>): void => {
    setTimeout((): void => {
        toastContainer.dismiss();
    }, 1000);
};

import { GridTile } from './grid-tile';

export interface Swimlane {
    type?: string;
    heading?: string;
    description?: string;
    grid?: GridTile[];
    backgroundColor?: string;
}

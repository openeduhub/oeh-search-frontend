import { GridTile } from './grid-tile';

export interface Swimlane {
    id?: string;
    type?: string;
    heading?: string;
    grid?: GridTile[];
    backgroundColor?: string;
}

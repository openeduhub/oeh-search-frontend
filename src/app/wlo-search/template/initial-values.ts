import { Swimlane } from './swimlane/swimlane';
import { v4 as uuidv4 } from 'uuid';

export const swimlanes: Swimlane[] = [
    {
        uuid: uuidv4(),
        type: 'collapse',
        heading: 'Durchstöbere hier unsere Lehrplanthemen',
        description: 'Example text?',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-collection-chips',
                cols: 3,
                rows: 1,
            },
        ],
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-ai-text-widget',
                cols: 3,
                rows: 1,
            },
        ],
        backgroundColor: '#BEDADE',
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-user-configurable',
                classNames: 'newest-widget',
                cols: 3,
                rows: 1,
                config: {
                    headline: 'Neueste Inhalte zum Thema',
                    layout: 'carousel',
                    searchMode: 'collection',
                },
            },
        ],
        backgroundColor: '#E3ECF6',
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-user-configurable',
                classNames: 'jobs-widget',
                cols: 3,
                rows: 1,
                config: {
                    headline: 'Das sind Berufe zum Thema',
                    layout: 'carousel',
                    searchMode: 'ngsearchword',
                    searchText: 'Berufe mit',
                },
            },
        ],
    },
];

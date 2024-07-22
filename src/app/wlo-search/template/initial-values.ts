import { v4 as uuidv4 } from 'uuid';

export const swimlanes = [
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
            },
        ],
        backgroundColor: '#BEDADE',
    },
    {
        uuid: uuidv4(),
        type: 'spacer',
    },
    // {
    //     uuid: uuidv4(),
    //     type: 'collapse',
    //     heading: 'Inhalt des Monats',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-image',
    //             cols: 2,
    //         },
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //         },
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //             cols: 3,
    //         },
    //     ],
    //     gridType: 'noGutter',
    //     backgroundColor: 'rgba(255, 185, 48, 0.2)',
    // },
    // {
    //     uuid: uuidv4(),
    //     type: 'collapse',
    //     heading: 'Andere Einstellungen',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //         },
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-image',
    //             rows: 3,
    //         },
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //             rows: 2,
    //         },
    //     ],
    //     gridType: 'mediumGutter',
    //     backgroundColor: '#838896',
    // },
    // {
    //     uuid: uuidv4(),
    //     type: 'jumbotron',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-card',
    //         },
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-card',
    //         },
    //     ],
    //     gridType: 'smallGutter',
    // },
    // {
    //     uuid: uuidv4(),
    //     type: 'text',
    //     heading: 'Erklärung Wechselpräpositionen',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //         },
    //     ],
    // },
    // {
    //     uuid: uuidv4(),
    //     type: 'text',
    //     heading: 'Chat GPT',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //         },
    //     ],
    // },
    // {
    //     uuid: uuidv4(),
    //     type: 'jumbotron',
    //     heading: 'Katzen! :D',
    //     description: 'Diese Beschreibung beschreibt Katzen beschreiblich.',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-text',
    //         },
    //     ],
    //     backgroundColor: '#81D4FA',
    // },
    {
        uuid: uuidv4(),
        type: 'jumbotron',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-user-configurable',
                classNames: 'newest-widget',
            },
        ],
        backgroundColor: '#E3ECF6',
    },
    // {
    //     uuid: uuidv4(),
    //     type: 'jumbotron',
    //     grid: [
    //         {
    //             uuid: uuidv4(),
    //             item: 'wlo-user-configurable',
    //             classNames: 'jobs-widget',
    //         },
    //     ],
    //     backgroundColor: '#F6E4E3',
    // },
    {
        uuid: uuidv4(),
        heading: 'New jobs?',
        type: 'collapse',
        grid: [
            {
                uuid: uuidv4(),
                item: 'wlo-user-configurable',
                classNames: 'jobs-widget',
            },
        ],
    },
];

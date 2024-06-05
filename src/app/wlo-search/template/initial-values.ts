export const gridColumns = [
    {
        uuid: crypto.randomUUID(),
        type: 'collapse',
        heading: 'Durchstöbere hier unsere Lehrplanthemen',
        description: 'Example text?',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-collection-chips',
                cols: 3,
                rows: 1,
            },
        ],
    },
    {
        uuid: crypto.randomUUID(),
        type: 'spacer',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'collapse',
        heading: 'Inhalt des Monats',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-image',
                cols: 2,
            },
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
            },
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
                cols: 3,
            },
        ],
        gridType: 'noGutter',
        backgroundColor: 'rgba(255, 185, 48, 0.2)',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'collapse',
        heading: 'Andere Einstellungen',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
            },
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-image',
                rows: 3,
            },
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
                rows: 2,
            },
        ],
        gridType: 'mediumGutter',
        backgroundColor: '#838896',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'jumbotron',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-card',
            },
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-card',
            },
        ],
        gridType: 'smallGutter',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'text',
        heading: 'Erklärung Wechselpräpositionen',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
            },
        ],
    },
    {
        uuid: crypto.randomUUID(),
        type: 'text',
        heading: 'Chat GPT',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
            },
        ],
    },
    {
        uuid: crypto.randomUUID(),
        type: 'jumbotron',
        heading: 'Katzen! :D',
        description: 'Diese Beschreibung beschreibt Katzen beschreiblich.',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-text',
            },
        ],
        backgroundColor: '#81D4FA',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'jumbotron',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-user-configurable',
                classNames: 'newest-widget',
            },
        ],
        backgroundColor: '#E3ECF6',
    },
    {
        uuid: crypto.randomUUID(),
        type: 'jumbotron',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-user-configurable',
                classNames: 'jobs-widget',
            },
        ],
        backgroundColor: '#F6E4E3',
    },
    {
        uuid: crypto.randomUUID(),
        heading: 'New jobs?',
        type: 'collapse',
        grid: [
            {
                uuid: crypto.randomUUID(),
                item: 'wlo-user-configurable',
                classNames: 'jobs-widget',
            },
        ],
    },
];

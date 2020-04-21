// Configuration for https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo

module.exports = {
    client: {
        service: {
            name: 'elasticsearch-relay',
            url: 'http://localhost:3000/graphql',
        },
        excludes: ['src/generated/**'],
    },
};

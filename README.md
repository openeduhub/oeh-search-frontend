# Open Edu Hub Search Frontend

![](https://github.com/openeduhub/oeh-search-frontend/workflows/Publish/badge.svg)
![](https://github.com/openeduhub/oeh-search-frontend/workflows/Lint/badge.svg)
![](https://github.com/openeduhub/oeh-search-frontend/workflows/Cypress/badge.svg)

You need at least a running elasticsearch-relay to use the frontend. See
https://github.com/openeduhub/oeh-search-elasticsearch-relay.

## Build

Setup

```bash
$ git submodule update --init
$ npm install
```

### Dev Server

The dev server will serve the application on http://localhost:4200/ and reload automatically if you
change any of the source files.

Either

-   start the dev server:

    ```bash
    $ npm start
    ```

-   or start the dev server with German translations:
    ```bash
    $ npm run start-de
    ```

### Docker Image

For deployment, the application is packaged as Docker image.

To locally build the image and serve it on http://localhost:8080, run:

```bash
$ npm run build
$ npm run docker-build
$ npm run docker-run
```

## Configuration

Local dev configuration is done via the file `src/env.js`. Copy `src/env.sample.js` for an initial version.

When started as Docker container, the file `src/env.js` will be populated with the respective environment variables

The following variables are available:

| Variable  | Description                                   | Default value (dev)     | Default value (prod)                |
| --------- | --------------------------------------------- | ----------------------- | ----------------------------------- |
| RELAY_URL | URL of the ElasticSearch Relay to connect to. | `http://localhost:3000` | `window.location.origin + '/relay'` |

For example, to run your locally built Docker image against the staging environment of
WirLernenOnline, run

```bash
docker run --name oeh-search-frontend --rm -ti -p 8080:80 -e RELAY_URL=https://staging.wirlernenonline.de/relay openeduhub/oeh-search-frontend:local
```

## Tests

### Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### E2E Tests with Cypress

See https://docs.cypress.io/guides/overview/why-cypress.html.

All of the following commands must be run from `e2e-cypress` as working directory:

```bash
$ cd e2e-cypress
```

Install dependencies using

```bash
$ npm install
```

#### Test Local Dev Environment

-   Install dependencies and submodules and run the dev server using `npm run start-de` (see section
    [Build](##Build)).
-   Start the elasticsearch-relay on port 3000 (see
    https://github.com/openeduhub/oeh-search-elasticsearch-relay).

Single run:

```bash
$ npm run cypress:local:open
```

Open GUI:

```bash
$ npm run cypress:local:run
```

#### Test an Online Environment

Test https://staging.wirlernenonline.de, single run:

```bash
$ npm run cypress:stage:run
```

Test https://staging.wirlernenonline.de, open GUI:

```bash
$ npm run cypress:stage:open
```

Test https://suche.wirlernenonline.de, single run:

```bash
$ npm run cypress:prod:run
```

Test https://suche.wirlernenonline.de, open GUI:

```bash
$ npm run cypress:prod:open
```

## Code Quality

This project uses [husky](https://github.com/typicode/husky) and
[link-staged](https://github.com/okonet/lint-staged) for automatic code checking and formatting
before commits.

Run `npm run format` to format all source files via [Prettier](https://prettier.io/).

Run `ng lint` to check all source files via [TSLint](https://palantir.github.io/tslint/).

## Internationalization

Internationalization is provided with [i18n](https://angular.io/guide/i18n) and updated with
[xliffmerge](https://github.com/martinroob/ngx-i18nsupport/wiki/Tutorial-for-using-xliffmerge-with-angular-cli).
Localization files are stored in `src/locale`.

### Provide Translations

To create / update translation files, run

```bash
npm run extract-i18n
```

This will generate the source file `messages.xlf` and translation files in `src/locale`.
Write missing translations in the `target` tags of translation files.

### Configure Additional Languages

The following files are relevant:

-   `angular.json`
-   `nginx.page.conf`

### Test a Translation on a Development Server

To choose a non-default locale, a configuration has to be provided in `angular.json`. It can be
activated like this:

```bash
ng serve --configuration=de
```

### Serving Multiple Translations

When built with `ng build --localize`, angular creates a directory for each language in `dist`. The
`Dockerfile` configures an Nginx to serve the browser's preferred language by redirecting into one
of these directories.

## GraphQL

Start `elasticsearch-relay` as dev server and install `apollographql.vscode-apollo` to get IDE
features for GraphQL queries in VSCode.

```
ext install apollographql.vscode-apollo
```

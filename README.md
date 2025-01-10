# Open Edu Hub Search Frontend

[![CI](https://github.com/openeduhub/oeh-search-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/openeduhub/oeh-search-frontend/actions/workflows/ci.yml)

In order to use the frontend, you either need a deployed or a locally running instance of
Edu-Sharing (see https://github.com/edu-sharing/Edu-Sharing/ for further information).

## Structure

-   **`app`**
    -   **`api`**: Auto-generated API service for REST communication to Edu-Sharing.
    -   **`wlo-search`**: Basically the complete application. Everything that does not necessarily
        have to go to the actual root component. This was meant for including the application as
        lazy-loaded route into another app, but we don't do that at the moment.
        -   **`core`**: The parts of the application that stay alive throughout the application
            lifetime, including header- and footer components and services.
        -   **`preferences`**: User-preferences pages, barely used at the moment.
        -   **`search`**: Search- and details pages, the heart of the search application.
            -   `details-page`
            -   `search-page`
            -   `shared`: Shared components of search- and details page.
        -   `shared`: Modules, pipes, and directives that are used application-wide.
        -   `template`: Template components, the heart of the topic pages application.

## Development / Build

### Prerequisites

Check whether the correct node version is installed that is specified in `.nvmrc`.

```bash
$ node -v
```

If this is not the case, you might run:

```bash
$ nvm install # to install and use the specified node version
$ nvm use # to switch to the specified node version, if it is already installed
```

or [install the specified version manually](https://nodejs.org/en/download).

### Setup

```bash
$ git submodule update --init
$ npm install
```

### Dev Server

#### Start-up information

The dev server will serve the application on http://localhost:4200/ and reload automatically, if
you change any of the source files.

Either:

-   start the dev server:

    ```bash
    $ npm start
    ```

-   or start the dev server with German translations:
    ```bash
    $ npm run start-de
    ```

http://localhost:4200/ is automatically redirected to http://localhost:4200/search, which serves
the search application. If you want to open the topic pages, you have to navigate to
http://localhost:4200/template?collectionId={COLLECTION_ID}.

#### Develop `wlo-pages-lib`

When developing `wlo-pages-lib` (the widget project relevant for the topic pages application),
checkout both projects (`oeh-search-frontend` and `wlo-pages-lib`) in one folder.
Afterward, `wlo-pages-lib` should be linked automatically within the `projects` folder.

Now, you can either:

-   start the dev server (with hot-reloading of `wlo-pages-lib`):

    ```bash
    $ npm run start:lib-dev
    ```

-   or start the dev server with German translations:
    ```bash
    $ npm run start-de:lib-dev
    ```

Known errors:

-   `Error: Cannot resolve type entity i1.ActionbarComponent to symbol` -> delete the `node_modules`-folder located in `projects/wlo-pages/lib`, if existing.

### Docker Image

For deployment, the application is packaged as Docker image.

To locally build the image and serve it on http://localhost:8080, run:

```bash
$ npm run build
$ npm run docker-build
$ npm run docker-run
```

### GitHub Actions

When pushing to GitHub, a workflow is started (https://github.com/openeduhub/oeh-search-frontend/actions) that builds the image and publishes it.

## Configuration

Local dev configuration is done via the file `src/env.js`. Copy `src/env.sample.js` for an initial version.

When started as Docker container, the file `src/env.js` will be populated with the respective environment variables

The following variables are available:

| Variable             | Description                                                     | Default value (dev)              | Default value (prod)         |
| -------------------- | --------------------------------------------------------------- | -------------------------------- | ---------------------------- |
| EDU_SHARING_API_URL  | URL of the Edu-Sharing API to connect to.                       | `/edu-sharing-api'`              | `/edu-sharing-api'`          |
| EDU_SHARING_USERNAME | Username to login during development.                           | (`undefined`)                    | (`undefined`)                |
| EDU_SHARING_PASSWORD | Password to login during development.                           | (`undefined`)                    | (`undefined`)                |
| WORDPRESS_URL        | Base URL of the corresponding WLO Wordpress page.               | `https://dev.wirlernenonline.de` | `https://wirlernenonline.de` |
| SHOW_EXPERIMENTS     | Display a link to experimental-feature toggles in the frontend. | `true`                           | `false`                      |
| ANALYTICS_URL        | URL of the analytics backend to connect to.                     | (`undefined`)                    | `/analytics'`                |

For example, to run your locally built Docker image against the staging environment of
WirLernenOnline, run

```bash
docker run --name oeh-search-frontend --rm -ti -p 8080:80 -e EDU_SHARING_API_URL=https://redaktion-staging.openeduhub.net/edu-sharing/rest openeduhub/oeh-search-frontend:local
```

### Proxy

Pointing the browser to a different backend as described above might fail due to missing CORS
headers. In order to point a dev environment to a deployed backend, copy `.env.sample` to `.env`
and set the URL there.

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
$ npm run cypress:local:run
```

Open GUI:

```bash
$ npm run cypress:local:open
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

Run `ng lint` to check all source files via [ESLint](https://eslint.org/).

## Internationalization

Internationalization is provided with [i18n](https://angular.io/guide/i18n).
Localization files are stored in `src/locale`.

### Provide Translations

To create / update translation files, run

```bash
npm run extract-i18n
```

This will generate the source file `messages.xlf` in `src/locale`.
Copy (or update) missing blocks from `messages.xlf` to target translation files in `src/locale` and
write missing translations in the `target` tags of translation files.

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

## Wordpress integration

Run

```bash
npm run build:web-components
```

and copy all data from the folder `dist/web-components/de` in the corresponding wordpress folder (`/wp-content/themes/wir-lernen-online/src/assets/js/angular/detail_view`)

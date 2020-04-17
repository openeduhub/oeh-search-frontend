# Open Edu Hub Frontend

## Build

To build the project and serve it via a docker container on `http://localhost:8080/`, run:

```bash
git submodule update --init
npm install
npm run build-shared
ng build --prod --localize
docker build . --tag open-edu-hub-frontend
docker run --name open-edu-hub-frontend --rm -ti -p 8080:80 open-edu-hub-frontend
```

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically
reload if you change any of the source files.

## Environments

### Production

The production environment — used when building the project as described above — expects the
Elasticsearch relay to be served at the same host/port as the frontend.

An Apache configuration could look like this:

```apacheconf
<VirtualHost *:80>
        # ...
        ProxyPass "/api" "http://localhost:3000/api"
        ProxyPass "/" "http://localhost:8080/"
</VirtualHost>
```

### Development

The development environment — used when serving the frontend via `ng serve` — expects the
Elasticsearch relay to be served on `http://localhost:3000`.

## Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

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

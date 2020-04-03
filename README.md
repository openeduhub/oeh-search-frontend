# Open Edu Hub Frontend

## Build

To build the project and serve it via a docker container on `http://localhost:8080/`, run:

```bash
npm install
ng build --prod
docker build . --tag open-edu-hub-frontend
docker run --name open-edu-hub-frontend --rm -ti -p 8080:80 open-edu-hub-frontend
```

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically
reload if you change any of the source files.

## Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Code Quality

This project uses [husky](https://github.com/typicode/husky) and
[link-staged](https://github.com/okonet/lint-staged) for automatic code checking and formatting
before commits.

Run `npm run format` to format all source files via [Prettier](https://prettier.io/).

Run `ng lint` to check all source files via [TSLint](https://palantir.github.io/tslint/).

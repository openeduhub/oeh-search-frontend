# Open Edu Hub Frontend

## Build

```
npm install
```

Run `ng build` to build the project. The build artifacts will be stored in the
`dist/` directory. Use the `--prod` flag for a production build.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app
will automatically reload if you change any of the source files.


## Tests

Run `ng test` to execute the unit tests via
[Karma](https://karma-runner.github.io).

Run `ng e2e` to execute the end-to-end tests via
[Protractor](http://www.protractortest.org/).

## Code Quality

Run `npm run format` to format source files according to `.editorconfig` and
`.prettierrc`.

Run `ng lint` to find code style problems.

Please add the following git hook to ensure code quality:

**`.git/hooks/pre-commit`**

---

    #!/bin/sh

    set -e

    npm run format
    npm run lint


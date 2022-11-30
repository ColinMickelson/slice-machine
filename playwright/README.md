# End-to-End Playwright tests

This is an ongonig proof of concept to run the end-to-end tests using the Playwright framework.


## Installation

```bash
  npm install
```
    
## How to run tests

Run all tests

```bash
  npx playwright test
```

Run a single test
```bash
  npx playwright test onboarding.spec.ts
```

Run a single test in headed mode (slower, but opens the browser for visual feedback)
```bash
  npx playwright test onboarding.spec.ts --headed
```

Open the test report
```bash
npx playwright show-report
```

See other examples on the [official documentation](https://playwright.dev/docs/running-tests)


## FAQ

#### My tests fail with the error `Error: playwright/tests/onboarding.spec.ts-snapshots/....png is missing in snapshots, writing actual.`

This is related to visual testing. It fails because the test runs on a OS/browser it never ran on. It needs to create a reference screenshot file. Run the test again and the issue should be resolved. More info on [the official documentation](https://playwright.dev/docs/test-snapshots).


## Useful links

- [VS Code extension](https://playwright.dev/docs/getting-started-vscode)
- [Official documentation](https://playwright.dev)

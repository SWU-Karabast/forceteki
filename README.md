# Forceteki
Implementation of the Star Wars Unlimited game rules, based on the [Ringteki](https://github.com/ringteki/ringteki) architecture.

## Contributing
For details on how to get started adding cards, see the [wiki](https://github.com/SWU-Karabast/forceteki/wiki).

## Development Quickstart
Follow these instructions to get to the point of being able to run the [unit tests](./test/server/) locally.

#### Required Software
* Git
* Node.js v22.x

### Install Dependencies
The following demonstrates how to install dependencies and also some sample commands for interacting with the repo and running tests.

```bash
# install node dependencies
npm install

# run once to download card definition files
# NOTE: TWI cards are currently being filtered out
npm run get-cards

# run this to transpile (build) the code. the 'npm test' command will automatically run this as well.
# rm -r build/  # needed if files are added / deleted / renamed between builds
npx tsc

# run code linter (recommend configuring this automatically with Visual Studio Code)
npm run lint
npm run lint-verbose

# runs tsc and executes tests
npm test

# run all tests in parallel for higher speed
# NOTE: there is a known issue with this method, see below
npm run test-parallel

# run a specific test file only
npm test test/server/cards/01_SOR/LukeSkywalkerFaithfulFriend.spec.js
npm test **/LukeSkywalkerFaithfulFriend.spec.js # use path globbing (may look different depending on your shell)
```

**Known issue with `test-parallel`**: in some cases when a test fails using `npm run test-parallel`, there will be a json stringify and it will not explain which test failed, only which suite. In this case you must re-run the tests using the standard `npm test` to determine the specifics.

### Linting
We've configured a set of eslint rules to keep the repo looking consistent and help catch potential bugs. These rules are checked at PR time.

To facilitate using them locally, we've set up VSCode integration so the rules will be applied automatically while you work. Just install the [VSCode ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), open the repo as a folder in vscode, and everything should work automatically.

### VSCode Debugging
We have a preconfigured [launch.json](.vscode\launch.json) file with debug profiles for use in Visual Studio Code. Open the repo as a folder in vscode and the profiles should load automatically under "Run and Debug" tab (ctrl + shift + D). See https://code.visualstudio.com/docs/editor/debugging for additional details.

Once you have vscode set up, use the `Debug All Jasmine Tests` profile or open a specific test file and run `Debug Open Jasmine Test` to run tests with breakpoints, debugging, etc.

#### Debugging Tips
- You can use the `debugger;` command in node to create a breakpoint in code that will be respected by the vscode debugger
- VSCode has advanced breakpoint features such as conditional breakpoints that are extremely useful for debugging complex situations, we highly recommend reading the "Advanced breakpoint topics" section of this guide if you haven't used it before: https://code.visualstudio.com/docs/editor/debugging#_advanced-breakpoint-topics
- See our [Debugging Guide](https://github.com/SWU-Karabast/forceteki/wiki/Debugging-Guide) for detailed guides on debugging cards

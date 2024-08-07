# Forceteki
Proof-of-concept for web based implementation of Star Wars Unlimited TCG. Very WIP.

## Development Quickstart
Follow these instructions to get to the point of being able to run the [unit tests](./test/server/) locally.

#### Required Software
* Git
* Node.js v22.x

### Install Dependencies
Use the following instructions to install dependencies and run the unit tests.

```bash
# install node dependencies
npm install

# run once to download card definition files
npm run get-cards

# run this to transpile (build) the code. the 'npm test' command will automatically run this as well.
npx tsc

# runs tsc and executes tests
npm test
```

### VSCode Linting
We've configured a set of eslint rules to keep the repo looking consistent and help catch potential bugs. To use it, just install the [VSCode ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), open the repo as a folder in vscode, and everything should work automatically.

### VSCode Debugging
We have a preconfigured [launch.json](.vscode\launch.json) file with debug profiles for use in Visual Studio Code. Open the repo as a folder in vscode and the profiles should load automatically under "Run and Debug" tab (ctrl + shift + D). See https://code.visualstudio.com/docs/editor/debugging for additional details.

Once you have vscode set up, use the `Debug All Jasmine Tests` profile or open a specific test file and run `Debug Open Jasmine Test` to run tests with breakpoints, debugging, etc.

#### Debugging Tips
- You can use the `debugger;` command in node to create a breakpoint in code that will be respected by the vscode debugger
- VSCode has advanced breakpoint features such as conditional breakpoints that are extremely useful for debugging complex situations, we highly recommend reading the "Advanced breakpoint topics" section of this guide if you haven't used it before: https://code.visualstudio.com/docs/editor/debugging#_advanced-breakpoint-topics

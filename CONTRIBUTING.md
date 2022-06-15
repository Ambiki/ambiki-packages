# How to contribute to Ambiki packages

1. Fork and clone the respository
2. Create a new branch: `git checkout -b my-branch`
3. Install the dependencies: `yarn install`
4. `cd` into the relevant package and run `yarn && yarn build`
5. Open `examples/index.html` by running `yarn start --group <custom-element>` from the root dir
6. Make necessary changes
7. Make sure the specs passes on your local machine: `yarn test` from the root dir
8. Push to your fork and submit a pull request

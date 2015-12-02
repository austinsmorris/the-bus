# the-bus

> A deployment solution for JavaScript applications built on Flightplan JS.

## Usage

```text
npm run deploy-production
```

### Deploy Faster with Caching

If you're deploying to multiple environments, you can use the `--cache` flag so that any future
deployments with the `--cache` flag will use the cached build and not reclone, npm i, etc.

If you are deploying something that has updated dependencies, but the main app does not have
any updates (compared to the cached copy), you'll want to delete the `tmp/deploy` directory
before using the `--cache` flag.

Example: 

```text
rm -rf tmp/deploy
npm run deploy-staging -- --cache
npm run deploy-demo -- --cache
npm run deploy-production -- --cache
```

Only the first deployment will build the app and install dependencies. Further deployments
will use the cached copy.


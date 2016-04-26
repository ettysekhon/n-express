n-express [![Circle CI](https://circleci.com/gh/Financial-Times/n-express/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-express/tree/master)
============

Slightly enhanced Express.

```
npm install -S @financial-times/n-express
```

# API extensions

## App init options
Passed in to `require('@financial-times/n-express')(options)`, these (Booleans defaulting to false unless otherwise stated) turn on various optional features
- `withFlags` - decorates each request with feature flags as `res.locals.flags`
- `withHandlebars` - adds handlebars as the rendering engine
- `withNavigation` - adds a data model for the navigation to each request
- `withAnonMiddleware` - sets the user's signed in state in the data model, and varies the response accordingly
- `withBackendAuthentication` - will reject requests not decorated with an `FT-Next-Backend-Key`. *Must be true for any apps accessed via our CDN and router*
- `withRequestTracing` - enables additional instrumentation of requests and responses to track performance
- `healthChecks` Array - an array of healthchecks to serve on the `/__health` path (see 'Healthchecks' section below)

## Cache control
Define Cache-Control and Surrogate-Control headers for your response in a way that plays nicely with our CDN
- `no`, `short`, `hour`, `day` or `long` presets can be used e.g. `res.cache('long')`
- the above can have parts overridden e.g. `res.cache('long', {'stale-on-revalidate': 15000000000000})`
- can also be passed one or two Cache-Control header strings, which are used for `Surrogate-Control` and outbound `Cache-Control` respectively

## Cache varying
Various vary headers are set by default (ft-flags, ft-anonymous-user, ft-edition, Accept-Encoding as of Apr 2016 ) as they are required for most responses - the user experience will break if they are not. To control these a few additional methods are provided
- `res.unvary('My-Header')` - use if your response definitely doesn't need to vary on one of the standard vary headers e.g. .rss probably doesn't need to vary on ft-edition
- `res.unvaryAll()` - remove all vary headers .*Do not use lightly!!!*
- `res.vary('My-Header') - add to the list of vary headers

## next-metrics
As next-metrics must be a singleton to ensure reliable reporting, it is exported at `require('@financial-times/n-express').metrics`

# Other enhancements
- `fetch` is added as a global using [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
- Our [Handlebars](http://handlebarsjs.com/) engine loads partials from `bower_components` and has  anukmber of [additional helpers](https://github.com/Financial-Times/n-handlebars). It also points to [n-layout](https://github.com/Financial-Times/n-layout) to provide a vanilla and 'wrapper' layout
- Errors are sent to sentry using [n-raven](https://github.com/Financial-Times/n-raven)
- Instrumentation of system and http (incoming and outgoing) performance using [Next Metrics](https://github.com/Financial-Times/next-metrics)
- Anti-search engine `GET /robots.txt` (possibly might need to change in the future)
- Exposes everything in the app's `./public` folder via `./{{name-of-app}}` (only in non-production environments, please use [next-assets](https://github.com/Financial-Times/next-assets) or hashed-assets in production)
- Exposes various bits of metadata about the app (e.g. name, version, env, isProduction) to templates (via `res.locals`) and the outside world (via `{appname}/__about.json`)



# Health checks

For an example set of health check results, see [next.ft.com/__health](https://next.ft.com/__health). For testing health checks, the [Health Status Formatter extension for Google Chrome](https://github.com/triblondon/health-status-formatter) is recommended.

Health checks can be tested for failures of a specific degree of severity by appending the severity number to the health check URL. This is particularly useful for setting up fine-grained alerting. For example, if on next.ft.com a severity level 2 health check were failing:

https://next.ft.com/__health.1 would return HTTP status 200
https://next.ft.com/__health.2 would return HTTP status 500
https://next.ft.com/__health.3 would return HTTP status 500

Each health check must have a getStatus() property, which returns an object meeting the specifications of the [FT Health Check Standard](https://docs.google.com/document/d/18hefJjImF5IFp9WvPAm9Iq5_GmWzI9ahlKSzShpQl1s/edit) and the [FT Check Standard] (https://docs.google.com/document/edit?id=1ftlkDj1SUXvKvKJGvoMoF1GnSUInCNPnNGomqTpJaFk#). This might look roughly like the following example:


```js
var exampleHealthCheck = {
	getStatus: () => {
		return {
			name: 'Some health check',
			ok: true,
			checkOutput: 'Everything is fine',
			lastUpdated: new Date(),
			panicGuide: 'Don\'t panic',
			severity: 3,
			businessImpact: "Some specific feature will fail",
			technicalSummary: "Doesn\'t actually check anything, just an example"
		};
	}
}
```

# Troubleshooting

## Testing with flags

If you’re using flags and testing with mocha, you’ll need to expose listen in your app:

```
module.exports.listen = app.listen(port);
```

And in your tests, add this:

```
before(function() {
	return app.listen;
});
```

This’ll make sure your tests wait for flags to be ready.

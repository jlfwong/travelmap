# Travel Map

![travelmap](http://i.imgur.com/El9IToC.png)

You can see the live version at <http://jamie-wong.com/experiments/travelmap/> 
and read the teardown of the technology this uses in [A Map of Everywhere My 
Family Has Ever Been][1].

# Running Locally

You can run this locally by cloning the repository then running:

```
npm install -g brunch
npm install
brunch w -s
```

Then point your browser at <http://localhost:3333>

# Customizing

To load this up with your own data, edit `app/data.js`. You'll probably also 
want to clear out the checked-in geocoding caches:

```
echo '{}' > app/assets/geocode_cache.json
echo '{}' > app/assets/reverse_geocode_cache.json
```

# Deploying

Once you're happy with the result and want to deploy, you'll need to save your 
geocoding and reverse geocoding caches as JSON. You can do this by running the 
following in the console:


```
require("aggregate").saveCaches()
```

This should download a new `geocode_cache.json` and `reverse_geocode_cache.json` 
file to disk (Chrome might prompt to ask if you want to allow the site to 
download multiple files).

Then move the downloaded caches back into the repo:

```
cp ~/Download/geocode_cache.json ~/Download/reverse_geocode_cache.json app/assets
```

To build the final static site, run `brunch build`, then upload the contents of 
the public folder to your favourite static host.

[1]: http://jamie-wong.com/2014/01/03/travelmap/

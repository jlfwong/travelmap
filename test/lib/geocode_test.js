var geocode = require("lib/geocode");

describe('geocode', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('retrieves lat/long for a string query', function(done) {
    // TODO(jlfwong): Figure out why this doesn't work with
    // sinon.useFakeXMLHttpRequest();
    var deferred = $.Deferred();
    var ajaxStub = sandbox.stub($, 'ajax').returns(deferred.promise());
    geocode("paris").then(function(latlon) {
      expect(latlon.lat).to.be(48.8565056);
      expect(latlon.lon).to.be(2.3521334);
      done();
    });
    deferred.resolveWith(deferred, [PARIS_RESPONSE]);
  });

  describe('.reverse', function() {
    it('retrieves address information for a given lat/lon', function(done) {
      var deferred = $.Deferred();
      var ajaxStub = sandbox.stub($, 'ajax').returns(deferred.promise());
      geocode.reverse({lat: 48.8565056, lon: 2.3521334}).then(function(addr) {
        expect(addr.city).to.be("Paris");
        expect(addr.country).to.be("France");
        done();
      });
      deferred.resolveWith(deferred, [PARIS_REVERSE_RESPONSE]);
    });
  });
});

var PARIS_RESPONSE = [
    {
        "boundingbox": [
            "48.8155746459961",
            "48.902156829834",
            "2.22412180900574",
            "2.46976041793823"
        ],
        "class": "place",
        "display_name": "Paris, Ile-de-France, 75000, France",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.96893459932191,
        "lat": "48.8565056",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "2.3521334",
        "osm_id": "7444",
        "osm_type": "relation",
        "place_id": "97923440",
        "type": "city"
    },
    {
        "boundingbox": [
            "48.8155746459961",
            "48.902156829834",
            "2.22412180900574",
            "2.46976041793823"
        ],
        "class": "boundary",
        "display_name": "Paris, Ile-de-France, France",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_boundary_administrative.p.20.png",
        "importance": 0.96893459932191,
        "lat": "48.85886575",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "2.32003761177144",
        "osm_id": "71525",
        "osm_type": "relation",
        "place_id": "97357969",
        "type": "administrative"
    },
    {
        "boundingbox": [
            "35.2672462463379",
            "35.3065032958984",
            "-93.7618103027344",
            "-93.6750793457031"
        ],
        "class": "place",
        "display_name": "Paris, Logan County, Arkansas, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.67385884862688,
        "lat": "35.28687645",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-93.7354879210082",
        "osm_id": "33063046",
        "osm_type": "way",
        "place_id": "42637879",
        "type": "city"
    },
    {
        "boundingbox": [
            "33.6118507385254",
            "33.7383804321289",
            "-95.6279296875",
            "-95.4354476928711"
        ],
        "class": "place",
        "display_name": "Paris, Lamar County, Texas, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.54374443751163,
        "lat": "33.6751155",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-95.5502662477703",
        "osm_id": "33299478",
        "osm_type": "way",
        "place_id": "42729434",
        "type": "city"
    },
    {
        "boundingbox": [
            "38.1649208068848",
            "38.2382736206055",
            "-84.3073272705078",
            "-84.2320861816406"
        ],
        "class": "place",
        "display_name": "Paris, Bourbon County, Kentucky, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.5108263210417,
        "lat": "38.2097987",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-84.2529869",
        "osm_id": "130722",
        "osm_type": "relation",
        "place_id": "97962432",
        "type": "city"
    },
    {
        "boundingbox": [
            "36.1119995117188",
            "36.112003326416",
            "-115.172668457031",
            "-115.172660827637"
        ],
        "class": "highway",
        "display_name": "Paris, South Las Vegas Boulevard, Hughes Center, Bracken, Clark County, Nevada, 89169, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/transport_bus_stop2.p.20.png",
        "importance": 0.4846342182247,
        "lat": "36.1120019",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-115.1726609",
        "osm_id": "1688891876",
        "osm_type": "node",
        "place_id": "18310048",
        "type": "bus_stop"
    },
    {
        "boundingbox": [
            "43.1932334899902",
            "43.1932373046875",
            "-80.3842849731445",
            "-80.38427734375"
        ],
        "class": "place",
        "display_name": "Paris, Brant County, Ontario, Canada",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_town.p.20.png",
        "importance": 0.46561345354774,
        "lat": "43.1932336",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-80.3842807",
        "osm_id": "257763716",
        "osm_type": "node",
        "place_id": "3669487431",
        "type": "town"
    },
    {
        "boundingbox": [
            "39.4691543579102",
            "39.4892807006836",
            "-92.021484375",
            "-91.9916763305664"
        ],
        "class": "place",
        "display_name": "Paris, Monroe County, Missouri, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.44025131828771,
        "lat": "39.4808721",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-92.0012811",
        "osm_id": "140787",
        "osm_type": "relation",
        "place_id": "97967436",
        "type": "city"
    },
    {
        "boundingbox": [
            "39.5814208984375",
            "39.6485786437988",
            "-87.7210464477539",
            "-87.6505355834961"
        ],
        "class": "place",
        "display_name": "Paris, Edgar County, Illinois, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.43634000491239,
        "lat": "39.611146",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-87.6961374",
        "osm_id": "126166",
        "osm_type": "relation",
        "place_id": "97975024",
        "type": "city"
    },
    {
        "boundingbox": [
            "36.2660026550293",
            "36.3290176391602",
            "-88.3671188354492",
            "-88.2650604248047"
        ],
        "class": "place",
        "display_name": "Paris, Henry County, Tennessee, United States of America",
        "icon": "http://nominatim.openstreetmap.org/images/mapicons/poi_place_city.p.20.png",
        "importance": 0.43634000491239,
        "lat": "36.3020023",
        "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
        "lon": "-88.3267107",
        "osm_id": "197171",
        "osm_type": "relation",
        "place_id": "98009579",
        "type": "city"
    }
];

var PARIS_REVERSE_RESPONSE = {
    "address": {
        "attraction": "H\u00f4tel de Ville",
        "city": "Paris",
        "city_district": "4th Arrondissement",
        "country": "France",
        "country_code": "fr",
        "county": "Paris",
        "neighbourhood": "Beaubourg",
        "pedestrian": "Place de l'H\u00f4tel de Ville - Esplanade de la Lib\u00e9ration",
        "postcode": "75004",
        "state": "Ile-de-France",
        "suburb": "Quartier Saint-Merri"
    },
    "display_name": "H\u00f4tel de Ville, Place de l'H\u00f4tel de Ville - Esplanade de la Lib\u00e9ration, Beaubourg, Quartier Saint-Merri, 4th Arrondissement, Paris, Ile-de-France, 75004, France",
    "lat": "48.85642655",
    "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
    "lon": "2.35252772813861",
    "osm_id": "55448726",
    "osm_type": "way",
    "place_id": "52369359"
};

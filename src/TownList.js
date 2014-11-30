define(['Backbone', 'Q'], function(Backbone, Q) {
    var line = function(input) {
        return input + "\n";
    };

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var parseFullApi = function parseFullApi(r) {
        var cities = [];
        $(r).find('geonames marker').each( function(){
            cities.push({
                name: $(this).attr('name'),
                population: parseInt($(this).attr('population'), 10),
                lat: parseFloat($(this).attr('lat')),
                lng: parseFloat($(this).attr('lng'))
            });
        });
        return cities;
    };

    var parseJsonCitiesApi = function parseJsonCitiesApi(r) {
        return r.geonames;
    };

    var getEndpoint = function getEndPoint(boundingBox, maxResults, api) {
        var north = boundingBox.get('north');
        var south = boundingBox.get('south');
        var east = boundingBox.get('east');
        var west = boundingBox.get('west');

        if(api == 'full') {
            return "http://www.geonames.org/servlet/geonames?srv=2&south=" + south + "&north="+north+"&west="+west+"&east="+east+"&P=1&lat="+north+"&lng="+west+"&zoom=12&orderby=population&maxRows=" + maxResults;
        } else {
            return "http://api.geonames.org/citiesJSON?north="+north+"&south="+south+"&east="+east+"&west="+west+"&lang=sv&username=ade_openttd_scenario&maxRows=" + maxResults;
        }
    };

    return Backbone.Model.extend({
        results: null,

        download: function(boundingBox, maxResults, api) {
            //Api only allows 2k results or it will fail the request
            maxResults = Math.min(maxResults, 2000);
            var deferred = Q.defer();
            var that = this;

            $.ajax({
                url: getEndpoint(boundingBox, maxResults, api)
            })
            .done(function(r) {
                if(api == 'full') {
                    that.set('results', parseFullApi(r));
                } else {
                    that.set('results', parseJsonCitiesApi(r));
                }
                deferred.resolve(that.get('results'));
            })
            .fail(function(e) {
                deferred.reject(e);
            });

            return deferred.promise;
        },

        getImportTextFile: function getImportTextFile(smallPopulationLimit, mediumPopulationLimit, largePopulationLimit, largeCityPopulationLimit, format, roadLayout) {
            var cities = this.get('results');
            var output = '';
            var populations = [];
            var cityData = '';
            var minPop = 999999;
            var maxPop = 0;
            var popSum = 0;
            var avgPop;
            var roadLayoutValue;

            cities.forEach(function(city) {
                var citySize;
                var cityIsCity = '0';
                if(city.population >= largeCityPopulationLimit) {
                    citySize = 'L';
                    cityIsCity = '1';
                } else if(city.population >= largePopulationLimit) {
                    citySize = 'L';
                } else if(city.population >= mediumPopulationLimit) {
                    citySize = 'M';
                } else if(city.population >= smallPopulationLimit) {
                    citySize = 'S';
                }

                if(format === "Zydeco") {
                    cityData += line([
                        city.name.replace(/,/g, '.'),
                        citySize,
                        cityIsCity,
                        city.lat,
                        city.lng
                    ].join(','));
                } else {
                    if(roadLayout === 'random') {
                        roadLayoutValue = getRandomInt(0, 4);
                    } else {
                        roadLayoutValue = roadLayout;
                    }
                    //<object name>,<object type>,<object size/importance>,<latitude>,<longitude>,<object layout>
                    cityData += line([
                        city.name.replace(/,/g, '.'),
                        citySize,
                        cityIsCity,
                        city.lat,
                        city.lng,
                        roadLayoutValue
                    ].join(','));
                }

                populations.push(city.population);
                popSum += city.population;
                if(city.population < minPop) {
                    minPop = city.population;
                }
                if(city.population > maxPop) {
                    maxPop = city.population;
                }
            });

            avgPop = popSum / cities.length;


            output += line('');
            output += line('# ' + cities.length + " towns");
            output += line('# Total population ' + popSum);
            output += line('# Min population ' + minPop);
            output += line('# Max population ' + maxPop);
            output += line('# Avg population ' + avgPop);

            output += cityData;

            return output;
        }
    });
});

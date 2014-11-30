define([
    'Backbone',
    'BoundingBox',
    'TownList'
], function(Backbone, BoundingBox, TownList) {
    var line = function(input) {
        return input + "\n";
    };

    return Backbone.View.extend({
        events: {
            'click #request': 'startRequest',
            'change #format': 'onChangeFormat'
        },
        getBoundingBox: function() {
            var bb = new BoundingBox({
                north: this.$('#north').val(),
                east: this.$('#east').val(),
                south: this.$('#south').val(),
                west: this.$('#west').val()
            });
            return bb;
        },

        startRequest: function() {
            var box = this.getBoundingBox();
            var api = this.$('#api').val();
            var maxResults = this.$('#maxresults').val();
            var that = this;

            this.$('#status').html('Downloading...');
            this.$('.output').val('');

            var townList = new TownList();

            var smallPopulationLimit = this.$('#pop_small').val();
            var mediumPopulationLimit = this.$('#pop_medium').val();
            var largePopulationLimit = this.$('#pop_large').val();
            var largeCityPopulationLimit = this.$('#pop_large_city').val();
            var roadLayout = this.$('#townLayout').val();

            var format = this.$('#format').val();

            townList.download(box, maxResults, api)
                .then(function() {
                    var output = "";

                    output += line('# Bounding box north: ' + box.get('north') + ", east: " + box.get('east') + ", south: " + box.get('south') + ", west: " + box.get('west'));
                    output += line(box.get('north') + "," + box.get('east') + "," + box.get('south') + "," + box.get('west'));
                    output += townList.getImportTextFile(smallPopulationLimit, mediumPopulationLimit, largePopulationLimit, largeCityPopulationLimit, format, roadLayout);

                    that.$('.output').val(output);
                    that.$('#status').html('Done!');
                })
                .fail(function(e) {
                    that.$("#status").html('Sorry, something went wrong');
                    that.$('.output').val(e.toString());
                });
        },
        onChangeFormat: function onChangeFormat() {
            if(this.$('#format').val() === "McZapkie") {
                this.$('#townLayoutContainer').show();
            } else {
                this.$('#townLayoutContainer').hide();
            }
        }
    });
});

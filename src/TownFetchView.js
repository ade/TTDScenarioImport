define([
    'Backbone',
    'BoundingBox',
    'TownList'
], function(Backbone, BoundingBox, TownList) {
    var line = function(input) {
        return input + "<br/>";
    };

    return Backbone.View.extend({
        events: {
            'click #request': 'startRequest'
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
            this.$('#output').html('');

            var townList = new TownList();

            townList.download(box, maxResults, api)
                .then(function() {
                    var output = "";

                    output += line('# Bounding box north: ' + box.get('north') + ", east: " + box.get('east') + ", south: " + box.get('south') + ", west: " + box.get('west'));
                    output += line(box.get('north') + "," + box.get('east') + "," + box.get('south') + "," + box.get('west'));
                    output += townList.getTownPatchFormat();

                    that.$('#output').html(output);
                    that.$('#status').html('Done!');
                })
                .fail(function(e) {
                    that.$("#status").html('Sorry, something went wrong');
                    that.$('#output').html(e.toString());
                });
        }
    });
});

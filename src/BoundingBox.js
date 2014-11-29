define(['Backbone'], function(Backbone) {
    return Backbone.Model.extend({
        defaults: {
            north: 0,
            west: 0,
            east: 0,
            south: 0
        }
    });
});

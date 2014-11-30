define(['Backbone'], function(Backbone) {
    return Backbone.View.extend({
        events: {
            'click #townstab': 'onClickTowns',
            'click #watertab': 'onClickWater'
        },
        onClickTowns: function() {
            $('#waterpage').hide();
            $('#townsform').show();
        },
        onClickWater: function() {
            $('#townsform').hide();
            $('#waterpage').show();
        }
    });
});
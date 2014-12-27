define(['Backbone'], function(Backbone) {
    return Backbone.View.extend({
        previewContext: null,
        previewCanvas: null,
        rawCanvas: null,
        rawContext: null,
        imageWidth: 0,
        imageHeight: 0,

        events: {
            'change #imageLoader': 'handleImage'
        },

        initialize: function initialize() {
            this.previewCanvas = document.getElementById('previewCanvas');
            this.rawCanvas = document.getElementById('rawCanvas');
            this.previewContext = this.previewCanvas.getContext('2d');
            this.rawContext = this.rawCanvas.getContext('2d');
            this.placeWaterOnSloped = document.getElementById("placeWaterOnSloped");
        },



        handleImage: function handleImage(e){
            var view = this;
            var URL = window.webkitURL || window.URL;
            var url = URL.createObjectURL(e.target.files[0]);
            var img = new Image();

            img.onload = function() {
                view.previewContext.drawImage(img,0, 0, 512, 512);
                view.rawCanvas.width = img.width;
                view.rawCanvas.height = img.height;
                view.rawContext.drawImage(img,0,0, img.width, img.height);
                view.imageHeight = img.height;
                view.imageWidth = img.width;

                view.$('.status').html('Analyzing image');

                setTimeout(function () {
                    var startTime = new Date();
                    var pixels = view.getWaterData();

                    view.$('.status').html('Finished in ' + (new Date() - startTime) + "ms");
                    view.$('.output').val(view.getImportTextFile(pixels));
                }, 1);
            };
            img.src = url;
        },

        getWaterData: function getWaterData() {
            var width = this.imageWidth;
            var height = this.imageHeight;
            var pixelData;
            var pixels = [];
            var startTime = new Date();

            function getBlue(x, y) {
                return pixelData[(y * width + x) * 4 + 2];
            }
            function getAlpha(x, y) {
                return pixelData[(y * width + x) * 4 + 3];
            }

            pixelData = this.rawContext.getImageData(0, 0, width, height).data;

            for(var x = 0; x < width; x++) {
                for(var y = 0; y < height; y++) {
                    var val = getBlue(x,y);
                    if(val > 127 && getAlpha(x,y) > 127) {
                        pixels.push([width - x,y]);
                    }
                }
            }

            return pixels;
        },

        getImportTextFile: function getImportTextFile(tiles) {
            var output = "";

            output += "#bounds\n";
            output += "0,0,-" + this.imageHeight + ",-" + this.imageWidth + "\n";
            output += "\n";

            output += "#dummy entries for unused settings\n";
            output += "1,1,1\n";
            output += "1,1,1,1,1,1,1,1,1,1\n";
            output += "\n";

            for(var i = 0; i < tiles.length; i++) {
                if(this.placeWaterOnSloped.checked) {
                    output += ",W,0";
                } else {
                    output += ",W,1";
                }
                output += ",-" + tiles[i][1] + ",-" + tiles[i][0] + ",0\n";
            }
            return output;
        }
    });
});
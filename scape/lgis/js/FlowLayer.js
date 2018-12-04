define([
  "dojo/_base/declare", "dojo/dom-construct","esri/geometry/support/webMercatorUtils",
  "dojo/_base/lang", "esri/geometry/Point", "esri/geometry/ScreenPoint", "esri/layers/Layer", "lgis/windy"
], function (declare, domConstruct, webMercatorUtils, lang, Point, ScreenPoint, Layer) {
    return declare(null, {
        declaredClass: "esri.layers.FlowLayer",
        Container: null,
        _map: null,
        view: null,
        self: null,
        "-chains-": {
            constructor: "manual"
        },
        constructor: function (ParaJson) {

            this.view = ParaJson.view;
            var canvas = document.createElement('canvas');
            canvas.id = "FlowLayer";
            canvas.width = this.view.width;
            canvas.height = this.view.height;
            //canvas.style.zIndex = 8;
            canvas.style.position = "absolute";
            //canvas.style.border = "1px solid";
            //document.body.appendChild(canvas);
            this.view.container.firstChild.firstChild.appendChild(canvas);
            this.Container = canvas;
            this._init(ParaJson.data);
        },
        _setMap: function (map, container) {
            debugger;
            //var canvas = this.Container = domConstruct.create("canvas", {
            //    id: "canvas",
            //    width: view.width + "px",
            //    height: view.height + "px",
            //    style: "position: absolute; left: 0px; top: 0px;"
            //}, {});

        },
        _init: function (data) {
            var self = this;
            windy = new Windy({ canvas: this.Container, data: data });
            this._redraw();
            this._bindEvent = function () {
                this.view.watch('stationary', function (newValue) {
                    if (newValue) {
                        setTimeout(function () {
                            self._redraw();
                        }, 100);
                    } else {
                        windy.stop();
                    }
                });
            };
            this._bindEvent();
        },
        _redraw: function () {

            this.Container.width = this.view.width;
            this.Container.height = this.view.height;

            windy.stop();

            var extent = this.view.extent;
            if (this.view.spatialReference.wkid == '102100') {
                var min = mercator2lonlat({ x: this.view.extent.xmin, y: this.view.extent.ymin });
                var max = mercator2lonlat({ x: this.view.extent.xmax, y: this.view.extent.ymax });
                var min1 = webMercatorUtils.xyToLngLat(this.view.extent.xmin, this.view.extent.ymin);
                var max1 = webMercatorUtils.xyToLngLat(this.view.extent.xmax, this.view.extent.ymax);
                //extent = {
                //    xmin: min.x,
                //    ymin: min.y,
                //    xmax: max.x,
                //    ymax: max.y
                //}
                extent = {
                    xmin: -267.8292339722584,
                    ymin: -42.6894387941716,
                    xmax: 69.67400000965551,
                    ymax: 78.5934151207882
                }
                if (min.x <= -180) {
                    //extent.xmin = extent.xmin - 360;
                }
                var NewExtent = webMercatorUtils.webMercatorToGeographic(this.view.extent);
                NewExtent.xmin;
            }
            var self = this;
            //extent = {
            //    xmax: 69.67399999995683,
            //    xmin: -267.82599999995347,
            //    ymax: 79.47304873453706,
            //    ymin: -45.67373489781221
            //};
            setTimeout(function () {
                windy.start(
                  [[0, 0], [self.view.width, self.view.height]],
                  self.view.width,
                  self.view.height,
                  [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]]
                );
            }, 500);
        }
    });
});
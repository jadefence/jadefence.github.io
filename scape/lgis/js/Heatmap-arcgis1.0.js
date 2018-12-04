define([
    "dojo/_base/array",
    './Custom',
    './heatmap',
    
], function (_,Custom) {
    'use strict';

    var Heatmap = Custom.createSubclass({
        declaredClass: "esri.custom._Heatmap",
        normalizeCtorArgs: function (view, options) {
            this.mapView = view;
            this.options = options || {};
            // if (options.source) {
            //     this.initHeatmap(options.source);
            // }
            //document.getElementById();
            this._registerEvents();
        },
        _registerEvents: function () {
            var me = this;
            this.mapView.watch('updating', this.debounce(function (newValue) {
                if (!newValue && me.currSource) {
                    console.log(333)
                    setTimeout(function () {
                        me.generate(me.currSource);
                    }, 100);
                }
            }, 0));
        },
        generate: function (source) {
            this.currSource = source;
            var div = document.createElement('div');
            div.id = this.el = 'heatmap-div';
            document.body.appendChild(div);
            this._resizeCanvas();
            var config = dojo.mixin({
                //"radius": 30,
                "element": this.el,
                "visible": true,
                // "opacity": 50,
                // "gradient": {
                //     0.45: "rgb(0,0,255)",
                //     0.55: "rgb(0,255,255)",
                //     0.65: "rgb(0,255,0)",
                //     0.90: "yellow", 1.0: "rgb(255,0,0)"
                // }
            },this.options);

            var heatmap = heatmapFactory.create(config);
            var me = this;

            var data = _.map(source.datas, function (d) {
                var sPoint = me.mapView.toScreen(d.mapPoint);
                return {
                    x: sPoint.x,
                    y: sPoint.y,
                    count: d.value
                }
            });
            var max = source.maxValue;
            heatmap.store.setDataSet({ max: max, data: data });
            var canvas = dojo.query('#' + this.el + ' canvas')[0];
            var mapCanvas = dojo.query('.esri-display-object')[0];
            var drx = mapCanvas.getContext("2d");
            drx.drawImage(canvas, 0, 0);
            dojo.query('#' + me.el)[0].remove();
        },
        _resizeCanvas: function () {
            var canvas = document.getElementById(this.el);
            var viewDom = this.mapView.container;
            canvas.style.position = "absolute";
            canvas.style.left = viewDom.offsetLeft + 'px';
            canvas.style.top = viewDom.offsetTop + 'px';
            canvas.style.width = viewDom.offsetWidth + 'px';
            canvas.style.height = viewDom.offsetHeight + 'px';
        }
    });

    return Heatmap;
});
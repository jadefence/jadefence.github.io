define([
    "dojo/_base/array",
    './Custom',
    './heatmap',
    
], function (_, Custom, HeatMap) {
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
            this.event;
            this.container;
            this.Context;
        },
        _registerEvents: function () {
            var me = this;
            //this.mapView.watch('updating', this.debounce(function (newValue) {
            //    if (!newValue && me.currSource) {
            //        console.log(333)
            //        setTimeout(function () {
            //            me.generate(me.currSource);
            //        }, 100);
            //    }
            //}, 0));
            this.event = this.mapView.watch('stationary', function (newValue) {
                if (newValue && me.currSource) {
                    //console.log(newValue)
                    setTimeout(function () {
                        me.generate(me.currSource);
                    }, 500);
                } else {
                    if (me.container) me.container.remove();
                }
            });
        },
        generate: function (source) {
            if(this.container)this.container.remove();
            this.currSource = source;
            var div = document.createElement('div');
            div.id = this.el = 'heatmap-div';
            document.body.appendChild(div);
            this._resizeCanvas();
            var config = dojo.mixin({
                container: document.getElementById('heatmap-div'),
                //"radius": 20,
                "element": this.el,
                "visible": true,
                maxOpacity: .6,
                //"scaleRadius": true,
                //"useLocalExtrema": true,
                // "gradient": {
                //     0.45: "rgb(0,0,255)",
                //     0.55: "rgb(0,255,255)",
                //     0.65: "rgb(0,255,0)",
                //     0.90: "yellow", 1.0: "rgb(255,0,0)"
                // }
            },this.options);
            var heatmap = h337.create(config);
            var me = this;
            var max = 0;
            var data = _.map(source.datas, function (d) {
                var sPoint = me.mapView.toScreen(d.mapPoint);
                max = Math.max(max, d.value)+0.01;
                return {
                    x: sPoint.x,
                    y: sPoint.y,
                    value: d.value
                }
            });
            
            //heatmap.store.setDataSet({ max: max, data: data });
            data.push({ x: 1, y: 1, value: 0.0000000000000001 });
            //console.log(JSON.stringify({ max: max, data: data }));
            heatmap.setData({ max: max, data: data });
            debugger;
            var canvas = document.createElement('canvas');
            canvas.id = "lgis-heatmap";
            canvas.width = this.mapView.width;
            canvas.height = this.mapView.height;
            canvas.style.position = "absolute";
            this.mapView.container.firstChild.firstChild.appendChild(canvas);
            var drx = canvas.getContext("2d");
            var hcanvas = dojo.query('#' + this.el + ' canvas')[0];
            drx.drawImage(hcanvas, 0, 0);
            this.container = canvas;
            //var canvas = dojo.query('#' + this.el + ' canvas')[0];
            //var mapCanvas = dojo.query('.esri-display-object')[0];
            //var drx = mapCanvas.getContext("2d");
            //drx.drawImage(canvas, 0, 0);
            //this.container = canvas;

            this.Context = drx;
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
        },
        clear: function () {
            //var canvas = document.getElementById(this.el);
            //this.container.canvas.parentNode.removeChild(this.container.canvas);
            //this.container.canvas.clearRect(0, 0, this.container.canvas.width, this.container.canvas.height);
            this.event.remove();
            //if (this.Context)
            //    this.Context.clearRect(0, 0, this.container.width, this.container.height);
            if (this.container) {
                this.container.height = 0;
                this.container.remove();
            }
        }
    });

    return Heatmap;
});
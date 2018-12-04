define([
    "./Custom",
    "./Draw",
    "esri/geometry/geometryEngine",
    "esri/symbols/TextSymbol",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/support/jsonUtils",
    "dojo/dom-construct"
], function (Custom, Draw, geometryEngine, TextSymbol, Graphic,
    GraphicsLayer, FeatureLayer, SimpleMarkerSymbol, rendererJsonUtils, domConstruct) {
    'use strict';

    var tools = {
        AREA: 'area',
        LENGTH: 'length',
        LOCATION: 'location'
    };
    var _tpl = dojo.string.substitute;

    var resultTemplate = '<div class="result-div" data-randomid="${randomId}" data-mapx="${mapx}" data-mapy="${mapy}" style="position:absolute;left:${screenx}px;top:${screeny}px;border: 1px solid #FF0103;padding: 4px;background:#fff;font-size:14px;"><span style="font-weight:700;color:#ff6319">${result}</span> ${unit}</div>';
    var clearTemplate = '<div id="clear-${randomId}" data-left-offset="${leftOffset}" data-mapx="${mapx}" data-mapy="${mapy}" data-randomid="${randomId}" class="clear-div" title="清除此次测量" style="cursor:pointer;font-family: cursive;border: 1px solid red;height: 12px;display: inline-block;width: 12px;line-height: 8px;font-weight: bolder;color: red;text-align: center;position:absolute;left:${left}px;top:${top}px">x</div>'

    var Measure = Custom.createSubclass({
        declaredClass: "esri.custom._RemoteLegend",
        normalizeCtorArgs: function (view, options) {
            var me = this;
            options || (options = {});
            options.coordinates || (options.coordinates = 'projected'); // 投影坐标系和地理坐标系计算方式不一样 geodesic
            this._options = options;
            this._mapView = view;

            this._mapView.watch('extent', this.debounce(function () {
                me._calResultDiv();
            }, 0));

            this._initDraw(); // 初始化绘图工具
            this._tempGraphicLayer = new GraphicsLayer(); // 绘制时的图层
            this._mapView.map.add(this._tempGraphicLayer);
            this._drawNodeGraphicLayer = new GraphicsLayer(); // 绘制时拐点图层
            this._mapView.map.add(this._drawNodeGraphicLayer);
            this._resultLabelGraphicLayer = new GraphicsLayer(); // 结果标签图层
            this._mapView.map.add(this._resultLabelGraphicLayer);
            this._clearResultGraphicLayer = new GraphicsLayer(); //清除标志图层
            this._mapView.map.add(this._clearResultGraphicLayer);
        },
        _getUnitCh: function () {
            return this._customUnit || this.unitCh[this._unit];
        },
        _initDraw: function () {
            var me = this;
            this._draw = new Draw(this._mapView);
            this._draw.watch('end', function (geometry) {
                me._measure(geometry);
            });
            this._draw.watch('pointermove', function (graphic) {
                var result = me._measure(graphic.geometry);
                me._draw._setTooltipMsg(result + me._getUnitCh());
            });
            this._draw.watch('click', function (graphic) {
                var result = me._measure(graphic.geometry);
                if (result) {
                    me._toolname === tools.AREA && me._clearCurrentResultDivs(); // 如果是面积测量则清除上一次的测量结果
                    me._createResultDiv(result, graphic.mapPoint); // 添加测量结果信息div
                }
                me._createDrawNode(graphic.mapPoint); // 绘制拐点
            });
            this._draw.watch('end', function (graphic) {
                var result = me._measure(graphic.geometry);
                if (result) {
                    me._toolname === tools.AREA && me._clearCurrentResultDivs();
                    me._createResultDiv(result, graphic.mapPoint);
                }
                graphic.attributes = dojo.mixin(graphic.attributes, {
                    randomId: me._currentRandomId
                });
                me._tempGraphicLayer.add(graphic);
                me._createDrawNode(graphic.mapPoint);
                me._createClearDiv(graphic); // 创建清除测量按钮
                me._draw.deactivate();
            });
            dojo.query(this._mapView.container).on('keyup', function (e) {
                return;
                event.stopPropagation();
                if (e.keyCode === 27) {
                    me.deactivate();
                }
            })
        },
        unitCh: {
            'square-meters': '平方米',
            'meters': '米'
        },
        _createClearDiv: function (g) {
            if (!g.mapPoint) g.mapPoint = g.geometry;
            this._createClearLayer(g);
            return;
            var screen = this._mapView.toScreen(g.mapPoint);
            var me = this;
            var lastTwoPoints = []; // 测量完成后geometry得最后两个点
            switch (g.geometry.type) {
                case 'polygon':
                    var lastRing = this.last(g.geometry.rings);
                    if (lastRing && lastRing.length > 2) {
                        lastTwoPoints = [lastRing[lastRing.length - 1], lastRing[lastRing.length - 2]];
                    }
                    break;
                case 'polyline':
                    var lastPath = this.last(g.geometry.paths);
                    if (lastPath && lastPath.length >= 2) {
                        lastTwoPoints = [lastPath[lastPath.length - 1], lastPath[lastPath.length - 2]];
                    }
                    break;
            }
            var pixel = 10;
            if (lastTwoPoints.length === 2) { // 根据最后两个点的连线计算清除按钮放置点的左边还是右边
                if (lastTwoPoints[0][0] >= lastTwoPoints[1][0]) {
                    pixel = 10;
                } else {
                    pixel = -20;
                }
            }
            var html = _tpl(clearTemplate, {
                left: screen.x + pixel,
                top: screen.y - 7,
                randomId: this._currentRandomId,
                mapx: g.mapPoint.x,
                mapy: g.mapPoint.y,
                leftOffset: pixel
            });
            dojo.query(this._mapView.container).query('.esri-view-root').addContent(html);
            // 清除测量结果的点击事件，
            var handler = dojo.query('#clear-' + this._currentRandomId).on('click', function (event) {
                me._clearMeasureResult(event);
                handler[0].remove(); // 清除后移除该事件
            });
        },
        _clearMeasureResult: function (randomId) {
            var me = this;
            //var randomId = dojo.query(event.currentTarget).attr('data-randomid')[0];
            //dojo.query('[data-randomid="' + randomId + '"]').forEach(function (node) { // 移除添加的结果呈现div
            //    domConstruct.destroy(node);
            //});
            this._tempGraphicLayer.removeMany(dojo.filter(this._tempGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
            this._drawNodeGraphicLayer.removeMany(dojo.filter(this._drawNodeGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
            this._resultLabelGraphicLayer.removeMany(dojo.filter(this._resultLabelGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
            this._clearResultGraphicLayer.removeMany(dojo.filter(this._clearResultGraphicLayer.graphics.items, function (g) {
                return g.attributes['randomId'] == randomId;
            }));
            debugger;
            this._draw["clearItem"](randomId);
        },
        _createClearLayer: function (g) { 
            var graphic = new Graphic({
                geometry: g.mapPoint,
                symbol: new SimpleMarkerSymbol({
                    style: "x",
                    color: [255, 0, 0],
                    size: "6",
                    xoffset: 10, 
                    outline: {
                        color: [255, 0, 0],
                        width: 2
                    }
                }),
                attributes: {
                    randomId: this._currentRandomId
                }
            });
            this._clearResultGraphicLayer.add(graphic);

            var me = this;
            this._mapView.on("click", function (event) {
                var screenPoint = {
                    x: event.x,
                    y: event.y
                }; 
                me._mapView.hitTest(screenPoint).then(function (response) {
                    debugger;
                    if (response.results[0].graphic) {
                        var randomId = response.results[0].graphic.attributes["randomId"];
                        me._clearMeasureResult(randomId);
                    }
                });
            }); 
             
        },
        _createDrawNode: function (mapPoint) { // 创建节点
            var g = new Graphic({
                geometry: mapPoint,
                symbol: new SimpleMarkerSymbol({
                    style: "circle",
                    color: "white",
                    size: "6px",
                    outline: {
                        color: [255, 0, 0],
                        width: 2
                    }
                }),
                attributes: {
                    randomId: this._currentRandomId
                }
            });
            this._drawNodeGraphicLayer.add(g);
        },
        _clearCurrentResultDivs: function () { // 清除面积测量时的临时结果
            var me = this;
            dojo.query('.result-div').forEach(function (node) {
                if (dojo.query(node).attr('data-randomid')[0] == me._currentRandomId) {
                    domConstruct.destroy(node);
                }
            });
        },
        _createResultDiv: function (result, mapPoint) { // 创建结果div
            this._createResultLabel(result, mapPoint);
            return;
            var screen = this._mapView.toScreen(mapPoint);
            var html = _tpl(resultTemplate, {
                result: result,
                unit: this._getUnitCh(),
                screenx: screen.x - 5,
                screeny: screen.y + 10,
                mapx: mapPoint.x,
                mapy: mapPoint.y,
                randomId: this._currentRandomId
            });
            dojo.query(this._mapView.container).query('.esri-view-root').addContent(html);
        },
        _createResultLabel: function (result, mapPoint) { 
            var graphic = new Graphic({
                geometry: mapPoint,
                symbol: {
                    type: "text",
                    color: "red",
                    haloColor: "black",
                    haloSize: "1px",
                    text: result + this._getUnitCh(),
                    xoffset: 20,
                    yoffset: -20,
                    font: { // autocast as Font
                        size: 12,
                        family: "sans-serif"
                    }
                },
                attributes: {
                    randomId: this._currentRandomId
                }
            });
            this._resultLabelGraphicLayer.add(graphic);
        },
        _calResultDiv: function () { // 计算结果div对应到mapPoint时的位置
            var me = this;
            var nodes = dojo.query('.result-div').forEach(function (node) {
                var mapx = dojo.query(node).attr('data-mapx')[0];
                var mapy = dojo.query(node).attr('data-mapy')[0];
                var screen = me._mapView.toScreen({
                    x: parseFloat(mapx), y: parseFloat(mapy)
                });
                node.style.left = (screen.x - 5) + 'px';
                node.style.top = (screen.y + 10) + 'px';
            });
            dojo.query('.clear-div').forEach(function (node) {
                var dnode = dojo.query(node);
                var mapx = dnode.attr('data-mapx')[0];
                var mapy = dnode.attr('data-mapy')[0];
                var leftOffset = dnode.attr('data-left-offset');
                var screen = me._mapView.toScreen({
                    x: parseFloat(mapx), y: parseFloat(mapy)
                });
                node.style.left = (screen.x + parseFloat(leftOffset)) + 'px';
                node.style.top = (screen.y - 7) + 'px';
            });
        },
        activate: function (name, params) {
            this._toolname = name;
            params || (params = {});
            this._unit = params.unit;
            this._parseResult = params.parseResult; // 结果转换方法
            this._customUnit = params.customUnit; // 自定义单位名称
            this._decimal = params.decimal; // 保留小数位数
            switch (name) {
                case tools.AREA:
                    this._draw.activate(Draw.TYPE.POLYGON); break;
                case tools.LENGTH:
                    this._draw.activate(Draw.TYPE.POLYLINE); break;
                case tools.LOCATION:
                    this._draw.activate(Draw.TYPE.POINT); break;
            };
            this._currentRandomId = (new Date()).valueOf();
        },
        deactivate: function () {
            dojo.query('.result-div').forEach(function (node) {
                domConstruct.destroy(node);
            });
            dojo.query('.clear-div').forEach(function (node) {
                domConstruct.destroy(node);
            });
            this._tempGraphicLayer.removeAll();
            this._drawNodeGraphicLayer.removeAll();
            this._draw.deactivate();
        },
        _measure: function (geometry) {
            var result;
            if (!geometry) {
                return;
            }
            switch (this._toolname) {
                case tools.AREA:
                    if (geometry.type === 'polygon') {
                        this._unit || (this._unit = 'square-meters');
                        if (this._options.coordinates === 'projected') {
                            result = geometryEngine.planarArea(geometry, this._unit);
                        } else {
                            result = geometryEngine.geodesicArea(geometry, this._unit);
                        }
                        result = Math.abs(result);
                        break;
                    }
                case tools.LENGTH:
                    if (geometry.type === 'polyline') {
                        this._unit || (this._unit = 'meters');
                        if (this._options.coordinates === 'projected') {
                            result = geometryEngine.planarLength(geometry, this._unit);
                        } else {
                            result = geometryEngine.geodesicLength(geometry, this._unit);
                        }
                        result = Math.abs(result);
                        break;
                    }
            };

            if (this._parseResult) {
                result = this._parseResult(result);
            }
            if (this._decimal) { // 测量结果的小数保留
                var num = Math.pow(10, this._decimal);
                result = Math.round(result * num) / num;
            }
            return result;
        }
    });

    Measure.TOOLS = tools;

    return Measure;

});
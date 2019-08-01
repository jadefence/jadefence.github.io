//默认配置项
var lgis_API = "https://js.arcgis.com/4.5/";
var LGIS_Host = "http://172.16.12.20:8003/lgis/";

//动态设置配置项
var lgis_host = window.location.host;
var lgis_domain = document.domain;
var lgis_jsUrl = lgis_getMySrc();
var geometryService = "";
if (lgis_jsUrl.indexOf("172.16") > -1 || lgis_domain.indexOf("localhost") > -1) {
    lgis_API = "http://172.16.12.172:4057/arcgis_js_v322_api/"
    geometryService = "http://172.16.12.172:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
}
else {
    lgis_API = "http://61.50.135.114:4057/arcgis_js_v322_api/"
    geometryService = "http://61.50.135.114:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
}

//if (lgis_domain.indexOf("localhost") > -1) {
//    debugger;
//}
//else if (lgis_domain.indexOf("172.16") > -1)
//    lgis_API = "http://172.16.12.172:4057/arcgis_js_v322_api/"
//else
//    lgis_API = "http://61.50.135.114:4057/arcgis_js_v322_api/"

//获取引用页面地址
var js = document.scripts;
js = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"));
var lgis_PagePath = js.substring(0, js.lastIndexOf("/") + 1);

//加载 arcgis_js_API
loadExtentFile(lgis_API + "esri/css/esri.css", "css");
loadExtentFile(lgis_API + "dijit/themes/tundra/tundra.css", "css");
loadExtentFile(lgis_API, "js");
loadExtentFile(lgis_PagePath + "lgis/css/popup.css", "css");

var dojoConfig = {
    async: true,
    packages: [{
        "name": "lgis",
        "location": lgis_PagePath + "lgis/js"
    },
    {
        name: "bootstrap",
        location: "http://localhost/lgis/lgis/js/dist/vendor/dojo-bootstrap"
    },
        {
            name: "calcite-maps",
            location: "http://localhost/lgis/lgis/js/dist/js/dojo"
        }
    ]
};

//配置结束
function Lgis() {
    this.InitMap = InitMap;
    this.SwitchBaseMap = SwitchBaseMap;
    this.AddPoints = AddPoints;
    this.AddPolylines = AddPolylines;
    this.AddPolygons = AddPolygons;
    this.AddLayer = AddLayer;
    this.AddMapChart = AddMapChart;
    this.MapClear = MapClear;
    this.LayerClear = LayerClear;
    this.LayerEdit = LayerEdit;
    this.SetLayerScale = SetLayerScale;
    this.SetLayerVisible = SetLayerVisible;
    this.GetLayerVisible = GetLayerVisible;
    this.MapDraw = MapDraw;
    this.CreateBuffer = CreateBuffer;
    this.CreateCircle = CreateCircle;
    this.isInsidePolygon = isInsidePolygon;
    this.InitEdit = InitEdit;
    this.RemoveEdit = RemoveEdit;
    this.SetScalebar = SetScalebar;
    this.SetOverviewMap = SetOverviewMap;
    this.SetLegend = SetLegend;
    this.SetHomeButton = SetHomeButton;
    //this.MoveCarOnMap = MoveCarOnMap;
    this.GetGraphicByAtr = GetGraphicByAtr;
    this.Orbit_Move = Orbit_Move;
    this.Orbit_Stop = Orbit_Stop;
    this.FlyTo = FlyTo;
    this.ShowInfo = ShowInfo;
    this.HideInfo = HideInfo;
    this.MapZoom = MapZoom;
    this.Measure = Measure;
    this.loadGPTool = loadGPTool;
    this.getGPresultData = getGPresultData;
    this.getGPresultImageLayer = getGPresultImageLayer;
    this.AddPicturePoints = AddPicturePoints;
    this.AddHeatMap = AddHeatMap;

    this.MapZoomToExent = MapZoomToExent;
    this.BindEvent = BindEvent;
    this.RemoveEvent = RemoveEvent;

    this.loadPanorama = loadPanorama;
    this.linkSkyline = linkSkyline;
    this.stoplinkSkyline = stoplinkSkyline;

    this.lonlat2mercator = lonlat2mercator;
    this.mercator2lonlat = mercator2lonlat;
    this.FactoryClass = FactoryClass;
    this.AddWaterPolygons = AddWaterPolygons;


    //公共变量
    var map;
    var showTextLayer;
    var tb;
    var bufferLayer;
    var baseMaps = [];
    //var geometryService = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
    var geometryService = "http://172.16.12.20:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
    var layerEdits = [];
    var mapEvents = [];
    this.app = {
        center: [119, 40],
        scale: 50000001,
        basemap: "topo",
        mapcontainer: "map",
    };
    var _this = this;


    //地图初始化
    function InitMap(ParaJson, callback) {
        require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/InfoTemplate", "esri/graphic",
            "lgis/GoogleLayer", "lgis/TdtLayer", "lgis/BaiduLayer", "lgis/SuperLayer", "esri/geometry/Extent",
            "dojo/domReady!"],
            function (Map, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, GraphicsLayer, FeatureLayer,
                Point, SimpleMarkerSymbol, Color, InfoTemplate, Graphic,
                GoogleLayer, TdtLayer, BaiduLayer,SuperLayer, Extent) {
                objectMerge(_this.app, ParaJson);
                //dojo.addClass("map", "tundra");
                map = new Map(_this.app.mapcontainer, {
                    logo: false,
                    sliderStyle: "large",
                    smartNavigation: false,
                    center: _this.app.center,
                    //sliderLabels: ["1","2","3"],
                    //showPanArrows: true,
                    //nav: false, //不显示8个方向的按钮
                    //ShowZoomSlider: true,
                    //autoResize: true,
                    //fadeOnZoom: true
                });

                map.setMapCursor("pointer")

                if (_this.app.basemaps) {
                    for (var i = 0; i < _this.app.basemaps.length; i++) {
                        baseMaps.push(_this.app.basemaps[i].layerId);
                        var baselayer;
                        if (_this.app.basemaps[i].layerType) {
                            if (_this.app.basemaps[i].layerType.indexOf("google") > -1) {
                                baselayer = new GoogleLayer(_this.app.basemaps[i].layerUrl, { id: _this.app.basemaps[i].layerId, opacity: _this.app.basemaps[i].opacity });
                            }
                            else if (_this.app.basemaps[i].layerUrl.indexOf("tianditu") > -1) {
                                baselayer = new TdtLayer(_this.app.basemaps[i].layerUrl, { id: _this.app.basemaps[i].layerId, opacity: _this.app.basemaps[i].opacity });
                            }
                            else if (_this.app.basemaps[i].layerType.indexOf("baidu") > -1) {
                                baselayer = new BaiduLayer(_this.app.basemaps[i].layerUrl, { id: _this.app.basemaps[i].layerId, opacity: _this.app.basemaps[i].opacity });
                            }
                            else if (_this.app.basemaps[i].layerUrl.indexOf("iserver") > -1 || _this.app.basemaps[i].layerType.indexOf("supermap") > -1) {
                                baselayer = new SuperLayer(_this.app.basemaps[i].layerUrl, { id: _this.app.basemaps[i].layerId, opacity: _this.app.basemaps[i].opacity });
                            }
                            else {
                                if (_this.app.basemaps[i].layerUrl.indexOf("http") != -1)
                                    baselayer = new ArcGISTiledMapServiceLayer(_this.app.basemaps[i].layerUrl, { id: _this.app.basemaps[i].layerId, opacity: _this.app.basemaps[i].opacity });
                                else
                                    map.setBasemap(_this.app.basemaps[i].layerUrl);
                                //map.centerAt(new Point(_this.app.center.x, _this.app.center.y));
                                //map.setZoom(_this.app.zoom);
                            }
                        }
                        if (baselayer) {
                            //if (_this.app.basemaps[i].visible) baselayer.show(); else baselayer.hide();
                            map.addLayer(baselayer);
                            callback();
                        }
                        //if (_this.app.basemaps[i].layerUrl.indexOf("http") != -1) {
                        //    if (_this.app.basemaps[i].visible) baselayer.show(); else baselayer.hide();
                        //    map.addLayer(baselayer);
                        //}

                    }
                }
                else {
                    map.setBasemap(_this.app.basemap);
                }
                if (_this.app.zoom) map.setZoom(_this.app.zoom);
                if (_this.app.scale) map.setScale(_this.app.scale);
                if (_this.app.extent) {
                    var extent = new Extent(_this.app.extent[0], _this.app.extent[1], _this.app.extent[2], _this.app.extent[3]);
                    map.setExtent(extent);
                }
                map.on("load", function () {
                    callback();
                })
                //map.on("mouse-move", function (e) {
                //    e;
                //})
                if (_this.app.event) {
                    if (_this.app.event.mouseClick) {
                        map.on("click", function (e) {
                            window[_this.app.event.mouseClick](e);
                        });
                    }
                }
                showTextLayer = new GraphicsLayer();
                map.addLayer(showTextLayer);

            });
    };

    //切换底图
    function SwitchBaseMap(layerId) {
        require(["esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/layers/layer",
            "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/InfoTemplate", "esri/graphic", "dojo/domReady!"],
            function (Map, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, GraphicsLayer, FeatureLayer, Layer, Point, SimpleMarkerSymbol, Color, InfoTemplate, Graphic) {
                var layer = map.getLayer(layerId);
                if (layer != undefined) {
                    for (var i = 0; i < baseMaps.length; i++) {
                        var l = map.getLayer(baseMaps[i]);
                        l.hide()
                    }
                    layer.show();
                    layer.visible = true;
                }
                else {
                    map.removeAllLayers();
                    if (layerId.indexOf("http") != -1) {
                        var basemap = new ArcGISTiledMapServiceLayer(layerId);
                        map.addLayers([basemap]);
                    }
                    else
                        map.setBasemap(layerId);
                }
            });
    }

    //添加点,需指定图层名、点集、样式
    function AddPoints(layerId, PraJson, callback) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/renderers/ClassBreaksRenderer", "esri/renderers/HeatmapRenderer",
            "esri/dijit/InfoWindow", "dojo/query",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer, InfoWindow, query,
                domConstruct) {
                //参数初始化
                var graphicsJson = PraJson.gra;
                var renderJson = PraJson.map.symbol;
                var eventJson = PraJson.event;
                var isZoomMultiple = PraJson.zoom;
                if (map == null) return;
                //创建图层
                var graphicsLayer;
                var showInfo, showTooltip, showAny;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);
                }
                else {
                    graphicsLayer = new GraphicsLayer({ id: layerId });
                    map.addLayer(graphicsLayer, 100);
                }
                //添加点
                for (var i = 0; i < graphicsJson.length; i++) {
                    var graphic = new Graphic(graphicsJson[i]);
                    graphicsLayer.add(graphic);
                    if (graphic.infoTemplate) showInfo = true;
                    if (graphic.attributes) {
                        if (graphic.attributes["Tooltip"] || graphic.attributes["tooltip"]) {
                            if (graphic.attributes["Tooltip"] == "false" || graphic.attributes["tooltip"] == "false") {
                                showTooltip = false;
                                showAny = true;
                            }
                            else
                                showTooltip = true;
                        }
                    }
                }
                if (showAny) showInfo = false;

                //设置点位通用弹出框模板
                if (PraJson.popTemple) graphicsLayer.infoTemplate = new InfoTemplate(PraJson.popTemple);

                //样式渲染
                var renderer;
                if (renderJson.type == "uniqueValue")
                    renderer = new UniqueValueRenderer(renderJson);
                else if (renderJson.type == "simple") {
                    renderer = new SimpleRenderer(renderJson);
                    if (renderer.symbol.path)
                        renderer.symbol.setPath(renderer.symbol.path);
                } else if (renderJson.type == "ClassBreaks") {
                    renderer = new ClassBreaksRenderer(renderJson);
                } else if (renderJson.type == "heatmap") {
                    //delete renderJson.type;
                    renderer = new HeatmapRenderer({
                        field: "pop",
                        blurRadius: 10,
                        maxPixelIntensity: 100,
                        minPixelIntensity: 1
                    });
                    renderer.blurRadius = 10;
                    renderer.maxPixelIntensity = 100;
                    renderer.minPixelIntensity = 1;
                }
                if (renderJson.sizeInfo) renderer.setSizeInfo(renderJson.sizeInfo);
                graphicsLayer.setRenderer(renderer);
                graphicsLayer.redraw();

                //事件绑定
                if (eventJson) {
                    if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
                        window[eventJson.mouseClick](e);
                    });
                    if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
                        window[eventJson.mousedbClick](e);
                    });
                    if (eventJson.onload) {
                        window[eventJson.onload]();
                    };
                }

                graphicsLayer.on("mouse-over", function (e) {
                    if (showTooltip) {
                        mouseOverLayer(e);
                    }
                    else if (showInfo) {
                        map.infoWindow.setTitle(e.graphic.getTitle());
                        map.infoWindow.setContent(e.graphic.getContent());
                        map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                    }
                    if (eventJson) {
                        if (eventJson.mouseOver) window[eventJson.mouseOver](e);
                    }
                });
                graphicsLayer.on("mouse-out", function (e) {
                    if (showTooltip) {
                        mouseOutLayer(e)
                    }
                    //mouseOutLayer(e)
                    //map.infoWindow.hide();
                });
                //设置缩放
                if (isZoomMultiple) {
                    if (graphicsLayer.graphics.length > 1) {
                        var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
                        map.setExtent(layerExtent.expand(isZoomMultiple))
                        .then(function () {
                            if (callback)
                                callback();
                        });
                    }
                    else {
                        map.setZoom(isZoomMultiple);
                        var mapPoint = graphicsLayer.graphics[0].geometry;
                        map.centerAt(mapPoint)
                        .then(function () {
                            if (callback)
                                callback();
                        });;

                    }

                }
                else if (callback)
                    callback();

            });
    }

    //添加插值图片
    function AddPicturePoints(layerId, graphicsJson, renderJson, eventJson, mapExtent, mapLayerAlpha) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "esri/geometry/Extent", "esri/geometry/webMercatorUtils", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct, Extent, webMercatorUtils) {
                if (map == null) return;
                var graphicsLayer;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);
                }
                else {
                    graphicsLayer = new GraphicsLayer({ id: layerId });
                    map.addLayer(graphicsLayer);
                }



                var infoSymbol = new PictureMarkerSymbol(renderJson.symbol);//'lgis/img/AQI.png', 51, 51);

                // var extentValue = mapExtent.spli

                var xmax = mapExtent[2];// 117.553;
                var xmin = mapExtent[0];// 116.966;
                var ymax = mapExtent[3];// 29.225;
                var ymin = mapExtent[1];// 28.782;



                var xminPoint = new Point(xmin, ymin);
                var xmaxPoint = new Point(xmax, ymax);


                var webMmin = webMercatorUtils.geographicToWebMercator(xminPoint);
                var webMmax = webMercatorUtils.geographicToWebMercator(xmaxPoint);


                var xmax1 = webMmax.x;
                var xmin1 = webMmin.x;
                var ymax1 = webMmax.y;
                var ymin1 = webMmax.y;

                var pWidth;

                var pHeight;

                if (map.spatialReference.wkid == 4326) {


                    screenMinPoint = map.toScreen(xminPoint);//经纬转屏幕

                    screenMaxPoint = map.toScreen(xmaxPoint);//经纬转屏幕

                    var pWidth = Math.abs(screenMaxPoint.x - screenMinPoint.x);

                    var pHeight = Math.abs(screenMaxPoint.y - screenMinPoint.y);
                }
                else if (map.spatialReference.wkid == 4490) {


                    screenMinPoint = map.toScreen(xminPoint);//经纬转屏幕

                    screenMaxPoint = map.toScreen(xmaxPoint);//经纬转屏幕

                    var pWidth = Math.abs(screenMaxPoint.x - screenMinPoint.x);

                    var pHeight = Math.abs(screenMaxPoint.y - screenMinPoint.y);
                }
                else if (map.spatialReference.wkid == 102100) {

                    var zoomNumber = map.getZoom();

                    var mXminx = (xmin + 180) * (256 * Math.pow(2, zoomNumber)) / 360;

                    var mXmax = (xmax + 180) * (256 * Math.pow(2, zoomNumber)) / 360;


                    var siny = Math.sin(ymin * Math.PI / 180);
                    var y = Math.log((1 + siny) / (1 - siny));
                    var mYmin = (256 * Math.pow(2, zoomNumber)) * (1 - y / (2 * Math.PI));


                    var sinyMax = Math.sin(ymax * Math.PI / 180);
                    var yMax = Math.log((1 + sinyMax) / (1 - sinyMax));
                    var mYmax = (256 * Math.pow(2, zoomNumber)) * (1 - yMax / (2 * Math.PI));


                    //   pWidth = Math.abs(mXmax - mXminx);

                    //  pHeight = Math.abs(mYmax - mYmin);

                    pHeight = Math.abs(mXmax - mXminx);

                    pWidth = Math.abs(mYmax - mYmin);
                }


                // graphicsLayer.clear();
                graphicsLayer.opacity = mapLayerAlpha;

                infoSymbol.height = pHeight;
                infoSymbol.width = pWidth;




                //for (var i = 0; i < graphicsJson.length; i++) {
                //    var graphic = new Graphic(graphicsJson[i]);
                //    graphic.symbol = infoSymbol;
                //    graphicsLayer.add(graphic, infoSymbol);
                //    graphicsLayer.redraw();
                //}

                if (graphicsLayer != null && graphicsLayer.graphics != null && graphicsLayer.graphics.length > 0) {
                    var gra = graphicsLayer.graphics[0];
                    var gra = new Graphic(graphicsJson[i]);
                    gra.symbol = infoSymbol;
                    graphicsLayer.redraw();
                }
                else {
                    graphicsLayer.clear();
                    for (var i = 0; i < graphicsJson.length; i++) {
                        var graphic = new Graphic(graphicsJson[i]);
                        graphic.symbol = infoSymbol;
                        graphicsLayer.add(graphic, infoSymbol);

                    }

                }



                var mapExtentChange = map.on("extent-change", changeHandler);

                function changeHandler(evt) {
                    var xmax = mapExtent[2];// 117.553;
                    var xmin = mapExtent[0];// 116.966;
                    var ymax = mapExtent[3];// 29.225;
                    var ymin = mapExtent[1];// 28.782;

                    var xminPoint = new Point(xmin, ymin);

                    var xmaxPoint = new Point(xmax, ymax);



                    var webMmin = webMercatorUtils.geographicToWebMercator(xminPoint);

                    var webMmax = webMercatorUtils.geographicToWebMercator(xmaxPoint);



                    var xmax1 = webMmax.x;
                    var xmin1 = webMmin.x;
                    var ymax1 = webMmax.y;
                    var ymin1 = webMmax.y;


                    var pWidth;

                    var pHeight;

                    if (map.spatialReference.wkid == 4326) {


                        screenMinPoint = map.toScreen(xminPoint);//经纬转屏幕

                        screenMaxPoint = map.toScreen(xmaxPoint);//经纬转屏幕

                        var pWidth = Math.abs(screenMaxPoint.x - screenMinPoint.x);

                        var pHeight = Math.abs(screenMaxPoint.y - screenMinPoint.y);
                    }
                    else if (map.spatialReference.wkid == 4490) {


                        screenMinPoint = map.toScreen(xminPoint);//经纬转屏幕

                        screenMaxPoint = map.toScreen(xmaxPoint);//经纬转屏幕

                        var pWidth = Math.abs(screenMaxPoint.x - screenMinPoint.x);

                        var pHeight = Math.abs(screenMaxPoint.y - screenMinPoint.y);
                    }
                    else if (map.spatialReference.wkid == 102100) {

                        var zoomNumber = map.getZoom();

                        var mXminx = (xmin + 180) * (256 * Math.pow(2, zoomNumber)) / 360;

                        var mXmax = (xmax + 180) * (256 * Math.pow(2, zoomNumber)) / 360;


                        var siny = Math.sin(ymin * Math.PI / 180);
                        var y = Math.log((1 + siny) / (1 - siny));
                        var mYmin = (256 * Math.pow(2, zoomNumber)) * (1 - y / (2 * Math.PI));


                        var sinyMax = Math.sin(ymax * Math.PI / 180);
                        var yMax = Math.log((1 + sinyMax) / (1 - sinyMax));
                        var mYmax = (256 * Math.pow(2, zoomNumber)) * (1 - yMax / (2 * Math.PI));





                        pHeight = Math.abs(mXmax - mXminx);

                        pWidth = Math.abs(mYmax - mYmin);
                    }



                    infoSymbol.height = pHeight;
                    infoSymbol.width = pWidth;




                    if (graphicsLayer != null && graphicsLayer.graphics != null && graphicsLayer.graphics.length > 0) {
                        var gra = graphicsLayer.graphics[0];
                        var gra = new Graphic(graphicsJson[i]);
                        gra.symbol = infoSymbol;
                        graphicsLayer.redraw();
                    }
                    else {
                        graphicsLayer.clear();
                        for (var i = 0; i < graphicsJson.length; i++) {
                            var graphic = new Graphic(graphicsJson[i]);
                            graphic.symbol = infoSymbol;
                            graphicsLayer.add(graphic, infoSymbol);

                        }

                    }

                    //graphicsLayer.clear();

                    //for (var i = 0; i < graphicsJson.length; i++) {
                    //    var graphic = new Graphic(graphicsJson[i]);
                    //    graphic.symbol = infoSymbol;
                    //    graphicsLayer.add(graphic);
                    //}


                }

                if (mapExtent[4] == true) {
                    //  var extent1 = new Extent(xmin, ymin, xmax, ymax, map.spatialReference);// new SpatialReference({ wkid: 4326 }));
                    // map.setExtent(extent1.expand(1.5));
                    var extent1;
                    if (map.spatialReference.wkid == 4326) {
                        extent1 = new Extent(xmin, ymin, xmax, ymax, map.spatialReference);
                        //   extent1 = new Extent(webMmin.x, webMmin.y, webMmax.x, webMmax.y, map.spatialReference);//
                    }
                    if (map.spatialReference.wkid == 4490) {
                        extent1 = new Extent(xmin, ymin, xmax, ymax, map.spatialReference);
                        //   extent1 = new Extent(webMmin.x, webMmin.y, webMmax.x, webMmax.y, map.spatialReference);//
                    }
                    else if (map.spatialReference.wkid == 102100) {
                        extent1 = new Extent(webMmin.x, webMmin.y, webMmax.x, webMmax.y, map.spatialReference);//
                    }

                    map.setExtent(extent1.expand(1.5));
                }
            });
    }

    //添加热力图,需指定图层名、点集、样式
    function AddHeatMap(layerId, graphicsJson, renderJson, eventJson, isZoomMultiple, layerDefinition) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/renderers/ClassBreaksRenderer", "esri/renderers/HeatmapRenderer",
            "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                var graphicsLayer;
                var showInfo, showTooltip;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);
                }
                else {
                    var featureCollection = {
                        layerDefinition: layerDefinition
                    };
                    graphicsLayer = new FeatureLayer(featureCollection, { id: layerId });
                    map.addLayer(graphicsLayer, 100);
                }
                for (var i = 0; i < graphicsJson.length; i++) {
                    var graphic = new Graphic(graphicsJson[i]);
                    graphicsLayer.add(graphic);
                    if (graphic.infoTemplate) showInfo = true;
                    if (graphic.attributes["Tooltip"]) showTooltip = true;
                }
                //样式渲染
                var renderer;
                if (renderJson.type == "uniqueValue")
                    renderer = new UniqueValueRenderer(renderJson);
                else if (renderJson.type == "simple") {
                    renderer = new SimpleRenderer(renderJson);
                    if (renderer.symbol.path)
                        renderer.symbol.setPath(renderer.symbol.path);
                } else if (renderJson.type == "ClassBreaks") {
                    renderer = new ClassBreaksRenderer(renderJson);
                } else if (renderJson.type == "heatmap") {
                    renderer = new HeatmapRenderer(renderJson);
                }
                if (renderJson.sizeInfo) renderer.setSizeInfo(renderJson.sizeInfo);
                graphicsLayer.setRenderer(renderer);
                graphicsLayer.redraw();

                if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
                    window[eventJson.mouseClick](e);
                });
                if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
                    window[eventJson.mousedbClick](e);
                });
                graphicsLayer.on("mouse-over", function (e) {
                    if (showTooltip) {
                        mouseOverLayer(e);
                    }
                    else if (showInfo) {
                        map.infoWindow.setTitle(e.graphic.getTitle());
                        map.infoWindow.setContent(e.graphic.getContent());
                        map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                    }
                    if (eventJson.mouseOver) window[eventJson.mouseOver](e);
                });
                graphicsLayer.on("mouse-out", function (e) {
                    if (showTooltip) {
                        mouseOutLayer(e)
                    }
                    //mouseOutLayer(e)
                    //map.infoWindow.hide();
                });
                if (eventJson.onload) {
                    window[eventJson.onload]();
                };
                if (isZoomMultiple) {
                    var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
                    map.setExtent(layerExtent.expand(isZoomMultiple));
                }

            });
    }

    //添加面--new
    function AddWaterPolygons(layerId, graphicsJson, renderJson, eventJson, isZoomMultiple) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                var graphicsLayer;
                var showInfo, showTooltip, showAny;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);

                }
                else {
                    graphicsLayer = new GraphicsLayer({ id: layerId });
                    map.addLayer(graphicsLayer);
                }
                for (var i = 0; i < graphicsJson.length; i++) {
                    var graphic = new Graphic(graphicsJson[i]);

                    graphicsLayer.add(graphic);

                    if (graphic.attributes) {
                        if (graphic.attributes["Tooltip"] || graphic.attributes["tooltip"]) {
                            if (graphic.attributes["Tooltip"] == "false" || graphic.attributes["tooltip"] == "false") {
                                showTooltip = false;
                                showAny = true;
                            }
                            else
                                showTooltip = true;
                        }
                    }


                }

                if (showAny) showInfo = false;

                //样式渲染
                var renderer;
                if (renderJson.type == "uniqueValue")
                    renderer = new UniqueValueRenderer(renderJson);
                else if (renderJson.type == "simple")
                    renderer = new SimpleRenderer(renderJson);
                graphicsLayer.setRenderer(renderer);
                graphicsLayer.redraw();

                if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
                    window[eventJson.mouseClick](e);
                });
                if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
                    window[eventJson.mousedbClick](e);
                });
                if (eventJson.mouseOver) {
                    graphicsLayer.on("mouse-over", function (e) {


                        if (showTooltip) {
                            mouseOverLayer(e);
                        }
                        else if (showInfo) {
                            map.infoWindow.setTitle(e.graphic.getTitle());
                            map.infoWindow.setContent(e.graphic.getContent());
                            map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                        }
                        if (eventJson.mouseOver) window[eventJson.mouseOver](e);

                        //   map.infoWindow.setTitle(e.graphic.attributes["NAME"]);
                        // map.infoWindow.setContent(e.graphic.getContent());
                        // map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                        //  window[eventJson.mouseOver](e);
                    });

                    graphicsLayer.on("mouse-out", function (e) {
                        mouseOutLayer(e);
                        //  map.infoWindow.hide();
                    });
                }
                if (isZoomMultiple) {
                    var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
                    map.setExtent(layerExtent.expand(isZoomMultiple));
                }

                //graphicsLayer.on("mouse-over", function (e) {
                //    map.infoWindow.setTitle(e.graphic.getTitle());
                //    map.infoWindow.setContent(e.graphic.getContent());
                //    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                //});
                //graphicsLayer.on("mouse-out", function (e) {
                //    //mouseOutLayer(e)
                //    map.infoWindow.hide();
                //});

            });
    }

    ////添加面--new
    //function AddWaterPolygons(layerId, graphicsJson, renderJson, eventJson, isZoomMultiple) {
    //    require(["esri/map",
    //        "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
    //        "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
    //        "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
    //        "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
    //        "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
    //        "dojo/dom-construct", "dojo/domReady!"],
    //        function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
    //            SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
    //            Color, InfoWindowLite, InfoTemplate,
    //            SimpleRenderer, UniqueValueRenderer, InfoWindow,
    //            domConstruct) {
    //            if (map == null) return;
    //            var graphicsLayer;
    //            if (map.getLayer(layerId)) {
    //                graphicsLayer = map.getLayer(layerId);

    //            }
    //            else {
    //                graphicsLayer = new GraphicsLayer({ id: layerId });
    //                map.addLayer(graphicsLayer);
    //            }
    //            for (var i = 0; i < graphicsJson.length; i++) {
    //                var graphic = new Graphic(graphicsJson[i]);
    //                graphicsLayer.add(graphic);
    //            }

    //            //样式渲染
    //            var renderer;
    //            if (renderJson.type == "uniqueValue")
    //                renderer = new UniqueValueRenderer(renderJson);
    //            else if (renderJson.type == "simple")
    //                renderer = new SimpleRenderer(renderJson);
    //            graphicsLayer.setRenderer(renderer);
    //            graphicsLayer.redraw();

    //            if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
    //                window[eventJson.mouseClick](e);
    //            });
    //            if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
    //                window[eventJson.mousedbClick](e);
    //            });
    //            if (eventJson.mouseOver) {
    //                graphicsLayer.on("mouse-over", function (e) {

    //                    map.infoWindow.setTitle(e.graphic.attributes["NAME"]);
    //                   // map.infoWindow.setContent(e.graphic.getContent());
    //                    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
    //                  //  window[eventJson.mouseOver](e);
    //                });

    //                graphicsLayer.on("mouse-out", function (e) {

    //                    map.infoWindow.hide();
    //                });
    //            }
    //            if (isZoomMultiple) {
    //                var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
    //                map.setExtent(layerExtent.expand(isZoomMultiple));
    //            }

    //            //graphicsLayer.on("mouse-over", function (e) {
    //            //    map.infoWindow.setTitle(e.graphic.getTitle());
    //            //    map.infoWindow.setContent(e.graphic.getContent());
    //            //    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
    //            //});
    //            //graphicsLayer.on("mouse-out", function (e) {
    //            //    //mouseOutLayer(e)
    //            //    map.infoWindow.hide();
    //            //});

    //        });
    //}

    //添加线--new
    function AddPolylines(layerId, graphicsJson, renderJson, eventJson, isZoomMultiple) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                var graphicsLayer;
                var showInfo, showTooltip;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);

                }
                else {
                    graphicsLayer = new GraphicsLayer({ id: layerId });
                    map.addLayer(graphicsLayer);
                }
                for (var i = 0; i < graphicsJson.length; i++) {
                    var graphic = new Graphic(graphicsJson[i]);
                    graphicsLayer.add(graphic);
                    if (graphic.infoTemplate) showInfo = true;
                    if (graphic.attributes)
                        if (graphic.attributes["Tooltip"])
                            showTooltip = true;
                }

                //样式渲染
                var renderer;
                if (renderJson.type == "uniqueValue")
                    renderer = new UniqueValueRenderer(renderJson);

                else if (renderJson.type == "simple")
                    renderer = new SimpleRenderer(renderJson);
                graphicsLayer.setRenderer(renderer);
                graphicsLayer.redraw();

                if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
                    window[eventJson.mouseClick](e);
                });
                if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
                    window[eventJson.mousedbClick](e);
                });

                graphicsLayer.on("mouse-over", function (e) {
                    if (showTooltip) {
                        mouseOverLayer(e);
                    }
                    else if (showInfo) {
                        map.infoWindow.setTitle(e.graphic.getTitle());
                        map.infoWindow.setContent(e.graphic.getContent());
                        map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                    }
                    if (eventJson.mouseOver) window[eventJson.mouseOver](e);
                });
                graphicsLayer.on("mouse-out", function (e) {
                    if (showTooltip) {
                        mouseOutLayer(e)
                    }
                    //mouseOutLayer(e)
                    //map.infoWindow.hide();
                });
                if (isZoomMultiple) {
                    var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
                    map.setExtent(layerExtent.expand(isZoomMultiple));
                }

            });
    }

    //添加面
    function AddPolygons(layerId, graphicsJson, renderJson, eventJson, isZoomMultiple) {
        require(["esri/map",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                var graphicsLayer;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);

                }
                else {
                    graphicsLayer = new GraphicsLayer({ id: layerId });
                    map.addLayer(graphicsLayer);
                }
                for (var i = 0; i < graphicsJson.length; i++) {
                    var graphic = new Graphic(graphicsJson[i]);
                    graphicsLayer.add(graphic);
                }

                //样式渲染
                var renderer;
                if (renderJson.type == "uniqueValue")
                    renderer = new UniqueValueRenderer(renderJson);
                else if (renderJson.type == "simple")
                    renderer = new SimpleRenderer(renderJson);
                graphicsLayer.setRenderer(renderer);
                graphicsLayer.redraw();

                if (eventJson.mouseClick) graphicsLayer.on("click", function (e) {
                    window[eventJson.mouseClick](e);
                });
                if (eventJson.mousedbClick) graphicsLayer.on("dbl-click", function (e) {
                    window[eventJson.mousedbClick](e);
                });
                if (eventJson.mouseOver) graphicsLayer.on("mouse-over", function (e) {
                    window[eventJson.mouseOver](e);
                });
                if (eventJson.mouseOut) graphicsLayer.on("mouse-out", function (e) {
                    window[eventJson.mouseOut](e);
                });
                if (isZoomMultiple) {
                    var layerExtent = graphicsUtils.graphicsExtent(graphicsLayer.graphics);
                    map.setExtent(layerExtent.expand(isZoomMultiple));
                }

                //graphicsLayer.on("mouse-over", function (e) {
                //    map.infoWindow.setTitle(e.graphic.getTitle());
                //    map.infoWindow.setContent(e.graphic.getContent());
                //    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                //});
                //graphicsLayer.on("mouse-out", function (e) {
                //    //mouseOutLayer(e)
                //    map.infoWindow.hide();
                //});

            });
    }

    //定位到已存在的点
    function FlyTo(layerId, AttrName, Value, styleJson, ZoomTile, Replace) {
        require(["esri/map", "esri/layers/Layer",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, Layer, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                if (layerId == null) return;
                var graphicsLayer;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);
                }
                else
                    return;
                var targetPoint;
                for (var i = 0; i < graphicsLayer.graphics.length; i++) {
                    var graphic = graphicsLayer.graphics[i];
                    if (graphic.attributes[AttrName] == Value) {
                        var symbol;
                        if (styleJson) {
                            switch (styleJson.type) {
                                case "esriPMS":
                                    symbol = new PictureMarkerSymbol(styleJson);
                                    break;
                                case "esriSFS":
                                    symbol = new SimpleFillSymbol(styleJson);
                                    break;
                                default:

                            }
                            var targetgraphic = new Graphic(graphic.geometry, symbol);
                            if (graphic.attributes)
                                targetgraphic.attributes = graphic.attributes;
                            var gis_targetLayer;
                            if (map.getLayer("gis_targetLayer")) {
                                gis_targetLayer = map.getLayer("gis_targetLayer");
                                gis_targetLayer.clear();
                            }
                            else {
                                gis_targetLayer = new GraphicsLayer({ id: "gis_targetLayer" });
                                map.addLayer(gis_targetLayer);
                            }
                            if (graphicsLayer.infoTemplate)
                                gis_targetLayer.infoTemplate = graphicsLayer.infoTemplate;
                            gis_targetLayer.add(targetgraphic);
                            //隐藏原图形
                            if (Replace) {
                                graphic.hide();
                                graphicsLayer.redraw();
                                //debugger;
                                //var xy = map.toScreen(graphic.geometry);
                                //var images = document.getElementsByTagName('image');
                                //for (var i = 0; i < images.length; i++) {
                                //    if (images[i].x.animVal.valueInSpecifiedUnits == xy.x) {
                                //        images.style.display= "none";
                                //    }
                                //}
                            }
                        }
                        if (ZoomTile) {
                            map.setZoom(ZoomTile);
                            map.setExtent(graphicsUtils.graphicsExtent([graphic]));
                        }
                        if (Replace) {
                            gis_targetLayer.on("graphic-remove", function () {
                                graphic.show();
                            })
                            gis_targetLayer.on("graphics-clear", function () {
                                graphic.show();
                            })
                        }
                        return;
                    }
                }

            });
    }

    //定位到已存在的点
    function ShowInfo(layerId, AttrName, Value) {
        require(["esri/map", "esri/layers/Layer",
            "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
            "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
            "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
            "dojo/dom-construct", "dojo/domReady!"],
            function (Map, Layer, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, InfoWindowLite, InfoTemplate,
                SimpleRenderer, UniqueValueRenderer, InfoWindow,
                domConstruct) {
                if (map == null) return;
                if (layerId == null) return;
                var graphicsLayer;
                if (map.getLayer(layerId)) {
                    graphicsLayer = map.getLayer(layerId);
                }
                else
                    return;
                var targetPoint;
                for (var i = 0; i < graphicsLayer.graphics.length; i++) {
                    var graphic = graphicsLayer.graphics[i];
                    if (graphic.attributes[AttrName] == Value) {
                        //show
                        map.infoWindow.setTitle(graphic.getTitle());
                        map.infoWindow.setContent(graphic.getContent());
                        map.infoWindow.show(graphic.geometry, location, InfoWindow.ANCHOR_UPPERRIGHT);
                        return;
                    }
                }

            });
    }

    function HideInfo() {
        map.infoWindow.hide();
    }

    //加载图层
    function AddLayer(url, renderJson, isZoomMultiple) {
        require([
                "dojo/dom-construct",
                "esri/map",
                "esri/layers/FeatureLayer", "esri/geometry/Extent", "esri/InfoTemplate",
                "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/Color",
                "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/tasks/query",
                "dojo/domReady!"
        ], function (
                  domConstruct, Map, FeatureLayer, Extent,
                  InfoTemplate, SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol, Color, SimpleRenderer, UniqueValueRenderer, Query
                ) {
            var featureLayer = new FeatureLayer(url, {
                id: "world-regions"
            });

            var renderer;
            if (renderJson.type == "uniqueValue")
                renderer = new UniqueValueRenderer(renderJson);
            else if (renderJson.type == "simple") {
                renderer = new SimpleRenderer(renderJson);
                if (renderer.symbol.path)
                    renderer.symbol.setPath(renderer.symbol.path);
            } else if (renderJson.type == "ClassBreaks") {
                renderer = new ClassBreaksRenderer(renderJson);
            }
            if (renderJson.sizeInfo) renderer.setSizeInfo(renderJson.sizeInfo);
            featureLayer.setRenderer(renderer);
            //featureLayer.redraw();
            map.addLayer(featureLayer, 2);
            if (isZoomMultiple) {
                //map.setExtent(featureLayer.fullExtent);
                var query = new Query();
                query.where = "1=1";
                query.outFields = ["*"];
                query.returnGeometry = true;
                // Query for the features with the given object ID
                featureLayer.queryExtent(query,
                    function (e) {
                        var extent = new Extent(e.extent);
                        extent.spatialReference = { "wkid": 4326 };
                        map.setExtent(new Extent(extent.expand(isZoomMultiple)));
                    }, function (e) {
                    });
            }
        }
    )
    }

    //鼠标滑过
    var TooltipInfoWindow;
    function mouseOverLayer(event) {
        require(["esri/map", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
            "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol",
            "esri/Color", "esri/InfoTemplate", "esri/graphic", "lgis/BubblePopup",
            "dojo/dom", "dojo/dom-construct", "dojo/domReady!"],
            function (Map, GraphicsLayer, FeatureLayer, Point, SimpleMarkerSymbol, PictureMarkerSymbol, Color, InfoTemplate, Graphic, InfoWindow, dom, domConstruct) {
                map.setMapCursor("pointer");
                if (event.graphic == undefined) return;
                if (!event.graphic.attributes.Tooltip) return;
                //var font = new esri.symbol.Font();
                //font.setSize("10pt");
                //font.setFamily("微软雅黑");
                //var cpoint;
                //if (event.graphic.type == "polygon")
                //{
                //    cpoint = event.graphic.geometry.getCentroid();
                //}
                //else if (event.graphic.type == "point")
                //{
                //    cpoint = event.graphic.geometry;
                //}

                var cpoint = event.mapPoint;
                //var text = new esri.symbol.TextSymbol(event.graphic.attributes.Tooltip);
                //text.setFont(font);
                //text.setColor(new dojo.Color([0, 0, 0, 100]));
                //text.setOffset(20, -35);

                //var pmsTextBg = new PictureMarkerSymbol("../img/bd.jpg", 80, 20);
                //pmsTextBg.setOffset(20, -30);
                var textLength = event.graphic.attributes.Tooltip.length;
                //pmsTextBg.setWidth(textLength * 13.5 + 5);
                //var bgGraphic = new esri.Graphic(cpoint, pmsTextBg);
                //showTextLayer.add(bgGraphic);
                //var labelGraphic = new esri.Graphic(cpoint, text);
                //showTextLayer.add(labelGraphic);
                var pop = dojo.query(".dextra-bubble-pop");
                if (pop.length > 0)
                    pop.forEach(function (item, index, input) {
                        dojo.destroy(input[index]);
                    })

                TooltipInfoWindow = new InfoWindow();
                TooltipInfoWindow.setMap(map);
                //TooltipInfoWindow.resize(textLength * 13.5 + 5, 75);
                //TooltipInfoWindow.resize(150, 75);
                //TooltipInfoWindow.__mcoords = cpoint;
                //TooltipInfoWindow.setTitle(event.graphic.attributes.Tooltip);
                TooltipInfoWindow.setContent(event.graphic.attributes.Tooltip);
                TooltipInfoWindow.show(cpoint);
            })
    };
    //鼠标滑出
    function mouseOutLayer() {
        if (TooltipInfoWindow) {
            TooltipInfoWindow.hide();
            TooltipInfoWindow.destroy();
            var pops = document.getElementsByClassName("dextra-bubble-pop");
            for (var i = 0; i < pops.length; i++) {
                pops[i].style.display = 'none';
            }
        }
        //map.graphics.clear();
        //showTextLayer.clear();
        map.setMapCursor("default");
    }

    //地图绘制
    function MapDraw(ParaJson, callback) {
        require([
                "esri/map", "esri/toolbars/draw", "lgis/DrawEx", "lgis/DrawExt",
                "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
                "esri/symbols/SimpleFillSymbol", "esri/symbols/CartographicLineSymbol",
                "esri/graphic",
                "esri/Color", "dojo/dom", "dojo/on", "dojo/domReady!"
        ], function (
                Map, Draw, DrawEx, DrawExt,
                PictureMarkerSymbol, SimpleMarkerSymbol, SimpleLineSymbol,
                SimpleFillSymbol, CartographicLineSymbol,
                Graphic,
                Color, dom, on
              ) {
            if (tb) return;
            var tool = ParaJson.type;
            var display = ParaJson.display;
            var styleJson = ParaJson.symbol;
            var styleSymbol;
            if (styleJson) {
                switch (styleJson.type) {
                    case "esriSMS":
                        styleSymbol = new SimpleMarkerSymbol(styleJson);
                        break;
                    case "esriPMS":
                        styleSymbol = new PictureMarkerSymbol(styleJson);
                        break;
                    case "esriSLS":
                        styleSymbol = new SimpleLineSymbol(styleJson);
                        break;
                    case "esriSFS":
                        styleSymbol = new SimpleFillSymbol(styleJson);
                        break;
                }
            }
            var markerSymbol = new SimpleMarkerSymbol();
            markerSymbol.setPath("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z");
            markerSymbol.setColor(new Color("#00FFFF"));

            var lineSymbol = new CartographicLineSymbol(CartographicLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2, CartographicLineSymbol.CAP_ROUND, CartographicLineSymbol.JOIN_MITER, 5);

            var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color('#F00'), 2), new Color([20, 20, 20, 0.1]));

            map.disableMapNavigation();
            initToolbar();

            function initToolbar() {
                switch (tool) {
                    case "tailedsquadcombat":
                        tb = new DrawExt(map);
                        break;
                    case "curve":
                    case "beziercurve":
                    case "freehandarrow":
                    case "tailedsquadcombat":
                    case "bezierpolygon":
                        if (typeof (TweenMax) == "undefined")
                            loadExtentFile(LGIS_Host + "js/tween.js", "js");
                        tb = new DrawEx(map);
                        break;
                    default:
                        tb = new Draw(map);
                }
                tb.activate(tool.toLowerCase());
                tb.on("draw-end", addGraphic);
            }

            function addGraphic(evt) {
                tb.deactivate();
                tb = null;
                map.enableMapNavigation();
                if (display) {
                    var symbol;
                    if (evt.geometry.type === "point" || evt.geometry.type === "multipoint") {
                        symbol = styleSymbol && styleSymbol.type.indexOf("marker") > -1 ? styleSymbol : markerSymbol;
                    } else if (evt.geometry.type === "line" || evt.geometry.type === "polyline") {
                        symbol = styleSymbol && styleSymbol.type.indexOf("L") > -1 ? styleSymbol : lineSymbol;
                    }
                    else {
                        symbol = styleSymbol && styleSymbol.type.indexOf("F") > -1 ? styleSymbol : fillSymbol;
                    }
                    map.graphics.add(new Graphic(evt.geometry, symbol));
                }
                evt.ScreenPoint = map.toScreen(evt.geometry);
                callback(evt);
            }
        });
    }

    //地图缩放
    function MapZoom(lon, lat, level) {
        require([
                   "esri/map", "esri/geometry/Point"
        ], function (Map, Point) {
            map.centerAndZoom(new Point(parseFloat(lon), parseFloat(lat)), parseFloat(level));
        })
    }

    //地图缩放
    function MapZoomToExent(exentJson) {
        require([
                   "esri/map", "esri/geometry/Point"
        ], function (Map, Point) {
            var extent = new esri.geometry.Extent(exentJson);
            map.setExtent(extent);
        })
    }

    //地图清空
    function MapClear() {
        require([
                "esri/map"
        ], function () {
            map.graphics.clear();
        })
    }

    //修改图层要素样式
    function LayerEdit(layerId, AttrName, Value, styleJson, ZoomTile) {
        require(["esri/map", "esri/layers/Layer",
           "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
           "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
           "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
           "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
           "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/dijit/InfoWindow",
           "dojo/dom-construct", "dojo/domReady!"],
           function (Map, Layer, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
               SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
               Color, InfoWindowLite, InfoTemplate,
               SimpleRenderer, UniqueValueRenderer, InfoWindow,
               domConstruct) {
               if (map == null) return;
               if (layerId == null) return;
               var graphicsLayer;
               if (map.getLayer(layerId)) {
                   graphicsLayer = map.getLayer(layerId);
               }
               else
                   return;
               var targetGraphics = [];
               for (var i = 0; i < graphicsLayer.graphics.length; i++) {
                   var graphic = graphicsLayer.graphics[i];
                   if (graphic.attributes[AttrName] == Value) {
                       if (styleJson) {
                           switch (styleJson.type) {
                               case "esriPMS":
                                   graphic.symbol = new PictureMarkerSymbol(styleJson);
                                   break;
                               case "esriSMS":
                                   graphic.symbol = new SimpleMarkerSymbol(styleJson);
                                   break;
                               case "delete":
                                   graphicsLayer.remove(graphic)
                                   break;
                               default:
                                   break;
                           }
                       }
                       targetGraphics.push(graphic);
                   }
               }
               graphicsLayer.redraw();
               if (ZoomTile) {
                   map.setZoom(ZoomTile);
                   map.setExtent(graphicsUtils.graphicsExtent(targetGraphics));
               }
               return;
           });
    }

    //获取图层可见性
    function GetLayerVisible(layerId, callback) {
        require([
                "esri/map", "esri/layers/layer"
        ], function (Map, Layer) {
            var layer = map.getLayer(layerId)
            callback(layer.visible);
        })
    }

    //设置图层可见性
    function SetLayerVisible(layerId, visible) {
        require([
                "esri/map", "esri/layers/layer"
        ], function (Map, Layer) {
            var layer = map.getLayer(layerId);
            if (visible) {
                layer.show();
                layer.visible = true;
            }
            else {
                layer.hide();
                layer.visible = false;
            }
        });
    }

    //设置图层可见性
    function SetLayerScale(layerId, MinScale, MaxScale) {
        require([
                "esri/map", "esri/layers/layer"
        ], function (Map, Layer) {
            var layer = map.getLayer(layerId);
            if (layer) {
                layer.setMinScale(MinScale);
                layer.setMaxScale(MaxScale);

            };
        });
    }

    //图层清空
    function LayerClear(layerId) {
        require([
                "esri/map"
        ], function () {
            if (map.getLayer(layerId)) {
                map.getLayer(layerId).clear();
                //map.getLayer(layerId).redraw();
                map.removeLayer(map.getLayer(layerId));
            }

        });
    }

    //在图层中获取图形
    function GetGraphicByAtr(layerId, Attr, value, callback) {
        require([
                "esri/map", "esri/layers/layer"
        ], function (Map, Layer) {
            var layer = map.getLayer(layerId);
            var graphics = [];
            for (var i = 0; i < layer.graphics.length; i++) {
                if (layer.graphics[i].attributes[Attr] == value)
                    graphics.push(layer.graphics[i]);
            }
            callback(graphics);
        })
    }

    function createCricle(radius, ptx, pty) {

        var points = new Array();
        var radius = 300;


        for (var i = 0; i <= 360; i += 1) {
            var radian = i * (Math.PI / 180.0);
            var x = ptx + radius * Math.cos(radian);//r *[-1.1]
            var y = pty + radius * Math.sin(radian);
            points.push([x, y]);

        }

    }

    //创建缓冲区
    function CreateBuffer(points, radius, callback) {
        require([
                "esri/map", "esri/layers/layer", "esri/geometry/Polygon", "esri/geometry/Point", "esri/layers/GraphicsLayer",
                "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphic", "esri/Color"
        ], function (Map, Layer, Polygon, Point, GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Graphic, Color) {
            var polygon = new Polygon(map.spatialReference);
            //点缓冲
            if (points.length == 1) {
                var pt = points[0];
                for (var i = 0; i <= 360; i += 1) {
                    var radian = i * (Math.PI / 180.0);
                    var x = pt.x + radius * Math.cos(radian);//r *[-1.1]
                    var y = pt.y + radius * Math.sin(radian);
                    points.push(new Point(x, y));
                }
                polygon.addRing(points);
            }
            else {

            }
            bufferLayer = new GraphicsLayer();
            var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color('#F00'), 2), new Color([20, 20, 20, 0.25]));
            bufferLayer.add(new Graphic(polygon, fillSymbol));
            map.addLayer(bufferLayer);
            polygon.spatialReference = map.spatialReference;
            callback(polygon);
        })
    }
    //画圆
    function CreateCircle(lon, lat, radius, callback) {
        require([
         "esri/geometry/Circle",
         "esri/geometry/Polygon",
         "esri/Map",
         "esri/SpatialReference",
         "esri/geometry/Point",
         "esri/Graphic",
         "esri/units"

        ], function (Circle, Polygon, Map, SpatialReference, Point, Graphic, Units) {
            var pt = new Point([lon, lat], new SpatialReference({ wkid: 4326 }));
            var circle = new Circle({
                center: pt,
                geodesic: true,
                radius: radius
            });
            callback(circle);
        })
    }

    //图层编辑
    function InitEdit(layerId, symbolJson, callback) {
        require([
            "esri/map", "esri/toolbars/edit", "esri/layers/FeatureLayer", "esri/dijit/editing/AttachmentEditor", "esri/symbols/PictureMarkerSymbol", "dojo/_base/event",
            "dojo/parser", "dojo/dom",
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
        ], function (
            Map, Edit, FeatureLayer, AttachmentEditor, PictureMarkerSymbol, event,
            parser, dom
          ) {
            var firePerimeterFL = map.getLayer(layerId);
            var editToolbar = new Edit(map);
            editToolbar.on("deactivate", function (evt) {
                if (evt.info.isModified) {
                    callback(evt);
                }
            });

            var editingEnabled = false;
            var editEvent = firePerimeterFL.on("dbl-click", function (evt) {
                event.stop(evt);
                if (editingEnabled) {
                    editingEnabled = false;
                    editToolbar.deactivate();
                }
                else {
                    editingEnabled = true;
                    var curSymbol;
                    switch (symbolJson.type) {
                        case "esriPMS":
                            curSymbol = new PictureMarkerSymbol(symbolJson);
                            break;
                        default:
                    }
                    if (curSymbol) {
                        evt.graphic.symbol = curSymbol;
                        editingEnabled = false;
                    }
                    else {
                        if (evt.graphic.geometry.type != "point")
                            editToolbar.activate(Edit.EDIT_VERTICES, evt.graphic);
                        else {
                            editToolbar.activate(Edit.MOVE, evt.graphic);
                        }
                    }
                }
            });
            layerEdits.push({ layerId: layerId, event: editEvent });
        })
    }
    //移除编辑
    function RemoveEdit(layerId) {
        require([
            "esri/map", "esri/toolbars/edit", "esri/layers/FeatureLayer", "esri/dijit/editing/AttachmentEditor", "esri/symbols/PictureMarkerSymbol",
            "dojo/parser", "dojo/dom",
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
        ], function (
            Map, Edit, FeatureLayer, AttachmentEditor, PictureMarkerSymbol,
            parser, dom
          ) {
            for (var i = 0; i < layerEdits.length; i++) {
                if (layerEdits[i].layerId == layerId) {
                    layerEdits[i].event.remove();
                }
            }
        })
    }

    var scalebar;
    //比例尺设定
    //postion: "top-right","bottom-right","top-center","bottom-center","bottom-left","top-left". The default value is "bottom-left".
    function SetScalebar(visible, postion) {
        require(["esri/map", "esri/dijit/Scalebar"
        ], function (Map, Scalebar) {
            if (scalebar == undefined) {
                scalebar = new Scalebar({
                    map: map,
                    attachTo: postion
                });
            }
            if (visible)
                scalebar.show();
            else
                scalebar.hide();
        });
    }
    var overviewMapDijit;
    //鹰眼设定
    //postion: "top-right","bottom-right","top-center","bottom-center","bottom-left","top-left". The default value is "bottom-left".
    function SetOverviewMap(visible, postion) {
        require([
            "esri/map", "esri/dijit/OverviewMap",
            "dojo/parser",
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
        ], function (
            Map, OverviewMap,
            parser
          ) {
            //parser.parse();
            if (overviewMapDijit == undefined) {
                overviewMapDijit = new OverviewMap({
                    map: map,
                    attachTo: postion,
                });
            }
            if (visible) {
                overviewMapDijit.startup();
                overviewMapDijit.show();
            }
            else {
                overviewMapDijit.visible = false;
                overviewMapDijit.hide();
            }
        });
    }
    var legend;
    //图例设定 
    function SetLegend(visible, legendDiv) {
        require([
            "esri/map", "esri/dijit/Legend"
        ], function (
            Map, Legend
          ) {
            //parser.parse();
            if (legend == undefined) {
                legend = new Legend({
                    map: map
                }, legendDiv);
            }
            if (visible) {
                legend.startup();
            }
            else {
                legend.destroy();
            }
        });
    }
    var home;
    //图例设定 
    function SetHomeButton(visible, HomeButtonDiv) {
        require([
            "esri/map", "esri/dijit/HomeButton", "dojo/domReady!"
        ], function (
            Map, HomeButton
          ) {
            //parser.parse();
            if (home == undefined) {
                home = new HomeButton({
                    map: map
                }, HomeButtonDiv);
                home.startup();
            }
            if (visible) {
                home.show();
            }
            else {
                home.hide();
            }
        });
    }
    //测量
    function Measure(index) {
        require(["lgis/Measure"], function (Navigation) {
            measure = new widgets.Measure({ map: map });
            if (index == "distance") {
                measure.measure(esri.toolbars.Draw.POLYLINE);
            }
            else if (index == "area") {
                measure.measure(esri.toolbars.Draw.POLYGON);
            }
            else if (index == "clear") {
                LayerClear("GL_Widgets_Measure_01");
                var x = document.getElementsByClassName("class_widgets_measure");
                var n = x.length;
                for (var i = 0; i < n; i++) {
                    x[0].parentNode.removeChild(x[0]);
                }
            }
        });
    }

    function BindEvent(eventType, callback) {
        require(["esri/map", "esri/geometry/Extent",
                     "esri/geometry/Point", "esri/symbols/PictureMarkerSymbol",
                     "esri/geometry/Polyline", "esri/SpatialReference", "esri/symbols/SimpleLineSymbol",
                     "esri/graphic", "dojo/domReady!"],
                     function (Map, Extent, Point, PictureMarkerSymbol, Polyline, SpatialReference, SimpleLineSymbol, Graphic) {
                         var mapevent = map.on(eventType, function (e) {
                             callback(e);
                         });
                         mapEvents.push({ eventType: eventType, event: mapevent });

                     })
    }
    function RemoveEvent(eventType) {
        require(["esri/map", "esri/geometry/Extent",
                     "esri/geometry/Point", "esri/symbols/PictureMarkerSymbol",
                     "esri/geometry/Polyline", "esri/SpatialReference", "esri/symbols/SimpleLineSymbol",
                     "esri/graphic", "dojo/domReady!"],
                     function (Map, Extent, Point, PictureMarkerSymbol, Polyline, SpatialReference, SimpleLineSymbol, Graphic) {
                         for (var i = 0; i < mapEvents.length; i++) {
                             if (mapEvents[i].eventType == eventType) {
                                 mapEvents[i].event.remove();
                             }
                         }
                     })
    }

}


//------------------------------地图图表-------------------------------------
function AddMapChart(layerId, chartType, chartJson, eventJson) {
    require(["esri/map", "esri/layers/FeatureLayer", "esri/layers/GraphicsLayer", "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/graphic", "esri/graphicsUtils",
        "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
        "esri/renderers/SimpleRenderer", "esri/Color",
        "lgis/ChartInfoWindow", "lgis/CustomTheme", "lgis/geometryUtils",
        "dojo/_base/array", "dojo/dom-construct", "dojo/_base/window",
        "dojox/charting/Chart", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/plot2d/ClusteredColumns", "dojox/charting/plot2d/Pie",
        "dojo/domReady!"
    ], function (
      Map, FeatureLayer, GraphicsLayer, ArcGISTiledMapServiceLayer, Graphic, graphicsUtils,
      SimpleLineSymbol, SimpleFillSymbol,
      SimpleRenderer, Color, ChartInfoWindow, CustomTheme, geometryUtils,
      array, domConstruct, win,
      Chart, Highlight, Tooltip
    ) {
        map.infoWindow.hide();
        var showFields = chartJson.fields;
        var showFieldsTitle = chartJson.titles;
        var showColors = chartJson.colors;
        var baseCode = chartJson.baseCode;
        var baseName = chartJson.baseName;

        var layer;
        if (map.getLayer(layerId)) {
            layer = map.getLayer(layerId);

        }
        else {
            return;
        }

        var featureSums = [];
        array.forEach(layer.graphics, function (graphic) {
            var sum = 0;
            for (var i = 0, j = showFields.length; i < j; i++) {
                sum += graphic.attributes[showFields[i]];
            }

            featureSums.push(sum);
        });
        var sumMax = -10000;
        array.forEach(featureSums, function (featureSum) {
            if (sumMax < featureSum) sumMax = featureSum;
        });

        var optinalChart = null;
        array.forEach(layer.graphics, function (graphic, index) {
            var chartDIV = domConstruct.create('div', null, document.getElementById('map'));
            chartDIV.className = "claro";
            var infoWindow = new ChartInfoWindow({
                domNode: chartDIV
            });
            chartDIV.onclick = function (e) {
                var dd = e;
            }
            infoWindow.setMap(map);
            var nodeChart = null;
            switch (chartType) {
                case "Columns":
                    var max = maxAttribute(layer.graphics, showFields);
                    nodeChart = domConstruct.create("div", { id: 'infowindow_' + layerId + '_' + index, style: "width:50px;height:100px" }, win.body());
                    var chart = makeChart(nodeChart, layer.graphics[index].attributes, showFields, showFieldsTitle, max, showColors, baseCode, baseName);
                    optinalChart = chart;
                    infoWindow.resize(50, 101);
                    break;
                case "Pie":
                    var curSum = 0;
                    for (var i = 0, j = showFields.length; i < j; i++) {
                        curSum += layer.graphics[index].attributes[showFields[i]];
                    }
                    var radius = 80 * curSum / sumMax;
                    var styleStr = "width:" + radius + "px;height:" + radius + "px";
                    nodeChart = domConstruct.create("div", { id: 'infowindow_' + layerId + '_' + index, style: styleStr }, win.body());
                    var chart = makePieChart(nodeChart, layer.graphics[index].attributes, showFields, showFieldsTitle, showColors);
                    var optinal = true;
                    for (var m = 0, n = showFields.length; m < n; m++) {
                        if (layer.graphics[index].attributes[showFields[m]] <= 0) {
                            optinal = false;
                        }
                    }
                    if (optinal == true) {
                        optinalChart = chart;
                    }
                    infoWindow.resize(radius + 2, radius + 2);
                    infoWindow.align = "Center";
                    break;
                default:

            }


            var labelPt = geometryUtils.getPolygonCenterPoint(graphic.geometry);
            infoWindow.setContent(nodeChart);
            infoWindow.__mcoords = labelPt;
            infoWindow.show(map.toScreen(labelPt));
        });


        function maxAttribute(graphics, showFields) {
            var max = -100000;
            array.forEach(graphics, function (graphic) {
                var attributes = graphic.attributes;
                for (var i = 0, j = showFields.length; i < j; i++) {
                    if (max < attributes[showFields[i]]) {
                        max = attributes[showFields[i]];
                    }
                }
            });

            return max;
        }

        function makeChart(node, attributes, showFields, showFieldsTitle, max, showColors, baseCode, baseName) {
            if (showColors) {
                for (var i = 0; i < showColors.length; i++) {
                    if (CustomTheme.colors[i]) CustomTheme.colors[i] = Color.fromRgb(showColors[i]);
                    else CustomTheme.colors.push(Color.fromRgb(showColors[i]));
                }
            }
            var chart = new Chart(node, { margins: { l: 0, r: 0, t: 0, b: 0 } }).
                            setTheme(CustomTheme).
                            addPlot("default", { type: "Columns", gap: 0 });
            chart._customMargins = true;
            var serieValues = [];
            var regionCode = attributes[baseCode];
            var regionName = attributes[baseName];
            chart.baseCode = regionCode;
            chart.baseName = regionName;
            var length = showFields.length;
            for (var i = 0; i < length; i++) {
                serieValues = [];
                for (var m = 0; m < i; m++) {
                    serieValues.push(0);
                }
                serieValues.push(attributes[showFields[i]]);
                chart.addSeries(showFields[i], serieValues, { stroke: { color: "black" } });
            }

            serieValues = [];
            for (var k = 0; k < length; k++) {
                serieValues.push(0);
            }
            serieValues.push(max);
            chart.addSeries("隐藏", serieValues, { stroke: { color: new Color([0x3b, 0x44, 0x4b, 0]) }, fill: "transparent" });

            var anim1 = new Highlight(chart, "default", {
                highlight: function (e) {
                    if (e.a == 0 && e.r == 0 && e.g == 0 && e.b == 0) {
                    }
                    else {
                        return "lightskyblue";
                    }
                }
            });
            var anim2 = new Tooltip(chart, "default", {
                text: function (o) {
                    var fieldName = o.chart.series[o.index].name;
                    if (fieldName == "隐藏") return "";
                    return (regionName + "<br/>" + showFieldsTitle[o.index] + "：" + o.y);
                }
            });
            chart.render();
            chart.connectToPlot("default", function (evt) {
                var shape = evt.shape, type = evt.type;
                if (type == "onclick") {
                    // Update its fill
                    var rotateFx = new dojox.gfx.fx.animateTransform({
                        duration: 1200,
                        shape: shape,
                        transform: [
                        { name: 'rotategAt', start: [0, 240, 240], end: [360, 240, 240] }
                        ]
                    }).play();
                    if (eventJson.mouseClick) window[eventJson.mouseClick](evt);
                }
                else if (type == "onmouseover") {
                    //if (!shape.originalFill) {
                    //    shape.originalFill = shape.fillStyle;
                    //}
                    // Set the fill color to pink
                    //shape.setFill("pink");
                }
                    // If it's a mouseout event
                else if (type == "onmouseout") {
                    // Set the fill the original fill
                    //shape.setFill(shape.originalFill);
                }

            });

            return chart;
        }

        function makePieChart(node, attributes, showFields, showFieldsTitle, showColors) {
            var chart = new Chart(node, { margins: { l: 0, r: 0, t: 0, b: 0 } }).
                            setTheme(CustomTheme).
                            addPlot("default", { type: "Pie" });
            var serieValues = [];
            var regionCode = attributes[baseCode];
            var regionName = attributes[baseName];
            chart.baseCode = regionCode;
            chart.baseName = regionName;
            var length = showFields.length;
            for (var i = 0; i < length; i++) {
                serieValues.push({ y: attributes[showFields[i]], legend: showFields[i], region: regionName });
            }
            chart.addSeries(showFields[i], serieValues, { stroke: { color: "black" } });

            var anim1 = new Highlight(chart, "default", {
                highlight: function (e) {
                    return "lightskyblue";
                }
            });
            var anim2 = new Tooltip(chart, "default", {
                text: function (o) {
                    var fieldName = o.chart.series[0].data[o.x].legend;
                    return (regionName + "<br/>" + showFieldsTitle[o.x] + "：" + o.y);
                }
            });
            chart.render();

            return chart;
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CalulateXYAnagle(startx, starty, endx, endy) {
    var tan = Math.atan(Math.abs((endy - starty) / (endx - startx))) * 180 / Math.PI + 90;
    if (endx > startx && endy > starty)//第一象限  
    {
        return -tan + 180;
    }
    else if (endx > startx && endy < starty)//第二象限  
    {
        return tan;
    }
    else if (endx < startx && endy > starty)//第三象限  
    {
        return tan - 180;
    }
    else {
        return -tan;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Orbit_Moving;
var startNum, endNum, isStop = false;
//轨迹播放开始
function Orbit_Move(layerId, graphic, points, start, end) {
    require(["esri/map", "esri/geometry/Extent",
                 "esri/geometry/Point", "esri/symbols/PictureMarkerSymbol",
                 "esri/geometry/Polyline", "esri/SpatialReference", "esri/symbols/SimpleLineSymbol",
                 "esri/graphic", "dojo/domReady!"],
                 function (Map, Extent, Point, PictureMarkerSymbol, Polyline, SpatialReference, SimpleLineSymbol, Graphic) {
                     var carlayer = map.getLayer(layerId);
                     for (var i = 0; i < carlayer.graphics.length; i++) {
                         if (carlayer.graphics[i] == graphic)
                             graphic = carlayer.graphics[i];
                     }
                     var x1 = points[start][0];
                     var y1 = points[start][1];
                     var x2 = points[end][0];
                     var y2 = points[end][1];
                     //map.graphics.add(graphic);
                     var p = (y2 - y1) / (x2 - x1);//斜率
                     var v = 0.00002;//距离  距离越小 位置越精确
                     Orbit_Moving = setInterval(function () {
                         startNum = start;
                         endNum = end;
                         if (endNum == points.length - 1) {
                             document.getElementById("closeTool").disabled = true;
                             document.getElementById("continueTool").disabled = true;
                             document.getElementById("returnTool").disabled = false;
                         }
                         //分别计算 x,y轴方向速度
                         if (Math.abs(p) == Number.POSITIVE_INFINITY) {//无穷大
                             graphic.geometry.y += v;
                         }
                         else {
                             if (x2 < x1) {
                                 graphic.geometry.x -= (1 / Math.sqrt(1 + p * p)) * v;
                                 graphic.geometry.y -= (p / Math.sqrt(1 + p * p)) * v;
                                 //计算汽车角度 
                                 graphic.symbol.angle = CalulateXYAnagle(x1, y1, x2, y2); //// (Math.PI / 2 - Math.atan(p)) * 180 / Math.PI+180
                             }
                             else {
                                 graphic.geometry.x += (1 / Math.sqrt(1 + p * p)) * v;
                                 graphic.geometry.y += (p / Math.sqrt(1 + p * p)) * v;
                                 //计算汽车角度 
                                 graphic.symbol.angle = CalulateXYAnagle(x1, y1, x2, y2); ////(Math.PI / 2 - Math.atan(p)) * 180 / Math.PI
                             }
                         }
                         //图层刷新 
                         //map.graphics.redraw();
                         carlayer.redraw();
                         if (Math.abs(graphic.geometry.x - x2) <= v && Math.abs(graphic.geometry.y - y2) <= v) {
                             clearInterval(Orbit_Moving);
                             startNum = start++;
                             endNum = end++;
                             if (end < points.length)
                                 Orbit_Move(layerId, graphic, points, start, end);
                         }
                     }, 50);
                 })
}
//轨迹播放停止
function Orbit_Stop(layerId, graphic, points) {
    require(["esri/map", "esri/geometry/Extent",
                 "esri/geometry/Point", "esri/symbols/PictureMarkerSymbol",
                 "esri/geometry/Polyline", "esri/SpatialReference", "esri/symbols/SimpleLineSymbol",
                 "esri/graphic", "dojo/domReady!"],
                 function (Map, Extent, Point, PictureMarkerSymbol, Polyline, SpatialReference, SimpleLineSymbol, Graphic) {
                     //map.graphics.add(graphic);
                     var carlayer = map.getLayer(layerId);
                     graphic.geometry.x = points[0][0];
                     graphic.geometry.y = points[0][1];
                     graphic.symbol.angle = 0;
                     carlayer.redraw();
                 })
}



//批量点投影转换：经纬度->墨卡托
function pointsl2m(lp) {
    for (var i = 0; i < lp.length; i++) {
        lp[i].x = lonlat2mercator(lp[i]).x;
        lp[i].y = lonlat2mercator(lp[i]).y;
    }
    return lp;
}

//经纬度转墨卡托
function lonlat2mercator(lonlat) {
    var mercator = { x: 0, y: 0 };
    var x = lonlat.x * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lonlat.y) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    mercator.x = x;
    mercator.y = y;
    return mercator;
}

//墨卡托转经纬度
function mercator2lonlat(mercator) {
    var lonlat = { x: 0, y: 0 };
    var x = mercator.x / 20037508.34 * 180;
    var y = mercator.y / 20037508.34 * 180;
    y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
    lonlat.x = x;
    lonlat.y = y;
    return lonlat;
}

//加载脚本或样式文件
function loadExtentFile(filePath, fileType) {
    if (fileType == "js") {
        var oJs = document.createElement('script');
        oJs.setAttribute("type", "text/javascript");
        oJs.setAttribute("src", filePath);//文件的地址 ,可为绝对及相对路径
        document.getElementsByTagName("head")[0].appendChild(oJs);//绑定
    } else if (fileType == "css") {
        var oCss = document.createElement("link");
        oCss.setAttribute("rel", "stylesheet");
        oCss.setAttribute("type", "text/css");
        oCss.setAttribute("href", filePath);
        document.getElementsByTagName("head")[0].appendChild(oCss);//绑定
    }
}

//判断经纬度是否在多边形中
function isInsidePolygon(lng, lat, poly) {
    if (poly[0].lat) {
        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i].lat <= lng && lng < poly[j].lat) || (poly[j].lat <= lng && lng < poly[i].lat)) &&
            (lat < (poly[j].lng - poly[i].lng) * (lng - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng) &&
            (c = !c);
        return c;
    }
    else {
        for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
            ((poly[i][0] <= lng && lng < poly[j][0]) || (poly[j][0] <= lng && lng < poly[i][0])) &&
            (lat < (poly[j][1] - poly[i][1]) * (lng - poly[i][0]) / (poly[j][0] - poly[i][0]) + poly[i][1]) &&
            (c = !c);
        return c;
    }
}


//全景------------------------全景--------------------------全景-----------------------------
var camera, controls;
var renderer, renderer2;
var scene, scene2;
var arrowObject;
function loadPanorama(nodeDiv, viewPara, callback) {
    var imgUrls = viewPara.imgUrls;
    var tileWidth = viewPara.tileWidth;
    var showArrow = viewPara.showArrow;
    var heading = viewPara.heading;

    if (typeof (THREE) == "undefined") {
        loadExtentFile(LGIS_Host + "js/threejs/three.min.js", "js");
        loadExtentFile(LGIS_Host + "js/controls/OrbitControls.js", "js");
    }
    var container = document.getElementById(nodeDiv);
    container.innerHTML = "";
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize(container.clientWidth, container.clientHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    container.appendChild(renderer2.domElement);

    scene = new THREE.Scene();
    scene2 = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 0.01;

    controls = new THREE.OrbitControls(camera);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 0.5;

    var textures = [];

    for (var i = 0; i < 6; i++) {
        textures[i] = new THREE.Texture();
        var imageObj = new Image();
        imageObj.onload = (function (i, imageObj) {
            return function () {
                var canvas, context;
                canvas = document.createElement('canvas');
                context = canvas.getContext('2d');
                canvas.height = tileWidth;
                canvas.width = tileWidth;
                context.drawImage(imageObj, 0, 0, tileWidth, tileWidth);
                textures[i].image = canvas
                textures[i].needsUpdate = true;
            }
        })(i, imageObj);
        imageObj.src = imgUrls[i];
    }

    var materials = [];

    for (var i = 0; i < 6; i++) {

        materials.push(new THREE.MeshBasicMaterial({ map: textures[i] }));

    }

    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MultiMaterial(materials));
    skyBox.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
    scene.add(skyBox);

    container.addEventListener('resize', onContainerResize, false);

    if (showArrow) addArrow();

    animate();

    function onContainerResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.clientHeight, container.clientHeight);

    }
    function animate() {
        controls.update();
        renderer.render(scene, camera);

        if (showArrow) {
            var jiaodu = controls.getAzimuthalAngle() > 0 ? 360 - controls.getAzimuthalAngle() * (180 / Math.PI) : 0 - controls.getAzimuthalAngle() * (180 / Math.PI);
            var x = 200 * Math.sin(jiaodu * Math.PI / 180);
            var y = 0 - 200 * Math.cos(jiaodu * Math.PI / 180);
            //document.getElementById("info").innerHTML = "d:" + jiaodu + " x:" + x + " y:" + y;

            arrowObject.position.x = x;
            arrowObject.position.y = -100;
            arrowObject.position.z = y;
            arrowObject.rotation.x = 300;
            arrowObject.rotation.y = 0;
            arrowObject.rotation.z = 0;
            arrowObject.scale.x = 1;
            arrowObject.scale.y = 1;
            renderer2.render(scene2, camera);
        }

        requestAnimationFrame(animate);

        callback({ scene: scene, camera: camera, controls: controls });
    }
    function addArrow() {
        var element = document.createElement('div');
        var img1 = document.createElement('img');
        img1.src = "../img/北.png";
        var img2 = document.createElement('img');
        img2.src = "../img/南.png";
        if (view) {
            var imgNum = parseInt((heading / 45 + 1) / 2);
            img1.src = LGIS_Host + "img/arrow/" + imgNum + ".png";
            img2.src = LGIS_Host + "img/arrow/" + -imgNum + ".png";
        }
        img2.style.webkitTransform = "rotate(-180deg)"
        img2.style.MozTransform = "rotate(-180deg)"
        img2.style.msTransform = "rotate(-180deg)"
        img2.style.OTransform = "rotate(-180deg)"
        img2.style.transform = "rotate(-180deg)";
        element.style.width = '50px';
        element.style.height = '50px';
        element.appendChild(img1);
        element.appendChild(img2);

        arrowObject = new THREE.CSS3DObject(element);
        scene2.add(arrowObject);

    }
}
//计算两点间的距离
function getFlatternDistance(lat1, lng1, lat2, lng2) {
    var f = getRad((lat1 + lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var a = EARTH_RADIUS;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;

    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}


//skyline联动-----------------skyline联动----------------------
var link2d = false;
var link3d = true;
function linkSkyline(skylinePage) {
    //map.on("click", function () {
    //    link2d = false;
    //    link3d = true;
    //})
    document.getElementById("map").onmouseover = function () {
        link2d = false;
        link3d = true;
    }
    BindEvent("extent-change", function (e) {
        if (!link3d) return;
        var lon = (e.extent.xmax + e.extent.xmix) / 2;
        var lat = (e.extent.ymax + e.extent.ymix) / 2;
        var center = mercator2lonlat({ x: lon, y: lat });
        var h = 1000000;
        //fly3d(center.x, center.y, h);
        var max = mercator2lonlat({ x: e.extent.xmax, y: e.extent.ymax });
        var min = mercator2lonlat({ x: e.extent.xmin, y: e.extent.ymin });
        skylinePage.contentWindow.Move3DMapTo(max.x, max.y, min.x, min.y);
    })

    //map.on("extent-change", function (e) {
    //    if (!link3d) return;
    //    var lon = (e.extent.xmax + e.extent.xmix) / 2;
    //    var lat = (e.extent.ymax + e.extent.ymix) / 2;
    //    var center = mercator2lonlat({ x: lon, y: lat });
    //    var h = 1000000;
    //    //fly3d(center.x, center.y, h);
    //    var max = mercator2lonlat({ x: e.extent.xmax, y: e.extent.ymax });
    //    var min = mercator2lonlat({ x: e.extent.xmin, y: e.extent.ymin });
    //    skylinePage.contentWindow.Move3DMapTo(max.x, max.y, min.x, min.y);
    //})
}
//联动回调
function linkCallBack(extent) {
    link2d = true;
    link3d = false;
    MapZoomToExent(extent);
}
//联动清除
function stoplinkSkyline() {
    link2d = false;
    link3d = false;
    RemoveEvent("extent-change");
}

//GP服务调用
function loadGPTool(gpUrl, parms, statusId, IfShow, jobResult) {

    require(["esri/map", "esri/tasks/Geoprocessor", "dojo/dom", "esri/domUtils", "dojo/domReady!"],
                function (Map, Geoprocessor, dom, domUtils) {
                    gp = new esri.tasks.Geoprocessor(gpUrl);
                    gp.submitJob(parms, gpJobComplete, gpJobStatus, gpJobFailed);

                    function gpJobComplete(jobinfo) {
                        jobResult(jobinfo);
                        if (!IfShow) return;
                        gp.getResultImageLayer(jobinfo.jobId, null, null, function (layer) {
                            layer.setOpacity(0.8);
                            map.addLayers([layer]);
                            //jobResult(layer);
                        });
                        gp.getResultData(jobinfo.jobId, null, function (layer) {
                            layer.setOpacity(0.8);
                            map.addLayers([layer]);
                        });
                        //图例监听
                        //map.on("layers-add-result", function (evtObj) {
                        //    domUtils.show(dom.byId('legendDiv'));
                        //    if (!legend) {
                        //        //add the legend to show the resulting layer. 
                        //        var layerInfo = array.map(evtObj.layers, function (layer, index) {
                        //            return {
                        //                layer: layer.layer,
                        //                title: layer.layer.name
                        //            };
                        //        });

                        //        legend = new Legend({
                        //            map: map,
                        //            layerInfos: layerInfo
                        //        }, "legendDiv");
                        //        legend.startup();
                        //    }
                        //});
                    }
                    //执行状态
                    function gpJobStatus(jobinfo) {
                        domUtils.show(dom.byId(statusId));
                        var jobstatus = '';
                        switch (jobinfo.jobStatus) {
                            case 'esriJobSubmitted':
                                jobstatus = 'Submitted...';
                                break;
                            case 'esriJobExecuting':
                                jobstatus = 'Executing...';
                                break;
                            case 'esriJobSucceeded':
                                domUtils.hide(dom.byId(statusId));
                                break;
                        }
                        dom.byId(statusId).innerHTML = jobstatus;
                    }
                    //执行失败
                    function gpJobFailed(error) {
                        dom.byId(statusId).innerHTML = error;
                        domUtils.hide(dom.byId(statusId));
                    }
                })
}
//获取GP服务矢量结果
function getGPresultData(gpUrl, jobId, layerIndex, addLayer, layerId, InfoTemplateJson, showLabel) {
    require(["esri/map", "esri/tasks/Geoprocessor", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/InfoTemplate",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer",
        "esri/symbols/TextSymbol", "esri/layers/LabelClass",
        "dojo/dom", "esri/domUtils", "dojo/domReady!"],
                    function (Map, Geoprocessor, GraphicsLayer, FeatureLayer, InfoTemplate, SimpleFillSymbol, SimpleLineSymbol, Color, SimpleRenderer, UniqueValueRenderer, TextSymbol, LabelClass,
                        dom, domUtils) {
                        gp = new esri.tasks.Geoprocessor(gpUrl);

                        //var featureLayer = "http://localhost:6080/arcgis/rest/services/Model_AirM/MapServer/jobs/jffaea1fda8d14369a047740cdd1802e3/0"
                        var featureLayerUrl = gpUrl.split("GPServer")[0] + "MapServer/jobs/" + jobId + "/" + layerIndex;
                        var featureLayer = new FeatureLayer(featureLayerUrl, {
                            id: layerId, outFields: ["*"], showLabels: showLabel
                        });
                        //LayerClear("gp_resultLayer" + layerId);
                        if (InfoTemplateJson) {
                            var infoTemplate = new InfoTemplate(InfoTemplateJson);
                            featureLayer.setInfoTemplate(infoTemplate);
                        }
                        if (showLabel) {
                            var labelSymbol = new TextSymbol();
                            labelSymbol.font.setSize("14pt");
                            labelSymbol.font.setFamily("arial");
                            var json = {
                                "labelExpressionInfo": { "value": "{Contour}" }
                            };
                            var lc = new LabelClass(json);
                            lc.symbol = labelSymbol;
                            featureLayer.setLabelingInfo([lc]);
                        }
                        map.addLayer(featureLayer);
                    })
}
//获取GP服务影像结果
function getGPresultImageLayer(gpUrl, jobId, layerIndex, addLayer, layerId, InfoTemplateJson, showLabel, callback) {
    require(["esri/map", "esri/tasks/Geoprocessor", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/InfoTemplate",
        "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color", "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer",
        "esri/symbols/TextSymbol", "esri/layers/LabelClass",
        "dojo/dom", "esri/domUtils", "dojo/domReady!"],
                    function (Map, Geoprocessor, GraphicsLayer, FeatureLayer, InfoTemplate, SimpleFillSymbol, SimpleLineSymbol, Color, SimpleRenderer, UniqueValueRenderer, TextSymbol, LabelClass,
                        dom, domUtils) {
                        gp = new esri.tasks.Geoprocessor(gpUrl);
                        gp.getResultImageLayer(jobId, layerIndex, null, function (results) {
                            if (addLayer) {
                                results.setOpacity(0.8);
                                results.id = layerId;
                                //LayerClear(results.id);
                                map.addLayer(results);
                                results.hide();
                                callback(results);
                            }
                        })
                    })
}

//插值分析
function Interpolation(type) {
    var features = [];
    features.push(graphic);
    var featureset = new esri.tasks.FeatureSet();
    featureset.features = features;
    //构造缓冲长度，这里的单位是可以更改的，我使用的是度，简单一些
    var Dis = new esri.tasks.LinearUnit();
    Dis.distance = 1;
    Dis.units = esri.Units.DECIMAL_DEGREES;
    var parms = {
        ContaminatedAreas: featureset,
        Distance__value_or_field_: Dis
    };
    loadGPTool();
}



if (typeof ClassType == "undefined") {
    var ClassType = {};
    ClassType.Point = 1;
}

function FactoryClass(classType, callback) {
    require(["esri/map",
       "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
       "esri/geometry/Point", "esri/graphic", "esri/graphicsUtils",
       "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
       "esri/Color", "esri/dijit/InfoWindowLite", "esri/InfoTemplate",
       "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/renderers/ClassBreaksRenderer", "esri/renderers/HeatmapRenderer",
       "esri/dijit/InfoWindow",
       "dojo/dom-construct", "dojo/domReady!"],
       function (Map, GraphicsLayer, FeatureLayer, Point, Graphic, graphicsUtils,
           SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
           Color, InfoWindowLite, InfoTemplate,
           SimpleRenderer, UniqueValueRenderer, ClassBreaksRenderer, HeatmapRenderer, InfoWindow,
           domConstruct) {
           switch (classType) {
               case ClassType.Point:
                   callback(new Point());
                   break;
           }
       })
}

//对象合并
function objectMerge(o, n) {
    for (var p in n) {
        if (n.hasOwnProperty(p))
            o[p] = n[p];
    }
};

function lgis_getMySrc() {
    var scriptSrc = document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].src;
    return scriptSrc;
}
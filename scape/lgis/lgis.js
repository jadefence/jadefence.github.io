//配置项
var lgis_API = "https://js.arcgis.com/4.5/";
//var API_Host = "http://localhost/4.4/";
//var API_Host = "http://172.16.12.20/4.4/";
var lgis_Host = "http://172.16.12.20:8003/lgis/";

//动态设置配置项
var lgis_Host = window.location.host + "/lgis/";
var lgis_domain = document.domain;
if (lgis_domain.indexOf("172.16") > -1 || lgis_domain.indexOf("localhost") > -1)
    lgis_API = "http://61.50.135.114:4057/arcgis_js_v48_api/"
    //lgis_API = "http://172.16.14.31/4.7/"
else
    lgis_API = "http://61.50.135.114:4057/arcgis_js_v48_api/"

//获取引用页面地址
var js = document.scripts;
js = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/"));
locationPath = js.substring(0, js.lastIndexOf("/") + 1);

//加载 arcgis_js_API
loadExtentFile(lgis_API + "esri/css/main.css", "css");
loadExtentFile(lgis_API, "js");

//var locationPath = location.href.replace(location.href.split("/")[location.href.split("/").length - 1], "");
//var locationPath = location.pathname.replace(/\/[^\/]+$/, "");
//var urlPath = locationPath.split('/');

//dojo配置
var dojoConfig = {
    parseOnLoad: true,
    async: true,
    packages: [{
            "name": "lgis",
            "location": locationPath + "/lgis/js",
        },
        {
            "name": "themes",
            "location": locationPath + "/themes",
        },
        {
            "name": "widgets",
            "location": locationPath + "/widgets",
        },
        {
            "name": "js",
            "location": locationPath + "/js",
        },
        {
            "name": "configs",
            "location": locationPath + "/configs",
        },
        {
            "name": "libs",
            "location": locationPath + "/libs",
        },
        {
            "name": "demo",
            "location": locationPath + "/demo",
        }
    ]
};


function Lgis() {
    this.InitMap = InitMap;
    this.SwitchBaseMap = SwitchBaseMap;
    this.getBaseMap = getBaseMap;
    this.viewChange = viewChange;
    //----要素----
    this.AddPoints = AddPoints;
    this.AddPointTip = AddPointTip;
    this.closePointTip = closePointTip;
    this.AddPolylines = AddPolylines;
    this.AddPolygons = AddPolygons;
    this.AddImages = AddImages;
    this.AddImageThree = AddImageThree;
    this.UpdateImageThreeUrl = UpdateImageThreeUrl;
    //----图层----
    this.AddTiledLayer = AddTiledLayer;
    this.AddSceneLayer = AddSceneLayer;
    this.AddFeatureLayer = AddFeatureLayer;
    this.AddImageryLayer = AddImageryLayer;
    this.LayerClear = LayerClear;
    this.LayerReorder = LayerReorder;
    this.LayerUpdate = LayerUpdate;
    //this.LayerEdit = LayerEdit;
    //this.SetLayerScale = SetLayerScale;
    this.SetLayerVisible = SetLayerVisible;
    this.GetLayerVisible = GetLayerVisible;

    //----地图----
    this.FlickerPopupView = FlickerPopupView; //闪烁点的功能
    //this.AddMapChart = AddMapChart;
    this.MapZoomToLayer = MapZoomToLayer;
    this.MapTo = MapTo;
    this.MapClear = MapClear;
    this.MapDraw = MapDraw;
    this.MapDrawClear = MapDrawClear;

    //----图形----
    //this.CreateBuffer = CreateBuffer;
    this.CreateCircle = CreateCircle;
    this.CreateEllipse = CreateEllipse;
    this.CreateSector = CreateSector;

    //this.InitEdit = InitEdit;
    //this.RemoveEdit = RemoveEdit;

    //----控件----
    this.SetBasemapGallery = SetBasemapGallery;
    this.SetBasemapToggle = SetBasemapToggle;
    this.SetScalebar = SetScalebar;
    this.SetOverviewMap = SetOverviewMap;
    this.SetLegend = SetLegend;
    this.SetHomeButton = SetHomeButton;
    this.SetZoomButton = SetZoomButton;

    ////this.MoveCarOnMap = MoveCarOnMap;
    //this.GetGraphicByAtr = GetGraphicByAtr;
    //this.Orbit_Move = Orbit_Move;
    //this.Orbit_Stop = Orbit_Stop; 
    //this.ShowInfo = ShowInfo;
    this.HideInfo = HideInfo;
    //this.MapZoom = MapZoom;
    this.Measure = Measure;
    //this.loadGPTool = loadGPTool;
    //this.getGPresultData = getGPresultData;
    //this.getGPresultImageLayer = getGPresultImageLayer;
    //this.AddPicturePoints = AddPicturePoints;
    this.AddHeatMap = AddHeatMap;
    this.ClearHeatMap = ClearHeatMap;
    this.AddMapPatch = AddMapPatch;
    this.ClearMapPatch = ClearMapPatch;
    this.AddMapWindy = AddMapWindy;
    this.AddSceneWindy = AddSceneWindy;
    //this.MapZoomToExent = MapZoomToExent;
    this.BindEvent = BindEvent;
    this.RemoveEvent = RemoveEvent;

    //this.loadPanorama = loadPanorama;
    //this.linkSkyline = linkSkyline;

    //this.isInsidePolygon = isInsidePolygon;
    //this.lonlat2mercator = lonlat2mercator;
    //this.mercator2lonlat = mercator2lonlat;
    //this.FactoryClass = FactoryClass;
    this.isInsidePolygon = isInsidePolygon;

    this.AddEcharts = AddEcharts;
    this.ClearEcharts = ClearEcharts;
    this.SetRelatedLayer = SetRelatedLayer; //查找并定位

    this.SetMapLayerClick = SetMapLayerClick; //查找并定位
    this.GetLayer = GetLayer; //查找并定位

    this.LoadObj = LoadObj;
    this.RemoveObj = RemoveObj

    this.TaskQuery = TaskQuery;
    this.TaskFind = TaskFind;

    //公共变量
    this.state = false;
    var map, mapScene;
    var view
    var showTextLayer;
    var tb;
    var bufferLayer;
    var baseMaps = [];
    //var geometryService = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
    var geometryService = "http://172.16.12.20:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
    var layerEdits = [];
    var mapEvents = [];

    //var app;
    this.app = {
        center: [119, 40],
        scale: 50000001,
        basemap: "topo",
        mapcontainer: "map",
        scenemap: "topo",
        scenecontainer: "scene",
        ground: "world-elevation",
        viewingMode: "global", //local
        start: "map", //  map  二维 scene  三维
        viewPadding: {
            top: 50,
            bottom: 0
        },
        uiComponents: ["zoom", "compass", "attribution"],
        dockOptions: {
            position: "auto",
            // Custom docking breakpoints
            breakpoint: {
                width: 768,
                height: 768
            }
        },
        mapView: null,
        sceneView: null,
        activeView: null,
        searchWidget: null,
        screenWidth: 0,
        systype: ""
    };
    var _this = this;

    //地图初始化
    function InitMap(ParaJson, loaded) {
        require(["esri/config", "esri/Map", "esri/Basemap", 
                "esri/layers/WebTileLayer", "esri/layers/TileLayer","esri/layers/MapImageLayer",
                "esri/views/MapView", "esri/views/SceneView", "esri/widgets/Popup",
                "dojo/domReady!"
            ],
            function(esriConfig, Map, Basemap, WebTileLayer, TileLayer,MapImageLayer,
                MapView, SceneView, Popup) {
                //read map config
                objectMerge(_this.app, ParaJson);
                //init basemaps
                var config = _this.app;
                var baselayer, initbaseMap
                if (_this.app.basemaps) {
                    if (_this.app.basemaps.length > 0) {
                        for (var i = 0; i < _this.app.basemaps.length; i++) {
                            var layerInfo = _this.app.basemaps[i];
                            if (layerInfo.layerUrl.indexOf("http") == -1) {
                                baselayer = layerInfo.layerUrl;
                                var baseMap = Basemap.fromId(baselayer);
                                baseMap.title = layerInfo.layerTitle;
                                baseMaps.push(baseMap);
                            } else {
                                switch (layerInfo.layerType) {
                                    case "tiled":
                                        if (layerInfo.layerUrl.indexOf("{level}") > -1) {
                                            baselayer = new WebTileLayer({
                                                urlTemplate: layerInfo.layerUrl
                                            });
                                        } else {
                                            baselayer = new TileLayer({
                                                url: layerInfo.layerUrl
                                            });
                                        }
                                        if (layerInfo.subDomains)
                                            baselayer.subDomains = layerInfo.subDomains;
                                        else
                                            baselayer.subDomains = [layerInfo.layerUrl.split("//")[1].split("/")[0]];
                                        break;
                                    case "dynamic":
                                        baselayer = new MapImageLayer({
                                            url: layerInfo.layerUrl
                                        });
                                        break;
                                    default:

                                }
                                var baseMap = new Basemap({
                                    baseLayers: [baselayer],
                                    thumbnailUrl: layerInfo.imgUrl,
                                    title: layerInfo.layerTitle,
                                    id: layerInfo.layerId
                                });
                                baseMaps.push(baseMap);
                            }
                        }
                        initbaseMap = baseMaps[0];
                    }
                } else {
                    baselayer = _this.app.basemap;
                    initbaseMap = Basemap.fromId(baselayer);
                }
                // Map
                if (_this.app.mapcontainer) {
                    map = new Map({
                        basemap: initbaseMap
                            //layers: [initbaseMap]
                    });

                    _this.app.mapView = new MapView({
                        container: _this.app.mapcontainer,
                        map: map,
                        center: _this.app.center,
                        scale: _this.app.scale,
                        zoom: _this.app.zoom,
                        padding: _this.app.viewPadding,
                        popup: new Popup({
                            dockOptions: _this.app.dockOptions
                        }),
                        ui: {
                            components: _this.app.uiComponents
                        },
                        constraints: {
                            rotationEnabled: false
                        }
                    });
                }
                // Scene
                if (_this.app.scenecontainer) {
                    mapScene = new Map({
                        basemap: initbaseMap,
                        //ground: _this.app.ground
                    });

                    _this.app.sceneView = new SceneView({
                        container: _this.app.scenecontainer,
                        map: mapScene,
                        viewingMode: _this.app.viewingMode,
                        center: _this.app.center,
                        scale: _this.app.scale,
                        camera: _this.app.camera,
                        padding: _this.app.viewPadding,
                        popup: new Popup({
                            dockOptions: _this.app.dockOptions
                        }),
                        ui: {
                            components: _this.app.uiComponents
                        }
                    });
                }

                //加载完成事件
                var Isloaded = 0;
                if (getEleDisplay(_this.app.scenecontainer)) {
                    _this.app.sceneView.when(function() {
                        Isloaded++;
                        if (Isloaded == 2) loaded();
                    });
                } else {
                    Isloaded++;
                    if (Isloaded == 2) loaded();
                }
                if (getEleDisplay(_this.app.mapcontainer)) {
                    _this.app.mapView.when(function() {
                        Isloaded++;
                        if (Isloaded == 2) loaded();
                    });
                } else {
                    Isloaded++;
                    if (Isloaded == 2) loaded();
                }

                return;

                /*
                var center = lmap.center;
                
                map.on("load", function () {
                    loaded();
                })
                if (eventJson) {
                    if (eventJson.mouseClick) map.on("click", function (e) {
                        window[eventJson.mouseClick](e);
                    });
                }
                showTextLayer = new GraphicsLayer();
                map.addLayer(showTextLayer);
                */
            });
    };

    //视图切换
    function viewChange(viewName) {


        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/views/SceneView",
            "esri/widgets/Search",
            "esri/widgets/Popup",
            "esri/core/watchUtils",
            "dojo/query",
            "dojo/on",

            // Bootstrap
            "bootstrap/Collapse",
            "bootstrap/Dropdown",
            "bootstrap/Tab",
            // Calcite Maps
            "calcite-maps/calcitemaps-v0.2",

            "dojo/domReady!"
        ], function(Map, MapView, SceneView, Search, Popup, watchUtils, query,
            on) {

            if (viewName == "map") {
                app.activeView = app.mapView;
                syncViews(app.sceneView, app.mapView);

            } else {
                app.activeView = app.sceneView;
                syncViews(app.mapView, app.sceneView);
            }

            map = app.activeView.map;
            // Views - sync viewpoint and popup
            function syncViews(fromView, toView) {
                watchUtils.whenTrueOnce(toView, "ready").then(function(result) {
                    watchUtils.whenTrueOnce(toView, "stationary").then(function(
                        result) {
                        toView.goTo(fromView.viewpoint);
                        toView.popup.reposition();
                    });
                });
            }
        });
    }

    //切换底图
    function SwitchBaseMap(baseMapIndex, actor) {
        actView(actor, Act2d, Act3d);

        function Act2d() {
            var view = _this.app.mapView;
            view.map.basemap = baseMaps[baseMapIndex];
        }

        function Act3d() {
            var view = _this.app.sceneView;
            view.map.basemap = baseMaps[baseMapIndex];
        }
    }

    //获取底图
    function getBaseMap() {
        return baseMaps;
    }

    //获取图层可见性
    function GetLayerVisible(layerId, callback, actor) {
        require([
            "esri/Map", "esri/layers/Layer"
        ], function(Map, Layer) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var rendView = _this.app.mapView;
                var simpleMap = rendView.map;
                var layer = simpleMap.findLayerById(layerId);
                if (layer) callback(layer.visible);
            }

            function Act3d() {
                var rendView = _this.app.mapView;
                var simpleMap = rendView.map;
                var layer = simpleMap.findLayerById(layerId);
                if (layer) callback(layer.visible);
            }
        })
    }

    //设置图层可见性
    function SetLayerVisible(layerId, visible) {
        require([
                "esri/Map", "esri/layers/Layer"
            ], function(Map, Layer) {
                //var sMapView = app.mapView;
                //var sceneMapView = app.sceneView;

                var sMapView = _this.app.mapView;
                var sceneMapView = _this.app.sceneView;
                mapLayerVisivle(sMapView, layerId, visible);
                mapLayerVisivle(sceneMapView, layerId, visible);

                function mapLayerVisivle(rendView, layerId, visible) {
                    var simpleMap = rendView.map;
                    var layer = simpleMap.findLayerById(layerId);
                    if (layer) {
                        if (visible) {
                            // layer.show();
                            layer.visible = true;
                        } else {
                            //  layer.hide();
                            layer.visible = false;
                        }
                    }
                }
            }

        );
    }

    function LayerReorder(layerId, index, actor) {
        actView(actor, Act2d, Act3d);

        function Act2d() {
            var rendView = _this.app.mapView;
            var curMap = rendView.map;
            var layer = curMap.findLayerById(layerId);
            curMap.reorder(layer, index)
        }

        function Act3d() {
            var rendView = _this.app.sceneView;
            var curMap = rendView.map;
            var layer = curMap.findLayerById(layerId);
            curMap.reorder(layer, index)
        }
    }

    //查找并定位
    /**
    layerId  图层的id
    FID  图层的唯一字段的值
    */
    function SetRelatedLayer(layerId, FID, actor) {
        require([
                "esri/Map", "esri/layers/Layer"
            ], function(Map, Layer) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var rendView = _this.app.mapView;
                    var simpleMap = rendView.map;
                    if (simpleMap.findLayerById(layerId)) {
                        var graPointLayer = simpleMap.findLayerById(layerId);
                        var graphics = graPointLayer.source;
                        var result = graphics.items[FID];
                        if (result) {
                            rendView.popup.open({
                                features: [result],
                                location: result.geometry
                            });
                            rendView.popup.position = "auto";
                            rendView.popup.dockEnabled = false;
                            rendView.goTo({
                                target: [result],
                                heading: 0,
                                // zoom: 16,
                                tilt: 0
                            });
                        }
                    }
                }

                function Act3d() {
                    var rendView = _this.app.sceneView;
                    var simpleMap = rendView.map;
                    if (simpleMap.findLayerById(layerId)) {
                        var graPointLayer = simpleMap.findLayerById(layerId);
                        var graphics = graPointLayer.source;
                        var result = graphics.items[FID];
                        if (result) {
                            rendView.popup.open({
                                features: [result],
                                location: result.geometry
                            });

                            rendView.popup.position = "auto";

                            rendView.popup.dockEnabled = false;
                            rendView.goTo({
                                target: [result],
                                heading: 0,
                                // zoom: 16,
                                tilt: 0
                            });
                        }
                    }
                }
            }

        );
    }

    //
    function FlickerPopupView(layerId, PraJson, actor) {
        require(["esri/Map", "esri/layers/Layer", "esri/layers/GraphicsLayer",
                "esri/layers/FeatureLayer",
                "esri/geometry/Point",

                "esri/geometry/geometryEngine",
                "esri/renderers/support/jsonUtils",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, Layer, GraphicsLayer, FeatureLayer, Point,
                geometryEngine,
                rendererJsonUtils,
                domConstruct) {

                var sMapView = _this.app.mapView;
                var sceneMapView = _this.app.sceneView;

                function Act2d() {
                    addMapFlickerPointLayer(sMapView, layerId, PraJson.gra, PraJson.map.symbol);
                }

                function Act3d() {
                    addMapFlickerPointLayer(sceneMapView, layerId, PraJson.gra, PraJson.scene.symbol);
                }
                actView(actor, Act2d, Act3d);

                function addMapFlickerPointLayer(rendView, layerId, graphicsJson, renderJson) {
                    var simpleMap = rendView.map;
                    if (simpleMap == null) return;
                    //字段定义
                    var fields = [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }];

                    if (graphicsJson["attributes"]) {
                        for (var col in graphicsJson["attributes"]) {
                            fields.push({
                                name: col,
                                alias: col,
                                type: "string"
                            })
                        }
                    }


                    //样式定义
                    var renderer;
                    renderer = rendererJsonUtils.fromJSON(renderJson);


                    //添加图形
                    var graphics = [];
                    var geometryUnion = [];
                    //  for (var i = 0; i < graphicsJson.length; i++) {
                    if (graphicsJson["attributes"]) {
                        graphicsJson.attributes["ObjectID"] = 1;
                    } else {

                        var attributes = new Object();
                        attributes["ObjectID"] = 1;
                        graphicsJson["attributes"] = attributes;
                    }
                    var pPoint = new Point({
                        x: graphicsJson.geometry.x,
                        y: graphicsJson.geometry.y,
                        hasZ: false,
                        hasM: false,
                    });
                    if (graphicsJson.geometry.z == undefined) {
                        graphics.push({
                            geometry: pPoint, //new Point({
                            attributes: graphicsJson.attributes
                        });
                        // geometryUnion.push(pPoint);
                    } else {
                        graphics.push({
                            geometry: pPoint,
                            attributes: graphicsJson.attributes
                        });
                        // geometryUnion.push(pPoint);
                    }
                    //生成图层
                    var graPointLayer;
                    if (simpleMap.findLayerById(layerId)) {

                        graPointLayer = simpleMap.findLayerById(layerId);
                        simpleMap.removeMany([graPointLayer])

                        // Layer[]
                    }
                    graPointLayer = new FeatureLayer({
                        fields: fields,
                        objectIdField: "ObjectID",
                        title: layerId,
                        id: layerId,
                        source: graphics,
                        geometryType: "point",
                        spatialReference: { wkid: 4326 },
                        renderer: renderer
                    });

                    simpleMap.add(graPointLayer);


                    simpleMap.reorder(graPointLayer, simpleMap.layers.length - 1);
                    if (PraJson.popup) {
                        rendView.popup.open({
                            // Set the popup's title to the coordinates of the location
                            title: "ddddddddddddddd",
                            //content:"fdffffffff",
                            location: pPoint // Set the location of the popup to the clicked location
                        });
                        // renderer.vi
                        rendView.popup.position = "auto";

                        rendView.popup.dockEnabled = false;

                        // rendView.popup.reposition()
                        //rendView.popup.location = { latitude: pPoint.x, longitude: pPoint.y};
                        renderer.center = pPoint;

                    }
                }

            });
    }

    var graphicsLayer;

    //添加面
    function AddPolygons(layerId, PraJson1, actor) {
        require(["esri/Map",
                "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
                "esri/geometry/Point", "esri/Graphic", "esri/geometry/Polygon",
                "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
                "esri/Color",
                "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/layers/support/LabelClass",
                "esri/symbols/TextSymbol3DLayer", "esri/symbols/LabelSymbol3D", "esri/symbols/TextSymbol", "esri/geometry/geometryEngine",
                "esri/renderers/support/jsonUtils",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, GraphicsLayer, FeatureLayer, Point, Graphic, Polygon,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, SimpleRenderer, UniqueValueRenderer, LabelClass, TextSymbol3DLayer, LabelSymbol3D, TextSymbol, geometryEngine,
                renderersjsonUtils,
                domConstruct) {
                function Act2d() {
                    var view = _this.app.mapView;
                    addMapPolyLayerRender(view, layerId, PraJson1, PraJson1.map);
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    addMapPolyLayerRender(view, layerId, PraJson1, PraJson1.scene);
                }
                actView(actor, Act2d, Act3d);

                function addMapPolyLayerRender(rendView, layerId, PraJson, viewJson) {
                    var graphicsJson = PraJson.gra;
                    var renderJson = viewJson.symbol;
                    var LabelClassJson = viewJson.label;
                    var eventJson = PraJson.event;
                    var pTemplate = PraJson.popTemple;
                    var layerVisible = PraJson.visible;


                    var pLayer;
                    simpleMap = rendView.map;
                    if (simpleMap == null) return;
                    var graphics = [];
                    var geometryUnion = [];

                    //字段定义
                    var fields = [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }];
                    if (graphicsJson[0].attributes) {
                        for (var col in graphicsJson[0].attributes) {
                            fields.push({
                                name: col,
                                alias: col,
                                type: "string"
                            })
                        }
                    }
                    //样式定义
                    var renderer;

                    renderer = renderersjsonUtils.fromJSON(renderJson);
                    // var syr = JSON.stringify(renderer.toJSON());
                    //添加图形

                    for (var i = 0; i < graphicsJson.length; i++) {
                        if (!graphicsJson[i]["attributes"])
                            graphicsJson[i]["attributes"] = { ObjectID: i };
                        else
                            graphicsJson[i]["attributes"]["ObjectID"] = i;
                        var pPoly = new Polygon({
                            rings: graphicsJson[i].geometry.rings,
                            hasZ: false,
                            hasM: false,
                        });
                        graphics.push({
                            geometry: pPoly,
                            attributes: graphicsJson[i].attributes
                        });
                        geometryUnion.push(pPoly)
                    }
                    //图层高度
                    var elevationInfo = "on-the-ground";
                    if (PraJson.scene) {
                        if (PraJson.scene.offset) {
                            elevationInfo = {
                                mode: "relative-to-ground",
                                offset: PraJson.scene.offset
                            }
                        }
                    }
                    //生成图层
                    if (simpleMap.findLayerById(layerId)) {
                        pLayer = simpleMap.findLayerById(layerId);
                    } else {
                        pLayer = new FeatureLayer({
                            fields: fields,
                            objectIdField: "ObjectID",
                            title: layerId,
                            id: layerId,
                            source: graphics,
                            geometryType: "polygon",
                            spatialReference: { wkid: 4326 },
                            renderer: renderer,
                            elevationInfo: elevationInfo
                        });
                        simpleMap.add(pLayer);
                    }
                    //气泡模板设置
                    if (pTemplate) {
                        pLayer.popupTemplate = pTemplate;
                    }

                    if (rendView == _this.app.mapView) {

                        var union = geometryEngine.union(geometryUnion);

                        // rendView.extent = union;// pLayer.fullExtent;

                        var unionPolygon = new Polygon({
                            rings: union.rings,
                            hasZ: false,
                            hasM: false,
                        });

                        if (PraJson.zoom) {
                            //  rendView.goTo(unionPolygon);
                            rendView.extent = unionPolygon.extent.expand(PraJson.zoom);
                            console.log(JSON.stringify(unionPolygon.extent));
                        } else {
                            rendView.extent = unionPolygon.extent.expand(1.5);
                        }

                    }

                    var textGraLayer = new GraphicsLayer();


                    if (PraJson.visible != undefined) {
                        if (PraJson1.visible) {
                            pLayer.visible = true;
                            textGraLayer.visible = true;
                        } else {
                            pLayer.visible = false;
                            textGraLayer.visible = false;
                        }
                    }

                    if (LabelClassJson) {
                        if (rendView == app.mapView) {


                            var textLayerID = layerId + "-text"
                            var textGraphics = graphics.slice(0);
                            for (var nm = 0; nm < textGraphics.length; nm++) {
                                var textGraphic = textGraphics[nm];
                                //var textSymbol = TextSymbol.fromJSON(LabelClassJson);
                                //textSymbol.text = textGraphic.attributes["FID"];
                                var textSymbol = TextSymbol.fromJSON(LabelClassJson["textSymbol"]);
                                textSymbol.text = textGraphic.attributes[LabelClassJson["fieldName"]];
                                textGraphic.symbol = textSymbol;

                                textGraLayer.add(textGraphic);
                            }

                            simpleMap.add(textGraLayer);

                        } else {
                            var labelClass = LabelClass.fromJSON(LabelClassJson);
                            // Add labels to the feature layer
                            pLayer.labelsVisible = true;
                            pLayer.labelingInfo = [labelClass];
                        }



                        //if (isZoomMultiple) {

                        //    app.activeView.goTo(graphics);

                        //}

                    }
                    //rendView.goTo({ target: geometryUnion, tilt: 60 }, { speedFactor: 0.5 });
                    ////事件定义
                    //if (eventJson.mouseClick) pLayer.on("click", function (e) {
                    //    window[eventJson.mouseClick](e);
                    //});
                    //if (eventJson.mousedbClick) pLayer.on("dbl-click", function (e) {
                    //    window[eventJson.mousedbClick](e);
                    //});
                    //if (eventJson.mouseOver) pLayer.on("mouse-over", function (e) {
                    //    window[eventJson.mouseOver](e);
                    //});


                }


                //pLayer.on("mouse-over", function (e) {
                //    map.infoWindow.setTitle(e.graphic.getTitle());
                //    map.infoWindow.setContent(e.graphic.getContent());
                //    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                //});
                //pLayer.on("mouse-out", function (e) {
                //    //mouseOutLayer(e)
                //    map.infoWindow.hide();
                //});

            });
    }

    //添加线
    function AddPolylines(layerId, PraJson1, actor) {
        require(["esri/Map",
                "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer",
                "esri/geometry/Point", "esri/Graphic", "esri/geometry/Polygon", "esri/geometry/Polyline",
                "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
                "esri/Color", "esri/symbols/PathSymbol3DLayer", "esri/symbols/LineSymbol3D",
                "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer", "esri/layers/support/LabelClass",
                "esri/symbols/TextSymbol3DLayer", "esri/symbols/LabelSymbol3D", "esri/symbols/TextSymbol", "esri/geometry/geometryEngine",
                "esri/renderers/support/jsonUtils",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, GraphicsLayer, FeatureLayer, Point, Graphic, Polygon, Polyline,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, PathSymbol3DLayer, LineSymbol3D,
                SimpleRenderer, UniqueValueRenderer, LabelClass, TextSymbol3DLayer, LabelSymbol3D, TextSymbol, geometryEngine,
                renderersjsonUtils,
                domConstruct) {

                function Act2d() {
                    var view = _this.app.mapView;
                    addMapPolyLayerRender(view, layerId, PraJson1, PraJson1.map);
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    addMapPolyLayerRender(view, layerId, PraJson1, PraJson1.scene);

                }
                actView(actor, Act2d, Act3d);

                function addMapPolyLayerRender(rendView, layerId, PraJson, viewJson) {
                    var graphicsJson = PraJson.gra;
                    var renderJson = viewJson.symbol;
                    var LabelClassJson = viewJson.label;
                    var targetView = viewJson.target;
                    var eventJson = PraJson.event;
                    var pTemplate = PraJson.popTemple;
                    var layerVisible = PraJson.visible;

                    var pLayer;
                    simpleMap = rendView.map;
                    if (simpleMap == null) return;
                    var graphics = [];
                    var geometryUnion = [];

                    //字段定义
                    var fields = [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }];
                    if (graphicsJson[0].attributes) {
                        for (var col in graphicsJson[0].attributes) {
                            fields.push({
                                name: col,
                                alias: col,
                                type: "string"
                            })
                        }
                    }
                    //样式定义
                    var renderer;

                    renderer = renderersjsonUtils.fromJSON(renderJson);
                    //renderer = new SimpleRenderer({
                    //    symbol:new LineSymbol3D({
                    //        symbolLayers: [new PathSymbol3DLayer({
                    //            size: 200,  // 20 meters in diameter
                    //            material: { color: "#ff7380" }
                    //        })]
                    //    })
                    //})
                    var syr = JSON.stringify(renderer.toJSON());
                    //添加图形

                    for (var i = 0; i < graphicsJson.length; i++) {
                        if (!graphicsJson[i]["attributes"])
                            graphicsJson[i]["attributes"] = { ObjectID: i };
                        else
                            graphicsJson[i]["attributes"]["ObjectID"] = i;
                        var pPoly = new Polyline({
                            paths: graphicsJson[i].geometry.paths
                        });
                        var graphic = {
                            geometry: pPoly,
                            attributes: graphicsJson[i].attributes,
                        };
                        //气泡模板设置
                        if (pTemplate) {
                            graphic.popupTemplate = pTemplate;
                        }
                        graphics.push(graphic);
                        geometryUnion.push(pPoly)
                    }

                    //生成图层
                    if (simpleMap.findLayerById(layerId)) {
                        pLayer = simpleMap.findLayerById(layerId);
                    } else {
                        pLayer = new FeatureLayer({
                            fields: fields,
                            objectIdField: "ObjectID",
                            title: layerId,
                            id: layerId,
                            source: graphics,
                            geometryType: "polyline",
                            spatialReference: { wkid: 4326 },
                            renderer: renderer,
                        });
                        simpleMap.add(pLayer);
                    }
                    //气泡模板设置
                    if (pTemplate) {
                        pLayer.popupTemplate = pTemplate;
                        pLayer.popupEnabled = true;
                    }



                    //if (rendView == _this.app.mapView) {

                    //    var union = geometryEngine.union(geometryUnion);

                    //    // rendView.extent = union;// pLayer.fullExtent;

                    //    var unionPolygon = new Polygon({
                    //        rings: union.rings,
                    //        hasZ: false,
                    //        hasM: false,
                    //    });

                    //    //  rendView.goTo(unionPolygon);
                    //    rendView.extent = unionPolygon.extent.expand(1.5);
                    //    console.log(JSON.stringify(unionPolygon.extent));
                    //}
                    var textGraLayer = new GraphicsLayer();

                    if (PraJson.visible != undefined) {
                        if (PraJson.visible) {
                            pLayer.visible = true;
                            textGraLayer.visible = true;
                        } else {
                            pLayer.visible = false;
                            textGraLayer.visible = false;
                        }
                    }

                    //if (LabelClassJson) {
                    //    if (rendView == app.mapView) {


                    //        var textLayerID = layerId + "-text"
                    //        var textGraphics = graphics.slice(0);
                    //        for (var nm = 0; nm < textGraphics.length; nm++) {
                    //            var textGraphic = textGraphics[nm];
                    //            //var textSymbol = TextSymbol.fromJSON(LabelClassJson);
                    //            //textSymbol.text = textGraphic.attributes["FID"];
                    //            var textSymbol = TextSymbol.fromJSON(LabelClassJson["textSymbol"]);
                    //            textSymbol.text = textGraphic.attributes[LabelClassJson["fieldName"]];
                    //            textGraphic.symbol = textSymbol;

                    //            textGraLayer.add(textGraphic);
                    //        }

                    //        simpleMap.add(textGraLayer);

                    //    }
                    //    else {
                    //        var labelClass = LabelClass.fromJSON(LabelClassJson);
                    //        // Add labels to the feature layer
                    //        pLayer.labelsVisible = true;
                    //        pLayer.labelingInfo = [labelClass];
                    //    }

                    //}
                    if (targetView) {
                        rendView.goTo(targetView, { speedFactor: 0.5 });
                    }

                    // rendView.goTo({ target: geometryUnion, tilt: 60 }, { speedFactor: 0.5 });


                    ////事件定义
                    //if (eventJson.mouseClick) pLayer.on("click", function (e) {
                    //    window[eventJson.mouseClick](e);
                    //});
                    //if (eventJson.mousedbClick) pLayer.on("dbl-click", function (e) {
                    //    window[eventJson.mousedbClick](e);
                    //});
                    //if (eventJson.mouseOver) pLayer.on("mouse-over", function (e) {
                    //    window[eventJson.mouseOver](e);
                    //});


                }


                //pLayer.on("mouse-over", function (e) {
                //    map.infoWindow.setTitle(e.graphic.getTitle());
                //    map.infoWindow.setContent(e.graphic.getContent());
                //    map.infoWindow.show(e.mapPoint, location, InfoWindow.ANCHOR_UPPERRIGHT);
                //});
                //pLayer.on("mouse-out", function (e) {
                //    //mouseOutLayer(e)
                //    map.infoWindow.hide();
                //});

            });
    }

    function AddImages(layerId, PraJson, actor) {
        require([
            "esri/map", "esri/layers/MapImageLayer", "esri/layers/support/MapImage"
        ], function(Map, MapImageLayer, MapImage) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var rendView = _this.app.mapView;
                var map = rendView.map;
                Act(map);
            }

            function Act3d() {
                var rendView = _this.app.mapView;
                var map = rendView.map;
                Act(map);
            }

            function Act(map) {
                var imghref = PraJson.href;
                var extent = PraJson.extent;
                var layer = new MapImageLayer();
                map.add(layer);
                mi = new MapImage({
                    'extent': extent,
                    'href': imghref
                });
                layer.addImage(mi);
            }
        })
    }
    //添加图片叠加渲染-three.js
    function AddImageThree(layerId, PraJson, actor) {
        require([
                "esri/Map",
                "esri/views/SceneView",
                "esri/views/3d/externalRenderers",
                "esri/geometry/SpatialReference",
                "esri/Camera",
                "esri/request",
                "dojo/domReady!",
            ],
            function(
                Map,
                SceneView,
                externalRenderers,
                SpatialReference,
                Camera,
                esriRequest
            ) {
                var view = _this.app.sceneView;
                var issExternalRenderer = {
                    renderer: null, // three.js renderer
                    camera: null, // three.js camera
                    scene: null, // three.js scene

                    ambient: null, // three.js ambient light source
                    sun: null, // three.js sun light source
                    models: [], // ISS model
                    issScale: 40000, // scale for the iss model
                    issMaterial: new THREE.MeshLambertMaterial({ color: 0xe03110 }), // material for the ISS model
                    imgMaterial: null, // material for the ISS model
                    cameraPositionInitialized: false, // we focus the view on the ISS once we receive our first data point
                    positionHistory: [], // all ISS positions received so far 

                    imgLayer: null,
                    /**
                     * Setup function, called once by the ArcGIS JS API.
                     */
                    setup: function(context) {

                        // initialize the three.js renderer
                        //////////////////////////////////////////////////////////////////////////////////////
                        this.renderer = new THREE.WebGLRenderer({
                            context: context.gl,
                            premultipliedAlpha: false
                        });
                        this.renderer.setPixelRatio(window.devicePixelRatio);
                        this.renderer.setViewport(0, 0, view.width, view.height);

                        // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
                        this.renderer.autoClearDepth = false;
                        this.renderer.autoClearStencil = false;
                        this.renderer.autoClearColor = false;

                        // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
                        // We have to inject this bit of code into the three.js runtime in order for it to bind those
                        // buffers instead of the default ones.
                        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
                        this.renderer.setRenderTarget = function(target) {
                            originalSetRenderTarget(target);
                            if (target == null) {
                                context.bindRenderTarget();
                            }
                        }

                        // setup the three.js scene
                        ///////////////////////////////////////////////////////////////////////////////////////

                        this.scene = new THREE.Scene();

                        // setup the camera
                        this.camera = new THREE.PerspectiveCamera();

                        // setup scene lighting
                        this.ambient = new THREE.AmbientLight(0xffffff, 1);
                        this.scene.add(this.ambient);
                        this.sun = new THREE.DirectionalLight(0xffffff, 1);
                        this.sun.position.set(40, -60, -10);
                        this.scene.add(this.sun);

                        //real function
                        this.init();

                        context.resetWebGLState();
                    },
                    init: function() {
                        var extent = PraJson.extent;
                        var CenterX = (extent[0] + extent[2]) / 2;
                        var CenterY = (extent[1] + extent[3]) / 2;
                        var z = PraJson.z;

                        var texture = new THREE.TextureLoader().load(PraJson.url);
                        //imgMap.wrapS = imgMap.wrapT = THREE.RepeatWrapping;
                        //imgMap.anisotropy = 16;

                        var width = (extent[2] - extent[0]) * 111 * 1000;
                        var height = (extent[3] - extent[1]) * 111 * 1000;
                        var material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
                        var object = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);
                        object.material.transparent = true;
                        this.scene.add(object);

                        var spacePos = [CenterX, CenterY, z];
                        var renderPos = [0, 0, 0];
                        externalRenderers.toRenderCoordinates(view, spacePos, 0, SpatialReference.WGS84, renderPos, 0, 1);
                        object.position.set(renderPos[0], renderPos[1], renderPos[2]);

                        this.imgLayer = object;
                    },
                    render: function(context) {

                        // update camera parameters
                        ///////////////////////////////////////////////////////////////////////////////////
                        var cam = context.camera;

                        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
                        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
                        this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

                        // Projection matrix can be copied directly
                        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

                        // draw the scene
                        /////////////////////////////////////////////////////////////////////////////////////////////////////
                        this.renderer.resetGLState();
                        this.renderer.render(this.scene, this.camera);

                        // as we want to smoothly animate the ISS movement, immediately request a re-render
                        externalRenderers.requestRender(view);

                        // cleanup
                        context.resetWebGLState();
                    },

                }
                _this.app.d3obj = issExternalRenderer;
                // register the external renderer
                externalRenderers.add(view, issExternalRenderer);

            })
    }

    function UpdateImageThreeUrl(layerId, PraJson, actor) {
        var texture = new THREE.TextureLoader().load(PraJson.url);
        var material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
        material.transparent = true;
        this.app.d3obj.imgLayer.material = material;
    }
    //地图缩放
    function MapZoomToExent(exentJson) {
        require([
            "esri/map", "esri/geometry/Point"
        ], function(Map, Point) {
            var union = geometryEngine.union(geometryUnion);
            rendView.extent = union.extent.expand(PraJson.zoom);
            var extent = new esri.geometry.Extent(exentJson);
            map.setExtent(extent);
        })
    }

    //地图缩放
    function MapZoomToLayer(layerId, actor) {
        require(["esri/geometry/geometryEngine"], function(geometryEngine) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var rendView = _this.app.mapView;
                var simpleMap = rendView.map;
                var layer = simpleMap.findLayerById(layerId);
                var graphicsArray = layer.source.items;
                var geometryArray = [];
                var graLength = graphicsArray.length;
                for (var i = 0; i < graLength; i++) {
                    geometryArray.push(graphicsArray[i]["geometry"]);
                }

                var union = geometryEngine.union(geometryArray);
                //var union = geometryEngine.union(layer.source.items);
                rendView.extent = union.extent;
            }

            function Act3d() {
                var rendView = _this.app.mapView;
                var simpleMap = rendView.map;
                var layer = simpleMap.findLayerById(layerId);
                rendView.extent = layer.fullExtent
            }
        })
    }

    //地图清空
    function MapClear() {
        require([
            "esri/Map", "esri/views/MapView", "esri/views/SceneView"
        ], function(Map, MapView, SceneView) {
            // map.graphics.clear();

            //  alert("二维" + JSON.stringify(app.sceneView
            var myMap = _this.app.mapView.map;
            myMap.removeAll();

            var myMapScene = _this.app.sceneView.map;
            myMapScene.removeAll();

            _this.app.mapView.popup.visible = false;
            _this.app.sceneView.popup.visible = false;


        })
    }

    //图层清空
    function LayerClear(layerIds, actor) {
        actView(actor, Act2d, Act3d);

        function Act2d() {
            var view = _this.app.mapView;
            Act(view);
        }

        function Act3d(view) {
            var view = _this.app.sceneView;
            Act(view);
        }

        function Act(view) {
            var map = view.map;
            if (layerIds instanceof Array) {
                var layers = [];
                for (var i = 0; i < layerIds.length; i++) {
                    if (map.findLayerById(layerIds[i])) {
                        layers.push(map.findLayerById(layerIds[i]));
                        //sceneMap.remove(sceneMap.findLayerById(layerIds[i]));
                    }
                }
                map.removeMany(layers);
            } else {
                if (map.findLayerById(layerIds)) {
                    map.remove(map.findLayerById(layerIds));
                }
            }
        }

        return;

        require([
            "esri/Map", "esri/views/MapView", "esri/views/SceneView"
        ], function(Map, MapView, SceneView) {

            //if (map.getLayer(layerId)) {

            //map.getLayer(layerId).clear();
            //map.getLayer(layerId).redraw();
            //  app.mapView.map.rem

            //  alert("二维" + JSON.stringify(app.sceneView
            //var myMap = _this.app.mapView.map;
            //if (myMap.findLayerById(layerId)) {
            //    myMap.remove(myMap.findLayerById(layerId));
            //}
            //if (myMap.findLayerById(layerId + "-text"))
            //{ myMap.remove(myMap.findLayerById(layerId + "-text")); }

            // layerId + "-text"

            var myMapScene = _this.app.sceneView.map;
            if (myMapScene.findLayerById(layerId)) {
                var layer = myMapScene.remove(myMapScene.findLayerById(layerId));
            }
            return;
            if (myMapScene.findLayerById(layerId + "-text")) { myMapScene.remove(myMapScene.findLayerById(layerId + "-text")); }

            _this.app.mapView.popup.visible = false;
            _this.app.sceneView.popup.visible = false;
            // app.mapView.map.findLayerById(layerId);

            //   findLayerById

            //  map.removeLayer(map.getLayer(layerId));
            // }

        });
    }

    //图层清空
    function GetLayer(layerId, callback) {
        require([
            "esri/Map", "esri/views/MapView", "esri/views/SceneView"
        ], function(Map, MapView, SceneView) {

            var myMap = _this.app.mapView.map;
            if (myMap.findLayerById(layerId)) {
                callback(myMap.findLayerById(layerId));
            }
            var myMapScene = _this.app.sceneView.map;
            if (myMapScene.findLayerById(layerId)) {
                callback(myMapScene.findLayerById(layerId));
            }

        });
    }
    //更新图层
    function LayerUpdate(layerId, ParaJson, actor) {
        require([
            "esri/geometry/Point",
        ], function(Point) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var view = _this.app.mapView.map;
                Act(view);
            }

            function Act3d(view) {
                var view = _this.app.sceneView.map;
                Act(view);
            }

            function Act(view) {
                var map = view.map;
                var layer = view.findLayerById(layerId);
                if (layer) {
                    var graphicsJson = ParaJson.gra;
                    //添加图形
                    var graphics = [];
                    var geometryUnion = [];
                    for (var i = 0; i < graphicsJson.length; i++) {
                        //定义字段内容
                        if (graphicsJson[i].attributes) {
                            graphicsJson[i].attributes["ObjectID"] = i;
                        } else {
                            var attributes = new Object();
                            attributes["ObjectID"] = i;
                            graphicsJson[i]["attributes"] = attributes;
                        }
                        //根据坐标系定义单点
                        var pPoint;
                        if (graphicsJson[i].geometry.spatialReference) {
                            pPoint = new Point({
                                x: graphicsJson[i].geometry.x,
                                y: graphicsJson[i].geometry.y,
                                spatialReference: graphicsJson[i].geometry.spatialReference.wkid,
                                hasZ: false,
                                hasM: false,
                            });
                        } else {
                            pPoint = new Point({
                                x: graphicsJson[i].geometry.x,
                                y: graphicsJson[i].geometry.y,
                                //  spatialReference: rendView.spatialReference,
                                hasZ: false,
                                hasM: false,
                            });
                        }

                        //考虑Z值并入组
                        if (graphicsJson[i].geometry.z == undefined) {
                            graphics.push({
                                geometry: pPoint, //new Point({
                                //    x: graphicsJson[i].geometry.x,
                                //    y: graphicsJson[i].geometry.y,
                                //  //  hasZ: false,
                                //    hasM: false
                                //}),
                                attributes: graphicsJson[i].attributes
                            });
                            geometryUnion.push(pPoint);
                        } else {
                            graphics.push({
                                geometry: pPoint,
                                attributes: graphicsJson[i].attributes
                            });
                            geometryUnion.push(pPoint);
                        }
                        //判断是否显示提示框
                        if (graphicsJson[i].attributes["tooltip"]) {
                            showTooltip = true;
                        }
                    }
                }
            }
        })
    }

    //加载图层
    function AddFeatureLayer(url, ParaJson, callback, beforfun, actor) {
        require(["esri/layers/FeatureLayer", "esri/layers/support/LabelClass",
                "esri/symbols/TextSymbol", "esri/renderers/support/jsonUtils",
            ],
            function(FeatureLayer, LabelClass, TextSymbol, renderersjsonUtils) {

                var layerdef = {
                    url: url,
                    id: ParaJson.id,
                    visible: ParaJson.visible,
                    displayField: ParaJson.nameField,
                    outFields: ["*"],
                    popupEnabled: true,
                    popupTemplate: {
                        title: "{" + ParaJson.nameField + "}",
                    }
                }
                if (ParaJson.symbol) {
                    var renderer = renderersjsonUtils.fromJSON(ParaJson.symbol);
                    layerdef.renderer = renderer;
                }
                if (ParaJson.labelvisible) {
                    var statesLabelClass = new LabelClass({
                        labelExpressionInfo: { value: "{" + ParaJson.nameField + "}" },
                        symbol: new TextSymbol({
                            color: "black",
                            haloSize: 1,
                            haloColor: "white"
                        })
                    });
                    layerdef.labelsVisible = ParaJson.labelvisible;
                    layerdef.labelingInfo = statesLabelClass;
                }
                if (ParaJson.popContent) {
                    layerdef.popupTemplate.content = ParaJson.popContent;
                }
                var layer = new FeatureLayer(layerdef);

                layer.on("layerview-create", function(event) {

                });

                actView(actor, Act2d, Act3d);

                function Act2d() {
                    _this.app.mapView.map.add(layer)
                }

                function Act3d() {
                    _this.app.sceneView.map.add(layer)
                }
            }
        )
    }

    //添加三维图层
    function AddSceneLayer() {
        require([
            "esri/config",
            "esri/Map",
            "esri/views/SceneView",
            "esri/layers/SceneLayer",
            "esri/renderers/SimpleRenderer",
            "esri/symbols/MeshSymbol3D",
            "dojo/domReady!"
        ], function(esriConfig, Map, SceneView, SceneLayer,
            SimpleRenderer, MeshSymbol3D
        ) {
            var symbol = new MeshSymbol3D();

            // Create the renderer and configure visual variables
            var renderer = new SimpleRenderer({
                symbol: symbol,
                visualVariables: [{
                        type: "color",
                        field: "HType",
                        stops: [{
                                value: 0,
                                color: "#288594"
                            },
                            {
                                value: 1,
                                color: "#5BA095"
                            },
                            {
                                value: 2,
                                color: "#A3A36B"
                            },
                            {
                                value: 3,
                                color: "#E7D580"
                            },
                            {
                                value: 4,
                                color: "#288594"
                            }
                        ]
                    },
                    {
                        type: "opacity",
                        field: "HType",
                        stops: [{ value: 0, opacity: 0.7 },
                            { value: 4, opacity: 0.9 }
                        ]
                    }
                ]
            });

            var sceneLayer = new SceneLayer({
                url: "https://tiles.arcgis.com/tiles/glS9FdXOLhofgCsX/arcgis/rest/services/lp_3D_Open/SceneServer",
                renderer: renderer // Set the renderer to sceneLayer
            });
            map.add(sceneLayer);
        })
    }

    //添加切片图层
    function AddTiledLayer(layerId, parJson, actor) {
        require([
            "esri/config",
            "esri/layers/WebTileLayer",
            "esri/layers/TileLayer",
            "esri/Map",
            "esri/views/SceneView",
            "dojo/dom",
            "dojo/domReady!"
        ], function(esriConfig, WebTileLayer, TileLayer, Map, SceneView, dom) {
            for (var i = 0; i < parJson.corsEnabledServers.length; i++) {
                esriConfig.request.corsEnabledServers.push(parJson.corsEnabledServers[i]);
            }
            var tiledLayer = new WebTileLayer({
                urlTemplate: parJson.urlTemplate,
                id: layerId
            });
            if (parJson.subDomains)
                tiledLayer.subDomains = parJson.subDomains;

            function Act2d() {
                _this.app.mapView.map.add(tiledLayer)
            }

            function Act3d() {
                _this.app.sceneView.map.add(tiledLayer)
            }
            actView(actor, Act2d, Act3d);

        });
    }

    function AddImageryLayer(layerId, parJson, actor) {
        require([
                "esri/Map",
                "esri/views/MapView",
                "esri/layers/ImageryLayer",
                "esri/layers/support/RasterFunction",
                "esri/layers/support/MosaicRule",
                "dojo/domReady!"
            ],
            function(
                Map, MapView,
                ImageryLayer, RasterFunction, MosaicRule
            ) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    Act(view)
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    Act(view)
                }

                function Act(view) {
                    var mosaicRule0 = new MosaicRule({
                        ascending: true,
                        method: "center",
                        operation: "last"
                    });
                    var remapRF0 = new RasterFunction({
                        functionName: "Remap",
                        functionArguments: {
                            inputRanges: [0, 41, 41, 44, 44, 255],
                            outputValues: [1, 2, 1],
                            raster: "$$"
                        },
                        outputPixelType: "U8"
                    });

                    var layer = new ImageryLayer({
                        url: parJson.url,
                        //format: "jpgpng",
                        //renderingRule: colorRF,
                        //mosaicRule: mosaicRule,
                    });

                    var remapRF, colorRF;
                    //颜色渲染定义
                    if (parJson.colormap) {
                        var colorJson = {
                            functionName: "Colormap",
                            functionArguments: {
                                colormap: parJson.colormap,
                                raster: "$$"
                            },
                            outputPixelType: "U8"
                        };
                        //重分类方法定义
                        if (parJson.remap) {
                            var remapJson = {
                                functionName: "Remap",
                                functionArguments: parJson.remap,
                                outputPixelType: "U8"
                            };
                            remapRF = new RasterFunction(remapJson);
                            colorJson.functionArguments.raster = remapRF;
                        }
                        colorRF = new RasterFunction(colorJson);
                        layer.renderingRule = colorRF;
                    }
                    //客户端渲染方案
                    if (parJson.colorsize) {
                        layer.pixelFilter = parJson.colorsize;
                    }
                    view.map.add(layer);
                }
            });
    }

    //自带底图集控件
    function SetBasemapGallery() {
        require(["esri/Map", "esri/widgets/BasemapGallery"], function(Map, BasemapGallery) {
            var view = _this.app.mapView;
            var basemapGallery = new BasemapGallery({
                view: view
            });
            // Add widget to the bottom left corner of the view
            view.ui.add(basemapGallery, {
                position: "top-right"
            });

        });
    }
    //自带底图切换控件
    function SetBasemapToggle(ParaJson, callback, actor) {
        require(["esri/Map", "esri/widgets/BasemapToggle"], function(Map, BasemapToggle) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var view = _this.app.mapView;
                var basemapToggle = _this.app.basemapToggle2d;
                Act(view, home);
            }

            function Act3d() {
                var view = _this.app.mapView;
                var basemapToggle = _this.app.basemapToggle3d;
                Act(view, home);
            }

            function Act(view, basemapToggle) {
                var nextbaseMap;
                if (baseMaps.length > 0) {
                    if (baseMaps[1]) nextbaseMap = baseMaps[1]
                    else nextbaseMap = baseMaps[0];
                }
                if (basemapToggle == undefined) {
                    basemapToggle = new BasemapToggle({
                        view: view,
                        nextBasemap: nextbaseMap
                    });
                    if (!ParaJson.postion) ParaJson.postion = "top-right";
                    view.ui.add(basemapToggle, ParaJson.postion);
                }
                if (ParaJson.visible || ParaJson.visible == undefined) {
                    basemapToggle.startup();
                    basemapToggle.on('toggle', function(event) {
                        callback(event);
                    });
                } else {
                    basemapToggle.destroy();
                }
            }
        });
    }

    var scalebar;
    //比例尺设定  postion: "top-right","bottom-right","top-center","bottom-center","bottom-left","top-left". The default value is "bottom-left".
    function SetScalebar(visible, postion, actor) {
        require(["esri/Map", "esri/widgets/ScaleBar"], function(Map, ScaleBar) {
            function Act2d() {
                var view = _this.app.mapView;
                if (scalebar == undefined) {
                    scalebar = new ScaleBar({
                        view: view,
                        unit: "dual"
                    });
                    if (!postion) postion = "bottom-left";
                    view.ui.add(scalebar, {
                        position: postion
                    });
                }
                if (visible)
                    scalebar.startup();
                else
                    scalebar.hide();
            }

            function Act3d() {}
            actView(actor, Act2d, Act3d);
        });
    }

    var overviewMapDijit;
    //鹰眼设定  postion: "top-right","bottom-right","top-center","bottom-center","bottom-left","top-left". The default value is "bottom-left".
    function SetOverviewMap(visible, postion) {
        require([
            "esri/Map", "esri/dijit/OverviewMap",
            "dojo/parser",
            "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"
        ], function(
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
            } else {
                overviewMapDijit.visible = false;
                overviewMapDijit.hide();
            }
        });
    }

    //图例设定 
    function SetLegend(visible, layerId, layeTitle, position) {

        require([
            "esri/Map", "esri/views/MapView", "esri/views/SceneView", "esri/widgets/Legend", "esri/layers/FeatureLayer"
        ], function(Map, MapView, SceneView, Legend, FeatureLayer) {

            var myMap = _this.app.mapView.map;
            //if (myMap.findLayerById(layerId)) {

            //    myMap.remove(myMap.findLayerById(layerId));
            //}
            //if (visible)
            //{
            //    }
            //    esle
            //    {
            //        _this.app.mapView.ui.empty(position);
            //    }
            _this.app.mapView.then(function() {
                // get the first layer in the collection of operational layers in the WebMap
                // when the resources in the MapView have loaded.
                var featureLayer = myMap.findLayerById(layerId);

                // if (legend == undefined) {
                var legend = new Legend({
                    view: _this.app.mapView,
                    layerInfos: [{
                        layer: featureLayer,
                        title: layeTitle
                    }]
                });
                //}
                if (visible) {
                    legend.startup();
                    _this.app.mapView.ui.empty(position);
                    _this.app.mapView.ui.add(legend, position);
                } else {
                    legend.destroy();
                    _this.app.mapView.ui.empty(position);

                }

                //_this.app.mapView.ui.empty("bottom-right");

                //_this.app.mapView.ui.add(legend, "bottom-right");




                // }
                // Add widget to the bottom right corner of the view


                //if (myMap.findLayerById(layerId + "-text"))
                //{ myMap.remove(myMap.findLayerById(layerId + "-text")); }
                // layerId + "-text"
                //var myMapScene = _this.app.sceneView.map;
                //if (myMapScene.findLayerById(layerId))
                //{ myMapScene.remove(myMapScene.findLayerById(layerId)); }

                //if (myMapScene.findLayerById(layerId + "-text"))
                //{ myMapScene.remove(myMapScene.findLayerById(layerId + "-text")); }
                //_this.app.mapView.popup.visible = false;
                //_this.app.sceneView.popup.visible = false;
            });



        });
    }


    //function SetLegend(visible, legendDiv) {
    //    require([
    //        "esri/map", "esri/dijit/Legend"
    //    ], function (
    //        Map, Legend
    //      ) {
    //        //parser.parse();
    //        if (legend == undefined) {
    //            legend = new Legend({
    //                map: map
    //            }, legendDiv);
    //        }
    //        if (visible) {
    //            legend.startup();
    //        }
    //        else {
    //            legend.destroy();
    //        }
    //    });
    //}


    var home;
    //Home键设置
    function SetHomeButton(PraJson, actor) {
        require([
            "esri/widgets/Home"
        ], function(Home) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var view = _this.app.mapView;
                var home = _this.app.home2d;
                Act(view, home);
            }

            function Act3d() {
                var view = _this.app.mapView;
                var home = _this.app.home3d;
                Act(view, home);
            }

            function Act(view, home) {
                if (home == undefined) {
                    home = new Home({
                        view: view
                    });
                    if (!PraJson.postion) PraJson.postion = "top-left";
                    view.ui.add(home, PraJson.postion);
                }
                if (PraJson.visible) {
                    home.startup();
                } else {
                    home.destroy();
                }
            }
        });
    }

    var zoom;
    //Home键设置
    function SetZoomButton(PraJson, actor) {
        require([
            "esri/widgets/Zoom"
        ], function(Zoom) {
            actView(actor, Act2d, Act3d);

            function Act2d() {
                var view = _this.app.mapView;
                Act(view, home);
            }

            function Act3d() {
                var view = _this.app.sceneView;
                Act(view, home);
            }

            function Act(view, zoom) { 
                if (view.ui.components.indexOf("zoom")==-1) {
                    zoom = new Zoom({
                        view: view
                    });
                    if (!PraJson.postion) PraJson.postion = "top-left";
                    view.ui.add(zoom, PraJson.postion);
                }else{
                    view.ui.move(["zoom"], PraJson.postion);
                }
                if (PraJson.visible) {
                    zoom.startup();
                } else {
                    zoom.destroy();
                }
            }
        });
    }

    function SetMapLayerClick(callback) {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/FeatureLayer",
            //"esri/renderers/UniqueValueRenderer",
            //"esri/symbols/SimpleLineSymbol",

            "esri/geometry/Point",
            "esri/renderers/support/jsonUtils",

            "dojo/dom",
            "dojo/domReady!"
        ], function(
            Map,
            MapView,
            FeatureLayer,
            //UniqueValueRenderer,
            //SimpleLineSymbol,
            Point,
            rendererJsonUtils,

            dom
        ) {

            //var sceneMapView = app.sceneView;
            var sMapView = _this.app.mapView;
            var sceneMapView = _this.app.sceneView;

            // Set up a click event handler and retrieve the screen x, y coordinates 
            var myclick = sceneMapView.on("click", function(evt) {
                LayerClear("point_layer");
                // sceneMapView.map.LayerClear("point_layer");     //    LayerClear

                var fields = [{
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                }];
                //var renderer;

                //renderer = rendererJsonUtils.fromJSON(renderJson);

                var point = [{
                    "geometry": { "x": evt.mapPoint.x, "y": evt.mapPoint.y, "spatialReference": { "wkid": sceneMapView.spatialReference.wkid } }
                }];
                callback(evt);
                myclick.remove();
                //console.log(JSON.stringify(point));

                //var graJson = {
                //    gra: point,
                //    scene: {
                //        symbol: ObjectSymbol3dJSON,
                //        offset: 60
                //        // ,
                //        //label: pointScenelabelCalss
                //    },
                //    zoom: 12,
                //};
                //AddPoints("point_layer", graJson, "3d");

                ////添加图形

                //    var attributes = new Object();
                //    attributes["ObjectID"] = 0;
                //     var graAttributes = new Object();
                //     graAttributes["attributes"] = attributes;
                //   // graphicsJson[i]["attributes"] = attributes;

                //    var pPoint = new Point({
                //        x: evt.mapPoint.x,
                //        y: evt.mapPoint.y,
                //        hasZ: false,
                //        hasM: false,
                //    });
                //    var graphics = [];
                //    graphics.push({
                //        geometry: pPoint, 
                //        attributes: attributes
                //    });



                //    var elevationInfo = "on-the-ground";
                //    //if (PraJson.scene) {
                //    //    if (PraJson.scene.offset) {
                //            elevationInfo = {
                //                mode: "relative-to-ground",
                //                offset: 60
                //        //    }
                //        //}
                //    }



                //   var graPointLayer = new FeatureLayer({
                //        fields: fields,
                //        objectIdField: "ObjectID",
                //        title: layerId,
                //        id: layerId,
                //        source: graphics,
                //        geometryType: "point",
                //        spatialReference: { wkid: sceneMapView.spatialReference },
                //        renderer: renderer,
                //      elevationInfo: elevationInfo,
                //   });

                //   sceneMapView.map.add(graPointLayer);

                //  console.log("经度" + evt.mapPoint.x + "  纬度  " + evt.mapPoint.y);



                // the hitTest() checks to see if any graphics in the view
                // intersect the given screen x, y coordinates
                //view.hitTest(screenPoint)
                //  .then(getGraphics);
            });



        });
    }

    //添加点
    function AddPoints(layerId, PraJson1, actor) {
        require(["esri/Map", "esri/layers/GraphicsLayer",
                "esri/layers/FeatureLayer",
                "esri/geometry/Point", "esri/geometry/Polygon",
                "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol",
                "esri/Color", "esri/symbols/PointSymbol3D",
                "esri/symbols/IconSymbol3DLayer",
                "esri/symbols/ObjectSymbol3DLayer",
                "esri/symbols/TextSymbol3DLayer",
                "esri/symbols/LabelSymbol3D",
                "esri/layers/support/LabelClass",
                "esri/renderers/SimpleRenderer",
                "esri/renderers/UniqueValueRenderer",
                "esri/symbols/TextSymbol",
                "esri/geometry/geometryEngine",
                "esri/renderers/support/jsonUtils",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, GraphicsLayer, FeatureLayer, Point, Polygon,
                SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol,
                Color, PointSymbol3D, IconSymbol3DLayer,
                ObjectSymbol3DLayer, TextSymbol3DLayer, LabelSymbol3D, LabelClass,
                SimpleRenderer, UniqueValueRenderer, TextSymbol, geometryEngine,
                rendererJsonUtils,
                domConstruct) {
                function Act2d() {
                    var view = _this.app.mapView;
                    addMapPointLayerRender(view, layerId, PraJson1, PraJson1.map);
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    addMapPointLayerRender(view, layerId, PraJson1, PraJson1.scene);
                }
                actView(actor, Act2d, Act3d);

                function addMapPointLayerRender(rendView, layerId, PraJson, viewJson) {
                    var graphicsJson = PraJson.gra;
                    var renderJson = viewJson.symbol;
                    var LabelClassJson = viewJson.label;
                    var eventJson = PraJson.event;
                    var pTemplate = PraJson.popTemple;
                    var layerVisible = PraJson.visible;

                    var simpleMap = rendView.map;
                    if (simpleMap == null) return;

                    var showTooltip, showInfo;
                    //字段定义
                    var fields = [{
                        name: "ObjectID",
                        alias: "ObjectID",
                        type: "oid"
                    }];
                    for (var col in graphicsJson[0]["attributes"]) {
                        fields.push({
                            name: col,
                            alias: col,
                            type: "string"
                        })
                    }
                    //样式定义
                    var renderer = rendererJsonUtils.fromJSON(renderJson);

                    //添加图形
                    var graphics = [];
                    var geometryUnion = [];
                    for (var i = 0; i < graphicsJson.length; i++) {
                        //定义字段内容
                        if (graphicsJson[i].attributes) {
                            graphicsJson[i].attributes["ObjectID"] = i;
                        } else {
                            var attributes = new Object();
                            attributes["ObjectID"] = i;
                            graphicsJson[i]["attributes"] = attributes;
                        }
                        //根据坐标系定义单点
                        if (!graphicsJson[i].geometry.x || !graphicsJson[i].geometry.y) continue;
                        var pPoint;
                        if (graphicsJson[i].geometry.spatialReference) {
                            pPoint = new Point({
                                x: graphicsJson[i].geometry.x,
                                y: graphicsJson[i].geometry.y,
                                spatialReference: graphicsJson[i].geometry.spatialReference.wkid,
                                hasZ: false,
                                hasM: false,
                            });
                        } else {
                            pPoint = new Point({
                                x: graphicsJson[i].geometry.x,
                                y: graphicsJson[i].geometry.y,
                                //  spatialReference: rendView.spatialReference,
                                hasZ: false,
                                hasM: false,
                            });
                        }

                        //考虑Z值并入组
                        if (graphicsJson[i].geometry.z == undefined) {
                            graphics.push({
                                geometry: pPoint, //new Point({
                                //    x: graphicsJson[i].geometry.x,
                                //    y: graphicsJson[i].geometry.y,
                                //  //  hasZ: false,
                                //    hasM: false
                                //}),
                                attributes: graphicsJson[i].attributes
                            });
                            geometryUnion.push(pPoint);
                        } else {
                            graphics.push({
                                geometry: pPoint,
                                attributes: graphicsJson[i].attributes
                            });
                            geometryUnion.push(pPoint);
                        }
                        //判断是否显示提示框
                        if (graphicsJson[i].attributes["tooltip"]) {
                            showTooltip = true;
                        }
                    }
                    var elevationInfo = "on-the-ground";
                    if (PraJson.scene) {
                        if (PraJson.scene.offset) {
                            elevationInfo = {
                                mode: "relative-to-ground",
                                offset: PraJson.scene.offset
                            }
                        }
                    }
                    //生成图层
                    var graPointLayer;
                    if (simpleMap.findLayerById(layerId)) {
                        graPointLayer = simpleMap.findLayerById(layerId);
                    } else {
                        graPointLayer = new FeatureLayer({
                            fields: fields,
                            objectIdField: "ObjectID",
                            title: layerId,
                            id: layerId,
                            source: graphics,
                            geometryType: "point",
                            spatialReference: { wkid: 4326 },
                            renderer: renderer,
                            elevationInfo: elevationInfo,
                        });
                        simpleMap.add(graPointLayer);
                    }
                    //气泡模板设置
                    if (pTemplate) {
                        graPointLayer.popupTemplate = pTemplate;
                    }
                    if (PraJson.visible != undefined) {
                        if (PraJson.visible) {
                            graPointLayer.visible = true;
                        } else {
                            graPointLayer.visible = false;
                        }
                    }
                    //缩放
                    if (PraJson.zoom) {
                        var union = geometryEngine.union(geometryUnion);
                        if (union.extent)
                            rendView.extent = union.extent.expand(PraJson.zoom);
                        // if (rendView == _this.app.mapView) { 
                        //     if (union.extent)
                        //         rendView.extent = union.extent.expand(PraJson.zoom);
                        // } else {
                        //     rendView.extent = union.extent.expand(PraJson.zoom);
                        //     //rendView.goTo(graphics[0]);
                        // }
                    }
                    //标签设置
                    if (LabelClassJson) {
                        if (rendView == _this.app.mapView) {
                            
                            var textGraLayer = new GraphicsLayer();
                            var textLayerID = layerId + "-text"

                            textGraLayer.id = textLayerID;
                            var textGraphics = graphics.slice(0);
                            for (var nm = 0; nm < textGraphics.length; nm++) {
                               var textGraphic = textGraphics[nm];
                               //var textSymbol = TextSymbol.fromJSON(LabelClassJson);
                               //textSymbol.text = textGraphic.attributes["FID"];
                               var textSymbol = TextSymbol.fromJSON(LabelClassJson["textSymbol"]);

                               textSymbol.text = textGraphic.attributes[LabelClassJson["fieldName"]];
                               textGraphic.symbol = textSymbol;

                               textGraLayer.add(textGraphic);
                            }

                            simpleMap.add(textGraLayer);

                        } else {
                            var labelClass = [];
                            for (var i = 0; i < LabelClassJson.length; i++) {
                                labelClass.push(LabelClass.fromJSON(LabelClassJson[i]));
                            }
                            graPointLayer.labelsVisible = true;
                            graPointLayer.labelingInfo = labelClass;
                        }

                    }
                    //事件定义
                    if (eventJson) {
                        if (eventJson.mouseClick)   rendView.on("click", function (event) {
                            rendView.hitTest(event).then(function (e) {
                                if (e.results.length > 0) {
                                    if (e.results[0].graphic) {
                                        if (e.results[0].graphic.layer.id == layerId)
                                            window[eventJson.mouseClick](e);
                                    } else {
                                        window[eventJson.mouseClick](null);
                                    } 
                                }
                                else {
                                    window[eventJson.mouseClick](null);
                                }
                            });  
                        });
                        if (eventJson.mousedbClick) graPointLayer.on("dbl-click", function(e) {
                            window[eventJson.mousedbClick](e);
                        });
                        if (eventJson.mouseOver) graPointLayer.on("mouse-over", function(e) {
                            window[eventJson.mouseOver](e);
                        });
                        if (eventJson.popShow) rendView.on("click", function(event) {
                            rendView.hitTest(event).then(function(e) {
                                if (e.results.length > 0) {
                                    if (e.results[0].graphic.layer.id == layerId)
                                        setTimeout(function() {
                                            eventJson.popShow(e.results[0].graphic);
                                        }, 100);
                                }
                            });


                        });
                    }
                    //显示提示框
                    if (showTooltip) {
                        var tooltip = createTooltip(rendView);
                        rendView.on("pointer-move", function(e) {
                            rendView.hitTest(e.x, e.y)
                                .then(function(hit) {
                                    if (hit.results.length == 0) {
                                        tooltip.hide();
                                        return;
                                    }
                                    var results = hit.results.filter(function(result) {
                                        return result.graphic.layer === graPointLayer;
                                    });

                                    if (results.length) {
                                        var graphic = results[0].graphic;
                                        var screenPoint = hit.screenPoint;

                                        //highlight = layerview.highlight(graphic);
                                        tooltip.show(screenPoint, graphic.getAttribute("tooltip"));
                                    } else {
                                        tooltip.hide();
                                    }
                                })
                        });
                    }
                    //气泡事件绑定
                    var popup = rendView.popup;
                    popup.viewModel.on("trigger-action", function(e) {
                        if (eventJson) {
                            if (eventJson.popClick) {
                                window[eventJson.popClick](e);
                            };
                        }
                    });

                    //创建提示框
                    function createTooltip(view) {
                        var tooltip = document.createElement("div");
                        var style = tooltip.style;

                        tooltip.setAttribute("role", "tooltip");
                        tooltip.classList.add("tooltip");

                        var textElement = document.createElement("div");
                        textElement.classList.add("esri-widget");
                        tooltip.appendChild(textElement);

                        view.container.appendChild(tooltip);

                        var x = 0;
                        var y = 0;
                        var targetX = 0;
                        var targetY = 0;
                        var visible = false;

                        // move the tooltip progressively
                        function move() {
                            x += (targetX - x) * 0.1;
                            y += (targetY - y) * 0.1;

                            if (Math.abs(targetX - x) < 1 && Math.abs(targetY - y) < 1) {
                                x = targetX;
                                y = targetY;
                            } else {
                                requestAnimationFrame(move);
                            }

                            style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(y) + "px, 0)";
                        }

                        return {
                            show: function(point, text) {
                                if (!visible) {
                                    x = point.x;
                                    y = point.y;
                                }

                                targetX = point.x;
                                targetY = point.y;
                                style.opacity = 1;
                                visible = true;
                                textElement.innerHTML = text;

                                move();
                            },

                            hide: function() {
                                style.opacity = 0;
                                visible = false;
                            }
                        };
                    }
                }

            });
    }

    //提示点样式
    var tipEvents = [];

    function AddPointTip(PraJson, actor) {
        require(["esri/Map", "esri/geometry/Point", "esri/geometry/ScreenPoint", "lgis/tipSymbol",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, Point, ScreenPoint, tipSymbol, domConstruct) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    var graphicsJson = PraJson.gra;
                    var datas = deal(graphicsJson, view);
                    var callback = function(e) {
                        if (PraJson.event.mouseClick)
                            window[PraJson.event.mouseClick](e);
                    }
                    tipSymbol.init("body", datas, callback);
                    var tipEvent = {};
                    tipEvent.pdwon = view.on("pointer-down", function(evt) {
                        tipSymbol.hide();
                    });
                    tipEvent.pup = view.on("pointer-up", function(evt) {
                        var datas = deal(graphicsJson, view);
                        tipSymbol.init("body", datas, callback);
                    });
                    tipEvent.mwheel = view.on("mouse-wheel", function(evt) {
                        tipSymbol.hide();

                        setTimeout(function() {
                            var datas = deal(graphicsJson, view);
                            tipSymbol.init("body", datas, callback);
                        }, 500)
                    });
                    tipEvents.push(tipEvent);

                }

                function Act3d() {

                }

                function deal(graphicsJson, view) {
                    var datas = [];
                    for (var i = 0; i < graphicsJson.length; i++) {
                        if (view.spatialReference.wkid == 4326) {
                            xy = { x: PraJson.gra[i].geometry.x, y: PraJson.gra[i].geometry.y };
                        } else if (view.spatialReference.wkid == 102100) {
                            xy = lonlat2mercator({ x: PraJson.gra[i].geometry.x, y: PraJson.gra[i].geometry.y });
                        }
                        var point = new Point({
                            x: xy.x,
                            y: xy.y,
                            spatialReference: view.spatialReference
                        });
                        var screenPoint = new ScreenPoint();
                        view.toScreen(point, screenPoint);
                        datas.push({
                            ObjectID: graphicsJson[i].attributes.ObjectID,
                            name: graphicsJson[i].attributes.name,
                            value: graphicsJson[i].attributes.value,
                            color: graphicsJson[i].attributes.color,
                            font: graphicsJson[i].attributes.font,
                            title: graphicsJson[i].attributes.title,
                            x: screenPoint.x,
                            y: screenPoint.y
                        });
                    }
                    return datas;
                }

            });
    }

    function closePointTip() {
        for (var i in tipEvents) {
            var tipEvent = tipEvents[i];
            tipEvent.pdwon.remove();
            tipEvent.pup.remove();
            tipEvent.mwheel.remove();
        }
        $(".tip_label").remove();
    }

    //热力图
    var curHeatMap;

    function AddHeatMap(PraJson, actor) {
        require(["esri/geometry/Point", "lgis/Heatmap-arcgis",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Point, HeatMap) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    var source = { datas: [] };
                    for (var i in PraJson.gra) {
                        var xy;
                        if (view.spatialReference.wkid == 4326) {
                            xy = { x: PraJson.gra[i].geometry.x, y: PraJson.gra[i].geometry.y };
                        } else if (view.spatialReference.wkid == 102100) {
                            xy = lonlat2mercator({ x: PraJson.gra[i].geometry.x, y: PraJson.gra[i].geometry.y });
                        }

                        var point = new Point({
                            x: xy.x,
                            y: xy.y,
                            spatialReference: view.spatialReference
                        });
                        var value = PraJson.gra[i].attributes[PraJson.field];
                        source.datas.push({ mapPoint: point, value: value });
                    }
                    curHeatMap = new HeatMap(view);
                    curHeatMap.generate(source);
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                }

            });
    }

    function ClearHeatMap() {
        if (curHeatMap) {
            curHeatMap.clear();
        }
    }

    var MapPatchEvent;
    //添加地图磁贴，定位到图层要素中点，可放任意内容(html)
    function AddMapPatch(layerId, ParaJson, actor, callback) {
        require(["esri/geometry/Point", "lgis/geometryUtils",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Point, geometryUtils) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    var layer = view.map.findLayerById(layerId);
                    getPostion(view, layer);
                    MapPatchEvent = view.watch('stationary', function(newValue) {
                        if (newValue) {
                            getPostion(view, layer);
                        } else {
                            var x = document.getElementsByClassName("lgisPatch");
                            var n = x.length;
                            for (var i = 0; i < n; i++) {
                                x[0].parentNode.removeChild(x[0]);
                            }
                        }
                    });
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    var layer = view.map.findLayerById(layerId);
                    getPostion(view, layer);
                    MapPatchEvent = view.watch('stationary', function(newValue) {
                        if (newValue) {
                            getPostion(view, layer);
                        } else {
                            var x = document.getElementsByClassName("lgisPatch");
                            var n = x.length;
                            for (var i = 0; i < n; i++) {
                                x[0].parentNode.removeChild(x[0]);
                            }
                        }
                    });
                }

                function getPostion(view, layer) {
                    switch (layer.geometryType) {
                        case "polygon":
                            for (var i in layer.source.items) {
                                var graphic = layer.source.items[i];
                                var attributes = graphic.attributes;
                                var centerPt = graphic.geometry.centroid;
                                addPatch(view, centerPt, attributes);
                            }
                            break;
                        case "":
                            break;
                        case "":
                            break;
                        default:
                            break;
                    }
                    callback();
                }

                function addPatch(view, centerPt, attributes) {
                    if (view.spatialReference.wkid == "102100") {
                        var xy;
                        if (centerPt.spatialReference.wkid == "4326")
                            xy = lonlat2mercator({ x: centerPt.x, y: centerPt.y });
                        else
                            xy = { x: centerPt.x, y: centerPt.y };
                        mapPt = new Point({
                            x: xy.x,
                            y: xy.y,
                            spatialReference: view.spatialReference
                        });
                    } else {
                        mapPt = new Point({
                            x: centerPt.x,
                            y: centerPt.y
                        });
                    }
                    var screenPt = view.toScreen(mapPt);
                    var item;
                    for (var i in ParaJson.data) {
                        if (ParaJson.data[i].target == attributes[ParaJson.field]) {
                            item = ParaJson.data[i];
                            break;
                        }
                    }
                    if (item) {
                        var div = document.createElement('div');
                        div.style.position = 'absolute';
                        //div.style.height =  '50px';
                        //div.style.width =  '50px';
                        div.style.top = screenPt.y + item.yoffset + "px";
                        div.style.left = screenPt.x + item.xoffset + "px";
                        div.innerHTML = item.content;
                        div.className = "lgisPatch";
                        view.container.firstChild.firstChild.appendChild(div);
                    }
                }

            });
    }

    function ClearMapPatch() {
        var x = document.getElementsByClassName("lgisPatch");
        var n = x.length;
        for (var i = 0; i < n; i++) {
            x[0].parentNode.removeChild(x[0]);
        }
        if (MapPatchEvent)
            MapPatchEvent.remove();
    }

    //绘制流场
    function AddMapWindy(ParaJson) {
        var view, map, flowLayer;
        var canvasSupport;
        view = _this.app.mapView,
            map = _this.app.mapView.map;
        require([
            "esri/request",
            "dojo/parser", "dojo/number", "dojo/json", "dojo/dom",
            "dijit/registry", "lgis/FlowLayerD3",
            "esri/config",
            "dojo/domReady!",
            "lgis/d3.min", "lgis/when", "lgis/mvi"
        ], function(
            esriRequest,
            parser, number, JSON, dom,
            registry, FlowLayer, esriConfig
        ) {
            parser.parse();
            debugger;
            changeColors(ParaJson.colors);
            self._mapEvent = view.watch('stationary', function(newValue) {
                if (newValue) {
                    setTimeout(function() {
                        draw();
                    }, 100);
                } else {
                    if (flowLayer) {
                        flowLayer.stop();
                    }
                }
            });


            function supports_canvas() {
                return !!document.createElement("canvas").getContext;
            }

            function draw() {
                debugger;
                canvasSupport = supports_canvas();
                // Add raster layer
                if (canvasSupport) {
                    //box
                    var extent;
                    if (view.spatialReference.wkid == "102100") {
                        extent = view.extent;
                        var min = mercator2lonlat({ x: extent.xmin, y: extent.ymin });
                        var max = mercator2lonlat({ x: extent.xmax, y: extent.ymax });
                        extent = {
                            xmin: min.x,
                            ymin: min.y,
                            xmax: max.x,
                            ymax: max.y
                        }
                    } else {
                        extent = view.extent;
                    }
                    var box = [extent.xmin, extent.ymin, extent.xmax, extent.ymax];
                    flowLayer = new FlowLayer({ bbox: box, view: view, colors: ParaJson.colors, render: ParaJson.render });
                    flowLayer.build(ParaJson);
                }
            }

            function changeColors(colors) {
                for (var i in colors) {
                    if (colors[i].indexOf("#") > -1) {
                        colors[i] = colors[i].colorRgb();
                    }
                }
            }

        });
    }

    function AddSceneWindy(ParaJson) {
        require([
                "esri/Map",
                "esri/views/SceneView",
                "esri/views/3d/externalRenderers",
                "esri/geometry/SpatialReference",
                "esri/request",
                "dojo/domReady!",
            ],
            function(
                Map,
                SceneView,
                externalRenderers,
                SpatialReference,
                esriRequest
            ) {
                var view = _this.app.sceneView;
                var issExternalRenderer = {
                    renderer: null, // three.js renderer
                    camera: null, // three.js camera
                    scene: null, // three.js scene
                    ambient: null, // three.js ambient light source
                    sun: null, // three.js sun light source
                    models: [], // ISS model
                    tick: 0,
                    clock: new THREE.Clock(),
                    controls: null,
                    container: null,
                    gui: new dat.GUI({ width: 350 }),
                    options: null,
                    spawnerOptions: null,
                    particleSystem: null,
                    stats: null,
                    /**
                     * Setup function, called once by the ArcGIS JS API.
                     */
                    setup: function(context) {

                        // initialize the three.js renderer
                        //////////////////////////////////////////////////////////////////////////////////////
                        this.renderer = new THREE.WebGLRenderer({
                            context: context.gl,
                            premultipliedAlpha: false
                        });
                        this.renderer.setPixelRatio(window.devicePixelRatio);
                        this.renderer.setViewport(0, 0, view.width, view.height);

                        // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
                        this.renderer.autoClearDepth = false;
                        this.renderer.autoClearStencil = false;
                        this.renderer.autoClearColor = false;

                        // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
                        // We have to inject this bit of code into the three.js runtime in order for it to bind those
                        // buffers instead of the default ones.
                        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
                        this.renderer.setRenderTarget = function(target) {
                            originalSetRenderTarget(target);
                            if (target == null) {
                                context.bindRenderTarget();
                            }
                        }

                        // setup the three.js scene
                        ///////////////////////////////////////////////////////////////////////////////////////

                        this.scene = new THREE.Scene();

                        // setup the camera
                        this.camera = new THREE.PerspectiveCamera();

                        // setup scene lighting
                        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
                        this.scene.add(this.ambient);
                        this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
                        this.sun.position.set(40, -60, -10);
                        this.scene.add(this.sun);


                        this.particleSystem = new THREE.GPUParticleSystem({
                            maxParticles: 500000
                        });
                        this.scene.add(this.particleSystem);

                        this.options = {
                            position: new THREE.Vector3(),
                            positionRandomness: 0.01,
                            velocity: new THREE.Vector3(),
                            velocityRandomness: 0.01,
                            color: 0x999999,
                            colorRandomness: .2,
                            turbulence: 0,
                            lifetime: 0.7,
                            size: 3,
                            sizeRandomness: 1
                        };

                        this.spawnerOptions = {
                            spawnRate: 2000,
                            horizontalSpeed: 1.5,
                            verticalSpeed: 1.33,
                            timeScale: 0.3
                        };

                        context.resetWebGLState();

                        this.startPoints = ParaJson.gra;
                    },

                    render: function(context) {
                        var _this = this;
                        animate();
                        // update camera parameters
                        ///////////////////////////////////////////////////////////////////////////////////
                        var cam = context.camera;

                        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
                        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
                        this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

                        // Projection matrix can be copied directly
                        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

                        // draw the scene
                        /////////////////////////////////////////////////////////////////////////////////////////////////////
                        this.renderer.resetGLState();
                        this.renderer.render(this.scene, this.camera);

                        // as we want to smoothly animate the ISS movement, immediately request a re-render
                        externalRenderers.requestRender(view);

                        // cleanup
                        context.resetWebGLState();

                        function animate() {
                            var delta = _this.clock.getDelta() * _this.spawnerOptions.timeScale;
                            _this.tick += delta;
                            if (_this.tick < 0) _this.tick = 0;
                            if (delta > 0) {
                                var dx = Math.sin(_this.tick * _this.spawnerOptions.horizontalSpeed) * 200;
                                var dy = Math.sin(_this.tick * _this.spawnerOptions.verticalSpeed) * 100;
                                var dz = Math.sin(_this.tick * _this.spawnerOptions.horizontalSpeed + _this.spawnerOptions.verticalSpeed) * 10;

                                for (var i = 0; i < _this.startPoints.length; i++) {
                                    var posEst = [_this.startPoints[i].geometry.x, _this.startPoints[i].geometry.y, ParaJson.scene.offset];
                                    var renderPos = [_this.options.position.x, _this.options.position.y, _this.options.position.z];
                                    externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, renderPos, 0, 1);

                                    _this.options.position.x = renderPos[0] + dx;
                                    _this.options.position.y = renderPos[1] + dy;
                                    _this.options.position.z = renderPos[2] + dz;

                                    for (var x = 0; x < _this.spawnerOptions.spawnRate * delta; x++) {
                                        _this.particleSystem.spawnParticle(_this.options);
                                    }
                                    console.log(_this.startPoints.length + " : " + i);
                                }

                            }
                            _this.particleSystem.update(_this.tick);
                        }
                    },

                }
                _this.app.d3obj = issExternalRenderer;
                // register the external renderer
                externalRenderers.add(view, issExternalRenderer);

            })
    }

    //定位到已存在的点
    function MapTo(ParaJson, actor) {
        require(["esri/Map",
                "esri/Camera",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Map, Camera, domConstruct) {
                function Act2d() {
                    debugger;
                    var view = _this.app.mapView;
                    map = view.map;
                    //经纬度
                    if (ParaJson.x) {
                        var camera = ParaJson;
                        view.goTo({
                            center: [ParaJson.x, ParaJson.y],
                        })
                    }
                    //图层
                    if (ParaJson.layerId) {
                        var field = ParaJson.field;
                        var value = ParaJson.value;
                        if (map.findLayerById(layerId)) {
                            var layer = map.findLayerById(layerId);
                            var graphics = graPointLayer.source;
                            for (var i = 0; i < graphics.length; i++) {
                                if (graphics[i].attributes[field] == value) {
                                    view.goTo({
                                        target: [graphics[i]],
                                        heading: 0,
                                        tilt: 0
                                    });
                                }
                            }
                        }
                    }
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    map = view.map;
                    //相机位置
                    if (ParaJson.position) {
                        var camera = ParaJson;
                        view.goTo(new Camera(camera));
                    }
                    //图层
                    if (ParaJson.layerId) {
                        var field = ParaJson.field;
                        var value = ParaJson.value;
                        if (map.findLayerById(layerId)) {
                            var layer = map.findLayerById(layerId);
                            var graphics = graPointLayer.source;
                            for (var i = 0; i < graphics.length; i++) {
                                if (graphics[i].attributes[field] == value) {
                                    view.goTo({
                                        target: [graphics[i]],
                                        heading: 0,
                                        tilt: 0
                                    });
                                }
                            }
                        }
                    }
                }
                actView(actor, Act2d, Act3d);
            });
    }

    function HideInfo(actor) {
        actView(actor, Act2d, Act3d);

        function Act2d() {
            var view = _this.app.mapView;
            Act(view)
        }

        function Act3d() {
            var view = _this.app.sceneView;
            Act(view)
        }

        function Act(view) {
            view.popup.close();
        }
    }

    var mapDraws = [];;
    //地图标绘
    function MapDraw(ParaJson, callback, actor) {
        require(["lgis/Draw",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Draw) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    Act(view)
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    Act(view)
                }

                function Act(view) {
                    var mapDraw = new Draw(view);
                    mapDraw.activate(ParaJson.type, function(e) {
                        //console.log(e);
                        if (callback) callback(e);
                    })
                    mapDraws.push(mapDraw);
                }
            });
    }

    function MapDrawClear() {
        if (mapDraws.length > 0) {
            for (var i = 0; i < mapDraws.length; i++) {
                if (mapDraws[i]) {
                    mapDraws[i].clear();
                }
            }
        }
    }

    var activeWidget;
    //测量
    function Measure(ParaJson, actor) {
        require(["lgis/Measure",
                "esri/widgets/DirectLineMeasurement3D",
                "esri/widgets/AreaMeasurement3D",
                "dojo/dom-construct", "dojo/domReady!"
            ],
            function(Measure, DirectLineMeasurement3D, AreaMeasurement3D) {
                actView(actor, Act2d, Act3d);

                function Act2d() {
                    var view = _this.app.mapView;
                    var measure = new Measure(view, { coordinates: 'projected' }); // view为mapView
                    switch (ParaJson.type) {
                        case "location":
                            measure.activate("location", {
                                customUnit: '千米',
                                parseResult: function(result) { return result / 1000000 },
                                decimal: 2, // 保留小数位数
                                unit: '' // 此处为测量单位，为api中geometryEngine里的单位字符串，默认为米和平方米
                            });
                            break;
                        case "length":
                            measure.activate("length", {
                                customUnit: '千米',
                                parseResult: function(result) { return result / 1000 },
                                decimal: 2, // 保留小数位数
                                unit: '' // 此处为测量单位，为api中geometryEngine里的单位字符串，默认为米和平方米
                            });
                            break;
                        case "area":
                            measure.activate("area", {
                                customUnit: '平方千米',
                                parseResult: function(result) { return result / 1000000 },
                                decimal: 2, // 保留小数位数
                                unit: '' // 此处为测量单位，为api中geometryEngine里的单位字符串，默认为米和平方米
                            });
                            break;
                        default:

                    }
                }

                function Act3d() {
                    var view = _this.app.sceneView;
                    switch (ParaJson.type) {
                        case "length":
                            activeWidget = new DirectLineMeasurement3D({
                                view: view
                            });
                            //view.ui.add(activeWidget, "top-right");
                            //setActiveButton(document.getElementById('distanceButton'));
                            break;
                        case "area":
                            activeWidget = new AreaMeasurement3D({
                                view: view
                            });
                            //view.ui.add(activeWidget, "top-right");
                            //setActiveButton(document.getElementById('areaButton'));
                            break;
                        case null:
                            if (activeWidget) {
                                view.ui.remove(activeWidget);
                                activeWidget.destroy();
                                activeWidget = null;
                            }
                            break;
                    }
                }
            });
    }

    //画扇形
    function CreateSector(lon, lat, radius, startAngle, endAngle, pointNum, callback) {
        var sin;
        var cos;
        var x;
        var y;
        var angle;

        var points = new Array();
        points.push([lon, lat]);
        for (var i = 0; i <= pointNum; i++) {
            angle = startAngle + (endAngle - startAngle) * i / pointNum;
            sin = Math.sin(angle * Math.PI / 180);
            cos = Math.cos(angle * Math.PI / 180);
            x = lon + radius * sin;
            y = lat + radius * cos;
            points.push([x, y]);
        }
        return points;
    }

    //画圆
    function CreateCircle(lon, lat, radius, callback) {
        require([
            "esri/geometry/Circle",
            "esri/geometry/Polygon",
            "esri/Map",
            "esri/geometry/Point",
            "esri/Graphic",

        ], function(Circle, Polygon, Map, Point, Graphic) {
            var pt = new Point({
                x: lon,
                y: lat,
                //spatialReference: "4326",
            });
            var circle = new Circle({
                center: pt,
                geodesic: true,
                radius: radius
            });
            callback(circle);
        })
    }

    //函数的参数x,y为椭圆中心；a,b分别为椭圆横半轴
    function CreateEllipse(x, y, a, b) {

        var step = (a > b) ? 1 / a : 1 / b,
            points = [];

        for (var i = 0; i < 2 * Math.PI; i += step) {
            var point = [x + a * Math.cos(i), y + b * Math.sin(i)];
            points.push(point);
        }
        points = points.reverse();
        return points;
    }

    //判断经纬度是否在多边形中
    function isInsidePolygon(lng, lat, poly) {
        if (poly[0].lat) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].lat <= lng && lng < poly[j].lat) || (poly[j].lat <= lng && lng < poly[i].lat)) &&
                (lat < (poly[j].lng - poly[i].lng) * (lng - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng) &&
                (c = !c);
            return c;
        } else {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i][0] <= lng && lng < poly[j][0]) || (poly[j][0] <= lng && lng < poly[i][0])) &&
                (lat < (poly[j][1] - poly[i][1]) * (lng - poly[i][0]) / (poly[j][0] - poly[i][0]) + poly[i][1]) &&
                (c = !c);
            return c;
        }
    }

    var curEchartsLayer;
    //加载Echarts图层
    function AddEcharts(ParaJson) {
        require(["esri/Map", "lgis/EchartsLayer", "lgis/echarts.source", "dojo/domReady!"],
            function(Map, EchartsLayer) {
                debugger;
                var overlay = new EchartsLayer(_this.app.mapView, echarts);
                var chartsContainer = overlay.getEchartsContainer();
                var myChart = overlay.initECharts(chartsContainer);
                window.onresize = myChart.onresize;
                var option = ParaJson.option;
                overlay.setOption(option);
                curEchartsLayer = overlay;
            });
    }

    function ClearEcharts() {
        if (curEchartsLayer) {
            curEchartsLayer.clear();
            var echartlayer = document.getElementsByClassName("lgisEchartsLayer");
            if (echartlayer) {
                if (echartlayer.length > 0)
                    echartlayer[0].parentNode.removeChild(echartlayer[0]);
            }
        }
    }

    function BindEvent(eventType, callback, actor) {
        actView(actor, Act2d, Act3d);

        function Act2d() {
            var view = _this.app.mapView;
            var mapevent = view.on(eventType, function(e) {
                callback(e);
            });
            mapEvents.push({ eventType: eventType, event: mapevent });
        }

        function Act3d() {
            var view = _this.app.sceneView;
            var mapevent = view.on(eventType, function(e) {
                callback(e);
            });
            mapEvents.push({ eventType: eventType, event: mapevent });
        }



    }

    function RemoveEvent(eventType, actor) {
        for (var i = 0; i < mapEvents.length; i++) {
            if (mapEvents[i].eventType == eventType) {
                mapEvents[i].event.remove();
            }
        }
    }

    function LoadObj(ParaJson) {
        require([
                "esri/Map",
                "esri/views/SceneView",
                "esri/views/3d/externalRenderers",
                "esri/geometry/SpatialReference",
                "esri/request",
                "dojo/domReady!",
            ],
            function(
                Map,
                SceneView,
                externalRenderers,
                SpatialReference,
                esriRequest
            ) {
                var view = _this.app.sceneView;
                var issExternalRenderer = {
                    renderer: null, // three.js renderer
                    camera: null, // three.js camera
                    scene: null, // three.js scene

                    ambient: null, // three.js ambient light source
                    sun: null, // three.js sun light source
                    models: [], // ISS model
                    issScale: 40000, // scale for the iss model
                    issMaterial: new THREE.MeshLambertMaterial({ color: 0xe03110 }), // material for the ISS model
                    imgMaterial: null, // material for the ISS model
                    cameraPositionInitialized: false, // we focus the view on the ISS once we receive our first data point
                    positionHistory: [], // all ISS positions received so far

                    markerMaterial: null, // material for the markers left by the ISS
                    markerGeometry: null, // geometry for the markers left by the ISS

                    /**
                     * Setup function, called once by the ArcGIS JS API.
                     */
                    setup: function(context) {

                        // initialize the three.js renderer
                        //////////////////////////////////////////////////////////////////////////////////////
                        this.renderer = new THREE.WebGLRenderer({
                            context: context.gl,
                            premultipliedAlpha: false
                        });
                        this.renderer.setPixelRatio(window.devicePixelRatio);
                        this.renderer.setViewport(0, 0, view.width, view.height);

                        // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
                        this.renderer.autoClearDepth = false;
                        this.renderer.autoClearStencil = false;
                        this.renderer.autoClearColor = false;

                        // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
                        // We have to inject this bit of code into the three.js runtime in order for it to bind those
                        // buffers instead of the default ones.
                        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
                        this.renderer.setRenderTarget = function(target) {
                            originalSetRenderTarget(target);
                            if (target == null) {
                                context.bindRenderTarget();
                            }
                        }

                        // setup the three.js scene
                        ///////////////////////////////////////////////////////////////////////////////////////

                        this.scene = new THREE.Scene();

                        // setup the camera
                        this.camera = new THREE.PerspectiveCamera();

                        // setup scene lighting
                        this.ambient = new THREE.AmbientLight(0xffffff, 1);
                        this.scene.add(this.ambient);
                        this.sun = new THREE.DirectionalLight(0xffffff, 1);
                        this.sun.position.set(40, -60, -10);
                        this.scene.add(this.sun);

                        // setup markers
                        this.markerGeometry = new THREE.SphereBufferGeometry(12 * 1000, 16, 16);
                        this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe03110, transparent: true, opacity: 0.75 });

                        // texture
                        var manager = new THREE.LoadingManager();
                        manager.onProgress = function(item, loaded, total) {
                            console.log(item, loaded, total);
                        };
                        var textureLoader = new THREE.TextureLoader(manager);
                        var loader = new THREE.OBJLoader(THREE.DefaultLoadingManager);

                        for (var i = 0; i < ParaJson.gra.length; i++) {
                            (function(i, _this) {
                                var point = ParaJson.gra[i];
                                var posEst = [point.geometry.x, point.geometry.y, point.attributes.z];
                                var issMaterial = ""; //textureLoader.load('../data/UV_Grid_Sm.jpg');
                                var issMeshUrl = point.attributes.objurl;
                                var issScale = point.attributes.scale;
                                var rotation_x = point.attributes.rotation_x;
                                var rotation_y = point.attributes.rotation_y;
                                var rotation_z = point.attributes.rotation_z;
                                debugger;
                                issMaterial = issMeshUrl.replace("obj", "mtl");
                                var rootPath = issMeshUrl.replace(issMeshUrl.split("/")[issMeshUrl.split("/").length - 1], "");
                                //rootPath = "http://localhost:8011/lp3ddata/";
                                var mtlLoader = new THREE.MTLLoader();
                                mtlLoader.crossOrigin = "Anonymous";
                                mtlLoader.load(issMaterial, function(materials) {
                                    for (var i in materials.materialsInfo) {
                                        if (materials.materialsInfo[i].map_d)
                                            materials.materialsInfo[i].map_d = rootPath + materials.materialsInfo[i].map_d.replace("\\", "/");
                                        if (materials.materialsInfo[i].map_ka)
                                            materials.materialsInfo[i].map_ka = rootPath + materials.materialsInfo[i].map_ka.replace("\\", "/");
                                        if (materials.materialsInfo[i].map_kd)
                                            materials.materialsInfo[i].map_kd = rootPath + materials.materialsInfo[i].map_kd.replace("\\", "/");
                                    }
                                    materials.preload();
                                    loader.setMaterials(materials).load(issMeshUrl, function(object3d) {
                                        console.log(issMeshUrl + " is loaded.");
                                        var iss = object3d;
                                        //iss.traverse(function (child) {
                                        //    if (child instanceof THREE.Mesh) {
                                        //        //child.material = this.issMaterial;
                                        //        //child.material.map = imgMaterial;
                                        //    }
                                        //});

                                        iss.scale.set(issScale, issScale, issScale);
                                        iss.rotation.set(rotation_x, rotation_y, rotation_z);

                                        var renderPos = [0, 0, 0];
                                        externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, renderPos, 0, 1);
                                        iss.position.set(renderPos[0], renderPos[1], renderPos[2]);
                                        _this.models.push(iss);
                                        _this.scene.add(iss);
                                    }.bind(_this), undefined, function(error) {
                                        console.error("Error loading ISS mesh. ", error);
                                    });

                                });

                                //loader.load(issMeshUrl, function (object3d) {
                                //    console.log(issMeshUrl + " is loaded.");
                                //    var iss = object3d;
                                //    iss.traverse(function (child) {
                                //        if (child instanceof THREE.Mesh) {
                                //            console.log(child.name);
                                //            //var randomMaterial = new THREE.MeshLambertMaterial({ color: Math.floor(Math.random() * 0xffffff) });
                                //            //var randomMaterial = new THREE.MeshLambertMaterial({ color: 0xE8E66E });
                                //            //child.material = randomMaterial;
                                //            //child.material.map = randomMaterial;
                                //        }
                                //    });

                                //    iss.scale.set(issScale, issScale, issScale);
                                //    iss.rotation.set(rotation_x, rotation_y, rotation_z);

                                //    var renderPos = [0, 0, 0];
                                //    externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, renderPos, 0, 1);
                                //    iss.position.set(renderPos[0], renderPos[1], renderPos[2]);
                                //    _this.models.push(iss);
                                //    _this.scene.add(iss);
                                //}.bind(_this), undefined, function (error) {
                                //    console.error("Error loading ISS mesh. ", error);
                                //});


                            })(i, this)
                        }

                        // create the horizon model
                        var mat = new THREE.MeshBasicMaterial({ color: 0x2194ce });
                        mat.transparent = true;
                        mat.opacity = 0.5;
                        this.region = new THREE.Mesh(
                            new THREE.TorusBufferGeometry(2294 * 1000, 100 * 1000, 16, 64),
                            mat
                        );
                        //this.scene.add(this.region);


                        // start querying the ISS position
                        //this.queryISSPosition();

                        // cleanup after ourselfs
                        context.resetWebGLState();
                    },

                    render: function(context) {

                        // update camera parameters
                        ///////////////////////////////////////////////////////////////////////////////////
                        var cam = context.camera;

                        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
                        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
                        this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

                        // Projection matrix can be copied directly
                        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

                        // draw the scene
                        /////////////////////////////////////////////////////////////////////////////////////////////////////
                        this.renderer.resetGLState();
                        this.renderer.render(this.scene, this.camera);

                        // as we want to smoothly animate the ISS movement, immediately request a re-render
                        externalRenderers.requestRender(view);

                        // cleanup
                        context.resetWebGLState();
                    },

                }
                _this.app.d3obj = issExternalRenderer;
                // register the external renderer
                externalRenderers.add(view, issExternalRenderer);

            })
    }

    function RemoveObj(ParaJson) {
        require([
                "esri/Map",
                "esri/views/SceneView",
                "esri/views/3d/externalRenderers",
                "esri/geometry/SpatialReference",
                "esri/request",
                "dojo/domReady!",
            ],
            function(
                Map,
                SceneView,
                externalRenderers,
                SpatialReference,
                esriRequest
            ) {
                var view = _this.app.sceneView;
                if (_this.app.d3obj) {
                    externalRenderers.remove(view, _this.app.d3obj);
                    _this.app.d3obj = null;
                }
            })
    }

    function LoadObj0() {
        require([
                "esri/Map",
                "esri/views/SceneView",
                "esri/views/3d/externalRenderers",
                "esri/geometry/SpatialReference",
                "esri/request",
                "dojo/domReady!",
            ],
            function(
                Map,
                SceneView,
                externalRenderers,
                SpatialReference,
                esriRequest
            ) {
                debugger;
                var view = _this.app.sceneView;
                var issExternalRenderer = {
                    renderer: null, // three.js renderer
                    camera: null, // three.js camera
                    scene: null, // three.js scene

                    ambient: null, // three.js ambient light source
                    sun: null, // three.js sun light source

                    iss: null, // ISS model
                    issScale: 40000, // scale for the iss model
                    issMaterial: new THREE.MeshLambertMaterial({ color: 0xe03110 }), // material for the ISS model

                    cameraPositionInitialized: false, // we focus the view on the ISS once we receive our first data point
                    positionHistory: [], // all ISS positions received so far

                    markerMaterial: null, // material for the markers left by the ISS
                    markerGeometry: null, // geometry for the markers left by the ISS

                    /**
                     * Setup function, called once by the ArcGIS JS API.
                     */
                    setup: function(context) {

                        // initialize the three.js renderer
                        //////////////////////////////////////////////////////////////////////////////////////
                        this.renderer = new THREE.WebGLRenderer({
                            context: context.gl,
                            premultipliedAlpha: false
                        });
                        this.renderer.setPixelRatio(window.devicePixelRatio);
                        this.renderer.setViewport(0, 0, view.width, view.height);

                        // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
                        this.renderer.autoClearDepth = false;
                        this.renderer.autoClearStencil = false;
                        this.renderer.autoClearColor = false;

                        // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
                        // We have to inject this bit of code into the three.js runtime in order for it to bind those
                        // buffers instead of the default ones.
                        var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
                        this.renderer.setRenderTarget = function(target) {
                            originalSetRenderTarget(target);
                            if (target == null) {
                                context.bindRenderTarget();
                            }
                        }

                        // setup the three.js scene
                        ///////////////////////////////////////////////////////////////////////////////////////

                        this.scene = new THREE.Scene();

                        // setup the camera
                        this.camera = new THREE.PerspectiveCamera();

                        // setup scene lighting
                        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
                        this.scene.add(this.ambient);
                        this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
                        this.scene.add(this.sun);

                        // setup markers
                        this.markerGeometry = new THREE.SphereBufferGeometry(12 * 1000, 16, 16);
                        this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe03110, transparent: true, opacity: 0.75 });

                        // load ISS mesh
                        var issMeshUrl = "../data/iss.obj";
                        var loader = new THREE.OBJLoader(THREE.DefaultLoadingManager);
                        loader.load(issMeshUrl, function(object3d) {
                            console.log("ISS mesh loaded.");
                            this.iss = object3d;

                            // apply ISS material to all nodes in the geometry
                            this.iss.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.material = this.issMaterial;
                                }
                            }.bind(this));

                            // set the specified scale for the model
                            this.iss.scale.set(this.issScale, this.issScale, this.issScale);

                            // add the model
                            this.scene.add(this.iss);
                        }.bind(this), undefined, function(error) {
                            console.error("Error loading ISS mesh. ", error);
                        });

                        // create the horizon model
                        var mat = new THREE.MeshBasicMaterial({ color: 0x2194ce });
                        mat.transparent = true;
                        mat.opacity = 0.5;
                        this.region = new THREE.Mesh(
                            new THREE.TorusBufferGeometry(2294 * 1000, 100 * 1000, 16, 64),
                            mat
                        );
                        this.scene.add(this.region);


                        // start querying the ISS position
                        this.queryISSPosition();

                        // cleanup after ourselfs
                        context.resetWebGLState();
                    },

                    render: function(context) {

                        // update camera parameters
                        ///////////////////////////////////////////////////////////////////////////////////
                        var cam = context.camera;

                        this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
                        this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
                        this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

                        // Projection matrix can be copied directly
                        this.camera.projectionMatrix.fromArray(cam.projectionMatrix);

                        // update ISS and region position
                        ///////////////////////////////////////////////////////////////////////////////////
                        if (this.iss) {
                            var posEst = this.computeISSPosition();

                            var renderPos = [0, 0, 0];
                            externalRenderers.toRenderCoordinates(view, posEst, 0, SpatialReference.WGS84, renderPos, 0, 1);
                            this.iss.position.set(renderPos[0], renderPos[1], renderPos[2]);

                            // for the region, we position a torus slightly under ground
                            // the torus also needs to be rotated to lie flat on the ground
                            posEst = [posEst[0], posEst[1], -450 * 1000];

                            var transform = new THREE.Matrix4();
                            transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, posEst, SpatialReference.WGS84, new Array(16)));
                            transform.decompose(this.region.position, this.region.quaternion, this.region.scale);

                            // if we haven't initialized the view position yet, we do so now
                            if (this.positionHistory.length > 0 && !this.cameraPositionInitialized) {
                                this.cameraPositionInitialized = true;
                                view.goTo({
                                    target: [posEst[0], posEst[1]],
                                    zoom: 5,
                                });
                            }
                        }

                        // update lighting
                        /////////////////////////////////////////////////////////////////////////////////////////////////////
                        view.environment.lighting.date = Date.now();

                        var l = context.sunLight;
                        this.sun.position.set(
                            l.direction[0],
                            l.direction[1],
                            l.direction[2]
                        );
                        this.sun.intensity = l.diffuse.intensity;
                        this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);

                        this.ambient.intensity = l.ambient.intensity;
                        this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);

                        // draw the scene
                        /////////////////////////////////////////////////////////////////////////////////////////////////////
                        this.renderer.resetGLState();
                        this.renderer.render(this.scene, this.camera);

                        // as we want to smoothly animate the ISS movement, immediately request a re-render
                        externalRenderers.requestRender(view);

                        // cleanup
                        context.resetWebGLState();
                    },

                    lastPosition: null,
                    lastTime: null,

                    /**
                     * Computes an estimate for the position of the ISS based on the current time.
                     */
                    computeISSPosition: function() {
                        if (this.positionHistory.length == 0) { return [0, 0, 0]; }

                        if (this.positionHistory.length == 1) {
                            var entry1 = this.positionHistory[this.positionHistory.length - 1];
                            return entry1.pos;
                        }

                        var now = Date.now() / 1000;
                        var entry1 = this.positionHistory[this.positionHistory.length - 1];

                        // initialize the remembered ISS position
                        if (!this.lastPosition) {
                            this.lastPosition = entry1.pos;
                            this.lastTime = entry1.time;
                        }

                        // compute a new estimated position
                        var dt1 = now - entry1.time;
                        var est1 = [
                            entry1.pos[0] + dt1 * entry1.vel[0],
                            entry1.pos[1] + dt1 * entry1.vel[1],
                        ];

                        // compute the delta of current and newly estimated position
                        var dPos = [
                            est1[0] - this.lastPosition[0],
                            est1[1] - this.lastPosition[1],
                        ];

                        // compute required velocity to reach newly estimated position
                        // but cap the actual velocity to 1.2 times the currently estimated ISS velocity
                        var dt = now - this.lastTime;
                        if (dt === 0) { dt = 1.0 / 1000; }

                        var catchupVel = Math.sqrt(dPos[0] * dPos[0] + dPos[1] * dPos[1]) / dt;
                        var maxVel = 1.2 * Math.sqrt(entry1.vel[0] * entry1.vel[0] + entry1.vel[1] * entry1.vel[1]);
                        var factor = catchupVel <= maxVel ? 1.0 : maxVel / catchupVel;

                        // move the current position towards the estimated position
                        var newPos = [
                            this.lastPosition[0] + dPos[0] * factor,
                            this.lastPosition[1] + dPos[1] * factor,
                            entry1.pos[2]
                        ];

                        this.lastPosition = newPos;
                        this.lastTime = now;

                        return newPos;
                    },

                    /**
                     * This function starts a chain of calls querying the current ISS position from open-notify.org every 5 seconds.
                     */
                    queryISSPosition: function() {
                        esriRequest("//open-notify-api.herokuapp.com/iss-now.json", {
                                callbackParamName: "callback",
                                responseType: "json"
                            })
                            .then(function(response) {
                                var result = response.data;

                                var vel = [0, 0];
                                if (this.positionHistory.length > 0) {
                                    var last = this.positionHistory[this.positionHistory.length - 1];
                                    var deltaT = result.timestamp - last.time;
                                    var vLon = (result.iss_position.longitude - last.pos[0]) / deltaT;
                                    var vLat = (result.iss_position.latitude - last.pos[1]) / deltaT;
                                    vel = [vLon, vLat];
                                }

                                this.positionHistory.push({
                                    pos: [result.iss_position.longitude, result.iss_position.latitude, 400 * 1000],
                                    time: result.timestamp,
                                    vel: vel,
                                });

                                // create a new marker object from the second most recent position update
                                if (this.positionHistory.length >= 2) {
                                    var entry = this.positionHistory[this.positionHistory.length - 2];

                                    var renderPos = [0, 0, 0];
                                    externalRenderers.toRenderCoordinates(view, entry.pos, 0, SpatialReference.WGS84, renderPos, 0, 1);

                                    var markerObject = new THREE.Mesh(this.markerGeometry, this.markerMaterial);
                                    markerObject.position.set(renderPos[0], renderPos[1], renderPos[2]);
                                    this.scene.add(markerObject);
                                }
                            }.bind(this))
                            .always(function() {
                                // request a new position update in 5 seconds
                                setTimeout(this.queryISSPosition.bind(this), 5000);
                            }.bind(this));
                    }
                }

                // register the external renderer
                externalRenderers.add(view, issExternalRenderer);

            })
    }

    //--------------------内部公用-----------------

    //判断当前视图
    function actView(actor, Act2d, Act3d) {
        if (actor ? actor == "2d" : false) {
            Act2d();
            return;
        } else if (actor ? actor == "3d" : false) {
            Act3d();
            return;
        }
        if (_this.app.systype ? _this.app.systype.indexOf("2d") > -1 : false) {
            Act2d();
        } else if (_this.app.systype ? _this.app.systype.indexOf("3d") > -1 : false) {
            Act3d();
        }
    }


    function TaskFind(para, callback) {
        require([
            "esri/tasks/FindTask", "esri/tasks/FindParameters", "dojo/dom"
        ], function(FindTask, FindParameters, dom) {
            var find = new FindTask(para.url);
            var params = new FindParameters();
            params.layerIds = para.layerIds;
            params.searchFields = para.searchFields;
            params.searchText = para.searchText;

            find.execute(params, taskResults);

            function taskResults(e) {
                callback(e);
            }
        });
    }

    function TaskQuery(para, callback) {
        require([
            "esri/tasks/support/Query", "esri/tasks/QueryTask", "dojo/dom"
        ], function(Query, QueryTask, dom) {
            var query = new Query();
            var queryTask = new QueryTask(para.url);
            query.where = para.where ? para.where : "1=1";
            //query.outSpatialReference = {wkid:102100}; 
            query.returnGeometry = true;
            query.outFields = para.outFields ? para.outFields : ["FID"];
            queryTask.execute(query).then(function(results) {
                if (callback) callback(results);
            });
        });
    }


    //接口结束
}

//--------------------------------其他公用方法------------------------------------------

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
    var y = Math.log(Math.tan((90 + Number(lonlat.y)) * Math.PI / 360)) / (Math.PI / 180);
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
        oJs.setAttribute("src", filePath); //文件的地址 ,可为绝对及相对路径
        document.getElementsByTagName("head")[0].appendChild(oJs); //绑定
    } else if (fileType == "css") {
        var oCss = document.createElement("link");
        oCss.setAttribute("rel", "stylesheet");
        oCss.setAttribute("type", "text/css");
        oCss.setAttribute("href", filePath);
        document.getElementsByTagName("head")[0].appendChild(oCss); //绑定
    }
}

//判断要素是否显示
function getEleDisplay(id) {
    var dis;
    //document.getElementById(_this.app.scenecontainer).style.display != 'none'
    if (id) {
        var ele = document.getElementById(id);
        if (!ele) return false;
        var explorer = window.navigator.userAgent.toLowerCase();
        //ie 
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            if (ele.currentStyle["display"] == "" || ele.currentStyle["display"] == "none") {
                return false;
            } else
                return true;
        }
        //firefox 
        else if (explorer.indexOf("firefox") >= 0) {
            if (window.getComputedStyle(ele)["display"] == "" || window.getComputedStyle(ele)["display"] == "none") {
                return false;
            } else
                return true;
        }
        //Chrome
        else if (explorer.indexOf("chrome") >= 0) {
            if (window.getComputedStyle(ele)["display"] == "" || window.getComputedStyle(ele)["display"] == "none") {
                return false;
            } else
                return true;
        }
        "mozilla/5.0 (windows nt 6.1; wow64; trident/7.0; slcc2; .net clr 2.0.50727; .net clr 3.5.30729; .net clr 3.0.30729; media center pc 6.0; .net4.0c; .net4.0e; rv:11.0) like gecko"


    }
}

//对象合并
function objectMerge(o, n) {
    for (var p in n) {
        if (n.hasOwnProperty(p))
            o[p] = n[p];
    }
};


var reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
//颜色转换：10进制转16进制
String.prototype.colorHex = function() {
    var that = this;
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;
        }
        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return that;
        } else if (aNum.length === 3) {
            var numHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    } else {
        return that;
    }
};
//颜色转换：16进制转10进制
String.prototype.colorRgb = function() {
    var sColor = this.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return "rgba(" + sColorChange.join(",") + ",1)";
    } else {
        return sColor;
    }
};
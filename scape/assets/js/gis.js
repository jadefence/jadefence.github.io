var mapserverUrl = "locahost";
if (location.hostname == "120.78.148.255" || location.hostname == "ys.smartleyuan.com") {
    mapserverUrl = "120.78.148.255";
} 
var basemapUrl = "http://" + mapserverUrl + ":6080/arcgis/rest/services/PuNing/PuNing{F}F/MapServer"
var defaultFloor = 1;

var appJson = {
    center: AppConfig.center,
    scale: AppConfig.scale,
    basemap: "topo", 
    camera: {
        heading: 0, // face due east
        tilt: 0, // looking from a bird's eye view
        position: [AppConfig.center[0], AppConfig.center[1], 5000]  // creates a point instance (x,y,z)
    },
    mapcontainer: "map",
    viewingMode: "local",
    systype: '2d',
    maxZoom:AppConfig.maxZoom,
    minZoom:AppConfig.minZoom,
};

var lmap;
window.onload = function () {
    lmap = new Lgis();
    gis.initBaseMap();
    if (AppConfig.isMult) {
        gis.initShopData();
    }
    else {
        
    }
    lmap.InitMap(appJson, function () {
        app.locateQQ();
        if (AppConfig.isMult) {
            //lmap.task.RouteTask({ url: routeUrl });
            gis.addShopLayer();
        }
        else {
            gis.getPointData();
        }
        //lmap.SetZoomButton({ postion: "bottom-right" });
        $("#map_zoom_slider").removeClass("esriSimpleSliderTL");
        $("#map_zoom_slider").addClass("esriSimpleSliderBR");
    });
}

var gis = {
    //初始化底图
    initBaseMap: function () { 
        for (var i = 0; i < AppConfig.basemaps.length; i++) {
            var blayer = {
                layerId: AppConfig.basemaps[i].id,
                layerTitle: AppConfig.basemaps[i].title,
                layerType: AppConfig.basemaps[i].type,
                layerUrl: AppConfig.basemaps[i].url
            };
            if(!appJson.basemaps)appJson.basemaps=[];
            appJson.basemaps.push(blayer);
        }
        return;
        for (var i = 0; i < AppData.floorData.length; i++) {
            var blayer = {
                layerId: "f" + AppData.floorData[i].ID,
                layerTitle: "f" + AppData.floorData[i].ID,
                layerType: "dynamic",
                layerUrl: basemapUrl.replace("{F}", AppData.floorData[i].ID)
            };
            appJson.basemaps.push(blayer);
        }
    },
    //初始化点位数据
    initPointData: function () {
        var queryJson = {
            url: AppConfig.layers.point,
            outFields: ["*"]
        };
        lmap.TaskQuery(queryJson, function (e) {
            if (e.features.length > 0) {
                for (var i = 0; i < e.features.length; i++) {
                    if (e.features[i].attributes['voice'] == '1') {
                        e.features[i].attributes['type'] = '9';
                    }
                    AppData.shopList.push(e.features[i].attributes);
                }
                AppData.fsList = e.features;
            }
        });
    },
    //获取数据库点位
    getPointData: function () { 
        $.get('http://pay.xixiawangluo.com/pay/getAllPoint', { t: 'p' }, function (result) { 
            var data = result.data;
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i]['voice'].length > 0) {
                        data[i]['type'] = '9';
                    }
                    data[i].df = 1;//1层
                    AppData.shopList.push(data[i]);
                }
                AppData.fsList = data;
                gis.addScapeLayer();
            }
        });
    },
    //初始化商铺数据
    initShopData: function () {
        for (var i = 0; i < AppData.floorData.length; i++) {
            var queryJson = {
                url: basemapUrl.replace("{F}", AppData.floorData[i].ID) + "/0",
                outFields: ["FID", "code", "name", "type", "dy", "dx", "df"]
            };
            lmap.task.QueryTask(queryJson, function (e) {
                if (e.features.length > 0) {
                    var floorId = e.features[0].attributes.df;
                    for (var i = 0; i < e.features.length; i++) {
                        e.features[i].attributes.id = e.features[i].attributes.df * 1000 + e.features[i].attributes.FID;
                        AppData.shopList.push(e.features[i].attributes);
                    }
                }
            });
        }
    },
    //景区点位
    addScapeLayer: function () {
        var point = [];
        for (var i in AppData.fsList) {
            point.push({
                "geometry": { "x": AppData.fsList[i].lon, "y": AppData.fsList[i].lat, "spatialReference": { "wkid": 4326 } },
                "attributes": AppData.fsList[i]
            })
        }
        var symbolJson3D = {
            "type": "uniqueValue",
            "field1": "type",
            "defaultSymbol": {
                "type": "PointSymbol3D",
                "symbolLayers": [{
                    "type": "Icon",
                    resource: {
                        href: "assets/images/maps/followicon.png"
                    },
                    size: 5,
                }],
                callout: {
                    type: "line",
                    color: [19, 159, 86],
                    size: 2,
                    border: {
                        color: [19, 159, 86]
                    }
                }
            },
            "uniqueValueInfos": [{
                "value": "4",//卫生间
                "symbol": {
                    "type": "PointSymbol3D",
                    "symbolLayers": [{
                        "type": "Icon",
                        resource: {
                            href: "assets/images/maps/洗手间.png"
                        },
                        size: 15,
                    }],
                    callout: {
                        type: "line",
                        color: [138, 138, 138],
                        size: 2,
                        border: {
                            color: [138, 138, 138]
                        }
                    }
                }
            }, {
                "value": "1",//门
                "symbol": {
                    "type": "PointSymbol3D",
                    "symbolLayers": [{
                        "type": "Icon",
                        resource: {
                            href: "assets/images/maps/门.png"
                        },
                        size: 15,
                    }],
                    callout: {
                        type: "line",
                        color: [138, 138, 138],
                        size: 2,
                        border: {
                            color: [138, 138, 138]
                        }
                    }
                }
            }, {
                "value": "0",//景点
                "symbol": {
                    "type": "PointSymbol3D",
                    "symbolLayers": [{
                        "type": "Icon",
                        resource: {
                            href: "assets/images/maps/景点.png"
                        },
                        size: 15,
                    }],
                    callout: {
                        type: "line",
                        color: [138, 138, 138],
                        size: 2,
                        border: {
                            color: [138, 138, 138]
                        }
                    }
                }
            }, {
                "value": "9",//语音点位
                "symbol": {
                    "type": "PointSymbol3D",
                    "symbolLayers": [{
                        "type": "Icon",
                        resource: {
                            href: "assets/images/maps/语音.png"
                        },
                        size: 30,
                    }],
                    callout: {
                        type: "line",
                        color: [138, 138, 138],
                        size: 2,
                        border: {
                            color: [138, 138, 138]
                        }
                    }
                }
            },
            ]
        };
        var symbolJson2D = {
            "type": "uniqueValue",
            "field1": "type",
            "defaultSymbol": {
                "url": "assets/images/maps/followicon.png",
                "height": 5,
                "width": 5,
                "type": "esriPMS",
                "style": "STYLE_NULL", 
            },
            "uniqueValueInfos": [{
                "value": "4",//卫生间
                "symbol": {
                    "url": "assets/images/maps/洗手间.png",
                    "height": 20,
                    "width": 20,
                    "type": "esriPMS",
                    "style": "STYLE_NULL",  
                }
            }, {
                "value": "1",//门
                "symbol": {
                    "url": "assets/images/maps/门.png",
                    "height": 20,
                    "width": 20,
                    "type": "esriPMS",
                    "style": "STYLE_NULL",  
                }
            }, {
                "value": "0",//景点
                "symbol": {
                    "url": "assets/images/maps/景点.png",
                    "height": 10,
                    "width": 10,
                    "type": "esriPMS",
                    "style": "STYLE_NULL",  
                }
            }, {
                "value": "9",//语音点位
                "symbol": {
                    "url": "assets/images/maps/语音.png",
                    "height": 20,
                    "width": 20,
                    "type": "esriPMS",
                    "style": "STYLE_NULL",  
                }
            },{
                "value": "5",//餐饮
                "symbol": {
                    "url": "assets/images/maps/餐饮.png",
                    "height": 20,
                    "width": 20,
                    "type": "esriPMS",
                    "style": "STYLE_NULL",  
                }
            },
            ]
        };
        var labelCalss3D = [{
            labelExpressionInfo: {
                value: "{name}"
            },
            symbol: {
                type: "LabelSymbol3D",
                symbolLayers: [{
                    material: { color: [255, 255, 255] },
                    type: "Text",
                    size: 10,
                    halo: {
                        color: [42, 51, 59],
                        size: 1
                    }
                }],
            }
        }];
        var labelCalss2D = {
            fieldName: "name",
            textSymbol: {
                type: "esriTS",
                color: { r: 0, g: 0, b: 0, a: 1 },
                backgroundColor:{ r: 0, g: 0, b: 0, a: 1 },
                haloColor: { r: 0, g: 0, b: 0, a: 1 },
                haloSize: 2, 
                xoffset: 3,
                yoffset: 10, 
                font: {  // autocast as esri/symbols/Font
                    size: 9,
                    family: "sans-serif",
                    weight: "bolder"
                }
            },
            minScale:2500,

        };
        //图层参数构建
        var graJson = {
            gra: point,
            map: {
                symbol: symbolJson2D,
                label: labelCalss2D, 
            },
            scene: {
                symbol: symbolJson3D,
                label: labelCalss3D,
                offset: 0.1
            },
            event: {
                mouseClick: "scapeClick"
            },
            //popTemple: pTemplate,
            zoom: 1
        };

        lmap.LayerClear("scape_layer");
        lmap.AddPoints("scape_layer", graJson,function(){ 
            lmap.AddLabels("scapetext_layer",{
                pointlayer:"scape_layer",
                labelfield:"name",
                map:{
                    symbol:{
                        color:"black",
                        haloColor:[255,255,255,150],
                        haloSize:0.8,
                        yoffset: 10,
                        font: {
                            size: 9,
                            //family: "sans-serif", 
                            weight: "bolder"
                        }
                    }
                },
                minScale:5000,
            })
        });

    },
    //商铺图层
    addShopLayer: function () {
        var floor = AppData.cur.floor;
        var layerURL = basemapUrl.replace("{F}", floor) + "/1";
        var renderJson = {
            "type": "simple",
            "label": "",
            "description": "",
            "symbol": {
                "type": "esriSFS",
                "style": "esriSFSSolid",
                "color": [0, 0, 0, 0],
                "outline": {
                    "type": "esriSLS",
                    "style": "esriSLSSolid",
                    "color": [200, 0, 0, 200],
                    "width": 0
                }
            }
        }
        lmap.layer.FeatureLayer(layerURL, renderJson, null, function (e) {
            var id = AppData.cur.floor * 1000 + e.graphic.attributes.FID;
            var shop = app.getShopById(id);
            AppData.cur.shop = shop;
            mapShow.shop_base([shop], 3);
            gis.addShopMark();
        });
    },
    //商铺点位
    addShopMark: function () {
        var point = [{
            "geometry": { "x": AppData.cur.shop.dx, "y": AppData.cur.shop.dy }
        }]
        var symbolJson = {
            "type": "simple",
            "symbol": {
                "url": "assets/images/maps/markers_21.png",
                "height": 32,
                "width": 24,
                yoffset: 12,
                "type": "esriPMS"
            }
        };
        //图层参数构建
        var graJson = {
            gra: point,
            map: {
                symbol: symbolJson
            },
            //popTemple: pTemplate,
            //zoom: 2
        };

        lmap.LayerClear("shop_layer");
        lmap.AddPoints("shop_layer", graJson);
    },
    //公共设施
    addPublicMark: function () {
        var point = [];
        var xField=AppConfig.text.xField;
        var yField=AppConfig.text.yField;
        for (var i = 0; i < AppData.cur.Public.length; i++) {
            var pb = AppData.cur.Public[i];
            point.push({
                "geometry": { "x": pb[xField], "y": pb[yField] },
                attributes: pb
            });
        }
        var symbolJson = {
            "type": "uniqueValue",
            "field1": "order",
            "defaultSymbol": {
                "url": "assets/images/maps/markers_26.png",
                "height": 32,
                "width": 24,
                yoffset: 12,
                "type": "esriPMS"
            },
            "uniqueValueInfos": [{
                "value": 1,
                "symbol": {
                    "url": "assets/images/maps/markers_02.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": 2,
                "symbol": {
                    "url": "assets/images/maps/markers_04.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": 3,
                "symbol": {
                    "url": "assets/images/maps/markers_06.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": 4,
                "symbol": {
                    "url": "assets/images/maps/markers_08.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": "5",
                "symbol": {
                    "url": "assets/images/maps/markers_10.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": "6",
                "symbol": {
                    "url": "assets/images/maps/markers_12.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": "7",
                "symbol": {
                    "url": "assets/images/maps/markers_14.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": "8",
                "symbol": {
                    "url": "assets/images/maps/markers_16.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }, {
                "value": "9",
                "symbol": {
                    "url": "assets/images/maps/markers_18.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 12,
                    "type": "esriPMS"
                }
            }],
        };
        //图层参数构建
        var graJson = {
            gra: point,
            map: {
                symbol: symbolJson
            },
            scene: {
                symbol: symbolJson,
                offset: 0.1
            },
            //popTemple: pTemplate,
            zoom: 2
        };
        lmap.LayerClear("public_layer");
        lmap.LayerClear("shop_layer");
        lmap.AddPoints("public_layer", graJson);
    },
    //路径分析
    routeAnalysis: function () {
        debugger;
        var start = AppData.cur.start, target = AppData.cur.target;
        if (start.df == target.df) {
            this.routeTask(start, target, 4);
            this.switchMap(start.df);
            AppData.cur.floor = start.df;
            this.showRouteInfo([start.df]);
        }
        else {
            if (start.df < target.df) {
                var fs = [];
                for (var i = start.df; i <= target.df; i++) {
                    fs.push(i);
                }
            } else {
                var fs = [];
                for (var i = start.df; i >= target.df; i--) {
                    fs.push(i);
                }
            }
            var tmptarget = AppData.cur.tmptarget = this.getStair(start, start.df);
            this.routeTask(start, tmptarget, 4);
            this.switchMap(start.df);
            AppData.cur.floor = start.df;
            this.showRouteInfo(fs);
        }
    },
    //路径服务
    routeTask: function (start, target, f) {
        var point = [{
            "geometry": { "x": start.dx, "y": start.dy },
            "attributes": { RouteName: "Route 1", type: "start" }
        }, {
            "geometry": { "x": target.dx, "y": target.dy },
            "attributes": { RouteName: "Route 1", type: "end" }
        }];
        var symbolJson = {
            "type": "uniqueValue",
            "field1": "type",
            "defaultSymbol": {
                "url": "assets/images/maps/markers_26.png",
                "height": 32,
                "width": 20,
                "type": "esriPMS"
            },
            "uniqueValueInfos": [{
                "value": "start",
                "symbol": {
                    "url": "assets/images/maps/markers_start.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 16,
                    "type": "esriPMS"
                }
            }, {
                "value": "end",
                "symbol": {
                    "url": "assets/images/maps/markers_end.png",
                    "height": 32,
                    "width": 24,
                    yoffset: 16,
                    "type": "esriPMS"
                }
            }],
        };

        var graJson = {
            gra: point,
            map: {
                symbol: symbolJson
            },
            //popTemple: pTemplate,
            zoom: 2
        };
        var _this = this;
        lmap.MapClear();
        lmap.task.RouteTask({
            url: AppConfig.routeUrl.replace("{F}", f),
            stops: point
        }, function (e) {
            lmap.LayerClear("shop_layer");
            lmap.LayerClear("public_layer");
            lmap.LayerClear("routeMaker_layer");
            lmap.AddPoints("routeMaker_layer", graJson);
            //map.reorderLayer(map.getLayer("routeMaker_layer"), 10);
            var total = e.result.routeResults[0].route.attributes.Total_Length;
            if(!AppConfig.isMult){
                $('.routelist').html("总行程共计"+parseInt(total)+"米");
            } 
        });

    },
    //点定位
    flyPoint: function (id) {
        var fid = app.getShopById(id).order;
        var xh = fid * 2 - 1;
        var img = xh > 9 ? xh : "0" + xh;
        var styleJson = {
            "url": "assets/images/maps/markers_" + img + ".png",
            "height": 32,
            "width": 24,
            yoffset: 12,
            "type": "esriPMS"
        };
        lmap.FlyTo("public_layer", "id", id, styleJson, null, false);
    },
    //路径加载
    showRouteInfo: function (fs) {
        $(".mapslidewrap").hide();
        var s = "";
        for (var i = 0; i < fs.length; i++) {
            var cls = "cur";
            if (i > 0) cls = "";
            var d = { ID: fs[i], name: "L" + fs[i] }, len = fs.length;
            s += '<li class="' + cls + '" data-step="' + i + '" data-f="' + d.ID + '"><span class="floornum">' + d.name + '</span><i class="s_map"></i></li>';

        }
        s = "<ul>" + s + "</ul>";
        if(AppConfig.isMult){
            $('.routelist').html(s);
        }
        else{
            $('.routelist').html("全程2公里");
        }
        //$('.routelist ul').width(118 * len);
        $('#panel_nav_tab').show();
        //$(".floorPop").show();
        var _this = this;
        $('#panel_nav_tab li').bind('click', function (e) {
            debugger;
            var fid = $(this).data('f'),
                idx = $(this).index(),
                step = parseInt($(this).data('step'));
            if (fid != AppData.cur.floor) {
                lmap.MapClear();
                if (fid == AppData.cur.start.df) {
                    _this.routeTask(AppData.cur.start, AppData.cur.tmptarget, 4);
                    _this.switchMap(AppData.cur.start.df);
                    AppData.cur.floor = AppData.cur.start.df;
                }
                else if (fid == AppData.cur.target.df) {
                    _this.routeTask(AppData.cur.tmptarget, AppData.cur.target, 4);
                    _this.switchMap(AppData.cur.target.df);
                    AppData.cur.floor = AppData.cur.target.df;
                }
                else {
                    _this.switchMap(fid);
                    var popJson = {
                        x: AppData.cur.tmptarget.dx,
                        y: AppData.cur.tmptarget.dy,
                        title: "到" + AppData.cur.target.df + "楼"
                    };
                    lmap.ShowPopupMobile(popJson, function () {
                        $(".esriPopupMobile .titlePane").bind("click", function () {
                            _this.routeTask(AppData.cur.tmptarget, AppData.cur.target, 4);
                            _this.switchMap(AppData.cur.target.df);
                            AppData.cur.floor = AppData.cur.target.df;
                            lmap.ClearPopupMobile();
                            $("#panel_nav_tab li").removeClass("cur");
                            $($("#panel_nav_tab li")[$("#panel_nav_tab li").length - 1]).addClass("cur");
                        })
                    });
                    AppData.cur.floor = fid;
                }
                $("#panel_nav_tab li").removeClass("cur");
                $(this).addClass("cur");
                lmap.ClearPopupMobile();
            }
        })
    },
    //地图清空
    clearMap: function () {
        lmap.LayerClear("shop_layer");
        lmap.LayerClear("public_layer");
        lmap.LayerClear("routeMaker_layer");
        lmap.LayerClear("gis_targetLayer");
        lmap.MapClear();
    },
    //切换底图
    switchMap: function (id) {
        lmap.SwitchBaseMap("f" + id);
        this.addShopLayer();
    },
    //寻找最近楼梯
    getStair: function (start, f) {
        var near, sd;
        for (var i = 0; i < AppData.shopList.length; i++) {
            var item = AppData.shopList[i];
            if (item.df == f && (item.type == 2 || item.type == 3)) {
                //var d = getFlatternDistance(start.dy, start.dx, item.dy, item.dx);
                var d = Math.sqrt((start.dx - item.dx) * (start.dx - item.dx) + (start.dy - item.dy) * (start.dy - item.dy));
                if (!sd) {
                    sd = d;
                    near = item;
                }
                else if (sd > d) {
                    sd = d;
                    near = item;
                }
            }
        }
        return near;
    },
    //显示当前位置
    showPosition(position){
        var point = [{
            "geometry": { "x": position.x, "y": position.y }
        }]
        var symbolJson = {
            "type": "simple",
            "symbol": {
                "url": "assets/images/maps/locate.png",
                "height": 20,
                "width": 20,
                "type": "esriPMS"
            }
        };
        //图层参数构建
        var graJson = {
            gra: point,
            map: {
                symbol: symbolJson
            },
            //popTemple: pTemplate,
            //zoom: 2
        };

        lmap.LayerClear("locate_layer");
        lmap.AddPoints("locate_layer", graJson);
    },
}

//景点点击事件
function scapeClick(e) { 
    if (!e) {
        $(".swiper-wrapper").hide();
    } else {
        $(".swiper-wrapper").show();
        var data = [];
        if(e.results){
            for (var i in e.results) {
                var d = e.results[i].graphic.attributes;
                d.id = 1;
                d.code = d.voice;
                if (d.type == 9) {
                    d.BrandLogo = "assets/images/icon/播放.png";
                }
                data.push(d);
            }
        }
        else{
            var d = e.graphic.attributes;
            d.id = 1;
            d.code = d.voice;
            if (d.type == 9) {
                d.BrandLogo = "assets/images/icon/播放.png";
            }
            data.push(d);
        } 
        mapShow.shop_base(data, 3);
    }
}
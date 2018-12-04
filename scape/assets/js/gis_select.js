
var appJson1 = {
    center: [116.158, 23.315 ],
    scale: 2000,
    basemap: "topo",
    basemaps: [ ],
    mapcontainer: "mapSelect",
};

var lmap1 = new Lgis();

var gis1 = {
    //初始化底图
    initBaseMap: function () {
        for (var i = 0; i < AppData.floorData.length; i++) {
            var blayer = {
                layerId: "f" + AppData.floorData[i].ID,
                layerTitle: "f" + AppData.floorData[i].ID,
                layerType: "dynamic",
                layerUrl: basemapUrl.replace("{F}", AppData.floorData[i].ID)
            };
            appJson1.basemaps.push(blayer);
        }
    },
    //初始化数据
    initShopData: function () {
        for (var i = 0; i < AppData.floorData.length; i++) {
            var queryJson = {
                url: basemapUrl.replace("{F}", AppData.floorData[i].ID) + "/0",
                outFields: ["FID", "code", "name", "type", "dy", "dx", "df" ]
            };
            lmap1.task.QueryTask(queryJson, function (e) {
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
        lmap1.layer.FeatureLayer(layerURL, renderJson, null, function (e) {
            var id = AppData.cur.floor1 * 1000 + e.graphic.attributes.FID;
            var shop = app.getShopById(id);
            //debugger;
            var popJson = {
                x: shop.dx,
                y: shop.dy,
                title: "确定"
            }
            lmap1.ShowPopupMobile(popJson, function () {
                $(".esriPopupMobile .titlePane").bind("click", function () {
                    debugger;
                    if (AppData.cur.wait == "iptStart") {
                        AppData.cur.start = shop;
                        $("#iptStart").val(shop.name);
                    }
                    else {
                        AppData.cur.target = shop;
                        $("#iptEnd").val(shop.name);
                    }
                    $("#locateSelect").hide();
                    $("#routeInput").hide();
                    resetBtn();
                })
                
            }); 
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
                yoffset:12,
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

        lmap1.LayerClear("shop_layer");
        lmap1.AddPoints("shop_layer", graJson);
    },
    //公共设施
    addPublicMark: function () {
        var point = []
        for (var i = 0; i <AppData.cur.Public.length; i++) {
            var pb = AppData.cur.Public[i];
            point.push({
                "geometry": { "x": pb.dx, "y": pb.dy },
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
            //popTemple: pTemplate,
            zoom: 2
        };
        lmap1.LayerClear("public_layer");
        lmap1.LayerClear("shop_layer");
        lmap1.AddPoints("public_layer", graJson);
    },
    //路径分析
    routeAnalysis: function () {
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
                    yoffset:16,
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
        lmap1.MapClear();
        lmap1.task.RouteTask({
            url: routeUrl.replace("{F}",f),
            stops: point
        }, function () {
            lmap1.LayerClear("shop_layer");
            lmap1.LayerClear("public_layer");
            lmap1.LayerClear("routeMaker_layer");
            lmap1.AddPoints("routeMaker_layer", graJson);
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
        lmap1.FlyTo("public_layer", "id", id, styleJson, null, false);
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
        $('.routelist').html(s);
        //$('.routelist ul').width(118 * len);
        $('#panel_nav_tab').show();
        //$(".floorPop").show();
        var _this = this;
        $('#panel_nav_tab li').bind('click', function (e) {
            debugger;
            var fid = $(this).data('f'),
                idx = $(this).index(),
                step = parseInt($(this).data('step'));
            if (fid != AppData.cur.floor && (fid == AppData.cur.start.df || fid == AppData.cur.target.df)) {
                if (fid == AppData.cur.start.df) {
                    _this.routeTask(AppData.cur.start, AppData.cur.tmptarget, 4);
                    _this.switchMap(AppData.cur.start.df);
                    AppData.cur.floor = AppData.cur.start.df;
                }
                if (fid == AppData.cur.target.df) {
                    _this.routeTask(AppData.cur.tmptarget, AppData.cur.target, 4);
                    _this.switchMap(AppData.cur.target.df);
                    AppData.cur.floor = AppData.cur.target.df;
                }
                $("#panel_nav_tab li").removeClass("cur");
                $(this).addClass("cur");
            }
        })
    },
    //地图清空
    clearMap: function () {
        lmap1.LayerClear("shop_layer");
        lmap1.LayerClear("public_layer");
        lmap1.LayerClear("routeMaker_layer");
        lmap1.LayerClear("gis_targetLayer");
        lmap1.MapClear();
    },
    //切换底图
    switchMap: function (id) {
        lmap1.SwitchBaseMap("f" + id);
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
                if (!sd){ 
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
}

gis1.initBaseMap();
gis1.initShopData();

lmap1.InitMap(appJson1, function () {
    gis1.addShopLayer();
});

define(["dojo/_base/declare", "esri/layers/TiledMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/layers/TileInfo"],
    function (declare, TiledMapServiceLayer, Extent, SpatialReference, TileInfo) {
        return declare(TiledMapServiceLayer, {
            // ¹¹Ôìº¯Êý 
            constructor: function (layerUrl) {
                this.layerUrl = layerUrl;
                this.spatialReference = new esri.SpatialReference({ wkid: 102113 });
                this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference));
                this.tileInfo = new esri.layers.TileInfo({
                    "rows": 256,
                    "cols": 256,
                    "compressionQuality": 0,
                    "origin": { "x": -20037508.342787, "y": 20037508.342787 },
                    "spatialReference": { "wkid": 102113 },
                    "lods": [{ "level": 3, "scale": 73957190.948944, "resolution": 19567.8792409999 },
							{ "level": 4, "scale": 36978595.474472, "resolution": 9783.93962049996 },
							{ "level": 5, "scale": 18489297.737236, "resolution": 4891.96981024998 },
							{ "level": 6, "scale": 9244648.868618, "resolution": 2445.98490512499 },
							{ "level": 7, "scale": 4622324.434309, "resolution": 1222.99245256249 },
							{ "level": 8, "scale": 2311162.217155, "resolution": 611.49622628138 },
							{ "level": 9, "scale": 1155581.108577, "resolution": 305.748113140558 },
							{ "level": 10, "scale": 577790.554289, "resolution": 152.874056570411 },
							{ "level": 11, "scale": 288895.277144, "resolution": 76.4370282850732 },
							{ "level": 12, "scale": 144447.638572, "resolution": 38.2185141425366 },
							{ "level": 13, "scale": 72223.819286, "resolution": 19.1092570712683 },
							{ "level": 14, "scale": 36111.909643, "resolution": 9.55462853563415 },
							{ "level": 15, "scale": 18055.954822, "resolution": 4.77731426794937 },
							{ "level": 16, "scale": 9027.977411, "resolution": 2.38865713397468 },
							{ "level": 17, "scale": 4513.988705, "resolution": 1.19432856685505 },
							{ "level": 18, "scale": 2256.994353, "resolution": 0.597164283559817 },
							{ "level": 19, "scale": 1128.497176, "resolution": 0.298582141647617 }]
                });
                this.loaded = true;
                this.onLoad(this);
            },
            getTileUrl: function (level, row, col) { 
                if (this.layerUrl == "http-map")
                    return "http://mt" + (col % 4) + ".google.cn/vt/lyrs=m@226000000&hl=zh-CN&gl=cn&src=app&x=" + col + "&y=" + row + "&z=" + level + "&s=Gali";
                else if (this.layerUrl == "http-img")
                    return "http://google.cn/maps/vt/lyrs=s@708&gl=cn&x=" + col + "&y=" + row + "&z=" + level + "&s=";
                else
                    return this.layerUrl + level + "/" + col + "/" + row + ".png";
            }
        });
    }
)
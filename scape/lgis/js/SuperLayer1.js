 
 define(["dojo/_base/declare", "esri/layers/TiledMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/layers/TileInfo"],
     function (declare, TiledMapServiceLayer, Extent, SpatialReference, TileInfo) {
         return declare(TiledMapServiceLayer, {
             constructor: function (layerUrl) {
                 this.layerUrl = layerUrl;
                 this.spatialReference = new esri.SpatialReference({ wkid: 4490 });
                 this.initialExtent = (this.fullExtent =
                 new esri.geometry.Extent(110.35320596460349, 31.384355458383208, 116.64388578843032, 36.366515344740726, this.spatialReference));
                 this.tileInfo = new esri.layers.TileInfo({
                     "rows": 256,
                     "cols": 256,
                     "compressionQuality": 0,
                     "origin": { "x": 110.35320596460349, "y": 36.366515344740726 },
                     "spatialReference": { "wkid": 4490 },
                     "lods": [
                          { "level": 0, "resolution": 0.7031249994915666, "scale": 234906311 },
                          { "level": 1, "resolution": 0.3515624997457833, "scale": 117453155.5 },
                          { "level": 2, "resolution": 0.17578124987289165, "scale": 58726577.75 },
                          { "level": 3, "resolution": 0.08789062493644582, "scale": 29363288.875 },
                          { "level": 4, "resolution": 0.04394531246822291, "scale": 14681644.4375 },
                          { "level": 5, "resolution": 0.021972656234111456, "scale": 7340822.21875 },
                          { "level": 6, "resolution": 0.010986328117055728, "scale": 3670411.109375 },
                          { "level": 7, "resolution": 0.005493164058527864, "scale": 1835205.5546875 },
                          { "level": 8, "resolution": 0.002746582029263932, "scale": 917602.77734375 },
                          { "level": 9, "resolution": 0.001373291014631966, "scale": 458801.388671875 },
                          { "level": 10, "resolution": 0.000686645507315983, "scale": 229400.6943359375 },
                          { "level": 11, "resolution": 0.0003433227536579915, "scale": 114700.34716796875 },
                          { "level": 12, "resolution": 0.00017166137682899575, "scale": 57350.173583984375 },
                          { "level": 13, "resolution": 0.00008583068841449788, "scale": 28675.086791992188 },
                          { "level": 14, "resolution": 0.00004291534420724894, "scale": 14337.543395996094 },
                          { "level": 15, "resolution": 0.00002145767210362447, "scale": 7168.771697998047 }
                     ]
                 });
                 this.loaded = true;
                 this.onLoad(this);
             },
             getTileUrl: function (level, row, col) {
                 if (this.layerUrl == "http-map") {
                     var levelMap = "";
                     if (level < 15) {
                         if (level < 10) {
                             levelMap = "A0512_EMap";
                         } else if (level < 12) {
                             levelMap = "B0627_EMap1112";
                         } else if (level < 19) {
                             levelMap = "siwei0608";
                         }
                         return "http://t1.tianditu.cn/DataServer?T=vec_c&" + levelMap + "&" + "X=" + col + "&" + "Y=" + row + "&" + "L=" + (level * 1 + 1);
                     } 
                 }
                 else if (this.layerUrl == "http-img")
                     return "http://t1.tianditu.cn/DataServer?T=img_c&X=" + col + "&Y=" + row + "&L=" + (level * 1 + 1);
                 else if (this.layerUrl.indexOf("{row}")>-1)
                     return this.layerUrl.replace(/{subDomain}/g, level).replace(/{col}/g, col).replace(/{row}/g, row).replace(/{level}/g, (level * 1))
                 else
                     return this.layerUrl + (level * 1 + 1) + "/" + col + "/" + row + ".png";
 
             }
         });
     }
 )
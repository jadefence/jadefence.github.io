 
 define(["dojo/_base/declare", "esri/layers/TiledMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/layers/TileInfo"],
     function (declare, TiledMapServiceLayer, Extent, SpatialReference, TileInfo) {
         return declare(TiledMapServiceLayer, {
             constructor: function (layerUrl) {
                 this.layerUrl = layerUrl;
                 this.spatialReference = new esri.SpatialReference({ wkid: 4326 });
                 this.initialExtent = (this.fullExtent =
                 new esri.geometry.Extent(-180.0, -90.0, 180.0, 90.0, this.spatialReference));
                 this.tileInfo = new esri.layers.TileInfo({
                     "rows": 256,
                     "cols": 256,
                     "compressionQuality": 0,
                     "origin": { "x": -180, "y": 90 },
                     "spatialReference": { "wkid": 4326 },
                     "lods": [
                          { "level": 0, "resolution": 1.40625, "scale": 469812622.3397240042686462402343750 },
                          { "level": 1, "resolution": 0.703125, "scale": 234906311.1698620021343231201171875 },
                          { "level": 2, "resolution": 0.3515625, "scale": 117453155.5849310010671615600585938 },
                          { "level": 3, "resolution": 0.17578125, "scale": 58726577.79246550053358078002929688 },
                          { "level": 4, "resolution": 0.087890625, "scale": 29363288.89623275026679039001464844 },
                          { "level": 5, "resolution": 0.0439453125, "scale": 14681644.44811637513339519500732422 },
                          { "level": 6, "resolution": 0.02197265625, "scale": 7340822.224058187566697597503662109 },
                          { "level": 7, "resolution": 0.010986328125, "scale": 3670411.112029093783348798751831055 },
                          { "level": 8, "resolution": 0.0054931640625, "scale": 1835205.556014546891674399375915527 },
                          { "level": 9, "resolution": 0.00274658203125, "scale": 917602.7780072734458371996879577637 },
                          { "level": 10, "resolution": 0.001373291015625, "scale": 458801.3890036367229185998439788818 },
                          { "level": 11, "resolution": 0.0006866455078125, "scale": 229400.6945018183614592999219894409 },
                          { "level": 12, "resolution": 0.00034332275390625, "scale": 114700.3472509091807296499609947205 },
                          { "level": 13, "resolution": 0.000171661376953125, "scale": 57350.17362545459036482498049736023 },
                          { "level": 14, "resolution": 0.0000858306884765625, "scale": 28675.08681272729518241249024868011 },
                          { "level": 15, "resolution": 0.00004291534423828125, "scale": 14337.54340636364759120624512434006 },
                          { "level": 16, "resolution": 0.000021457672119140625, "scale": 7168.771703181823795603122562170029 },
                          { "level": 17, "resolution": 0.0000107288360595703125, "scale": 3584.385851590911897801561281085014 },
                          { "level": 18, "resolution": 0.00000536441802978515625, "scale": 1792.192925795455948900780640542507 },
                          { "level": 19, "resolution": 0.000002682209014892578125, "scale": 896.0964628977279744503903202712536 },
                          { "level": 20, "resolution": 0.0000013411045074462890625, "scale": 448.0482314488639872251951601356268 }
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
                     return this.layerUrl.replace(/{subDomain}/g, level).replace(/{col}/g, col).replace(/{row}/g, row).replace(/{level}/g, (level * 1 + 1))
                 else
                     return this.layerUrl + (level * 1 + 1) + "/" + col + "/" + row + ".png";
 
             }
         });
     }
 )
define([
    "./Custom",
], function (Custom) {
    'use strict';

    var _tpl = dojo.string.substitute;

    var ROOTTEMPLATE = '<div>${content}</div>';
    var ITEMTEMPLATE = '<div class="esriLegendService">${content}</div>';
    var TITLETEMPLATE = '<table width="95%"><tbody><tr><td align="left"><span class="esriLegendServiceLabel">${title}</span></td></tr></tbody></table>';
    var SUBLAYERTEMPLATE = '<div>${content}</div>';
    var LABELTEMPLATE = '<table width="95%" class="esriLegendLayerLabel"><tbody><tr><td align="left">${layerName}</td></tr></tbody></table>';
    var LEGENDTEMPLATE =
        '<table cellpadding="0" cellspacing="0" width="95%" class="esriLegendLayer">' +
        '<tbody>' +
        '<tr>' +
        '<td width="35" align="center">' +
        '<img src="data:image/png;base64,${imageData}" border="0"/>' +
        '</td>' +
        '<td>' +
        '<table>' +
        '<tbody>' +
        '<tr>' +
        '<td align="left">' +
        '${label}' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>';

    var RemoteLegend = Custom.createSubclass({
        declaredClass: "esri.custom._RemoteLegend",
        normalizeCtorArgs: function (view, options) {
            options || (options = {});
            this._mapView = view;
            this._containerId = options.containerId;
            this._layers = options.layers;
            if (!this._containerId) {
                console.error('未传入containerId');
                return;
            }
            var layerInfos = this._layerInfos = this._generateLayerInfos();
            this._generateLayerRender(this._layerInfos);
            this._registerEvents();
        },
        _registerEvents: function () {
            var me = this;
            this.handlers = [this._mapView.watch('scale', this.debounce(function () {
                me._generateLayerRender(me._layerInfos);
            }, 100))];
        },
        _generateLayerInfos: function () {
            var me = this;
            var layers = dojo.filter(this._mapView.map.allLayers.items, function (layer) {
                return layer.allSublayers;
            });
            if (this._layers) {
                var layerIds = dojo.map(this._layers, function (layer) {
                    return layer.id;
                });
                layers = dojo.filter(layers, function (layer) {
                    var index = dojo.indexOf(layerIds, layer.id)
                    if (index > -1) {
                        me._layers[index].title && (layer.title = me._layers[index].title);
                        return true;
                    }
                    return false;
                });
            }
            return layers;
        },
        _generateLayerRender: function (layers) {
            var me = this;
            this.layerCache || (this.layerCache = {});
            dojo.query('#' + me._containerId).empty();
            dojo.forEach(layers, function (layer) {
                if (layer.url) {
                    if (me.layerCache[layer.url]) {
                        var html = me._generateHtml(me.layerCache[layer.url], layer);
                        dojo.query('#' + me._containerId).addContent(html);
                    } else {
                        dojo.io.script.get({
                            url: layer.url + '/legend?f=json',
                            callbackParamName: 'callback'
                        }).then(function (resp) {
                            me.layerCache[layer.url] = resp.layers;
                            var html = me._generateHtml(resp.layers, layer);
                            dojo.query('#' + me._containerId).addContent(html);
                        });
                    }
                }
            });
        },
        _generateHtml: function (layers, layer) {
            var me = this;
            var content = '';
            var currScale = this._mapView.scale;
            dojo.forEach(layers, function (l) {
                if (l.maxScale && currScale < l.maxScale) {
                    return;
                }
                if (l.minScale && currScale > l.minScale) {
                    return;
                }
                var sublayerLabelContent = _tpl(LABELTEMPLATE, l);
                var legendHtml = '';
                dojo.forEach(l.legend, function (legend) {
                    legendHtml += _tpl(LEGENDTEMPLATE, legend);
                });
                content += _tpl(SUBLAYERTEMPLATE, { content: sublayerLabelContent + legendHtml });
            });
            var titleHtml = _tpl(TITLETEMPLATE, layer);
            return _tpl(ITEMTEMPLATE, { content: titleHtml + content });
        },
        destroy: function () {
            dojo.forEach(this.handlers,function(handler){
                handler.remove();
            });
        }
    });

    return RemoteLegend;

});
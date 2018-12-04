define([
    "./Custom"
], function (Custom) {
    var _tpl = dojo.string.substitute;

    var ROOT_TEMPLATE = '<div class="esri-custom-tooltip esri-custom-visible_hide" id="${id}">${content}</div>';
    var CONTENT_TEMPLATE = '<div class="esri-custom-tooltip-content">${content}</div>';
    var ARROW_TEMPLATE = '<div class="esri-custom-tooltop-arrow"></div>'

    var Tooltip = Custom.createSubclass({
        declaredClass: "esri.custom._Tooltip",
        normalizeCtorArgs: function (view, options) {
            this.options = (options || (options = {}));
            this._mapView = view;
            this._randomId = 'tooltip-' + Math.random().toString().split('.')[1];

            this._createTooltip();
            if (options.visible) {
                this.show();
            }
            this.registerEvents();
        },
        properties: {

        },
        registerEvents: function () {
            var me = this;
            this._handlers = [this._mapView.watch('extent', this.debounce(function (event) {
                if (me.options.visible) {
                    me.show();
                }
            }, 0))];
        },
        _createTooltip: function () {
            var contentHtml = _tpl(CONTENT_TEMPLATE, { content: this.options.content });
            var html = _tpl(ROOT_TEMPLATE, { content: contentHtml + ARROW_TEMPLATE, id: this._randomId });
            dojo.query(this._mapView.container).query('.esri-view-root').addContent(html);
        },
        show: function (param) {
            var rootNode = dojo.query('#' + this._randomId);
            rootNode.removeClass('esri-custom-visible_hide');
            var arrowNode = rootNode.query('.esri-custom-tooltop-arrow');
            this.options = param = dojo.mixin(this.options, param, {
                visible: true
            });
            if (param.location) {
                var screenPoint = this._mapView.toScreen(param.location);
                var arrowLeft = rootNode.style('width')[0] / 2 - 6;
                rootNode.style({
                    'left': (screenPoint.x - arrowLeft - 6) + 'px',
                    'top': (screenPoint.y - 48) + 'px'
                });
                arrowNode.style({
                    'left': arrowLeft + 'px'
                });
            }
        },
        hide: function () {
            dojo.query('#' + this._randomId).addClass('esri-custom-visible_hide');
        }
    });

    Tooltip.getInterPointFromRing = Custom.getInterPointFromRing;

    return Tooltip;

});
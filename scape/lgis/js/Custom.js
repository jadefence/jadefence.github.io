define([
    "esri/core/Accessor",
    "esri/geometry/Polygon"
], function (accessor, Polygon) {

    var Custom = accessor.createSubclass({
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function () {
                    var last = (new Date()) - timestamp;
                    if (last < wait) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) result = func.apply(context, args);
                return result;
            };
        },
        last: function (array) {
            if (array && array.length) {
                return array[array.length - 1];
            }
            return null;
        }
    });

    var _judgeCoordinates = function (flatCoordinates, offset, end, stride, x, y) {
        var wn = 0;
        var x1 = flatCoordinates[end - stride];
        var y1 = flatCoordinates[end - stride + 1];
        for (; offset < end; offset += stride) {
            var x2 = flatCoordinates[offset];
            var y2 = flatCoordinates[offset + 1];
            if (y1 <= y) {
                if (y2 > y && ((x2 - x1) * (y - y1)) - ((x - x1) * (y2 - y1)) > 0) {
                    wn++;
                }
            } else if (y2 <= y && ((x2 - x1) * (y - y1)) - ((x - x1) * (y2 - y1)) < 0) {
                wn--;
            }
            x1 = x2;
            y1 = y2;
        }
        var result = (wn !== 0);
        if (!result) {
            return false;
        }
        return true;
    };

    Custom.getInterPointFromRing = function (ring) {
        var i, ii, x, x1, x2, y1, y2;
        var polygon = new Polygon({
            "rings": [ring]
        });
        var extentCenter = polygon.extent.center;
        var y = extentCenter.y;
        var intersections = [];
        var flatCoordinates = [];
        for (var i = 0, len = ring.length; i < len; i++) {
            flatCoordinates.push(ring[i][0], ring[i][1]);
        }
        var end = flatCoordinates.length;
        x1 = flatCoordinates[end - 2];
        y1 = flatCoordinates[end - 2 + 1];
        for (i = 0; i < end; i += 2) {
            x2 = flatCoordinates[i];
            y2 = flatCoordinates[i + 1];
            if ((y <= y1 && y2 <= y) || (y1 <= y && y <= y2)) {
                x = (y - y1) / (y2 - y1) * (x2 - x1) + x1;
                intersections.push(x);
            }
            x1 = x2;
            y1 = y2;
        }
        var pointX = NaN;
        var maxSegmentLength = -Infinity;
        intersections.sort(function (a, b) {
            return a - b;
        });
        x1 = intersections[0];
        var xs = [];
        for (i = 1, ii = intersections.length; i < ii; ++i) {
            x2 = intersections[i];
            var segmentLength = Math.abs(x2 - x1);
            if (segmentLength > maxSegmentLength) {
                x = (x1 + x2) / 2;
                if (_judgeCoordinates(
                    flatCoordinates, 0, end, 2, x, y)) {
                    pointX = x;
                    maxSegmentLength = segmentLength;
                    xs.push(x);
                }
            }
            x1 = x2;
        }
        if (isNaN(pointX)) {
            pointX = extentCenter.x;
        }
        return { x: pointX, y: y }
    }

    return Custom;

})
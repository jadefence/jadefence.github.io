define([
    "./Custom"
], function (Custom) {
    var config = {
        width_value: 35,
        width_name: 65,
        height_label:25
    }
    var init = function (dom, datas,callback) {
        $(".tip_label").remove();
        //datas = [
        //    { name: "test1", value: 50, color: "red", title: "优", x: 10, y: 20 },
        //    { name: "test2", value: 50, color: "red", title: "良", x: 10, y: 20 }
        //];
        for (var i in datas) {
            if (!datas[i].x) continue;
            var tiplabel = template
                .replace(/{ObjectID}/g, datas[i].ObjectID)
                .replace(/{title}/g, datas[i].title)
                .replace(/{name}/g, datas[i].name)
                .replace(/{value}/g, datas[i].value)
                .replace(/{color}/g, datas[i].color)
                .replace(/{font}/g, datas[i].font)
                .replace("{x}", datas[i].x - (config.width_value / 2))
                .replace("{y}", datas[i].y - (config.height_label * 1.5))
                .replace(/{width_name}/g, config.width_name)
                .replace(/{width_value}/g, config.width_value)
                .replace(/{height}/g, config.height_label)
                .replace(/{xoffset}/g, (config.width_value / 2)-5);
            $(dom).append(tiplabel);
        }
        $(".tip_label").click(function (e) {
            debugger;
            callback(e);
        })
    }
    var template = '<div class="tip_label" style="position:absolute;left:{x}px;top:{y}px;height:{height}px;border:solid 1px {color};background-color:white;border-radius: 3px;box-shadow: 1px 1px 10px rgba(0,0,0,.3);cursor:pointer;" data-Id="{ObjectID}" title="{title}">'
        + '<div class="tip_value" style="float:left;background-color:{color};color:{font};width:{width_value}px;text-align:center;line-height:{height}px">{value}</div>'
        + '<div class="tip_name" style="float:left;width:{width_name}px;text-align:center;line-height:{height}px">{name}</div>'
        + '<div style="position:absolute;left:{xoffset}px;bottom:-10px;width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top:10px solid {color};"></div>'
        + '</div>';
    var initCss = function () {

    }
    var hide = function () {
        $(".tip_label").hide();
    }
    return {
        init: init,
        hide: hide
    }
})
window.trackPv = null;
app.onAction(function () {
    if (IsProduction == 'False')
        return;

    var referrerUrl = tParams.referrerUrl.split("?")[0];
    var url = tParams.url.split("?")[0];
    trackPv = util.getCookie("trackPv");
    trackPv = util.queryStringToObj(trackPv);
    if (!trackPv) {
        trackPv = {};
    }

    //是否为当前页
    if (trackPv["currPn"] != url) {
        trackPv["prevPn"] = trackPv["currPn"];
        trackPv["currPn"] = url;
        if (util.isNullOrEmpty(trackPv["prevPn"])) {
            if (!util.isNullOrEmpty(app.appInfo.pmrk)) {
                trackPv["prevPn"] = app.appInfo.pmrk;
            } else {
                trackPv["prevPn"] = referrerUrl;
            }
        }
        util.setCookie("trackPv", util.objToQueryString(trackPv));
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    var data = {
        _at: tParams._at,
        mid: tParams.mid,
        sid: tParams.sid,
        csrc: tParams.csrc,
        psrc: !util.isNullOrEmpty(app.appInfo.pmrk) ? tParams.csrc : tParams.dsSrc,
        src: tParams.dsSrc,
        mrk: trackPv["currPn"],
        pmrk: trackPv["prevPn"],
        uuid: app.deviceInfo.uuid,
        uid: tParams.uid,
        ip: app.deviceInfo.ip,
        _mc: app.deviceInfo.mac,
        _pv: app.deviceInfo.pv,//手机系统版本
        _pm: app.deviceInfo.pm,//手机型号
        _lo: app.deviceInfo.lo,//百度地图经度
        _la: app.deviceInfo.la,//百度地图维度
        _c: app.deviceInfo.city,//城市
        _addr: app.deviceInfo.addr,//地址
        _av: app.deviceInfo.av,//app版本号
        _avn: app.deviceInfo.avn,//app版本名称
        _i: app.deviceInfo.imei,//IMEI
        browser: tParams.browser,//客户端浏览器信息
        _r: tParams._r,//可以传递团购ID、促销ID、活动ID或者其他ID
        _rt: encodeURIComponent(tParams._rt)//可以传递团购名称、促销名称、活动名称或者其他ID对应的名称
    };

    script.src = tParams.api + "/api/trackpageview?";
    script.src = util.addUrlParams(script.src, data);
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(script);

});
//动作埋点
function TrackEvent(rid, userAction) {
    if (IsProduction == 'False')
        return;

    trackPv = util.getCookie("trackPv");
    trackPv = util.queryStringToObj(trackPv);

    var url = tParams.url.split("?")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    var data = {
        _at: tParams._at,
        mid: tParams.mid,
        sid: tParams.sid,
        csrc: !util.isNullOrEmpty(app.appInfo.pmrk) ? tParams.csrc : tParams.dsSrc,
        src: tParams.dsSrc,
        mrk: url,
        uuid: app.deviceInfo.uuid,
        uid: tParams.uid,
        _r: rid,//绑定的ID
        _a: userAction,
        ip: app.deviceInfo.ip,
        _mc: app.deviceInfo.mac,
        _pv: app.deviceInfo.pv,//手机系统版本
        _pm: app.deviceInfo.pm,//手机型号
        _lo: app.deviceInfo.lo,//百度地图经度
        _la: app.deviceInfo.la,//百度地图维度
        _c: app.deviceInfo.city,//城市
        _addr: app.deviceInfo.addr,//地址
        _av: app.deviceInfo.av,//app版本号
        _avn: app.deviceInfo.avn,//app版本名称
        _i: app.deviceInfo.imei,//IMEI
        browser: tParams.browser,//客户端浏览器信息
        premrk: trackPv["prevPn"]
    };

    script.src = tParams.api + "/api/TrackEvent?";
    script.src = util.addUrlParams(script.src, data);
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(script);
}

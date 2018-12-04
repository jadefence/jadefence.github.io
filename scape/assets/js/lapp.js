global = this;
var isPageInit = false;
var isReady = false;

var app = {
    // page init
    _pageInit: function () {

        if (isPageInit) {
            return;
        }
        var that = this;

        //$("[data-href]").tapLive(function () {

        //    var url = $(this).attr("data-href");
        //    if (!util.isNullOrEmpty(url)) {
        //        that.gotoPage(url);
        //    }
        //});

        //$("[data-back]").tapLive(function () {
        //    history.go(-1);
        //});

        isPageInit = true;

    },
    readyFuncs: [],
    onReady: function (fun) {
        if (typeof (fun) == "function") {
            this.readyFuncs.push(fun);
        }
    },
    _ready: function () {

        if (isReady) { return; }
        for (var i = 0; i < app.readyFuncs.length; i++) {
            var fun = app.readyFuncs[i];
            fun();
        }
        isReady = true;
    },
    actionFuncs: [],
    onAction: function (fun) {
        if (typeof (fun) == "function") {
            this.actionFuncs.push(fun);
        }
    },
    _action: function () {

        for (var i = 0; i < app.actionFuncs.length; i++) {
            var fun = app.actionFuncs[i];
            fun();
        }
    },
    pageRefresh: function () {
        window.history.go(0);
    },
    //页面跳转
    gotoPage: function (url) {

        if (url.indexOf("http") != 0) {
            url = domain + url;
        }
        appNative.gotoPage(url);
    },
    //后退
    backPage: function () {
        appNative.backPage();
    },

    getUuid: function () {
        var uuid = util.getCookie("_uuid");

        if (util.isNullOrEmpty(uuid)) {
            uuid = Guid.newGuid().toString("N");
            this.setUuid(uuid);
        }
        return uuid;
    },
    setUuid: function (uuid) {

        var exp = new Date();
        exp.setYear(exp.getYear() + 50 + 1900);
        util.setCookie("_uuid", uuid, exp, "/", "");
    },
    //设备信息
    deviceInfo: {
        uuid: "",
        ip: "",
        mac: "",
        sv: "",
        mode: "",
        longitude: 0,
        latitude: 0,
        screenWidth: screen.width,
        screenHeight: screen.height,
        version: "",
        versionName: ""
    },
    appInfo: {
        city: "",
        addr: "",
        pmrk: ""
    }
}

var startapp = {
    init: function (obj) {
        app.deviceInfo.uuid = app.getUuid();
        if (typeof (obj) == "object" && Object.prototype.toString.call(obj) == "[object Object]") {
            //uuid, pmrk, ip, mac, sv, mode, city, addr, lo, la, sw, sh, vers, vn, imei
            app.deviceInfo.uuid = util.isNullOrEmpty(obj.uuid) ? app.getUuid() : obj.uuid;
            app.setUuid(obj.uuid);
            app.appInfo.pmrk = obj.pmrk || "";//前一个页面标识

            app.deviceInfo.ip = obj.ip || "";//ip
            app.deviceInfo.mac = obj.mac || "";//mac地址

            app.deviceInfo.pv = obj.pv || "";//手机系统版本
            app.deviceInfo.pm = obj.pm || "";//手机型号

            app.deviceInfo.lo = obj.lo || "";//百度地图经度
            app.deviceInfo.la = obj.la || "";//百度地图维度
            app.deviceInfo.av = obj.av || "";//app版本号
            app.deviceInfo.avn = obj.avn || "";//app版本名称
            app.deviceInfo.imei = obj.imei || "";//app版本名称
            app.deviceInfo.user = window
        }

        app._pageInit();
        app._ready();
        app._action();
    }
};

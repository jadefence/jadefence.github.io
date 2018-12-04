
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




var isFromMp = false;//当前请求是否在微信中
var isServerConsole = false;//是否开启服务端js日志
var isDebug = false;//是否开启调试
var IsWXJSSDKDebug = true; //是否开启微信JS-SDK调试


//fixed window phone type tel
function IsWindowPhone() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Windows Phone");
    var flag = false;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}

$(function () {
    if (IsWindowPhone()) {
        for (var i = 0; i < $("input[type=tel]").length; i++) {
            $("input[type=tel]").eq(i).after($("input[type=tel]").eq(i).clone().attr("type", "text")).remove();
            console.log(i)
        }
    }
});


var $mcConsole = function (obj) {
    $.post('/service/Console', { "log": obj });
}


var $mcInit = function (mallID) {
    $mcSetHrefParams(mallID);
}

var PageIndex = 1, PageSize = 10;

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}


var $mcPost = function (url, data, callback, error, noLoading,errorCBFirst) {
    var loading_submit;
    if (noLoading != true) {
        loading_submit = new $.Zebra_Dialog('', { buttons: false, show_close_button: false, modal: false, custom_class: 'ZebraDialog_loading' });
    }
    $.ajax({
        url: url,
        data: data,
        type: "POST",
        timeout: location.href.indexOf("localhost") ? 100000 : 30000,  //30秒超时
        success: function (response) {
            if (noLoading != true)
                loading_submit.close();
            if (((typeof response.m) != "undefined" && response.m != null && response.m != 1) || ((typeof response.success) != "undefined" && response.success != null && !response.success)) {
                if (errorCBFirst) {
                    if (!IsJson(response)) {
                        response = {};
                    }

                    if ((response.message == undefined && response._e == undefined) || (response.message == "" && response._e == "")) {
                        response.message = "请求失败";
                    }
                    if (error) {
                        error(response);
                    }
                    else {
                        $mcDialog('<div class=\"taC\">' + (response.message || response._e) + '</div>', 1);
                    }

                    return;
                }
                switch (response.code) {
                    case 1205:
                    case 1204:
                    case 1001://未登录
                        var redirect = response.login + (response.login.indexOf("?") > -1 ? "&" : "?") + "url=" + response.url + "&_url=" + response.url;
                        if ($_type == '1' || $_type == '2') {
                            redirect = redirect + "&_targetType=4"
                        }
                        //app.gotoPage(redirect)
                        location.href = redirect;
                        break;
                    case 10012://新版登录
                        var redirect = "/member/user/login?url=" + response.url + "&_mid=" + _mid;
                        // 跳转到APP登录
                        if ($_type == '1' || $_type == '2') {
                            redirect = "/user/login?_targetType=4&_url=" + response.url;
                        }
                        location.href = redirect;
                        break;
                    case 1010://没有手机号
                        var redirect = "/user/bindphone?url=" + response.url + "&_mid=" + _mid;
                        location.href = redirect;
                        break;

                    case 2001:
                        alert(response.message);
                        break;

                    case 14103://未开卡或绑卡
                        $mcConfirm(response.message,
                            function () {
                                var redirect = "/mallcard/mymallcard?url=" + encodeURIComponent(window.location.href) + "&_mid=" + _mid;
                                console.log(redirect);
                                location.href = redirect;
                            }, "马上开卡");
                        break;
                    case 14101://已是会员（无法开卡，跳邦卡页面）
                        $mcAlert(response.message, function () {
                            var redirect = "";
                            if (window.isUseNewLogReg) {
                                var url = getQueryStringByName("url");
                                if (window.isSupportOpenMallCard == 1) {
                                    redirect = "/member/mallcard/bind?url=" + encodeURIComponent(window.location.href) + "&_mid=" + _mid;
                                }
                            }
                            else {
                                redirect = "/mallcard/bindmallcard?url=" + encodeURIComponent(window.location.href) + "&_mid=" + _mid;
                                location.href = redirect;
                            }
                        });
                        break;
                    case 14108://不是会员（无法绑卡，跳开卡页面）
                        $mcAlert(response.message, function () {
                            var redirect = "";
                            if (window.isUseNewLogReg) {
                                var url = getQueryStringByName("url");
                                if (window.isSupportBindMallCard == 1) {
                                    redirect = "/member/mallcard/nonrocopencard?url=" + encodeURIComponent(window.location.href) + "&_mid=" + _mid;
                                }
                            }
                            else {
                                var redirect = "/mallcard/activatecard?url=" + encodeURIComponent(window.location.href) + "&_mid=" + _mid;
                                location.href = redirect;
                            }
                        });
                        break;
                    case 4110://不是会员（无法绑卡）
                    case 15103:
                        $mcAlert(response.message, "<div class=\"giveUpPay\">积分不足</div>");
                        break;
                    case 3001://对接app的登录
                        var redirect = "/user/login?_targetType=4&_url=" + response.url;
                        location.href = redirect;
                        break;
                    case 930541:
                        var redirect = "/user/login?url=" + response.url + "&_url=" + response.url + "&_mid=" + _mid;
                        if ($_type == '1' || $_type == '2') {
                            redirect = redirect + "&_targetType=4"
                        }
                        location.href = redirect;
                        break;
                    case "attention"://微信引导关注
                        location.href = "/user/AttentionGuide?_mid=" + _mid;
                        break;
                    default:
                        if (!IsJson(response)) {
                            response = {};
                        }

                        if ((response.message == undefined && response._e == undefined) || (response.message == "" && response._e == "")) {
                            response.message = "请求失败";
                        }
                        if (error) {
                            error(response);
                        }
                        else {
                            $mcDialog('<div class=\"taC\">' + (response.message || response._e) + '</div>', 1);
                        }
                }
            }
            else {
                if (callback) {
                    callback(response);
                }
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (noLoading != true)
                loading_submit.close();
            if (textStatus != "abort")
                $mcAlert('<div class=\"taC\">' + textStatus + '</div>');
        }
    });
}

//弹出层
var alertBox_str = '<div id="mcDialog" class=\"ZebraDialogOverlay alertBoxMask\"></div>'
        + '<div class=\"ZebraDialog customer_pop alertBoxPop\">'
       + '<h3 class=\"ZebraDialog_Title\">'
     + '</h3><div class=\"ZebraDialog_BodyOuter\">'
            + '<div class=\"ZebraDialog_Body ZebraDialog_Icon ZebraDialog_Information\">'
                 + '<div class=\"conbox\">'
                      + '<div class=\"con\">'
                        + '</div>'
                        + '</div>'
                   + '</div>'
      + '</div><div class=\"ZebraDialog_ButtonsOuter\"><div class=\"ZebraDialog_Buttons\"><a href=\"javascript:void(0)\" class=\"ZebraDialog_Button_0\">确定</a>'
      + '<a href=\"javascript:void(0)\" class=\"ZebraDialog_Button_1\">取消</a></div></div>'
    + '</div>';

var alertCommon = function (option) {
    var title = option.title;
    var callbackYes = option.callbackYes;
    var callbackNo = option.callbackNo;
    var buttonYes = option.buttonYes;
    var buttonNo = option.buttonNo;
    var message = option.message;


    if ($('#mcDialog').length > 0) {
        $('#mcDialog').remove();
        $('.alertBoxPop').remove();
    }
    $(alertBox_str).appendTo($("body"));

    $(".alertBoxMask").css({
        "position": "fixed",
        "left": "0px",
        "top": "0px",
        "opacity": 0.9,
        "display": "block"
    });
    $(".alertBoxPop .ZebraDialog_Title").html(title);
    $(".alertBoxPop .ZebraDialog_Button_0").html(buttonYes);
    $(".alertBoxPop .con").html(message);
    $(".alertBoxPop").css({
        "position": "fixed",
        "visibility": "visible",
        "opacity": 1,
        "display": "block"
    });


    $(".alertBoxPop .ZebraDialog_Button_0").on("click", function () {
        $(".alertBoxMask").css({ "display": "none" });
        $(".alertBoxPop").css({ "display": "none" });
        if (callbackYes) {
            callbackYes();
        }
    });
    if (buttonNo) {
        $(".alertBoxPop .ZebraDialog_Button_1").html(buttonNo);
        $(".alertBoxPop .ZebraDialog_Button_1").on("click", function () {
            $(".alertBoxMask").css({ "display": "none" });
            $(".alertBoxPop").css({ "display": "none" });
            if (callbackNo) {
                callbackNo();
            }
        });
    }
    else {
        $(".alertBoxPop .ZebraDialog_Button_1").css('display', "none!important");
    }
}

var $mcAlert = function (message, title, callbackYes, yesButtonName) {
    if (!message) {
        message = "";
    }
    if (!title) {
        title = "提示";
    }
    else if ($.isFunction(title)) {
        if (callbackYes) {
            yesButtonName = callbackYes;
        }

        callbackYes = title;
        title = "提示";
    }
    if (!yesButtonName) {
        yesButtonName = "好的";
    }
    var option = {
        title: title,
        callbackYes: callbackYes,
        buttonYes: yesButtonName,
        message: message,
    }
    alertCommon(option)
}

var $mcLoad = function () {
    return $.Zebra_Dialog('<p style="text-align:center">加载中...</p>', { buttons: false, show_close_button: false });
};


var $mcConfirm = function (message, title, callbackYes, yesButtonName, callbackNo, noButtonName) {
    if (!message) {
        message = "";
    }
    if (!title) {
        title = "提示";
    }
    else if ($.isFunction(title)) {//未输入title
        if (callbackYes) {
            if ($.isFunction(callbackYes)) {
                callbackNo = callbackYes
                if (yesButtonName) {
                    noButtonName = yesButtonName;
                }
            }
            else {
                if (yesButtonName) {
                    if ($.isFunction(yesButtonName)) {
                        callbackNo = yesButtonName
                    }
                    else {
                        noButtonName = yesButtonName
                    }
                }
                yesButtonName = callbackYes;
            }
        }
        callbackYes = title;
        title = "提示";
    }

    if (!yesButtonName) {
        yesButtonName = "好的";
    }
    else if ($.isFunction(yesButtonName)) {
        callbackNo = yesButtonName;
        yesButtonName = "好的";
    }
    if (!noButtonName) {
        noButtonName = "取消";
    }

    var option = {
        title: title,
        callbackYes: callbackYes,
        callbackNo: callbackNo,
        buttonYes: yesButtonName,
        buttonNo: noButtonName,
        message: message,
    }
    alertCommon(option)


}


function confirmPwd($sect) {
    $sect.hide();
    var mess = '<div class="mart10">二级密码：<input type="password" id="pwd" class="gm-input" style="width:65%;display:inline-block;margin-bottom:0;"></div>';
    $mcConfirm(mess, "请输入二级密码", function () {
        var pwd = $("#pwd").val();
        if (!(pwd.length > 0)) {
            $mcAlert("请输入密码", function () {
                confirmPwd($sect);
            });
            return;
        }
        var postData = {
            pwd: pwd
        };
        $mcPost("/user/CheckCardPassword", postData, function () {
            $sect.show();
        }, function () {
            $mcAlert("密码有误", function () {
                confirmPwd($sect);
            });
        })
    }, "确定", function () {
        if (document.referrer != "") {
            window.history.go(-1);
        }
        else {
            $mcAlert("很抱歉！您没有权限进行此项操作。");
        }
    }, "取消");
}


var $mcGetHtml = function (url, data, callback) {

}
//给a链接添加默认参数

//var isTelephoneNumber = /^0(([1-9]\d)|([3-9]\d{2}))\d{8}$/; //匹配固定电话或小灵通
//var isMobileNumber = /^1[3,5]\d{9}$/;//匹配手机号码
var $mcSetHrefParams = function (mallID) {
    $('a').each(function () {
        //如果是apps调用
        if (getQueryStringByName("_type") == "1" || getQueryStringByName("_type") == "2") {
            var append = "";
            if (location.href.indexOf("?") > -1) {
                append = "&_targetType=1&_actType=23";
            }
            else {
                append = "?_targetType=1&_actType=23";
            }
            var url = location.href + append;

            var index = $(this).attr("href").indexOf("tel:");
            if (index == 0) {
                $(this).attr("href", url + "&value=" + $(this).attr("href").substring(4));
            }
        }


        var h = $(this).attr('href');
        if (h == "") {
            return true;
        }
        if (h.indexOf('javascript:') == 0) {
            return true;
        }
        if (h.indexOf('#') != -1) {
            return true;
        }
        if (h.length > 4 && h.indexOf("tel:") == 0) {
            return true;
        }
        if (h.indexOf('_mid') < 0) {
            if (h.indexOf('?') >= 0) {
                h += '&_mid=' + mallID;
            }
            else {
                h += '?_mid=' + mallID;
            }
        }
        $(this).attr('href', h);
    });
}


//返回上一页
//isMustUseUrl 必须使用给定的Url返回
var $mcViewGoBack = function (indexUrl, isMustUseUrl) {
    //无来源页，除杭州龙湖外，其余返回首页
    if (history.length == 1) {
        location.href = "/";
        return;
    }
    if (!isMustUseUrl) {
        if ((document.referrer.toLowerCase().indexOf("/user/login") > -1 || document.referrer.toLowerCase().indexOf("/member/user/login") > -1) && checkLogin() && history.length > 1) {
            history.go(-2);
            return;
        }
        if (history.length > 0) {
            history.go(-1);
            return;
        }
        location.href = "/?_mid=" + _mid;
    }
    else {
        if (indexUrl.indexOf('_mid') < 0) {
            if (indexUrl.indexOf('?') >= 0) {
                indexUrl += '&_mid=' + _mid;
            }
            else {
                indexUrl += '?_mid=' + _mid;
            }
        }

        location.href = indexUrl;
    }
}

var p = 2
var screenW = parseInt(parseInt($(window).width()) * p);
//获取100%宽度图片
//$img：图片实例
//heightPercent:width/height
var setImg = function ($img, heightPercent) {
    var height = screenW * heightPercent;
    //var imgSrc = "https://i1.mallcoo.cn//mc/9919e65d-fcee-488a-b7e2-32e345ec3a3a_" + screenW + "x" + h + "_1_0_0.jpg";
    var imgSrc = $img.attr("data-url");
    $img.attr("src", imgSrc.format(screenW, height));
}




//--------微信内分享---------------

var $mcShare = null;

function $testmcShare() {

    $mcShare.callPre(testshareFriend);
}



function $mcShareFriend() {
    if (!$mcShare) {
        return false;
    }
    if ($mcShare.callPre) {
        $mcShare.callPre(shareFriend);
    }
    else {
        shareFriend();
    }
}

function $mcShareTimeline() {
    if (!$mcShare) {
        return false;
    }
    if ($mcShare.callPre) {
        $mcShare.callPre(shareTimeline);
    }
    else {
        shareTimeline();
    }
}


function testshareFriend() {
    $mcShare.ShareType = 2;//分享给好友
    console.log($mcShare);
    $mcPost('/WeixinMp/shareadd', $mcShare, function (res2) {
        location.href = $mcShare.Url;
    }, function (res2) {
    });
}

function shareFriend() {
    WeixinJSBridge.invoke('sendAppMessage', {
        //"user_name": "gh_978c42ae9fa7",
        "appid": $mcShare.AppID,
        "img_url": $mcShare.Image,
        "img_width": "640",
        "img_height": "640",
        "link": $mcShare.Url,
        "desc": $mcShare.Content,
        "title": $mcShare.Title
    }, function (res) {
        if (true) {
            $mcShare.ShareType = 2;//分享给好友
            $mcPost('/WeixinMp/shareadd', $mcShare, function (res2) {
            }, function (res2) {
            });
        }
        _report('send_msg', res.err_msg);
    });
}
//分享到朋友圈
function shareTimeline() {
    WeixinJSBridge.invoke('shareTimeline', {
        "appid": $mcShare.AppID,
        "img_url": $mcShare.Image,
        "img_width": "640",
        "img_height": "640",
        "link": $mcShare.Url,
        "desc": $mcShare.Content,
        "title": $mcShare.Title
    }, function (res) {
        if (true) {
            $mcShare.ShareType = 1;//分享到朋友圈
            $mcPost('/WeixinMp/shareadd', $mcShare, function (res2) {

            }, function (res2) {

            });
        }
        _report('timeline', res.err_msg);
    });
}
//分享到微博
function shareWeibo() {
    WeixinJSBridge.invoke('shareWeibo', {
        "content": descContent,
        "url": lineLink,
    }, function (res) {
        _report('weibo', res.err_msg);
    });
}

function viewProfile() {
    typeof WeixinJSBridge != "undefined" && WeixinJSBridge.invoke && WeixinJSBridge.invoke("profile", {
        username: 'gh_978c42ae9fa7',
        scene: "57"
    });
}
// 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {

    // 发送给好友
    WeixinJSBridge.on('menu:share:appmessage', function (argv) {
        $mcShareFriend();
    });

    // 分享到朋友圈
    WeixinJSBridge.on('menu:share:timeline', function (argv) {
        $mcShareTimeline();
    });

    // 分享到微博
    WeixinJSBridge.on('menu:share:weibo', function (argv) {
        shareWeibo();
    });
}, false);
//--------微信内分享End---------------


//mallcoo app
var $mcAppViewClose = function myfunction() {

}

//首页模板跳转
function dourl(url) {
    if (url.length <= 0) {
        location.href = "home/index";
    } else {
        location.href = url;
    }
};
function moreurl(url) {
    if (url.length <= 0) {
        location.href = "home/index";
    } else {
        location.href = url;
    }
};


//消息提示
function dialog(str) {
    new $.Zebra_Dialog(str, {
        'buttons': false,
        'modal': false,
        'auto_close': 3000
    });
}

//消息提示
function $mcDialog(str, seconds, callback) {
    if (typeof seconds == "function") {
        callback = seconds;
        seconds = 3;
    }

    if (!seconds) {
        seconds = 3;
    }

    seconds = 3;
    new $.Zebra_Dialog("<div class='taC'><p>" + str + "</p></div>", {
        'buttons': false,
        'modal': false,
        'auto_close': seconds * 1000
    });

    if (typeof callback == "function") {
        setTimeout(function () { callback() }, seconds * 1000);
    }
}

//根据名字取QueryString
function getQueryStringByName(name, search) {
    if ((!search)) {
        search = location.search;
    }
    var result = search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

/**
 * @namespace
 * mallcoo
 */
var MC = {
    init: function () {
        this.form();
        this.pg_trans();
    },
    /**
     * @description 切换tap，click
     * eg:
         $('X').bind(MC.click,function(e){))
    */
    click: 'ontouchend' in document ? 'tap' : 'click'
    //click: 'click'
}

// 表单
MC.form = function () {
    /**
     * @description radio单击
     * eg:
        <div class="con taC" id="divcalss" data-form-role="radio" data-val="1">
            <span class="checked-in cur" data-val=1>先生</span>
            <span class="checked-in" data-val=2>女士</span>
        </div>
    */
    /*多个选项只能选择一个且不能选择自身*/
    $('[data-form-role=radio]').bind(MC.click, function (e) {
        var tar = e.target, $tar = $(tar), nodeName = tar.nodeName.toLowerCase();
        if (nodeName == 'span') {
            if ($tar.hasClass('checked')) { return false }
            $('.checked', this).removeClass('checked');
            $tar.addClass('checked');
            $(this).data('val', $tar.data('val'));
        }
    })
    /*单击自身可变成不选中状态*/
    $('[data-form-role=singlecheckbox]').bind(MC.click, function (e) {
        var tar = e.target, $tar = $(tar), nodeName = tar.nodeName.toLowerCase(), $this = $(this);

        if (nodeName == 'span') {
            if ($tar.hasClass('cur')) {
                $tar.removeClass('cur');
            } else {
                $tar.addClass('cur');
            }
            count();
        }
        function count() {
            var v = [];
            $this.find('span.cur').each(function () {
                v.push($(this).data('val'));
            })
            $this.data('val', v.join(','))
        }
    })
}
/**
 * @description 转场切换
 * 方法：开启，关闭
 */
MC.pg_trans = function () {
    $('[data-trans]').bind(MC.click, function (e) {
        e.stopPropagation();
        var box_cls = $(this).data('trans'),
            $box = $('.' + box_cls);
        $box.show();
        setTimeout(function () {
            $box.addClass('modal-in');
        }, 1)
    })
    $('.close-trans').bind(MC.click, function () {
        var $box = $(this).closest('.pg_trans_x')
        $box.removeClass('modal-in').addClass('modal-out').css({ "-webkit-transform": "" });
        $box.one('webkitTransitionEnd', function () {
            $(this).removeClass('modal-out').hide();
        })
    })
}
// 滚动置顶插件
MC.scrollFixed = function (e1, box) {
    /*
        * e1：需置顶元素
        * e2：克隆置顶辅助元素到 body下，减少结构复杂性
        * $box: 滚动父层
        * MC.scrollFixed('shopBar', 'pudescroll');
    */
    var e2 = e1 + '_clone',
        $e1 = $('#' + e1),
        $e2 = $e1.clone().attr('id', e1 + '_clone'),
        $box = $('#' + box || 'scrollWrap');
    var t1 = parseInt(getAbsolutePos($e1[0]).t);
    var t2 = parseInt(getAbsolutePos($box[0]).t);
    $e2.appendTo('body').css({ 'display': 'none', 'position': 'fixed', 'top': t2 });
    $box.scroll(function () {
        scrolling($(this));
    })

    function scrolling(obj) {
        var wt = parseInt(obj.scrollTop());
        if (wt > t1 - t2) {
            $e2.show();
        } else {
            $e2.hide();
        }
    }
    function getAbsolutePos(e) {
        var t = e.offsetTop;
        var l = e.offsetLeft;
        while (e = e.offsetParent) {
            t += e.offsetTop;
            l += e.offsetLeft;
        }
        return { t: t, l: l }
    }
}
MC.init();

//判断是不是手机号
String.prototype.IsValidMobile = function () {
    var pattern = /^1\d{10}$/;
    return pattern.test(this);
}


String.prototype.Right = function (length) {
    return this.slice(length * (-1));
}

//在字符串前后加字符
String.prototype.MessageDiviation = function (beforeStr, beforeCount, afterStr, afterCount) {
    return Replicate(beforeStr, beforeCount).concat(this).concat(Replicate(afterStr, afterCount));
}

function Replicate(str, count) {
    var returnValue = "";
    for (var i = 0; i < count; i++) {
        returnValue += str;
    }

    return returnValue;
}

//本地存储
(function () {
    function $localStorage() {
        this.set = function (storageKey, key, value) {
            if (window.localStorage) {
                var storage = window.localStorage;

                var details = JSON.parse(storage.getItem(storageKey)) || {};
                details[key] = value;

                storage.setItem(storageKey, JSON.stringify(details));
            }
            else {
                var values = util.queryStringToObj(util.getCookie(storageKey)) || {};
                values[key] = value;
                util.setCookie(storageKey, util.objToQueryString(values), 5184e6);
            }
        },
        this.get = function (storageKey, key) {
            if (window.localStorage) {
                var storage = window.localStorage;

                var details = JSON.parse(storage.getItem(storageKey)) || {};

                return details[key] || '';
            }
            else {
                var values = util.queryStringToObj(util.getCookie(storageKey)) || {};
                return values[key] || '';
            }
        },
        this.remove = function (storageKey) {
            if (window.localStorage) {
                var storage = window.localStorage;
                storage.removeItem(storageKey);
            }
            else {
                util.delCookie(storageKey);
            }
        },
        this.setObject = function (storageKey, value) {
            if (window.localStorage) {
                var storage = window.localStorage;

                storage.setItem(storageKey, JSON.stringify(value));
            }
            else {
                util.setCookie(storageKey, util.objToQueryString(value), 5184e6);
            }
        },
       this.getObject = function (storageKey) {
           if (window.localStorage) {
               var storage = window.localStorage;

               return JSON.parse(storage.getItem(storageKey));
           }
           else {
               return util.queryStringToObj(util.getCookie(storageKey)) || {};
           }
       }
    }
    window.Storage = new $localStorage();
})();

// APP下载关闭
(function () {
    var ele = document.querySelector('#smartAd');
    var closeBtn = document.querySelector('.sd-close');
    if (typeof _mid == "undefined")
        return false;

    var key = "dc_" + _mid;
    var dcDate = Storage.get("downCloseDate", key);
    if (!ele || (dcDate && new Date().getTime() - dcDate < ($(ele).data('expire') || 864e5))) {
        return false;
    }
    ele.style.display = '';
    closeBtn.addEventListener(MC.click, function () {
        setTimeout(function () {
            var key = "dc_" + _mid;
            ele.style.display = 'none ';
            Storage.set("downCloseDate", key, new Date().getTime())
        }, 100)
    }, false)
})()


/* 封装 window load */
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != "function") {
        window.onload = func;
    }
    else {
        window.onload = function () {
            oldonload();
            func();
        }
    }
}

//使用本地存储自动填充
function autoFillStorage(storageKey) {
    var user = getCookie("_mallcoo_context", "m");
    storageKey = storageKey + "_" + user;

    $("[data-autofill='y']").each(function () {
        var val = Storage.get(storageKey, $(this).attr("id"));
        if (val != "")
            $(this).val(val);
    })
}

//使用本地存储保存
function saveLocalStorage(storageKey) {
    var user = getCookie("_mallcoo_context", "m");
    storageKey = storageKey + "_" + user;

    $("[data-autofill='y']").each(function () {
        if ($(this).val().trim() != "")
            Storage.set(storageKey, $(this).attr("id"), $(this).val().trim());
    })
}

//读取cookie
function getCookie(cookie, key) {
    var c = $.fn.cookie(cookie);
    var result = c.match(new RegExp("[\&]" + key + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}

//设置cookie
function setCookie(name, value, exp, path, domain) {

    domain = domain || "";
    path = path || "/";
    var expDate = new Date();
    if (typeof (exp) == "number") {
        expDate.setTime(expDate.getTime() + (exp));
    }
    else if (Object.prototype.toString.call(exp) == "[object Date]") {
        expDate = exp;
    }
    var cookieStr = name + "=" + value + ";path=" + path + (util.isNullOrEmpty(domain) ? "" : ";domain=" + domain);
    if (!util.isNullOrEmpty(exp)) {
        cookieStr += ";expires=" + expDate.toGMTString();
    }
    document.cookie = cookieStr;
}


function GetDateDiff(startTime, endTime, diffType) {
    //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式 
    startTime = startTime.replace(/\-/g, "/");
    endTime = endTime.replace(/\-/g, "/");

    //将计算间隔类性字符转换为小写
    diffType = diffType.toLowerCase();
    var sTime = new Date(startTime); //开始时间
    var eTime = new Date(endTime); //结束时间
    //作为除数的数字
    var divNum = 1;
    switch (diffType) {
        case "second":
            divNum = 1000;
            break;
        case "minute":
            divNum = 1000 * 60;
            break;
        case "hour":
            divNum = 1000 * 3600;
            break;
        case "day":
            divNum = 1000 * 3600 * 24;
            break;
        default:
            break;
    }
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
}

// 全局a链接跳转走js方式
$(document).bind('click', function (e) {
    var tar = e.target, $tar = $(tar), $par = $tar.closest('a');
    if ($par.length) {
        e.preventDefault();
        fn($par)
    }

    function fn(_self) {
        var href = $.trim(_self.attr('href'));
        if (href == '' || href.indexOf('javascript') != -1) {
            return;
        }
        location.href = href;
    }
})

// 图片加载完毕 执行回调 (eg:列表占位图加载后，再实例化iscroll)
function loadImage(url, fn) {
    var o = new Image();
    o.src = url;
    if (o.complete) {
        fn();
    } else {
        o.onload = function () {
            fn();
        };
        o.onerror = function () {
            window.alert('图片加载失败:' + url);
        };
    }
}

function GetAppUrl(con, act, isApp) {
    var uid = getCookie('_mallcoo_context', 'm');
    var token = getCookie('_mallcoo_context', 't2');
    var mid = '&_mid=' + getCookie('_mallcoo_context', 'mid')
    var parms = location.search;

    if (parms.indexOf("?") != -1 && /_mid/.test(parms)) {
        mid = '';
    }
    var url = "";
    if (isApp)
        url = 'mallcooapp://webview/openpage?url=http://lapp-t.mallcoo.cn/' + con + '/' + act + "?_uid=" + uid + '&_token=' + token + mid;
    else
        url = '/' + con + '/' + act + '?_mid=' + getCookie('_mallcoo_context', 'mid');
    return url;

}
//特殊字符验证
String.prototype.TextFilter = function () {
    var pattern = new RegExp("[`~%!@#^=''?~！@#￥……&——‘”“'？*()（），,。.、${}]+"); //[]内输入你要过滤的字符，这里是我的
    var rs = "";
    for (var i = 0; i < this.length; i++) {
        rs += this.substr(i, 1).replace(pattern, '');
    }
    return rs;
}
//去除空格
String.prototype.NoSpace = function () {
    return this.replace(/\s+/g, "");
}
//判断输入是否为中文
String.prototype.IsChinese = function () {
    var myReg = /^[\u4e00-\u9fa5]+$/;
    if (myReg.test(this) == true) {
        return true;
    }
    return false;
}
//判断输入只能为数字+字母
String.prototype.Isnumorletter = function () {
    var regex = /^[A-Za-z0-9]+$/;
    if (regex.test(this) == true) {
        return true;
    }
    else {
        return false;
    }
}
//判断输入是否为数字
String.prototype.IsNumber = function () {
    var regex = /^[0-9]+[0-9]*]*$/;
    if (regex.test(this) == true) {
        return true;
    }
    else {
        return false;
    }
}
//判断是否为车牌
String.prototype.IsCarNumber = function () {
    var regex = /^[\u4e00-\u9fa5]{1}[A-Z_a-z]{1}[A-Z_a-z_0-9]{5}$/;
    if (regex.test(this)) {
        return true;
    }
    else {
        return false;
    }
}

//判断输入是否为手机号
String.prototype.IsPhone = function () {
    var reg = /^1\d{10}$/;
    if (reg.test(this) == true) {
        return true;
    }
    else {
        return false;
    }
}
String.prototype.Clearchar = function () {
    var regex = /&/;
    if (regex.test(this) == true) {
        return true;
    }
    else {
        return false;
    }
}

//lazyload
function Lazy(opt) {
    this.opt = $.extend({}, Lazy.Default, opt);
    this.img = this.getObj;
    this.load();
    $(window).on("scroll", $.proxy(this.load, this));
}
Lazy.prototype = {

    load: function () {
        var i;
        var notLoaded = this.getLoad();
        for (i = 0; i < notLoaded.length; i++) {
            if (this.isLoad(notLoaded[i])) {
                $(notLoaded[i]).attr('src', $(notLoaded[i]).attr('data-original'));
                $(notLoaded[i]).addClass("loadedImg");
            }
        }
    },
    isLoad: function (obj) {
        var t1 = $(this.opt.container).scrollTop();
        var h1 = $(this.opt.container).height();
        var t2 = $(obj).offset().top;
        var h2 = $(obj).height();
        var h = (h1 + h2) / 2 + this.opt.distance;
        var tc1 = t1 + h1 / 2;
        var tc2 = t2 + h2 / 2;
        return Math.abs(tc1 - tc2) < h ? true : false;
    },
    getLoad: function () {
        var img = $('img.' + this.opt.classImg).not($(".loadedImg"));
        return img;
    }
}

Lazy.Default = {
    container: window,
    distance: 100,
    classImg: "lazy",
}

//window.onload = function () {
//new Lazy({});
//}

//返回顶部
$(window).bind("scroll", function () {
    var obj = $(".AppBackTop");
    if ($(window).scrollTop() >= 200) {

        obj.show();
    }
    else {
        obj.hide(500);

    }
}).scroll();


IsJson = function (obj) {
    if (Array.isArray(obj)) return false;
    var objectConstructor = {}.constructor;
    return obj.constructor === objectConstructor && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
}


utility = {
    loading: null,
    queryStringToObj: function (val, separator) {
        if (util.isNullOrEmpty(val)) {
            return null;
        }

        var data = {};
        try {
            separator = separator || "&";
            var array = val.split(separator);
            for (var i = 0; i < array.length; i++) {
                var temp = array[i].split("=");
                data[temp[0]] = decodeURIComponent(temp[1]);
            }

            return data;
        }
        catch (e) {
            return null;
        }
    },
    //{a:1,b:2} => a=1&b=2
    objToQueryString: function (obj, separator) {
        if (!obj) {
            return null;
        }

        var queStr = [];
        try {
            separator = separator || "&";
            for (var i in obj) {
                if (!obj.hasOwnProperty(i) || obj[i] == null) {
                    continue;
                }
                queStr.push(i + "=" + encodeURIComponent(obj[i]));
            }

            return queStr.join("&");
        }
        catch (e) {
            return null;
        }
    },
    //写cookies
    setCookie: function (name, value, exp, path, domain) {

        domain = domain || "";
        path = path || "/";
        var expDate = new Date();
        if (typeof (exp) == "number") {
            expDate.setTime(expDate.getTime() + (exp));
        }
        else if (Object.prototype.toString.call(exp) == "[object Date]") {
            expDate = exp;
        }
        //else {
        //    expDate.setTime(expDate.getTime() + 2592000000);  //默认一个月
        //}
        var cookieStr = name + "=" + value + ";path=" + path + (this.isNullOrEmpty(domain) ? "" : ";domain=" + domain);
        if (!util.isNullOrEmpty(exp)) {
            cookieStr += ";expires=" + expDate.toGMTString();
        }
        document.cookie = cookieStr;
    },

    //读取cookies
    getCookie: function (name) {

        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return (decodeURIComponent(arr[2]));
        else
            return null;
    },
    //判断是否为空字符或null
    isNullOrEmpty: function (value) {

        if (value == null || String.prototype.trim.call(value) === "") {
            return true;
        }
        else {
            return false;
        }
    },
    showLoading: function () {
        this.loading = new $.Zebra_Dialog('', { buttons: false, show_close_button: false, modal: false, custom_class: 'ZebraDialog_loading' });
    },
    hideLoading: function () {
        if (this.loading != null)
            this.loading.close();
    }
}

//使用方法查看/user/invitationcode页面
function mallcooShare(type, obj) {
    function _share() {
        //分享到腾讯微博  
        this.shareToTxWeibo = function (title, url, picurl) {
            var link = 'http://share.v.t.qq.com/index.php?c=share&a=index&title=' + title + '&url=' + url + '&pic=' + picurl;
            return link;
        }
        //分享到新浪微博  
        this.shareToSina = function (title, url, picurl) {
            var link = 'http://v.t.sina.com.cn/share/share.php?title=' + title + '&url=' + url + '&content=utf-8&sourceUrl=' + url + '&pic=' + picurl;
            return link;
        }
        //分享到QQ空间  
        this.shareToQQZone = function (title, url, picurl) {
            var link = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary=' + title + '&url=' + url + '&pics=' + picurl;
            return link;
        }
    }

    var myshare = new _share();
    var title = obj.t;
    title = title.Length > 30 ? title.Substring(0, 30) : title;
    var url = obj.url;
    var photo = obj.p;

    switch (type) {
        case "sina": share(myshare.shareToSina(encodeURIComponent(title), encodeURIComponent(url), photo), location.pathname); break;
        case "qqzone": share(myshare.shareToQQZone(encodeURIComponent(title), encodeURIComponent(url), photo), location.pathname); break;
        case "tx": share(myshare.shareToTxWeibo(encodeURIComponent(title), encodeURIComponent(url), photo), location.pathname); break;
    }
}

//检查用户是否登录
function checkLogin() {
    var cookie = utility.getCookie("_mallcoo_context");
    var obj = utility.queryStringToObj(cookie);
    if (obj.m != undefined && obj.m != "" && obj.t2 != undefined && obj.t2 != "")
        return true;
    return false;
}

//退出登录
function logOut() {
    var _name = "_mallcoo_context";
    var cookie = utility.getCookie(_name);
    var obj = utility.queryStringToObj(cookie);
    obj.m = "";
    obj.t2 = "";
    utility.setCookie(_name, utility.objToQueryString(obj));
}

/**/

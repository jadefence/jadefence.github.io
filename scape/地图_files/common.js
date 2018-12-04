var util = (function () {
    return {

        //是否价格
        isPrice: function (value) {
            var tPrice = /^[0-9]+(.[0-9]{1,2})?$/;
            if (value != undefined && tPrice.test(value)) {
                return true;
            }
            else return false;
        },

        //是否为数字
        isNum: function (value) {

            var tNum = /^[0-9]*$/;
            if (value != undefined && value != "" && tNum.test(value)) {
                return true;
            }
            else return false;
        },

        //是否为手机号
        isMobile: function (value) {

            var tNum = /^1[0-9]\d{9}$/;
            if (value != undefined && value != "" && tNum.test(value)) {
                return true;
            }
            else return false;
        },

        //获取原始图片尺寸
        imgLoad: function (url, callback) {
            var img = new Image();
            img.src = url;

            if (img.complete) {
                callback(img.width, img.height);
            } else {
                img.onload = function () {
                    callback(img.width, img.height);
                    img.onload = null;
                }
            }
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

        //数字格式化，四舍五入
        //@s:数字
        //@n:位数
        numFormat: function (s, n) {

            n = n >= 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            return s;
        },

        //数字格式化，舍去
        //@s:数字
        //@n:位数
        numFormatWithRounding: function (s, n) {
            s = this.numFormat(s, n + 1);
            if (s.length > 1) {
                s = s.substr(0, s.length - 1);
            }
            return s;
        },

        //千分位数字
        milliFormat: function (number) {

            if (number == null || number === "") return "";
            var num = number + "";
            if (num === "0") return num;
            num = num.replace(new RegExp(",", "g"), "");
            // 正负号处理   
            var symble = "";
            if (/^([-+]).*$/.test(num)) {
                symble = num.replace(/^([-+]).*$/, "$1");
                num = num.replace(/^([-+])(.*)$/, "$2");
            }

            if (/^[0-9]+(\.[0-9]+)?$/.test(num)) {
                var num = num.replace(new RegExp("^[0]+", "g"), "");
                if (/^\./.test(num)) {
                    num = "0" + num;
                }

                var decimal = num.replace(/^[0-9]+(\.[0-9]+)?$/, "$1");
                var integer = num.replace(/^([0-9]+)(\.[0-9]+)?$/, "$1");

                var re = /(\d+)(\d{3})/;

                while (re.test(integer)) {
                    integer = integer.replace(re, "$1,$2");
                }
                return symble + integer + decimal;

            } else {
                return number;
            }
        },

        jsonDateFormat:function(jsonDate)
        {
            return new Date(parseInt(jsonDate.replace("/Date(", "").replace(")/", ""), 10));
        },

        dateFormat: function (date, format) {
            var o = {
                "y+": date.getYear() + 1, //year
                "M+": date.getMonth() + 1, //month
                "d+": date.getDate(),    //day
                "H+": date.getHours(),   //hour
                "m+": date.getMinutes(), //minute
                "s+": date.getSeconds(), //second
                "q+": Math.floor((date.getMonth() + 3) / 3),  //quarter
                "S": date.getMilliseconds() //millisecond
            }
            // 星期格式化
            var week = {
                "0": "日",
                "1": "一",
                "2": "二",
                "3": "三",
                "4": "四",
                "5": "五",
                "6": "六"
            };

            if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            if (/(E+)/.test(format))
            {
                format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "/u5468") : "") + week[date.getDay() + ""]);
            }
            
            for (var k in o) if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
						("00" + o[k]).substr(("" + o[k]).length));
            return format;
        },

        splitString: function (val, separator) {
            if (util.isNullOrEmpty(val))
                return "";
            separator = separator || " ";
            var len = val.length;
            var res = "";
            for (var i = 0; i < len; i++) {
                if (i > 0 && i % 4 === 0) {
                    res += separator;
                }
                res += val[i];
            }
            return res;

        },
        //a=1&b=2 => {a:1,b:2}
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
        // 获取url中的参数 a.aspx?id=123 => 123
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return decodeURIComponent(r[2]);
            }
            return null;
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
            var cookieStr = name + "=" + escape(value) + ";path=" + path + (this.isNullOrEmpty(domain) ? "" : ";domain=" + domain);
            if (!util.isNullOrEmpty(exp)) {
                cookieStr += ";expires=" + expDate.toGMTString();
            }
            document.cookie = cookieStr;
        },

        //读取cookies
        getCookie: function (name) {

            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return (unescape(arr[2]));
            else
                return null;
        },

        //删除cookies
        delCookie: function (name, path, domain) {

            domain = domain || "";
            path = path || "/";

            var exp = new Date();
            exp.setTime(exp.getTime() - 10000);
            var cval = this.getCookie(name);
            if (cval != null) {
                var cookieStr = name + "=;path=" + path + (this.isNullOrEmpty(domain) ? "" : ";domain=" + domain) + ";expires=" + exp.toGMTString();
                document.cookie = cookieStr;//name + "=" + cval + ";expires=" + exp.toGMTString();
            }
        },

        //获取本地存储的值
        getLocalData: function (key) {

            var val = "";
            if (window.localStorage) {
                val = window.localStorage.getItem(key);
            }
            else {
                val = this.getCookie(key);
            }
            if (this.isNullOrEmpty(val) || val == "undefined") return "";
            return val;
        },

        //设置本地存储的值
        setLocalData: function (key, val) {

            this.removeLocalData(key);
            if (window.localStorage) {
                window.localStorage.setItem(key, val);
            }
            else {
                this.setCookie(key, val);
            }
        },

        //删除本地存储
        removeLocalData: function (key) {

            if (window.localStorage) {
                window.localStorage.removeItem(key);
            }
            else {
                this.delCookie(key);
            }
        },

        //四舍五入
        round: function (v, e) {
            var t = 1;
            for (; e > 0; t *= 10, e--);
            for (; e < 0; t /= 10, e++);
            return Math.round(v * t) / t;
        },

        //计算字符串长度
        charLen: function (str) {

            var len = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255 || str.charCodeAt(i) < 0) len += 2; else len++;
            }
            return len;
        },

        //截取汉子字符串（从start字节到end字节）		
        subCHString: function (str, start, end) {
            var len = 0;
            var str2 = "";
            str.strToChars();
            for (var i = 0; i < str.length; i++) {
                if (str.charsArray[i][1])
                    len += 2;
                else
                    len++;
                if (end < len)
                    return str2;
                else if (start < len)
                    str2 += str.charsArray[i][0]; shi
            }
            return str2;
        },

        //解析url参数
        decodeUrlParams: function (val) {
            var i = val.indexOf("?");
            val = val.substr(i + 1);
            val = val.split("&");
            var _temp;

            var data = {};
            for (var i in val) {
                if (!val.hasOwnProperty(i)) { continue; }
                _temp = val[i].split("=");
                if (_temp.length == 2) {
                    data[_temp[0]] = _temp[1];
                }
            }

            return data;
        },

        //在url里添加参数
        addUrlParams: function (originUrl, data) {
            var i = originUrl.indexOf("?");
            var url = i > -1 ? originUrl.substr(0, i) : originUrl;
            var _data = this.decodeUrlParams(originUrl);
            for (var i in data) {
                _data[i] = data[i];
            }

            url += "?";
            var j = 0;
            for (var i in _data) {
                if (!_data.hasOwnProperty(i) || this.isNullOrEmpty(_data[i])) { continue; }
                if (j > 0) {
                    url += "&" + i + "=" + _data[i];
                }
                else {
                    j++;
                    url += i + "=" + _data[i];
                }
            }

            return url;
        },

        //格式化图片Url
        //isPNG 是否只能是png格式的图片，true是，false否
        formatImgUrl: function (value, width, height, type, isPNG, quality) {
            type = type || 0; 
            quality = quality || 80;
            if (value == undefined || value == '') {
                return "https://i1.mallcoo.cn/mc/35cab87c-dd16-4cca-8890-1d3f12ccd7f8_" + width + "x" + height + "_" + type + "_0_" + quality + ".jpg";
            }

            var _imgUrl = "";
            var arr = value.toString().split("/");
            var folders = arr[arr.length - 1].split(".");
            var _folder = folders[folders.length - 1];
            folders.pop();
            arr[arr.length - 1] = folders.join("");

            for (var i = arr.length - 1; i >= 0; i--) {
                if (i >= arr.length - 4) {
                    _imgUrl = arr[i] + _imgUrl;
                }
                else {
                    _imgUrl = arr[i] + "/" + _imgUrl;
                }
            }

            _imgUrl = _imgUrl + "_" + width + "x" + height + "_" + type + "_0_" + quality + "." + _folder;
            if (isPNG) {
                _imgUrl = _imgUrl.replace('.png', '.jpg');
            }
            return _imgUrl;

        },

        formatImgUrlV2: function (value, width, height, type, quality) {
            type = type || 0;
            quality = quality || 80;
            if (value == undefined || value == '') {
                return "https://i1.mallcoo.cn/mc/35cab87c-dd16-4cca-8890-1d3f12ccd7f8_" + width + "x" + height + "_" + type + "_0_" + quality + ".jpg";
            }

            var _imgUrl = "";
            var arr = value.toString().split("/");
            var folders = arr[arr.length - 1].split(".");
            var _folder1 = folders[folders.length - 2];
            var _folder2 = folders[folders.length - 1];

            _imgUrl = "https://i1.mallcoo.cn/mc/" + _folder1 + "_" + width + "x" + height + "_" + type + "_0_" + quality + "." + _folder2;
            return _imgUrl;

        },

        //求笛卡尔积
        descartes: function (list) {

            //parent上一级索引;count指针计数
            var point = {};

            var result = [];
            var pIndex = null;
            var tempCount = 0;
            var temp = [];

            //根据参数列生成指针对象
            for (var index in list) {
                if (typeof list[index] == 'object') {
                    point[index] = { 'parent': pIndex, 'count': 0 }
                    pIndex = index;
                }
            }

            //单维度数据结构直接返回
            if (pIndex == null) {
                return list;
            }

            //动态生成笛卡尔积
            while (true) {
                for (var index in list) {
                    tempCount = point[index]['count'];
                    temp.push(list[index][tempCount]);
                }

                //压入结果数组
                result.push(temp);
                temp = [];

                //检查指针最大值问题
                while (true) {
                    if (point[index]['count'] + 1 >= list[index].length) {
                        point[index]['count'] = 0;
                        pIndex = point[index]['parent'];
                        if (pIndex == null) {
                            return result;
                        }

                        //赋值parent进行再次检查
                        index = pIndex;
                    }
                    else {
                        point[index]['count']++;
                        break;
                    }
                }
            }
        },

        tapEventName: (function () {

            var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
            var ontouchstartSupported = 'ontouchstart' in window && !isTouchPad;
            if (ontouchstartSupported) {
                return "tap";
            }
            else {
                return "click";
            }
        })()
    }

})();

//#region (GUID)。

function Guid(g) {

    var arr = new Array(); //存放32位数值的数组



    if (typeof (g) == "string") { //如果构造函数的参数为字符串

        initByString(arr, g);

    }

    else {

        initByOther(arr);

    }

    //返回一个值，该值指示 Guid 的两个实例是否表示同一个值。

    this.equals = function (o) {

        if (o && o.isGuid) {

            return this.toString() == o.toString();

        }

        else {

            return false;

        }

    }

    //Guid对象的标记

    this.isGuid = function () { }

    //返回 Guid 类的此实例值的 String 表示形式。

    this.toString = function (format) {

        if (typeof (format) == "string") {

            if (format == "N" || format == "D" || format == "B" || format == "P") {

                return toStringWithFormat(arr, format);

            }

            else {

                return toStringWithFormat(arr, "D");

            }

        }

        else {

            return toStringWithFormat(arr, "D");

        }

    }

    //由字符串加载

    function initByString(arr, g) {

        g = g.replace(/\{|\(|\)|\}|-/g, "");

        g = g.toLowerCase();

        if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {

            initByOther(arr);

        }

        else {

            for (var i = 0; i < g.length; i++) {

                arr.push(g[i]);

            }

        }

    }

    //由其他类型加载

    function initByOther(arr) {

        var i = 32;

        while (i--) {

            arr.push("0");

        }

    }

    /*

    根据所提供的格式说明符，返回此 Guid 实例值的 String 表示形式。

    N  32 位： xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    D  由连字符分隔的 32 位数字 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

    B  括在大括号中、由连字符分隔的 32 位数字：{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}

    P  括在圆括号中、由连字符分隔的 32 位数字：(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

    */

    function toStringWithFormat(arr, format) {

        switch (format) {

            case "N":

                return arr.toString().replace(/,/g, "");

            case "D":

                var str = arr.slice(0, 8) + "-" + arr.slice(8, 12) + "-" + arr.slice(12, 16) + "-" + arr.slice(16, 20) + "-" + arr.slice(20, 32);

                str = str.replace(/,/g, "");

                return str;

            case "B":

                var str = toStringWithFormat(arr, "D");

                str = "{" + str + "}";

                return str;

            case "P":

                var str = toStringWithFormat(arr, "D");

                str = "(" + str + ")";

                return str;

            default:

                return new Guid();

        }

    }

}

//Guid 类的默认实例，其值保证均为零。
Guid.empty = new Guid();

//初始化 Guid 类的一个新实例。
Guid.newGuid = function () {

    var g = "";

    var i = 32;

    while (i--) {

        g += Math.floor(Math.random() * 16.0).toString(16);

    }

    return new Guid(g);

}

//#endregion

///* 得到日期年月日等加数字后的日期 */
//Date.prototype.dateAdd = function (interval, number) {
//    var d = this;
//    var k = { 'y': 'FullYear', 'q': 'Month', 'm': 'Month', 'w': 'Date', 'd': 'Date', 'h': 'Hours', 'n': 'Minutes', 's': 'Seconds', 'ms': 'MilliSeconds' };
//    var n = { 'q': 3, 'w': 7 };
//    eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
//    return d;
//}

///* 计算两日期相差的日期年月日等 */
//Date.prototype.dateDiff = function (interval, objDate2) {
//    var d = this, i = {}, t = d.getTime(), t2 = objDate2.getTime();
//    i['y'] = objDate2.getFullYear() - d.getFullYear();
//    i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
//    i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
//    i['ms'] = objDate2.getTime() - d.getTime();
//    i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
//    i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
//    i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
//    i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
//    i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
//    return i[interval];
//}

///* 获取字符串字节数长度 */
//String.prototype.getBytesLength = function () {
//    var str = this;
//    var l = 0;
//    for (var ii = 0; ii < str.length; ii++) {
//        var word = str.substring(ii, 1);
//        if (/[^\x00-\xff]/g.test(word)) {
//            l += 2;
//        } else {
//            l++;
//        }
//    }
//    return l;
//}
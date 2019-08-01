
shopName.getShopList();
mapfn.createFloor();
 
var geolocation;


//搜索店铺
function sarchShop(txt) {
    if (txt == "") return;
    var str = "";
    for (var i = 0; i < AppData.shopList.length; i++) {
        var shop = AppData.shopList[i];
        if (shop.name.indexOf(txt) > -1 && shop.name != " ") {
            str += '<li data-id="' + shop.id + '" data-name="' + shop.name + '" data-fid="3" data-x="0" data-y="0"><i class="icon_sp1 date-icon"></i><span><em>' + shop.name + '</em>中餐  L' + shop.df + '</span></li>';
        }
    }
    return str;
} 


// 点击商铺搜索结果
$('.sear_sugg_list').unbind().bind('click', function (e) {
    var tar = e.target,
        $tar = $(tar),
        $li = $tar.closest('li'),
        nodeName = tar.nodeName.toLowerCase();

    if ($li.length || nodeName == 'li') {
        var d = $li.data(), name = unescape(d.name), id = unescape(d.id);
        change_sear_pg(0);
        clearSearIpt();

        var data = null;
        for (var i = 0; i < AppData.shopList.length; i++) {
            var shop = AppData.shopList[i];
            if (shop.id == id) {
                AppData.cur.shop = data = shop;
            }
        }
        
        mapShow.shop_base([data], 3);
        gis.switchMap(data.df);
        $("#changeFloor").html("L" + data.df)
        gis.addShopMark();

        $("#searchList").hide();
    }
})
// 切换选点页
var change_sear_pg = function (idx) {
    return;
    $('#sear_nav_0').hide();
    $('#sear_nav_1').hide();
    $('#sear_nav_'+ idx).show();
    if(idx==0){
        this.clearSearIpt();
        this.update();
    }else{
        var s_p = this.s_param;
        var href = '#p=map_p1&mode=point&fid='+ (map.opts && map.fid || 0) +'&target='+ this.type;
        $('#lk_mapPick').data({'href':href,'replace-href':'#p=map_p2&' + s_p});
    }
}

var clearSearIpt = function(){
    var $box = $('#sear_list');
    $box.find('ul').html('');
    $box.hide();
    $('#searIptTxt').val('');
    $("#publicList").hide();
}
 
// 获取信息
var getShopInfo= function(sid,callback){
    var ajax = $.ajax({
        url: '/shop/DetailData',
        data: { shopId: sid },
        success: function (res) {
            if (!res.success) {
                //_this.closeShopPos();
                return false;
            }
            var info = res.entity;
            callback(info);
        }
    })
}

function closeDeatil() {
    $("#shopDetail").html("");
    $("#shopDetail").hide();
}
 
var app = {
    token:'',
    getShopById:function(id) {
        for (var i = 0; i < AppData.shopList.length; i++) {
            var shop = AppData.shopList[i];
            if (shop.id == id) {
                if(!shop.dx){
                    shop.dx = shop.lon;
                    shop.dy = shop.lat;
                }
                return shop;
            }
        }
    },
    init:function(){
        document.title = AppConfig.appTitle; 
        $("#searIptTxt").attr("placeholder",AppConfig.text.search);
        var strli="";
        for (let i = 0; i < AppConfig.searchList.length; i++) {
            var s = AppConfig.searchList[i];
            strli += "<li data-type='"+s.type+"'><div><img src='assets/images/icon/"+s.icon+".png'></img></div>"
            strli += "<div>"+s.name+"</div></li>";
        }
        $("#publicList ul").append(strli); 
        this.bindEvent(); 
        this.getBttsToken();
    },
    //事件绑定
    bindEvent:function(){
        //输入框焦点
        $(".ipt_sear_default").bind("focus", function () {
            $(".mapInfor").hide();
            $("#publicList").show();
        })
        //输入框变化
        $(".ipt_sear_default").bind("input propertychange", function (e) {
            var txt = $(".ipt_sear_default").val();
            var str = sarchShop(txt);
            $("#sear_list ul").html(str);
            $("#searchList").show();
        })
        //返回键点击
        $(".icon-back").bind("click", function () {
            $("#searchList").hide();
            $("#publicList").hide();
            gis.clearMap();
            $(".mapslidewrap").hide();
        })
        //设施点击
        $(".s_search li").bind("click", function (e) {  
            var txt = e.currentTarget.innerText;
            var type = e.currentTarget.dataset.type;
            $("#searIptTxt").val(txt);
            mapShow.hd(type);
            $("#searchList").hide();
            $("#publicList").hide();
            
        })
        //楼层点击
        $("#changeFloor").bind("click", function () {
            //if ($('#pg_findcar').length) { return }
            $('#floorPanel').mobiscroll('show').mobiscroll('setVal', AppData.cur.floor);
        }) 
        //退出导航
        $("#quitNav").bind("click", function () {
            gis.clearMap();
            $("#panel_nav_tab").hide();
        })
        //工具点击
        $(".mapTool li").bind("click", function (e) { 
            var type = e.currentTarget.dataset.target;
            switch (type) {
                case 'locate':
                    lmap.FlyTo("locate_layer", "", null, null, 18, false);
                    break;
            
                default:
                    break;
            }
        })
    },
    location(){
        if (navigator.geolocation){ 
            navigator.geolocation.getCurrentPosition(showPosition); 
            navigator.geolocation.watchPosition(showPosition);
          }else{ 
            alert("浏览器不支持地理定位。"); 
        } 
        function showPosition(position){ 
            var lat = position.coords.latitude; //纬度 
            var lag = position.coords.longitude; //经度 
            //alert('纬度:'+lat+',经度:'+lag+',方向：'+position.coords.heading); 
            gis.showPosition({
                x:lag,
                y:lat
            })
        }
        function showError(error){ 
            switch(error.code) { 
              case error.PERMISSION_DENIED: 
                alert("定位失败,用户拒绝请求地理定位"); 
                break; 
              case error.POSITION_UNAVAILABLE: 
                alert("定位失败,位置信息是不可用"); 
                break; 
              case error.TIMEOUT: 
                alert("定位失败,请求获取用户位置超时"); 
                break; 
              case error.UNKNOWN_ERROR: 
                alert("定位失败,定位系统失效"); 
                break; 
            } 
        } 
        
        // gis.showPosition({
        //     x:114.431077,
        //     y:36.78345
        // })
    },
    locateQQ(){
        geolocation = new qq.maps.Geolocation("OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77", "myapp");
        geolocation.watchPosition(showPosition,showError);

        // setInterval(() => {
        //     geolocation.watchPosition(showPosition,showError);
        // }, 3000);

        function showPosition(position){ 
            var cs = gcj02towgs84(position.lng,position.lat);
            var lng = cs[0]; //经度 
            var lat = cs[1]; //纬度 
            $("#apptip").html("x:"+lng+",y:"+lat);
            gis.showPosition({
                x:lng,
                y:lat
            })
        }
        function showError(error){ 
            switch(error.code) { 
              case error.PERMISSION_DENIED: 
                alert("定位失败,用户拒绝请求地理定位"); 
                break; 
              case error.POSITION_UNAVAILABLE: 
                alert("定位失败,位置信息是不可用"); 
                break; 
              case error.TIMEOUT: 
                alert("定位失败,请求获取用户位置超时"); 
                break; 
              case error.UNKNOWN_ERROR: 
                alert("定位失败,定位系统失效"); 
                break; 
            } 
        } 
    },
    //获取语音token
    getBttsToken(){
        $.get('http://pay.xixiawangluo.com/pay/getVoiceToken', { t: 'p' }, function (result) {
            var data = result.data;
            app.token = data.access_token;
        });
    },
    //语音转换
    getVoice(txt){
        btts({
            tex: txt,
            tok: app.token,
            spd: 5,
            pit: 5,
            vol: 15,
            per: 4
        }, {
            volume: 0.3,
            autoDestory: true,
            timeout: 10000,
            hidden: false,
            onInit: function (htmlAudioElement) {

            },
            onSuccess: function(htmlAudioElement) { 
                var audio = htmlAudioElement;
                var myVideo = document.getElementById("video1");
                myVideo.src = audio.src;
            },
            onError: function(errorText) {
            },
            onTimeout: function () {
            }
        });
    }
}
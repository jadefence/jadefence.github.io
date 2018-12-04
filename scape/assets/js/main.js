
shopName.getShopList();
mapfn.createFloor();
 
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
    getShopById:function(id) {
        for (var i = 0; i < AppData.shopList.length; i++) {
            var shop = AppData.shopList[i];
            if (shop.id == id) {
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
            strli += "<li><i style='background: url(images/icon/"+s.icon+".png) no-repeat;'></i>"+s.name+"</li>";
        }
        $("#publicList ul").append(strli);
    }
}
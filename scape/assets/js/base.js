// 应用
var mapfn = {
    defaults: {
        mode: null
    },
    orinFloorData: AppData.floorData || [],
    // 单击地图
    act: function (e) {
        var mode = map.opts.mode;
        switch (mode) {
            case 'shop':
                this.modeShop(e);
                break;
            case 'point':
                this.modePoint(e);
                break;
            case 'park':
                this.modePark(e);
                break;
        }
    },
    // 店铺模式
    modeShop: function (e) {
        var tar = e.target,
            nodeName = tar.nodeName.toLowerCase(),
            parEle = tar.parentNode,
            cls = parEle.getAttribute('class'),
            hd_name,
            g,
            result,
            id;

        // 店铺名称文本
        if ($(tar).closest('#g_txt').length) {
            var type = $(tar).data('type'),
                maid = $(tar).attr('id').replace('m_', '');
            if (type == 'm') {
                mapShow.shop_alone_pos(maid);
            }
            if (type == 'p') {
                mapShow.park_alone_pos(maid);
            }
            return false;
        }
        if (nodeName == 'image') {
            id = tar.getAttribute('id');
            hd_name = tar.getAttribute('alt');
            mapShow.hd_alone_pos(id, hd_name);
            return false;
        }
        // 商铺g区域
        if ((g = $(tar).closest('._area_merchant')).length) {
            id = g.attr('id');
            mapShow.shop_alone_pos(id);
            return false;
        }
        // 停车场g区域
        if ((g = $(tar).closest('._area_parking')).length) {
            id = g.attr('id');
            mapShow.park_alone_pos(id);
            return false;
        }
        // 设施g区域
        if (cls && (result = hd.isFacility(cls)) != null) {
            g = $(tar).closest('._area_' + result);
            id = g.attr('id');
            mapShow.hd_alone_pos(id, result[0]);
            return false;
        }

        // 商铺信息禁止操作
        if ($(tar).closest('.shop_info_inner').length) {
            return false;
        }

        mapShow.closeAlonePos();
    },
    modePoint: function (e) {
        var tar = e.target,
            nodeName = tar.nodeName.toLowerCase(),
            parEle = tar.parentNode,
            parNodeName = parEle.nodeName.toLowerCase(),
            cls = parEle.getAttribute('class'),
            hd_name,
            g,
            result,
            id;
        var p = map.opts.target;
        if ($(tar).closest('#g_txt').length) {
            id = tar.getAttribute('id').replace('m_', '');
            // 未落位
            shopName.changeShopId(id) && mapPick.setSePos(id, p, 'shop');
            return false;
        }
        if (nodeName == 'image') {
            id = 'icon' + tar.getAttribute('id');
            result = tar.getAttribute('alt');
            mapPick.setSePos(id, p, result);
            return false;
        }

        /*
         * <g><rect></g>
         * 父层(商铺区域,设备区域)
         */
        // 商铺|停车g区域
        if (cls && cls.match(/merchant|parking/) != null) {
            id = parEle.id;
            // 未落位
            shopName.changeShopId(id) && mapPick.setSePos(id, p, 'shop');
            return false;
        }
        // 设施g区域
        if (cls && (result = hd.isFacility(cls)) != null) {
            g = $(tar).closest('._area_' + result);
            id = g.attr('id');
            mapPick.setSePos(id, p, result);
            return false
        }
    },
    modePark: function (e) {
        if (Park.parkfn != 'markcar') {
            return
        }
        var tar = e.target,
            nodeName = tar.nodeName.toLowerCase(),
            parEle = tar.parentNode,
            parNodeName = parEle.nodeName.toLowerCase(),
            cls = parEle.getAttribute('class'),
            id,
            type;

        $('#g_markcar').remove();
        $("#" + Park.id_markPark).removeClass('g_mark');
        $('#park_info_tip').show();
        $('#park_info_mycar').hide();
        // 店铺名称文本
        if ($(tar).closest('#g_txt').length) {
            type = $(tar).data('type');
            id = tar.getAttribute('id').replace('m_', '');
            if (type == 'p') {
                Park.markPark(id);
            }
            return false;
        }
        // 商铺g区域
        if (cls && cls.indexOf('parking') > -1) {
            id = parEle.id;
            Park.markPark(id);
            return false;
        }
    },
    svgCache: function (fid, res) {
        map.building = map.building || {};
        map.building[fid] = res;
    },
    infoCache: function (fid, res) {
        map.buildinginfo = map.buildinginfo || {};
        map.buildinginfo[fid] = res;
    },
    // 创建楼层
    createFloor: function (fid) {
        var _this = this,
            data = this.orinFloorData,
            str = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i], id = d.ID;
            var tag = d.tag != '' ? ' (' + d.tag + ')' : '';
            if (fid == id) {
                str += '<option value=' + id + ' selected>' + d.name + tag + '</option>';
            } else {
                str += '<option value=' + id + '>' + d.name + tag + '</option>';
            }
        }
        $('#floorPanel').html(str);
        $('#floorPanel').mobiscroll().select({
            theme: 'mobiscroll',
            lang: 'zh',
            display: 'bottom',
            showInput: false,
            onSelect: function (v, obj) {
                debugger;
                //F-切换楼层
                var f = obj._tempValue;
                if (f != AppData.cur.floor) {
                    gis.switchMap(f);
                    AppData.cur.floor = f;
                    $("#changeFloor").html("L" + f);
                    return;
                    mapShow.closeAlonePos();
                    _this.fnChangeFloor(parseInt(obj._tempValue));
                }
            }
        });
    },
    // 切换楼层
    fnChangeFloor: function (fid, flag) {
        if (fid == undefined) { return }
        var fdata = map.opts.floorData,
            name = fdata[fid].name;
        $('#changeFloor').html(name);
        if (flag == undefined) {
            BtNav.triggerNav(0, 'hideFollow');
        }
        map.fid = fid;
        getSvg(fid);
    },
    //格式化楼层数据{id:{}}
    formatFloor: function () {
        var data = this.orinFloorData, temp = {};
        for (var i = 0; i < data.length; i++) {
            //{"ID":-3,"name":"B3","fid":0,"f":"1F","tag":"地下停车场","IsHavePark":true,"IsHaveShop":true}
            temp[data[i].ID] = data[i];
        }
        return temp;
    },
    /*  比例尺
     *  原始地图1px = 1m
     *  32px及32m的原始地图,为了全屏会放大10倍至320px,真实米数为320/10=32m
     *  px / scale = m
     */
    scaleRule: function () {
        var grade = [200, 100, 75, 50, 40, 30, 20, 10, 5, 1, 0.5],
            s = map.last_scale,
            d = 36 / s, //表示36px对应地图真实长度(m)
            num = 0;
        // 比对合适级别
        for (var i = 0, n = grade.length; i < n; i++) {
            if (d > grade[0]) {
                num = grade[0]
                break;
            }
            if (d < grade[i] && d > grade[i + 1]) {
                num = grade[i]
                break;
            }
            if (d < grade[n - 1]) {
                num = grade[n - 1];
                break;
            }
        }
        // 级别长度(m) * scale = 比例尺长度(px)
        $('.map_scaleCtrl').width(num * s);
        $('.map_scaleCtrl .text').text(num + '米');
    },
    // area
    scaleAreaRadius: function () {

    },
    dialog: function (str, json) {
        return new $.Zebra_Dialog(str, json);
    },
    destroy: function () {
        map.opts && (map.opts.mode = null);
    },
    addPath: function (arr, id, color, r) {
        var fragment = document.createDocumentFragment();//创建文档片段
        var pack = map.createSvgDom('g'), scale = map.scale;
        for (var i = 0, n = arr.length; i < n; i++) {
            var item = arr[i];
            var ele = this.drawCircle(item[0], item[1], 'path_' + i, '#FFC7C7', 0.2);
            fragment.appendChild(ele);
        }
        pack.appendChild(fragment);
        pack.setAttribute('id', 'g_path');
        map.vp[0].appendChild(pack);
    },
    getPath: function (mid) {
        var _this = this;
        this.pathPoints = [];
        $.ajax({
            url: '//gis.api.mallcoo.cn/backup/lydw/absorbPath/' + mid + '_absorbPath.json',
            success: function (res) {
                var d = eval('(' + res + ')');
                _this.pathPoints = d.pathPoints;
            }
        })
    },

    // 插入设备
    addAP: function (arr) {
        var fragment = document.createDocumentFragment();//创建文档片段
        var pack = map.createSvgDom('g'), scale = map.scale;
        for (var i = 0, n = arr.length; i < n; i++) {
            var item = arr[i];
            var ele = this.drawCircle(item.x, item.y, 'hd_' + item.apMac_1, '#41B4FF', 10 / scale);
            var txt = this.drawTxt(item.x, item.y - 0.5, item.minor)
            fragment.appendChild(ele);
            fragment.appendChild(txt);
        }
        pack.appendChild(fragment);
        pack.setAttribute('id', 'g_ap');
        map.vp[0].appendChild(pack);
    },
    // 路径
    drawCircle: function (cx, cy, id, color, r) {
        var ele = map.createSvgDom('circle');
        ele.setAttribute('stroke-width', .1);
        ele.setAttribute("fill", color);
        ele.setAttribute('cx', cx);
        ele.setAttribute('cy', cy);
        ele.setAttribute('r', r);
        ele.setAttribute('id', id);
        return ele;
    },
    drawTxt: function (x, y, v) {
        var ele = map.createSvgDom('text');
        ele.setAttribute('x', x);
        ele.setAttribute('y', y);
        ele.setAttribute('font-size', this.opts.fontsize / map.scale)
        ele.setAttribute('text-anchor', 'middle')
        ele.textContent = v
        return ele
    },
    // 主入口
    posEntrance: function (maid) {
        var x = shopName.getAreaInfo('mapAreaId', maid, 'dx');
        var y = shopName.getAreaInfo('mapAreaId', maid, 'dy');
        if (x == 0 || x == undefined) {
            var ref = map.getAreaCenter($('#' + maid));
            x = ref.x;
            y = ref.y;
        }
        return { x: x, y: y }
    }
}


var mapShow = {
    id: 0,
    markArr: {},
    markAlone: {},
    init: function () {
        var _this = this,
            type = parseInt(map.opts.searchType),
            fid = map.fid,
            val = map.opts.searchVal;
        this.destroy();
        if (!isNaN(type)) {
            switch (type) {
                case 0: // 公共设施
                    this.hd();
                    break;
                case 1: // 惠
                    promotion.getPromotionList(fid, function (d) {
                        _this.shop_base(d, 1);
                    })
                    break;
                case 2: // 关键字 暂未开发
                    //this.shop_base(result,2);
                    break;
                case 3: // 单个店铺sid
                    var sid = val;
                    if (!sid) {
                        location.href = "/Shop/map_p0?_mid=" + _mid;
                    }

                    this.getShopInfo(sid, function (d) {
                        _this.shop_base([d], 3);
                    })
                    break;
            }
        }

        // 点击标注
        $('#searMark').bind('click', function (e) {
            var tar = e.target,
                $tar = $(tar),
                $ele = $tar.closest('.map_marker'),
                id = $ele.data('id');
            if ($ele.length) {
                if ($ele.is('#abc')) {
                    return false;
                } else {
                    if ($(this).hasClass('cur')) { return }
                    var idx = $ele.data('idx');
                    _this.mark_focus(id);
                    _this.mySwiper.slideTo(idx, 1000, false);
                    _this.closeAlonePos();
                    $('#mapsear_1').show();
                }
            }
        })

        // 店铺搜索模式清除
        $('#searchDel').bind('click', function () {
            $('.mapInfor').hide();
            $('#searMark').empty();
            $('.ipt_sear').addClass('ipt_sear_default').html('搜店名、查设施、找优惠');
            $('#searchDel').hide();
        })
    },
    // 临时商铺标注
    shop_alone_pos: function (maid) {
        var _this = this,
            sid = shopName.changeShopId(maid),
            str_div = '';
        // 没有数据, !sid表示未落位
        if (!$('#' + maid).length || !sid) { return false }
        // 判断是否已是搜索标注区域
        if (maid in this.markArr) {
            $('#' + this.markArr[maid].id).click();
            return false;
        }
        this.getShopInfo(sid, function (d) {
            $.extend(d, { maid: maid, idx: null });
            str_div = _this.createShopPanel(d, 3);
            _this.alone_pos(maid, str_div);
        })
    },
    // 临时公共设施标注
    hd_alone_pos: function (maid, v) {
        var _this = this,
            str_div = '',
            name = hd.cont_hd[v];
        // 判断是否已是搜索标注区域
        if (maid in this.markArr) {
            $('#' + this.markArr[maid].id).click();
            return false;
        }
        str_div = this.createHdPanel(maid, 'abc', v, '', name);
        this.alone_pos(maid, str_div);
    },
    // 停车场
    park_alone_pos: function (maid) {
        var _this = this,
            sid = shopName.changeShopId(maid),
            str_div = '';
        // 没有数据, !sid表示未落位
        if (!$('#' + maid).length || !sid) { return false };
        // 判断是否已是搜索标注区域
        if (maid in this.markArr) {
            $('#' + this.markArr[maid].id).click();
            return false;
        }
        str_div = this.createParkPanel(maid);
        this.alone_pos(maid, str_div);
    },
    // 临时标注方法
    alone_pos: function (maid, str_div) {
        var cxy = map.getAreaCenter($('#' + maid)),
            _pos = map.id_calcPos(maid);
        //当前id等于maid时,就保持现状
        if ($('#abc').length) {
            var id = $('#abc').data('id');
            if (id == maid) { return false };
            $('#abc').remove();
        }
        var str_icon = '<div id="abc" data-id="' + maid + '" class="map_marker map_marker_dfl" style="top:' + (_pos.y - 29) + 'px;left:' + (_pos.x - 11) + 'px;"></div>';
        $('#searMark').append(str_icon);

        $('#mapsear_1').hide();
        $('#mapsear_2').html(str_div);
        $('#mapsear_2').show();
        this.markAlone = { id: 'abc', x: cxy.x, y: cxy.y };
    },
    closeAlonePos: function () {
        $('#abc').remove();
        $('#mapsear_1').hide();
        $('#mapsear_2 .inner').html('');
        $('#mapsear_2').hide();
        this.markAlone = null;
    },
    // 获取信息
    getShopInfo: function (sid, callback) {
        var ajax = $.ajax({
            url: '/shop/DetailData',
            data: { shopId: sid },
            success: function (res) {
                if (!res.success) {
                    //_this.closeShopPos();
                    return false;
                }
                var info = res.entity;
                callback(info)
            }
        })
    },
    // 清除搜索标注及面板
    destroy: function () {
        // 移除搜索mark
        this.markArr = {};
        //this.mySwiper && this.mySwiper.destroy();
    },
    // 搜索标注自增id
    getId: function () {
        this.id = this.id + 1;
        return 'sear_mark_num' + this.id;
    },
    // 生成搜索结果面板
    createShopPanel: function (d, type) {
        var card = '', fid, fn, name, link, pn, dn, pn, src;
        var ref = { x: 100, y: 20 };
        //var ref = mapfn.posEntrance(d.maid),
        // 优惠商铺面板
        if (type == 1) {
            card += '<span class="shoptype shoptype2">惠</span>';
            fid = map.id;
            fn = d.fn;
            name = d.sn;
            sid = d.sid;
            src = d.sl;
            dn = d.dn;
            pn = d.pn;
            var arr = src.split('mc/');
            arr[1] = arr[1].replace(/\//g, '').replace('.', '_200x200_1_0_0.');
            src = arr.join('mc/');
        } else {
            if (d.IsAddedVIPCard) {//是否已设置会员卡
                card += '<i class="icon_sp1 s-icon1"></i>';
            }
            if (d.HaveGroup) {//是否有团购
                card += '<span class="shoptype shoptype1">团</span>';
            }
            if (d.HavePromotion) {//是否有促销(普通 or限时)
                card += '<span class="shoptype shoptype2">惠</span>';
            }
            sid = d.id;
            name = d.name;
            if (d.BrandLogo == undefined) {
                src = "assets/images/images-mixc/free-60-icons-21.png";
            }
            else if (d.BrandLogo == '') {
                src = d.Photo;
                var arr = src.split('mc/');
                arr[1] = arr[1].replace(/\//g, '').replace('.', '_200x200_1_0_0.');
                src = arr.join('mc/');
            } else {
                src = d.BrandLogo;
            }
            pn = d.SubCommercialTypeName;
            //var d1 = d.PositionList.filter(function (item) {
            //    return item.df == 4
            //})[0]
            //fid = d1.FloorID;
            //fn = d1.FloorName;
            //dn = d1.DoorNo;
        }

        var href = '#p=map_p2&ex=' + ref.x + '&ey=' + ref.y + '&efid=' + fid + '&ename=' + escape(name),
            link = '/shop/detail?shopId=' + sid;
        return '<div class="Mitem swiper-slide" data-id="' + d.maid + '">' +
                    '<div class="inner">' +
                        '<a class="inforhd" href="#">' +
                            '<img src="' + src + '" class="shoppic">' +
                            '<div class="con">' +
                                '<div class="tit">' +
                                    '<h4>' + (d.idx ? d.idx + '. ' : '') + name + '</h4>' +
                                    card +
                                '</div>' +
                                //'<p class="addr ellipsis">' + pn + ' ' + fn + ' ' + dn + '</p>' +
                                '<p class="addr ellipsis">' + d.code + '</p>' +
                            '</div>' +
                            '<i class="arrow-r"></i>' +
                        '</a>' +
                        '<div class="inforbd" data-type="a" data-href="' + d.id + '"><i class="s_map icon-dist"></i>到这里</div>' +
                    '</div>' +
                '</div>'
    },
    // 搜索设施面板
    createHdPanel: function (maid, id, v, num, name) {
        //var ref = map.getAreaCenter($('#' + maid));
        //var href = '#p=map_p2&ex=' + ref.x + '&ey=' + ref.y + '&efid=' + map.fid + '&ename=' + escape(name);
        return '<div class="Mitem swiper-slide" data-id="' + maid + '">' +
                        '<div class="inner">' +
                            '<div class="inforhd">' +
                                '<div class="con">' +
                                    '<div class="tit">' +
                                        '<img src="assets/images/icon/icon_' + v + '_h.png" width="20px"> ' +
                                        '<h4>' + (num ? num + '. ' : '') + name + '</h4>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="inforbd" data-type="a" data-href="' + id + '"><i class="s_map icon-dist"></i>到这里</div>' +
                        '</div>' +
                    '</div>';
    },
    // 搜索设施面板
    createParkPanel: function (maid) {
        var ref = mapfn.posEntrance(maid);
        var name = shopName.getShopName(maid);
        var href = '#p=map_p2&ex=' + ref.x + '&ey=' + ref.y + '&efid=' + map.fid + '&ename=' + escape(name);
        return '<div class="Mitem swiper-slide" data-id="' + maid + '">' +
                        '<div class="inner">' +
                            '<div class="inforhd">' +
                                '<div class="con">' +
                                    '<div class="tit">' +
                                        '<img src="' + map.imgDir + '/ic_park_locpark.png" width="20px"> ' +
                                        '<h4>' + name + '</h4>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="inforbd" data-type="a" data-href="' + href + '"><i class="s_map icon-dist"></i>到这里</div>' +
                        '</div>' +
                    '</div>';
    },
    // 景点面板
    createScapePanel: function (d) { 
        var card = '', fid, fn, name, link, pn, dn, pn, src;
        var ref = { x: 100, y: 20 };
        sid = d.id;
        name = d.name;
        if (d.BrandLogo == undefined) {
            src = "assets/images/images-mixc/free-60-icons-21.png";
        }
        else if (d.BrandLogo == '') {
            src = d.Photo;
            var arr = src.split('mc/');
            arr[1] = arr[1].replace(/\//g, '').replace('.', '_200x200_1_0_0.');
            src = arr.join('mc/');
        } else {
            src = d.BrandLogo;
        }
        pn = d.SubCommercialTypeName;


        var href = '#p=map_p2&ex=' + ref.x + '&ey=' + ref.y + '&efid=' + fid + '&ename=' + escape(name),
            link = '/shop/detail?shopId=' + sid;
        return '<div class="Mitem swiper-slide" data-id="' + d.maid + '">' +
                    '<div class="inner">' +
                        '<a class="inforhd" href="#" data-href="' + d.id + '">' +
                            '<img src="' + src + '" class="shoppic">' +
                            '<div class="con">' +
                                '<div class="tit">' +
                                    '<h4>' + (d.idx ? d.idx + '. ' : '') + name + '</h4>' +
                                    card +
                                '</div>' +
                                //'<p class="addr ellipsis">' + pn + ' ' + fn + ' ' + dn + '</p>' +
                                '<p class="addr ellipsis">' + d.code + '</p>' +
                            '</div>' +
                            //'<i class="arrow-r"></i>' +
                        '</a>' +
                        '<div class="inforbd" data-type="a" data-href="' + d.id + '"><i class="s_map icon-dist"></i>到这里</div>' +
                    '</div>' +
                '</div>'
    },
    // 搜索标注icon
    createMark: function (maid, id, idx, x, y, num) {
        return '<div id="' + id + '" data-id="' + maid + '" data-idx="' + idx + '" class="map_marker map_marker11' + (idx == 0 ? ' cur' : '') + '" style="top:' + (y - 29) + 'px;left:' + (x - 11) + 'px;">' + num + '</div>';
    },
    // 搜索公共设施标注
    hd: function (type) {
        var _this = this, num = 0,
            //v = map.opts.searchVal,
            name = $("#searIptTxt").val(),
            str_icon = '',
            str_div = '';
        AppData.cur.Public = [];
        for (var i = 0; i < AppData.shopList.length; i++) {
            var shop = AppData.shopList[i];
            if (shop.type == type && shop.df == AppData.cur.floor) {
                var maid = shop.id,
                id = shop.id;
                num += 1;
                shop["order"] = num;
                AppData.cur.Public.push(shop);
                str_div += _this.createHdPanel(maid, id, type, num, name);
            }
        }
        if (AppData.cur.Public.length == 0) {
            $("#publicList").hide();
            gis.clearMap();
            return;
        }
        $('.ipt_sear').html(name);
        $(".mapslidewrap").show();
        this.list_pos(str_div, str_icon);
        gis.addPublicMark();
        gis.flyPoint(AppData.cur.Public[0].id);
    },
    // 滑动列表
    list_pos: function (str_div, str_icon) {
        var _this = this;
        $('#mapsear_1 .swiper-wrapper').html(str_div);
        if (str_div != '') {
            $('#mapsear_1').show();
        } else {
            $('#mapsear_1').hide();
        }
        $('#searMark').html(str_icon);
        $("#searchList").hide();
        $(".mapslidewrap").show();

        this.mySwiper && this.mySwiper.destroy();
        var swiper = this.mySwiper = new Swiper('.swiper-container', {
            slidesPerView: 1.1,
            centeredSlides: true,
            onSlideChangeEnd: function (obj) {
                var idx = obj.activeIndex,
                    id = $(obj.slides[idx]).data('id');
                _this.mark_focus(id);
            }
        });
        var played = false;
        //面板标题事件
        $(".inforhd").bind("click", function (e) {
            var id = e.currentTarget.dataset.href; 
            var myVideo = document.getElementById("video1");
            if(!played){ 
                $("#video1").show();
                //myVideo.style.display = "block"; 
                //myVideo.src = "voices/" + id + ".mp3";
                myVideo.play();
                played = true;
                $(".inforhd .shoppic").attr("src", "assets/images/icon/暂停.png");
            }else{
                played = false;
                $(".inforhd .shoppic").attr("src", "assets/images/icon/播放.png");
                myVideo.pause();
            }
            
        })
        //面板按钮事件
        $(".inforbd").bind("click", function (e) {
            var id = e.currentTarget.dataset.href;
            AppData.cur.target = app.getShopById(id);
            $("#routeStart").show();
            $("#routeStart").load("route/start.html");
            return;
            $("#load_nav").show();
            setTimeout(function () { $("#load_nav").hide(); }, 2000)
        })
    },
    // 搜索店铺列表
    shop_base: function (data, type) {
        var _this = this,
            str_icon = '',
            str_div = '';
        for (var i = 0, n = data.length; i < n; i++) {
            var item = data[i];
            item.maid = item.id;
            item.idx = num = 1; 
            if (item.voice) {//带语音的面板
                str_div += this.createScapePanel(item, type); 
                app.getVoice(item.voice);
            } else {//普通面板
                str_div += this.createShopPanel(item, type);
            }

        }
        if (type == 1) {
            $('.ipt_sear').html('优惠信息');
        }
        if (type == 3) {
            $('.ipt_sear').html(data[0].name);
        }
        this.list_pos(str_div, str_icon);
    },
    // 标注跟随地图位移
    mark_move: function () {
        var _this = this,
            list = this.markArr;
        // 列表
        for (var i in list) {
            fn(list[i]);
        }
        // 临时
        fn(this.markAlone);
        function fn(item) {
            if (!item) { return false }
            var id = item.id,
                x = item.x,
                y = item.y,
                pos = map.id_calcPos(x, y);
            $('#' + id).css({ left: pos.x - 11, top: pos.y - 29 });
        }
    },
    // 搜索标注绑定信息面板
    mark_focus: function (maid) {
        gis.flyPoint(maid);
        return;
        var ele = this.markArr[maid],
            id = ele.id,
            x = ele.x,
            y = ele.y,
            area = map.shopViewPortArea(),
            x1 = area[0], y1 = area[1], x2 = area[2], y2 = area[3];
        $('#searMark .cur').removeClass('cur');
        $('#' + id).addClass('cur');

        // 判断是否在视口范围,不在的话自动移至视口内
        if (!(x1 < x && x < x2 && y1 < y && y < y2)) {
            map.getPointCenter(null, x, y);
        }
    }
}


var shopName = {
    // 铺位信息
    getShopList: function (fid) {
        this.shopList = AppData.shopList;
        return;
        var _this = this;
        var info = map.buildinginfo && map.buildinginfo[fid];
        if (info == undefined) {
            $.ajax({
                type: "POST",
                data: { floorID: fid },
                url: "/Shop/GetMapInfo",
                success: function (res) {
                    var d = eval('(' + res.replace(/[\n\r\s]/g, '') + ')');
                    var list = _this.shopList = d.data.floorList[0].bizList;
                    $('.icon-compass i').css({ 'webkitTransform': 'rotate(' + (90 - d.data.heading) + 'deg)' })
                    //预存文本数组
                    _this.arrTxt = _this.formatArr(list);
                    map.init(fid);
                    // 缓存
                    mapfn.infoCache(fid, list);
                },
                error: function (res) {
                    _this.dialog("系统出故障，请稍后再试！")
                    location.href = location.href;
                }
            });
        } else {
            var list = this.shopList = info;
            //预存文本数组
            _this.arrTxt = _this.formatArr(list);
            map.init(fid);
        }
    },
    // 格式化文本数组 {f11002:[铺位id,中心坐标x,y,文本宽度,商户名称, 类型(车位|商铺)]}
    formatArr: function (list) {
        var arr = {};
        $.each(list, function (i, item) {
            var mapareaid = item.mapAreaId.replace(/\//g, '-'), name = item.name,
                x, y, _ref;
            if ($('#' + mapareaid).length == 0) {
                return true
            }
            _ref = map.getAreaCenter($('#' + mapareaid));
            x = _ref.x;
            y = _ref.y;
            arr[mapareaid] = [mapareaid, x, y, map.getBytesWidth(name), name, item.bizType];
        })
        return arr;
    },
    // 插入文本 [铺位id,中心坐标x,y,文本宽度,商户名称,isDot]
    setText: function (arr) {
        var html = '';
        for (var i = 0, n = arr.length; i < n; i++) {
            var item = arr[i],
                mapareaid = item[0], name = item[4],
                isDot = item[6] || false,
                len = item[3];
            // 重新获取div的商户中心坐标
            var _pos = map.id_calcPos(mapareaid);
            // 判断是否 车位或商铺
            var type = item[5] == 1 ? 'm' : 'p';
            // 无圆点-左偏移一半
            if (isDot != false) {
                html += '<span style="left:' + _pos.x + 'px;top:' + _pos.y + 'px;margin-left:-' + len / 2 + 'px" data-type="' + type + '" id="m_' + mapareaid + '" class="cls_txt">' + name + '</span>';
            } else {
                html += '<span style="left:' + _pos.x + 'px;top:' + _pos.y + 'px;" data-type="' + type + '" id="m_' + mapareaid + '" class="cls_txt cls_txt_circle">' + name + '</span>';
            }
        }
        $('#g_txt').append(html);
        $('.cls_txt').addClass('cls_txt1');
    },
    // 文字变化, arr视口内id
    zoom: function (type) {
        // 放缩时,清空上次数据
        if (type == 'transformend') {
            $('#g_txt').html('');
            map.visiblenodes = null;
        }
        var scale = map.scale,
            arrTxt = this.arrTxt,
            arr = map.viewportAreaShop,
            visiblenodes = [], // 本次数据
            last_visible = map.visiblenodes, //上一次数据
            new_temp_arrs = []; //新增数据

        // 循环上一次结果,筛选变化的数据, drag 状态下
        if (last_visible && type != "transformend") {
            for (var i = 0, n = last_visible.length; i < n; i++) {
                var id = last_visible[i][0];
                if (arr.contains(id)) {
                    visiblenodes.push(arrTxt[id].slice(0));
                    arr.splice(arr.indexOf(id), 1);
                } else {
                    $('#m_' + id).remove();
                }
            }
        }

        for (var i = 0, n = arr.length; i < n; i++) {
            var id = arr[i];
            if (!arrTxt[id]) {
                continue
            }

            // 临时数组, 存储变化
            var temp_arr = arrTxt[id].slice(0),
                textWidth = temp_arr[3];
            // 总体默认加上圆点padding,精确比对值
            temp_arr[3] += 12;
            // 上移半个汉字,模拟汉字垂直居中
            temp_arr[2] -= 14 / 2 / scale;
            // 当ratio非常小,scale=2时,依然很小,故ratio*scale=2,为实际2倍,文字才可能小于铺位尺寸,开放文字居中
            if (scale > 2) {
                var g = $('#' + id).children().first()[0],
                    w = g.getBoundingClientRect().width,
                    h = g.getBoundingClientRect().height;
                // 临时数组, 存储居中偏移参数
                if (w > textWidth + 10) {
                    temp_arr[3] = textWidth; // 没有圆点时,恢复宽度
                    temp_arr[1] -= textWidth / 2 / scale; //模拟x坐标居中
                    temp_arr[6] = 1;
                }
            }
            // false为不覆盖
            if (!map.checkIsCovered('txt', temp_arr, visiblenodes)) {
                visiblenodes.push(temp_arr);
                new_temp_arrs.push(temp_arr);
            }
        }
        this.setText(new_temp_arrs);
        map.visiblenodes = visiblenodes;
    },
    // 店铺id转svg铺位 id
    changeBizId: function (id) {
        var list = this.shopList;
        for (var i = 0, n = list.length; i < n; i++) {
            if (list[i].bizId == id) {
                return list[i].mapAreaId;
            }
        }
        return false
    },
    // svg铺位id转店铺id
    changeShopId: function (id) {
        var list = this.shopList;
        for (var i = 0, n = list.length; i < n; i++) {
            if (list[i].mapAreaId == id) {
                return list[i].bizId;
            }
        }
    },
    // 铺位id找名称
    getShopName: function (maid) {
        var list = this.shopList;
        for (var i = 0, n = list.length; i < n; i++) {
            if (list[i].mapAreaId == maid) {
                return list[i].name;
            }
        }
    },
    // 铺位id找区域
    getAreaName: function (maid) {
        var list = this.shopList;
        for (var i = 0, n = list.length; i < n; i++) {
            if (list[i].mapAreaId == maid) {
                return list[i].area;
            }
        }
    },
    getAreaInfo: function (type, v1, v2) {
        var list = this.shopList;
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i][type] == v1) {
                return list[i][v2];
            }
        }
        return list[0][v2];
    }
}
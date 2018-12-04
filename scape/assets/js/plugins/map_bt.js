//http://localhost:12308/Shop/map_p0?_mid=42#p=map_p1&mode=shop&fid=0&searchType=0&searchVal=escalator
var Map = (function(){
    var map = {
        defaults: {
            imagesize: 20,
            fontsize: 11,
            scale: 1,
            followScale:12,
            mapGap: 0.5, // 地图移动区域边距全屏80%
            gpsGap: 10, // gps路径展示边距
            txtGap: 20, // 文字边距
            border_size: 0.3
        },
        setOpt: function(opt){
            this.opts = $.extend({},this.defaults,mapfn.defaults,opt,{floorData:mapfn.formatFloor()});
        },
        // 加载地图后,初始化
        init: function(fid){
            this.isLoaded = true;
            this.imgDir = '/assets/images/utils/map/';
            this.$svg = $('#svgFrame svg');
            this.vp = $('#viewport');
            $('#followBox img')[0].src = resEnv +'/map/v1/navigation_d11feb4.png';

            // 重置选点模式下变量
            mapPick.last_sepoint=null;

            map.fid = fid;

            var path_loc = mapfn.pathPoints.filter(function(item){
                return item.floorID==fid
            })

            var floorPath = path_loc[0] && path_loc[0].floorPath || [];
            var path_sort = floorPath.concat();
            mapfn.path_sort = path_sort.sort(function(a, b) {return a[0] - b[0];});

            //预存设备id
            hd.arrHd = hd.formatJson();
            // 计算
            this.getLevel();

            this.getPointCenter();
            $("#svgBox").css('visibility', 'visible');

            // 放缩初始化
            this.multitouch();
            //
            map.loadSvg.close()

            // 比例尺
            mapfn.scaleRule();

            // 比例尺,定位面板
            $('.panel_1').show();

            // 店铺模式初始化
            if(map.opts.mode=='shop'){
                mapShow.init();
            }

            // 停车场模式初始化
            if(map.opts.mode=='park'){
                Park.markParking_status(fid);
                Park.init();
            }

            // 路径初始化
            if(map.opts.mode=='nav'){
                step = mapNav.step;
                if(BtNav.openFollow){
                    step = mapNav.steps.indexOf(parseInt(fid));
                }
                mapNav.setStep(step);
                // 更新nav面板状态
                mapNav.statusNavTab(fid,step)
                mapNav.draw(fid);
            }

            // 移除选点
            if(map.opts.mode=='point'){
                mapPick.removeSePos();
            }

            if(BtNav.openFollow){
                BtNav.show(BtNav.pos);
            }

            // test
            //mapfn.addPath(mapfn.path_sort);
        },
        // 计算比率
        getLevel: function () {
            var svg = this.$svg[0],
                x, y, width, height,
                g = this.vp[0],
                view = svg.getAttribute('viewBox').match(/(\+|-)?[\d\.]+/g),
                box_w = this.box_w = $('#svgFrame').width(),
                box_h = this.box_h = $('#svgFrame').height();

            svg.removeAttribute("viewBox");
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');

            x = parseFloat(view[0]);
            y = parseFloat(view[1]);
            width = this.vb_w = parseFloat(view[2]) - x;
            height = this.vb_h = parseFloat(view[3]) - y;

            var widthLevel = box_w / width;
            var heightLevel = box_h / height;
            // ratio初始值是满屏时比例
            this.ratio = this.scale = this.last_scale = Math.min(widthLevel, heightLevel);

            this.mapGap_w = this.opts.mapGap * this.box_w;
            this.mapGap_h = this.opts.mapGap * this.box_h;
        },
        // 放缩svg
        multitouch: function () {
            var _this = this;
            var hammertime = Hammer($('#svgFrame')[0], {
                transform_always_block: true,
                transform_min_scale: 1,
                drag_block_horizontal: true,
                drag_block_vertical: true,
                drag_min_distance: 0
            });

            hammertime.on('drag dragstart dragend transformstart transform transformend', function (ev) {
                manageMultitouch(ev);
            })
            function manageMultitouch(ev) {
                switch (ev.type) {
                    //缩放中
                    case 'transform':
                        _this.scale = Math.max(_this.ratio, Math.min(_this.last_scale * ev.gesture.scale, 30));
                        //以容器为中心点,放大后左半边的位移等于(中心点坐标-放大后左边大小)
                        var getPos = _this.getPosTransform(_this.scale);
                        _this.posX = getPos.x;
                        _this.posY = getPos.y;
                        break;
                    case 'dragstart':
                        BtNav.triggerNav(0);
                        break;
                    case 'drag':
                        _this.posX = ev.gesture.deltaX + _this.lastPosX;
                        _this.posY = ev.gesture.deltaY + _this.lastPosY;
                        break;
                    case 'transformstart':
                        // 变化前全部元素隐藏
                        $('#g_txt').html('');
                        $('#g_hd').remove();
                        break;
                }
                BtNav.firstTriggerFollow = false;
                // 展示地图
                _this.map_show(_this.scale, ev.type);
            }
        },
        // 使x,y坐标点 在scale级上居中
        getPointCenter: function (scale, x, y) {
            // 先找到视图中心点,然后比对x|y 差值,再加上svg最后一次定位
            this.r_w = 1 / 2;
            this.r_h = 1 / 2;
            var c = this.getViewPortCenter(), scale = scale || this.ratio;
            var disX = c.x - x || 0,
                disY = c.y - y || 0,
                getPos = this.getPosTransform(scale);
            this.posX = getPos.x + disX * scale;
            this.posY = getPos.y + disY * scale;
            this.map_show(scale, 'transformend');
        },
        // 视口中心点
        getViewPortCenter: function () {
            // 视口中心点的左侧占比*总长度 等于 视口中心x,y
            return {
                x: this.vb_w * this.r_w,
                y: this.vb_h * this.r_h
            }
        },
        // svg视口范围
        shopViewPortArea: function () {
            var box_h = this.box_h,
                box_w = this.box_w,
                scale = this.scale;
            // 起点坐标:lastPos-差额部分算出, 终点坐标:起点+视口宽高
            var x1 = -this.lastPosX / scale,
                y1 = -this.lastPosY / scale,
                x2 = x1 + box_w / scale,
                y2 = y1 + box_h / scale;
            return [x1, y1, x2, y2];
        },
        // 获取视口商户
        shopViewPort: function () {
            // 循环当前商铺坐标, 保存当前在视口内的商户id
            var _this = this,
                area = this.shopViewPortArea(),
                x1 = area[0], y1 = area[1], x2 = area[2], y2 = area[3],
                arr1 = [], //初始化视口商铺
                arr2 = [];
            $('._area_merchant,._area_parking').each(function () {
                var x0, y0, id, bbox;
                var bbox = _this.getAreaCenter($(this));
                x0 = bbox.x;
                y0 = bbox.y;
                if (x1 < x0 && x0 < x2 && y1 < y0 && y0 < y2) {
                    arr1.push($(this).attr('id'));
                }
            })
            hd.eles.each(function () {
                var x0, y0, id, bbox;
                var bbox = _this.getAreaCenter($(this));
                x0 = bbox.x;
                y0 = bbox.y;
                if (x1 < x0 && x0 < x2 && y1 < y0 && y0 < y2) {
                    arr2.push($(this).attr('id'));
                }
            });

            // 视口内 商户,设备id
            map.viewportAreaShop = arr1
            map.viewportAreaHd = arr2;
        },
        // 获取位移比率,以容器中心点为基点,放大后左半边的占比(中心点+左位移 除以 总大小)
        getPosRatio: function (scale) {
            return {
                r_w: (this.box_w / 2 - this.posX) / (this.vb_w * scale),
                r_h: (this.box_h / 2 - this.posY) / (this.vb_h * scale)
            }
        },
        // 获取位移, 以容器为中心点,放大后左半边的位移等于(中心点坐标-放大后左边大小)
        getPosTransform: function (scale) {
            var w = this.vb_w, h = this.vb_h;
            return {
                x: (this.box_w / 2 - w * this.r_w * scale),
                y: (this.box_h / 2 - h * this.r_h * scale)
            }
        },
        /* 获取字符串字节数宽度 */
        getBytesWidth: function (str) {
            var span = document.createElement('span'),
                txt = document.createTextNode(str),
                w = 1;
            span.appendChild(txt);
            document.body.appendChild(span);
            w = span.offsetWidth;
            document.body.removeChild(span);
            return w;
        },
        // 获取区域中心
        getAreaCenter: function (ele) {
            var cx, cy, height, rect, width, x, x1, x2, y, y1, y2, _ref, _ref1, _ref2;
            if ((ele.attr('cxy') != null) && ele.attr('cxy') !== '') {
                _ref = ele.attr('cxy').split(','), cx = _ref[0], cy = _ref[1];
            } else {
                rect = ele.find('rect');
                if (rect[0] != null) {
                    _ref1 = [rect.attr('x'), rect.attr('y'), parseFloat(rect.attr('x')) + parseFloat(rect.attr('width')), parseFloat(rect.attr('y')) + parseFloat(rect.attr('height'))], x1 = _ref1[0], y1 = _ref1[1], x2 = _ref1[2], y2 = _ref1[3];
                    cx = (parseFloat(x1) + parseFloat(x2)) / 2;
                    cy = (parseFloat(y1) + parseFloat(y2)) / 2;
                } else {
                    _ref2 = ele[0].getBBox(), x = _ref2.x, y = _ref2.y, width = _ref2.width, height = _ref2.height;
                    cx = x + width / 2;
                    cy = y + height / 2;
                }
            }
            return {
                x: parseFloat(cx),
                y: parseFloat(cy)
            };
        },
        // 平移放缩地图展示
        map_show: function (scale, type) {
            var r_bound = 0, l_bound = 0,
                t_bound = 0, b_bound = 0,
                box_h = this.box_h,
                box_w = this.box_w,
                box_h1 = this.vb_h,
                box_w1 = this.vb_w,
                mapGap_w = this.mapGap_w,
                mapGap_h = this.mapGap_h,
                posX = this.posX,
                posY = this.posY,
                last_visible = this.visiblenodes || [];
            if (scale < this.ratio) {
                scale = this.ratio;
            }
            t_bound = mapGap_h;
            l_bound = mapGap_w;
            // 先使svg右侧贴地图左边，然后再露出gap空间
            b_bound = -box_h1*scale + (box_h-mapGap_h);
            r_bound = -box_w1*scale + (box_w-mapGap_w);

            if (posX < r_bound) {
                posX = r_bound;
            }
            if (posY < b_bound) {
                posY = b_bound;
            }

            // 优先处理左上角边界,覆盖上面的右下
            if (posX > l_bound) {
                posX = l_bound;
            }
            if (posY > t_bound) {
                posY = t_bound;
            }

            this.posX = posX;
            this.posY = posY;
            this.scale = scale;

            var matrix = 'matrix(' + scale + ',0,0,' + scale + ',' + posX + ',' + posY + ')'
            this.vp[0].setAttribute('transform', matrix)

            if (type == 'drag') {
                for (var i = 0, n = last_visible.length; i < n; i++) {
                    var vmid = last_visible[i][0];
                    _pos2 = this.id_calcPos(vmid);
                    $('#m_' + vmid).css({ left: _pos2.x, top: _pos2.y });
                }
            }
            if(!this.openFollow){
                var _ref = map.id_calcPos(BtNav.last_loc_x, BtNav.last_loc_y),
                    x = _ref.x,
                    y = _ref.y;
                $('#followBox').css({ left: x, top: y });
            }

            // 选点面板位置变化
            if(map.opts.mode=='point'){
                mapPick.move();
            }else if (map.opts.mode=='shop') {
                // 搜索mark放缩
                mapShow.mark_move();
            }else if(map.opts.mode=='nav'){
                mapNav.move();
            }
            var gmcar_x = $('#g_markcar').attr('cx'),
                gmcar_y = $('#g_markcar').attr('cy');
            $('#g_markcar').attr({width:17/scale, height:26/scale, x: gmcar_x-17/scale, y: gmcar_y-26/scale})

            // 放缩,移动停止时,记录最后一次数据
            if (type == "dragend" || type == "transformend") {
                this.lastPosX = posX;
                this.lastPosY = posY;

                // r_w,r_h 以视口中心点为基点,计算左侧占比
                var r = this.getPosRatio(scale);
                this.r_w = r.r_w;
                this.r_h = r.r_h;

                // 搜集视口内 商铺,设备id
                this.shopViewPort();

                if (type == "transformend") {
                    this.last_scale = scale;
                    this.stroke_zoom(); // 边框

                    mapNav.zoom();
                }
                // 元素放缩
                this.unitTransform(type);
            }
        },
        // svg放缩后，子元素相应放缩
        unitTransform: function (type) {
            hd.zoom(); //设备
            shopName.zoom(type); //文字
            // 放缩时变化的元素
            if (type == "transformend") {
                // gps开启下,进行icon,line放缩
                mapfn.scaleRule();
                mapfn.scaleAreaRadius();
            }
        },
        // 根据铺位id或x,y,计算基于视口(0,0)的x,y
        id_calcPos: function () {
            var $area, _ref, x, y, scale = this.scale, arg = arguments;
            if (arg.length > 1) {
                x = arg[0] * scale + this.posX;
                y = arg[1] * scale + this.posY;
            } else if (arg.length == 1) {
                $area = $('#' + arg[0]);
                _ref = this.getAreaCenter($area);
                x = _ref.x * scale + this.posX;
                y = _ref.y * scale + this.posY;
            }
            return { x: x, y: y }
        },
        // 全屏居中
        initLevelMap: function () {
            this.posX = this.lastPosX = 0;
            this.posY = this.lastPosY = 0;
            this.r_w = 1 / 2; //视口中心点到左端与总宽度比率
            this.r_h = 1 / 2;
            this.getPointCenter();
        },
        stroke_zoom: function () {
            var bsize = this.opts.border_size, scale = this.scale;
            $('._area_merchant,._area_parking').children().attr('stroke-width', bsize / scale);
            $('._area_background').children().attr('stroke-width', bsize / scale);
        },
        // 计算元素碰撞
        checkIsCovered: function (type, arr, visible) {
            var flag = false,
                scale = this.scale,
                imagesize = this.opts.imagesize,
                rect, rect1, tGap;
            if (type == "txt") {
                rect = getBoundTxt(arr, scale);
                tGap = this.opts.txtGap / scale;
            } else if (type == "hd") {
                rect = getBoundHd(arr, scale, imagesize);
                tGap = 10 / scale;
            }
            var left = rect.l - tGap;
            var top = rect.t - tGap;
            var right = rect.r + tGap;
            var bottom = rect.b + tGap;

            for (var i = 0, n = visible.length; i < n; i++) {
                if (type == "txt") {
                    rect1 = getBoundTxt(visible[i], scale);
                } else if (type == "hd") {
                    rect1 = getBoundHd(visible[i], scale, imagesize);
                }
                var left1 = rect1.l;
                var top1 = rect1.t;
                var right1 = rect1.r;
                var bottom1 = rect1.b;

                //左边
                if (left < left1 && right > left1 && !(top > bottom1 || bottom < top1)) {
                    flag = true;
                    break;
                }

                //右边
                if (left < right1 && right > right1 && !(top > bottom1 || bottom < top1)) {
                    flag = true;
                    break;
                }

                //上边
                if (top < top1 && bottom > top1 && !(right < left1 || left > right1)) {
                    flag = true;
                    break;
                }

                //下边
                if (top < bottom1 && bottom > bottom1 && !(right < left1 || left > right1)) {
                    flag = true;
                    break;
                }

                //内部上下
                if (left > left1 && right < right1 && !(top > bottom1 || bottom < top1)) {
                    flag = true;
                    break;
                }

                //内部左右
                if (top > top1 && bottom < bottom1 && !(right < left1 || left > right1)) {
                    flag = true;
                    break;
                }
            }

            function getBoundTxt(arr, scale) {
                var id = arr[0], x = arr[1], y = arr[2], len = arr[3], name = arr[4];
                return {
                    i: id,
                    name: name,
                    l: x,
                    t: y,
                    r: x + len / scale,
                    b: y + 14 / scale
                }
            }
            function getBoundHd(arr, scale, imagesize) {
                var id = arr[0], x = arr[1], y = arr[2];
                return {
                    i: id,
                    l: x,
                    t: y,
                    r: x + imagesize / scale,
                    b: y + imagesize / scale
                }
            }
            return flag;
        },
        createSvgDom: function (dom) {
            return document.createElementNS('http://www.w3.org/2000/svg', dom)
        },
        // 创建img w1,h1偏离距离
        createIcon: function (x, y, w, h, w1, h1, src) {
            var ele, _ref, x, y, scale = this.scale;
            ele = this.createSvgDom('image');
            ele.href.baseVal = src;
            ele.setAttribute("x", x - w1 / scale);
            ele.setAttribute("y", y - h1 / scale);
            ele.setAttribute("cx", x);
            ele.setAttribute("cy", y);
            ele.setAttribute('width', w / scale);
            ele.setAttribute('height', h / scale);
            return ele
        }
    }

    // 应用
    var mapfn = {
        defaults: {
            mode: null
        },
        orinFloorData: floorData || [],
        // 单击地图
        act: function(e){
            var mode = map.opts.mode;
            switch (mode){
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
        modeShop: function(e){
            var tar = e.target,
                nodeName = tar.nodeName.toLowerCase(),
                parEle = tar.parentNode,
                cls = parEle.getAttribute('class'),
                hd_name,
                g,
                result,
                id;

            // 店铺名称文本
            if ($(tar).closest('#g_txt').length){
                var type = $(tar).data('type'),
                    maid = $(tar).attr('id').replace('m_', '');
                if(type=='m'){
                    mapShow.shop_alone_pos(maid);
                }
                if(type=='p'){
                    mapShow.park_alone_pos(maid);
                }
                return false;
            }
            if (nodeName == 'image') {
                id = tar.getAttribute('id');
                hd_name = tar.getAttribute('alt');
                mapShow.hd_alone_pos(id,hd_name);
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
                mapShow.hd_alone_pos(id,result[0]);
                return false;
            }

            // 商铺信息禁止操作
            if ($(tar).closest('.shop_info_inner').length) {
                return false;
            }

            mapShow.closeAlonePos();
        },
        modePoint: function(e){
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
        modePark: function(e){
            if(Park.parkfn!='markcar'){
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
            $("#"+Park.id_markPark).removeClass('g_mark');
            $('#park_info_tip').show();
            $('#park_info_mycar').hide();
            // 店铺名称文本
            if ($(tar).closest('#g_txt').length) {
                type = $(tar).data('type');
                id = tar.getAttribute('id').replace('m_', '');
                if(type=='p'){
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
        svgCache: function(fid,res){
            map.building = map.building || {};
            map.building[fid] = res;
        },
        infoCache: function(fid,res){
            map.buildinginfo = map.buildinginfo || {};
            map.buildinginfo[fid] = res;
        },
        // 创建楼层
        createFloor: function(fid){
            var _this = this,
                data = this.orinFloorData,
                str = '';
            for (var i = 0; i < data.length; i++) {
                var d = data[i], id = d.ID;
                var tag = d.tag!='' ? ' ('+d.tag+')' : '';
                if (fid == id) {
                    str += '<option value='+ id + ' selected>'+ d.name+ tag +'</option>';
                } else {
                    str += '<option value='+ id + '>'+ d.name + tag +'</option>';
                }
            }
            $('#floorPanel').html(str);
            $('#floorPanel').mobiscroll().select({
                theme: 'mobiscroll',
                lang: 'zh',
                display: 'bottom',
                showInput:false,
                onSelect: function(v,obj){
                    var f = obj._tempValue;
                    if(f != map.fid){
                        mapShow.closeAlonePos();
                        _this.fnChangeFloor(parseInt(obj._tempValue));
                    }
                }
            });
        },
        // 切换楼层
        fnChangeFloor: function(fid,flag){
            if(fid==undefined){return}
            var fdata = map.opts.floorData,
                name = fdata[fid].name;
            $('#changeFloor').html(name);
            if(flag==undefined){
                BtNav.triggerNav(0,'hideFollow');
            }
            map.fid = fid;
            getSvg(fid);
        },
        //格式化楼层数据{id:{}}
        formatFloor: function(){
            var data = this.orinFloorData, temp={};
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
        scaleRule: function(){
            var grade = [200,100,75,50,40,30,20,10,5,1,0.5],
                s = map.last_scale,
                d = 36/s, //表示36px对应地图真实长度(m)
                num = 0;
            // 比对合适级别
            for(var i=0,n=grade.length; i<n; i++){
                if(d>grade[0]){
                    num = grade[0]
                    break;
                }
                if(d< grade[i] && d>grade[i+1]){
                    num = grade[i]
                    break;
                }
                if(d < grade[n-1]){
                    num = grade[n-1];
                    break;
                }
            }
            // 级别长度(m) * scale = 比例尺长度(px)
            $('.map_scaleCtrl').width(num*s);
            $('.map_scaleCtrl .text').text(num+'米');
        },
        // area
        scaleAreaRadius: function(){

        },
        dialog: function(str, json) {
            return new $.Zebra_Dialog(str, json);
        },
        destroy: function(){
            map.opts && (map.opts.mode=null);
        },
        addPath: function(arr,id,color,r){
            var fragment = document.createDocumentFragment();//创建文档片段
            var pack = map.createSvgDom('g'), scale = map.scale;
            for (var i = 0, n = arr.length; i < n; i++) {
                var item = arr[i];
                var ele = this.drawCircle(item[0],item[1],'path_'+i,'#FFC7C7',0.2);
                fragment.appendChild(ele);
            }
            pack.appendChild(fragment);
            pack.setAttribute('id', 'g_path');
            map.vp[0].appendChild(pack);
        },
        getPath: function(mid){
            var _this = this;
            this.pathPoints = [];
            $.ajax({
                url:'//gis.api.mallcoo.cn/backup/lydw/absorbPath/'+ mid +'_absorbPath.json',
                success: function(res){
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
                var ele = this.drawCircle(item.x,item.y,'hd_'+item.apMac_1,'#41B4FF',10/scale);
                var txt = this.drawTxt(item.x, item.y-0.5, item.minor)
                fragment.appendChild(ele);
                fragment.appendChild(txt);
            }
            pack.appendChild(fragment);
            pack.setAttribute('id', 'g_ap');
            map.vp[0].appendChild(pack);
        },
        // 路径
        drawCircle: function(cx,cy,id,color,r) {
            var ele = map.createSvgDom('circle');
            ele.setAttribute('stroke-width', .1);
            ele.setAttribute("fill", color);
            ele.setAttribute('cx', cx);
            ele.setAttribute('cy', cy);
            ele.setAttribute('r', r);
            ele.setAttribute('id', id);
            return ele;
        },
        drawTxt: function(x,y,v){
            var ele = map.createSvgDom('text');
            ele.setAttribute('x',x);
            ele.setAttribute('y',y);
            ele.setAttribute('font-size',this.opts.fontsize/map.scale)
            ele.setAttribute('text-anchor','middle')
            ele.textContent = v
            return ele
        },
        // 主入口
        posEntrance:function(maid){
            var x = shopName.getAreaInfo('mapAreaId',maid,'dx');
            var y = shopName.getAreaInfo('mapAreaId',maid,'dy');
            if(x==0 || x==undefined){
                var ref = map.getAreaCenter($('#'+maid));
                x = ref.x;
                y = ref.y;
            }
            return {x:x, y:y}
        }
    }

    // 商铺文本
    var shopName = {
        // 铺位信息
        getShopList: function (fid) {
            var _this = this;
            var info = map.buildinginfo && map.buildinginfo[fid];
            if(info==undefined){
                $.ajax({
                    type: "POST",
                    data: { floorID: fid },
                    url: "/Shop/GetMapInfo",
                    success: function (res) {
                        var d = eval('(' + res.replace(/[\n\r\s]/g, '') + ')');
                        var list = _this.shopList = d.data.floorList[0].bizList;
                        $('.icon-compass i').css({'webkitTransform':'rotate('+ (90-d.data.heading) +'deg)'})
                        //预存文本数组
                        _this.arrTxt = _this.formatArr(list);
                        map.init(fid);
                        // 缓存
                        mapfn.infoCache(fid,list);
                    },
                    error: function (res) {
                        _this.dialog("系统出故障，请稍后再试！")
                        location.href = location.href;
                    }
                });
            }else{
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
                var type = item[5]==1 ? 'm' : 'p';
                // 无圆点-左偏移一半
                if (isDot != false) {
                    html += '<span style="left:' + _pos.x + 'px;top:' + _pos.y + 'px;margin-left:-' + len / 2 + 'px" data-type="'+ type +'" id="m_' + mapareaid + '" class="cls_txt">' + name + '</span>';
                } else {
                    html += '<span style="left:' + _pos.x + 'px;top:' + _pos.y + 'px;" data-type="'+type+'" id="m_' + mapareaid + '" class="cls_txt cls_txt_circle">' + name + '</span>';
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
        getAreaInfo: function(type,v1,v2){
            var list = this.shopList;
            for (var i = list.length-1; i >= 0; i--) {
                if (list[i][type] == v1) {
                    return list[i][v2];
                }
            }
        }
    }
    // 设施
    var hd = {
        cont_hd: {
            'elevator': '直梯',
            'stair': '楼梯',
            'escalator': '自动扶梯',
            'toilet': '洗手间',
            'service': '服务台',
            'a-toilet': '残障人士洗手间',
            'motherbaby': '母婴室',
            'cashier': '收银台',
            'vip': '会员处',
            'tailoring': '剪裁处',
            'atm':'自动取款机'
        },
        lastHD: null,
        // 格式化设备id {icon1:[x,y,name]}
        formatJson: function () {
            var icons = this.eles = this.getEles(), _ref, name, arr = {};
            for (var i = 0, n = icons.length; i < n; i++) {
                var icon = icons[i];
                // 统一设置设备铺位id
                icon.setAttribute('id', 'icon' + i);

                name = icon.getAttribute('class').substring(6);
                _ref = map.getAreaCenter($(icon));
                arr['icon' + i] = [i, _ref.x, _ref.y, name];
            }
            return arr;
        },
        // 设备对象
        getEles: function () {
            var arr = Object.keys(hd.cont_hd), $obj = $([]);
            for (var i = 0; i < arr.length; i++) {
                $obj = $obj.add('._area_' + arr[i]);
            }
            return $obj;
        },
        // 插入设备
        add: function (arr) {
            var fragment = document.createDocumentFragment();//创建文档片段
            var pack = document.querySelector('#g_hd');
            var imagesize = map.opts.imagesize, scale = map.scale;
            for (var i = 0, n = arr.length; i < n; i++) {
                var item = arr[i],
                    id = item[0],
                    name = item[3],
                    w = h = imagesize,
                    x = item[1], y = item[2],
                    suffix = item[4] ? '_h' : '',
                    src = map.imgDir + 'icon_' + name + suffix + '.png';

                // 比率在3倍的时候, 设备和铺位大小接近
                if (scale < 3) {
                    // 随着scale大小变化, ratio/3为初始值
                    w = h = imagesize / 3 * scale;
                }
                var ele = map.createIcon(x, y, w, h, w / 2, h / 2, src);
                ele.setAttribute('id', id);
                ele.setAttribute('alt', name);
                fragment.appendChild(ele);
            }
            if (!pack) {
                pack = map.createSvgDom('g');
                pack.setAttribute('id', 'g_hd');
                map.vp[0].appendChild(pack);
            }
            pack.appendChild(fragment);
        },
        // 设备变化
        zoom: function () {
            // 清空上次数据
            $('#g_hd').remove();
            var imagesize = map.opts.imagesize,
                scale = map.scale,
                arrHd = this.arrHd, //所有设备id
                arr = map.viewportAreaHd, //视口内设备id
                visibleHd = []; //最终显示的设备id
            for (var i = 0, n = arr.length; i < n; i++) {
                var id = arr[i];
                // 临时数组, 存储变化
                var temp_arr = arrHd[id].slice(0);

                var g = $('#' + id).children().first()[0],
                    w = g.getBoundingClientRect().width,
                    h = g.getBoundingClientRect().height;

                // 高亮条件下,提取指定设备类型
                if (this.lastHD && temp_arr[3] == this.lastHD) {
                    temp_arr[4] = 1;
                    visibleHd.push(temp_arr);
                }

                // false为不覆盖
                if (!map.checkIsCovered('hd', temp_arr, visibleHd) && (w > imagesize + 20 && h > imagesize + 20) && temp_arr[0] != this.lastHD) {
                    visibleHd.push(temp_arr);
                }
            }
            this.add(visibleHd);
        },
        isFacility: function (s) {
            var reg = /elevator|stair|escalator|toilet|service|a-toilet|motherbaby|cashier|vip|tailoring|atm/;
            return s.match(reg);
        },
        hdSearPos: function(){
            var _this = this, src, ele, $area, _ref, x, y, cn_name;

            $('.shop_info_inner').hide();
            $('#shopInfo').css({ bottom: -150 }).animate({
                bottom: 0
            }, 500, 'ease-out', function () {
                $('#shopInfo_sub2 .name')[0].className = 'name name_' + name;
                cn_name = _this.options.Cont_hd[name];
                $('#shopInfo_sub2 .name').html(cn_name);
                $('#shopInfo_sub2 [data-id=btnNavigate]').data('name', cn_name);
                $('#shopInfo_sub2').show();
            });
        }
    }
    // 优惠
    var promotion = {
        //获取优惠列表
        getPromotionList: function(fid, callback) {
            var _this = this;
            $.ajax({
                type: "POST",
                data: { floorID: fid },
                url: "/Shop/DoPromotionShop",
                success: function (res) {
                    var d = JSON.parse(res);
                    if(d.m!=1){
                        return
                    }
                    callback(d.sp);
                },
                error: function (res) {
                    _this.dialog("系统出故障，请稍后再试！")
                }
            });
        },
        // 插入优惠
        add: function () {
            var src = map.imgDir + 'icon_hui@2x.png',
                cxy, x, y, maid,
                arr = this.huiData;
            var fragment = document.createDocumentFragment();//创建文档片段
            var pack = document.querySelector('#g_hui');
            for (var i = 0, n = arr.length; i < n; i++) {
                maid = this.changeBizId(arr[i]);
                if (!maid) { continue }
                cxy = this.getAreaCenter($('#' + maid));
                x = cxy.x;
                y = cxy.y;
                var ele = this.createIcon(x, y, 30, 30, 30 / 2, 30, src);
                ele.setAttribute('class', 'hui_icon');
                fragment.appendChild(ele);
            }
            if (!pack) {
                pack = this.createSvgDom('g');
                pack.setAttribute('id', 'g_hui');
                this.vp[0].appendChild(pack);
            }
            pack.appendChild(fragment);
        },
        zoom: function(){
            // 清空上次数据
            $('#g_hui').remove();
            this.add();
        }
    }

    /* 地图搜索模式
     *
     * 1.搜索结果展示mapsear_1
     * searchType=0&searchVal=escalator
     * 0公共设施|自动扶梯  1优惠信息  2关键字  3商铺(单个店铺sid)
     *
     * 优惠接口和 商铺接口 数据不统一 需要shim
     *
     *
     * 2.临时结果展示mapsear_2
     * 可点击查看其它商铺信息
     *
     * 如果点击的商铺正好是结果中,切换结果展示
     *
    */
    var mapShow = {
        id: 0,
        markArr: {},
        markAlone:{},
        init: function(){
            var _this = this,
                type = parseInt(map.opts.searchType),
                fid = map.fid,
                val = map.opts.searchVal;
            this.destroy();
            if(!isNaN(type)){
                switch(type){
                    case 0: // 公共设施
                        this.hd();
                        break;
                    case 1: // 惠
                        promotion.getPromotionList(fid,function(d){
                            _this.shop_base(d,1);
                        })
                        break;
                    case 2: // 关键字 暂未开发
                        //this.shop_base(result,2);
                        break;
                    case 3: // 单个店铺sid
                        var sid = val;
                        if(!sid){
                            location.href = "/Shop/map_p0?_mid="+_mid;
                        }

                        this.getShopInfo(sid,function(d){
                            _this.shop_base([d],3);
                        })
                        break;
                }
            }

            // 点击标注
            $('#searMark').bind('click',function(e){
                var tar = e.target,
                    $tar = $(tar),
                    $ele = $tar.closest('.map_marker'),
                    id = $ele.data('id');
                if($ele.length){
                    if($ele.is('#abc')){
                        return false;
                    }else{
                        if($(this).hasClass('cur')){ return }
                        var idx = $ele.data('idx');
                        _this.mark_focus(id);
                        _this.mySwiper.slideTo(idx, 1000, false);
                        _this.closeAlonePos();
                        $('#mapsear_1').show();
                    }
                }
            })

            // 店铺搜索模式清除
            $('#searchDel').bind('click',function(){
                $('.mapInfor').hide();
                $('#searMark').empty();
                $('.ipt_sear').addClass('ipt_sear_default').html('搜店名、查设施、找优惠');
                $('#searchDel').hide();
            })
        },
        // 临时商铺标注
        shop_alone_pos: function(maid){
            var _this = this,
                sid = shopName.changeShopId(maid),
                str_div = '';
            // 没有数据, !sid表示未落位
            if (!$('#' + maid).length || !sid) { return false }
            // 判断是否已是搜索标注区域
            if(maid in this.markArr){
                $('#'+this.markArr[maid].id).click();
                return false;
            }
            this.getShopInfo(sid,function(d){
                $.extend(d,{maid: maid,idx:null});
                str_div = _this.createShopPanel(d,3);
                _this.alone_pos(maid,str_div);
            })
        },
        // 临时公共设施标注
        hd_alone_pos: function(maid,v){
            var _this = this,
                str_div = '',
                name = hd.cont_hd[v];
            // 判断是否已是搜索标注区域
            if(maid in this.markArr){
                $('#'+this.markArr[maid].id).click();
                return false;
            }
            str_div = this.createHdPanel(maid,'abc',v,'',name);
            this.alone_pos(maid,str_div);
        },
        // 停车场
        park_alone_pos: function(maid){
            var _this = this,
                sid = shopName.changeShopId(maid),
                str_div = '';
            // 没有数据, !sid表示未落位
            if (!$('#' + maid).length || !sid) { return false };
            // 判断是否已是搜索标注区域
            if(maid in this.markArr){
                $('#'+this.markArr[maid].id).click();
                return false;
            }
            str_div = this.createParkPanel(maid);
            this.alone_pos(maid,str_div);
        },
        // 临时标注方法
        alone_pos: function(maid,str_div){
            var cxy = map.getAreaCenter($('#'+maid)),
                _pos = map.id_calcPos(maid);
            //当前id等于maid时,就保持现状
            if($('#abc').length){
                var id = $('#abc').data('id');
                if (id == maid) { return false };
                $('#abc').remove();
            }
            var str_icon = '<div id="abc" data-id="'+ maid +'" class="map_marker map_marker_dfl" style="top:'+ (_pos.y-29) +'px;left:'+ (_pos.x-11) +'px;"></div>';
            $('#searMark').append(str_icon);

            $('#mapsear_1').hide();
            $('#mapsear_2').html(str_div);
            $('#mapsear_2').show();
            this.markAlone = {id:'abc', x:cxy.x, y:cxy.y};
        },
        closeAlonePos: function(){
            $('#abc').remove();
            $('#mapsear_1').hide();
            $('#mapsear_2 .inner').html('');
            $('#mapsear_2').hide();
            this.markAlone = null;
        },
        // 获取信息
        getShopInfo: function(sid,callback){
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
        destroy: function(){
            // 移除搜索mark
            this.markArr = {};
            //this.mySwiper && this.mySwiper.destroy();
        },
        // 搜索标注自增id
        getId: function(){
            this.id = this.id+1;
            return 'sear_mark_num'+this.id;
        },
        // 搜索商铺面板
        createShopPanel: function(d,type){
            var card = '', ref = mapfn.posEntrance(d.maid), fid, fn, name, link, pn, dn, pn,src;
            // 优惠商铺面板
            if(type==1){
                card += '<span class="shoptype shoptype2">惠</span>';
                fid = map.fid;
                fn = d.fn;
                name = d.sn;
                sid = d.sid;
                src = d.sl;
                dn = d.dn;
                pn = d.pn;
                var arr = src.split('mc/');
                arr[1] = arr[1].replace(/\//g,'').replace('.','_200x200_1_0_0.');
                src = arr.join('mc/');
            }else{
                if (d.IsAddedVIPCard) {//是否已设置会员卡
                    card += '<i class="icon_sp1 s-icon1"></i>';
                }
                if (d.HaveGroup) {//是否有团购
                    card += '<span class="shoptype shoptype1">团</span>';
                }
                if (d.HavePromotion) {//是否有促销(普通 or限时)
                    card += '<span class="shoptype shoptype2">惠</span>';
                }
                sid = d.ID;
                name = d.Name;
                if(d.BrandLogo==''){
                    src = d.Photo;
                    var arr = src.split('mc/');
                    arr[1] = arr[1].replace(/\//g,'').replace('.','_200x200_1_0_0.');
                    src = arr.join('mc/');
                }else{
                    src = d.BrandLogo;
                }
                pn = d.SubCommercialTypeName;
                var d1 = d.PositionList.filter(function(item){
                    return item.FloorID == map.fid
                })[0]
                fid = d1.FloorID;
                fn = d1.FloorName;
                dn = d1.DoorNo;
            }

            var href = '#p=map_p2&ex=' + ref.x + '&ey='+ ref.y +'&efid='+ fid +'&ename='+ escape(name),
                link = '/shop/detail?shopId=' + sid;
            return '<div class="Mitem swiper-slide" data-id="'+ d.maid +'">'+
                        '<div class="inner">'+
                            '<a class="inforhd" href="'+ link +'">'+
                                '<img src="' + src +'" class="shoppic">'+
                                '<div class="con">'+
                                    '<div class="tit">'+
                                        '<h4>'+ (d.idx? d.idx+'. ' : '') + name +'</h4>'+
                                        card+
                                    '</div>'+
                                    '<p class="addr ellipsis">'+ pn + ' ' + fn +' ' +dn +'</p>'+
                                '</div>'+
                                '<i class="arrow-r"></i>'+
                            '</a>'+
                            '<div class="inforbd" data-type="a" data-href="'+ href +'"><i class="s_map icon-dist"></i>到这里</div>'+
                        '</div>'+
                    '</div>'
        },
        // 搜索设施面板
        createHdPanel: function(maid,id,v,num,name){
            var ref = map.getAreaCenter($('#' + maid));
            var href = '#p=map_p2&ex=' + ref.x + '&ey='+ ref.y +'&efid='+map.fid +'&ename='+ escape(name);
            return '<div class="Mitem swiper-slide" data-id="'+ maid +'">'+
                            '<div class="inner">'+
                                '<div class="inforhd">'+
                                    '<div class="con">'+
                                        '<div class="tit">'+
                                            '<img src="'+ map.imgDir +'/icon_'+ v +'_h.png" width="20px"> '+
                                            '<h4>'+ (num? num+'. ' : '') +name +'</h4>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="inforbd" data-type="a" data-href="'+ href +'"><i class="s_map icon-dist"></i>到这里</div>'+
                            '</div>'+
                        '</div>';
        },
        // 搜索设施面板
        createParkPanel: function(maid){
            var ref = mapfn.posEntrance(maid);
            var name = shopName.getShopName(maid);
            var href = '#p=map_p2&ex=' + ref.x + '&ey='+ ref.y +'&efid='+map.fid +'&ename='+ escape(name);
            return '<div class="Mitem swiper-slide" data-id="'+ maid +'">'+
                            '<div class="inner">'+
                                '<div class="inforhd">'+
                                    '<div class="con">'+
                                        '<div class="tit">'+
                                            '<img src="'+ map.imgDir +'/ic_park_locpark.png" width="20px"> '+
                                            '<h4>' +name +'</h4>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="inforbd" data-type="a" data-href="'+ href +'"><i class="s_map icon-dist"></i>到这里</div>'+
                            '</div>'+
                        '</div>';
        },
        // 搜索标注icon
        createMark: function(maid,id,idx,x,y,num){
            return '<div id="'+ id +'" data-id="'+ maid +'" data-idx="'+ idx +'" class="map_marker map_marker11'+ (idx==0?' cur':'') +'" style="top:'+ (y-29) +'px;left:'+ (x-11) +'px;">'+ num +'</div>';
        },
        // 搜索公共设施标注
        hd: function(){
            var _this = this,
                v = map.opts.searchVal,
                name = hd.cont_hd[v],
                str_icon = '',
                str_div = '';
            $('._area_'+v).each(function(idx){
                var maid = $(this).attr('id'), // icon1
                    cxy = map.getAreaCenter($(this)),
                    _pos = map.id_calcPos(maid),
                    id = _this.getId(),
                    num = idx+1;

                str_icon += _this.createMark(maid,id,idx,_pos.x,_pos.y,num);
                str_div += _this.createHdPanel(maid,id,v,num,name);

                // 保存mark数据
                _this.markArr[maid] = {
                    x: cxy.x,
                    y: cxy.y,
                    id: id
                }
            })
            $('.ipt_sear').html(name);
            this.list_pos(str_div,str_icon);
        },
        // 滑动列表
        list_pos: function(str_div,str_icon){
            var _this = this;
            $('#mapsear_1 .swiper-wrapper').html(str_div);
            if(str_div!=''){
                $('#mapsear_1').show();
            }else{
                $('#mapsear_1').hide();
            }
            $('#searMark').html(str_icon);

            this.mySwiper && this.mySwiper.destroy();
            var swiper = this.mySwiper = new Swiper('.swiper-container', {
                slidesPerView: 1.1,
                centeredSlides: true,
                onSlideChangeEnd: function(obj){
                    var idx = obj.activeIndex,
                        id = $(obj.slides[idx]).data('id');
                    _this.mark_focus(id);
                }
            });
        },
        // 搜索店铺列表
        shop_base: function(data,type){
            var _this = this,
                str_icon = '',
                str_div = '';
            for(var i=0,n=data.length; i<n; i++){
                var item = data[i];
                if(type!=1){
                    var maid = shopName.getAreaInfo('bizId', item.ID, 'mapAreaId');
                }else{
                    var maid = shopName.getAreaInfo('bizId', item.sid, 'mapAreaId');
                }
                // 没有数据
                if(!maid || $('#'+maid).length==0){
                    continue;
                }

                var cxy = map.getAreaCenter($('#'+maid)),
                    _pos = map.id_calcPos(maid),
                    id = _this.getId(),
                    num = i+1;

                str_icon += _this.createMark(maid,id,i,_pos.x,_pos.y,num);
                item.maid = maid;
                item.idx = num;
                str_div += this.createShopPanel(item,type);

                // 保存mark数据
                this.markArr[maid] = {
                    x: cxy.x,
                    y: cxy.y,
                    id: id
                }
            }
            if(type==1){
                $('.ipt_sear').html('优惠信息');
            }
            if(type==3){
                $('.ipt_sear').html(data[0].Name);
            }
            this.list_pos(str_div,str_icon);
        },
        // 标注跟随地图位移
        mark_move: function(){
            var _this = this,
                list = this.markArr;
            // 列表
            for(var i in list){
                fn(list[i]);
            }
            // 临时
            fn(this.markAlone);
            function fn(item){
                if(!item){return false}
                var id = item.id,
                    x = item.x,
                    y = item.y,
                    pos = map.id_calcPos(x,y);
                $('#'+id).css({left:pos.x-11,top:pos.y-29});
            }
        },
        // 搜索标注绑定信息面板
        mark_focus: function(maid){
            var ele = this.markArr[maid],
                id = ele.id,
                x = ele.x,
                y = ele.y,
                area = map.shopViewPortArea(),
                x1 = area[0], y1 = area[1], x2 = area[2], y2 = area[3];
            $('#searMark .cur').removeClass('cur');
            $('#'+id).addClass('cur');

            // 判断是否在视口范围,不在的话自动移至视口内
            if (!(x1 < x && x < x2 && y1 < y && y < y2)) {
                map.getPointCenter(null, x, y);
            }
        }
    }

    /* 导航视图
     * 先获取导航路径,判断初始楼层,再进行地图展示
     * http://localhost:12308/Shop/map_p0?_mid=47#p=map_p1&mode=nav&sx=77.845&sy=65.407&fid=0&ex=757.882&ey=583.573&efid=0
     */
    var mapNav = {
        init: function(fid){
            this.steps = []; //跨层fid顺序
            this.formatData = [];

            this.getData(fid);
        },
        // 设置第几段, 非导航数据楼层,step设为-1
        setStep: function(n){
            this.step = n==undefined ? -1 : n;
        },
        getParam: function(){
            var opts = map.opts;
            return {
                sx: opts.sx,
                sy: opts.sy,
                sfid: map.fid,
                ex: opts.ex,
                ey: opts.ey,
                efid: opts.efid
            }
        },
        //sx=63.03&sy=62.719&fid=1&ex=73.002&ey=7.584&efid=0
        getData: function(fid){
            var _this = this;
            var d = this.getParam(),
                url = 'http://gisapi-t.mallcoo.cn/gis/GetGSegment?mid=' + mallId,
                p = map.opts,
                d = {
                    fpx: p.sx,
                    fpy: p.sy,
                    fpfid: p.fid,
                    tpx: p.ex,
                    tpy: p.ey,
                    tpfid: p.efid,
                    rm: 3
                };
            
            $.ajax({ url: url,
                data: d,
                success: function (res) {
                    if(typeof res == 'string'){
                        res = eval('(' +res + ')')
                    }
                    mapfn.dialog_userpos && mapfn.dialog_userpos.close();
                    if (res.m != 1) {
                        mapfn.dialog('导航失败,请重新导航', { buttons: false, modal: false, auto_close: 2000 });
                        return false
                    }
					if(res.gs==null){
						mapfn.dialog('导航失败,请重新导航', { buttons: false, modal: false, auto_close: 2000 });
						setTimeout(function(){
							history.go(-1);
						},2000)

						return
					}

                    //初始化,格式化数据
                    map.fid = fid;
                    _this.setStep(0);

                    _this.format(res.gs);

                    getSvg(fid);

                    // 初始化导航面板
                    _this.navTab(0)
                    // 楼层切换提示,点击功能
                    $('#pathTip').bind('click',function(){
                        var fid = $(this).data('f'),
                            step = parseInt($(this).data('step'));
                        mapNav.step = step;
                        mapfn.fnChangeFloor(fid)
                    })
                    // 退出导航
                    $('#quitNav').bind('click',function(){
                        history.go(-2)
                    })
                },
                error: function (res) {
                    mapfn.dialog('导航失败,请重新导航', { buttons: false, modal: false, auto_close: 2000 });
                }
            })
        },
        // 画点,路径
        draw: function(fid){
            var step = this.step;
            // 切换到非导航路线楼层,清除数据
            if(step==-1){
                return false
            }
            var d = this.formatData,
                points = d[step].point,
                steps =this.steps,
                id = d[step].id,
                sPoint = points[0],
                s_x = sPoint.X,
                s_y = sPoint.Y,
                ePoint = points[points.length - 1],
                e_x = ePoint.X,
                e_y = ePoint.Y,
                arr = [];

            // 画起点icon
            var ele_s = this.drawIcon(s_x, s_y,'s');
            var ele_e = this.drawIcon(e_x, e_y,'e');
            $('#navMark').html(ele_s+ele_e);

            //转化[x,y,x,y]
            for (var i = 0, n = points.length; i < n ; i++) {
                arr.push(points[i].X + ',' + points[i].Y);
            }
            this.drawLine(arr.join(' '));
            this.drawArrow(points);
            this.drawTip(step,steps,e_x,e_y);
        },
        // 切换导航楼层
        navTab: function(){
            var _this=this,
                s='',
                steps =this.steps,
                len = steps.length,
                fdata = map.opts.floorData,
                flag = false;
            for(var i=0;i<len;i++){
                var fid = steps[i],
                    cls='',
                    d = fdata[fid];
                if(map.fid==fid && !flag){
                    cls = 'cur';
                    flag = true;
                }
                s+='<li class="'+ cls +'" data-step="'+ i +'" data-f="'+ d.ID +'"><span class="floornum">'+ d.name +'</span><i class="s_map"></i></li>';
            }
            s = "<ul>"+s + "</ul>";
            $('.routelist').html(s);
            $('.routelist ul').width(118*len);
            $('#panel_nav_tab').show();
            $('#panel_nav_tab li').bind('click',function(e){
                var fid = $(this).data('f'),
                    idx = $(this).index(),
                    step = parseInt($(this).data('step'));
                if($(this).hasClass('cur')){return}
                // 可能1楼分2步,不同步骤也会触发导航数据
                mapNav.step = idx;
                mapfn.fnChangeFloor(fid)
            })
        },
        // nav tab面板
        statusNavTab: function(fid,step){
            $('#panel_nav_tab .cur').removeClass();
            this.clean();
            if(step != -1){
                $('#panel_nav_tab li').eq(step).addClass('cur');
            }
        },
        // 切换楼层提示
        drawTip: function(step,steps,x,y){
            var _this = this,
                nextIdx = step+1,
                next = steps[nextIdx],
                fdata = map.opts.floorData,
                pos = map.id_calcPos(x, y);
            if(next != undefined){
                $('#pathTip').css({'left':pos.x, 'top':pos.y-55}).html('到'+fdata[next].name).show();
                $('#pathTip').attr({'data-f':next,'data-step':nextIdx,'data-x':x, 'data-y':y});
            }else{
                $('#pathTip').html('').hide();
            }
        },
        // 判断起始点状态
        passFloor: function(type){
            var len = this.steps.length,
                step = this.step;
            // 起点状态, 在数组第1项,说明是起点,否则过渡点
            if(type=='s'){
                if(step==0){
                    return 'start'
                }
                return 'pass_start'
            }
            // 终点状态, 在数组最后项,说明是终点,否则过渡点
            if(type=='e'){
                if(step==len-1){
                    return 'end'
                }
                return 'pass_end'
            }
        },
        drawIcon: function(x,y,type,id){
            var pos = map.id_calcPos(x, y),
                status = this.passFloor(type,id),
                cls = '';
            if(status=='start'){
                cls = 'map_marker_star'
            }else if(status=='end'){
                cls = 'map_marker_end'
            }else if(status=='pass_start'){
                cls = 'map_marker11 cur'
            }else if(status=='pass_end'){
                cls = 'map_marker11'
            }
            return '<div class="map_marker '+ cls +'" data-x="'+ x +'" data-y="'+ y +'"  style="top:'+ (pos.y-29) +'px;left:'+ (pos.x-11) +'px;"></div>';
        },

        drawLine: function(path){
            var w = this.strokeWidth = 12;
            var pack = map.createSvgDom('g');
            pack.setAttribute('id', 'g_nav');
            var ele = map.createSvgDom('polyline');
            ele.setAttribute('points', path);
            ele.setAttribute('stroke-width', w / map.scale);
            ele.setAttribute("stroke", '#496ee3');
            ele.setAttribute("stroke-linecap", 'round');
            ele.setAttribute("fill", 'none');
            ele.setAttribute('id', 'navLine');
            pack.appendChild(ele);
            map.vp[0].appendChild(pack);

            // 放缩地图呈现路径
            this.trans_gps(pack);
        },
        drawArrow: function(point){
            var html = '', s = map.scale, gap = parseInt(50/s),
                dis = 0;
            for(var i=0,n=point.length; i<n-1; i++){
                if(i!=0){
                    var pos1 = map.id_calcPos(point[i].X, point[i].Y),
                        x = pos1.x-5, y = pos1.y-5,
                        pos2 = map.id_calcPos(point[i+1].X, point[i+1].Y),
                        angle = this.getAngle(pos1.x,pos1.y,pos2.x,pos2.y);
                    dis+= angle[1];
                    if(dis > 60){
                        html+= '<div class="arrow" data-x="'+ point[i].X +'" data-y="'+ point[i].Y +'" style="left:'+ x +'px;top:'+ y +'px;-webkit-transform:rotate('+angle[0]+'deg)"></div>';
                        dis=0;
                    }
                }
            }
            $('#pathArrow').html(html);
        },
        // 计算角度
        getAngle: function (x1, y1, x2, y2) {
            // 直角的边长
            var x = Math.abs(x1 - x2);
            var y = Math.abs(y1 - y2);
            // 斜边长
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            // 余弦
            var cos = y / z;
            // 弧度
            var radina = Math.acos(cos);
            // 角度
            var angle = 180 * radina / Math.PI;
            // 根据象限来计算旋转角度,与传统的度数相反,90度为顺时针90度
            // 注:地图坐标系(左上角0,0),X轴(左-右+),Y轴和传统坐标相反(上-下+)
            if(x1 > x2 ){
                if(y1 > y2 ){
                    // 第2象限
                    angle = 270-angle;
                }else if(y1 < y2){
                    // 第3象限
                    angle = 90+angle;
                }else{
                    angle = 180;
                }
            }else if(x1 < x2 ){
                if(y1 > y2 ){
                    // 第1象限
                    angle = -(90-angle);
                }else if(y1 < y2){
                    // 第4象限
                    angle = 90-angle;
                }else{
                    angle = 0;
                }
            }else{
                if(y1 > y2 ){
                    angle = 270;
                }else if(y1 < y2){
                    angle = 90;
                }
            }

            return [angle,z];
        },
        /* 提取当前层坐标点
         * 虚拟原始数据[3,2,2,3] 从一栋大厦3层去另一栋大厦3楼
         * 起点在3层下到2层,2层连走续2段(其中一段连体走廊),再去另一大厦3层终点
         *
         * [{id:sid, point:[]},{id:sid, point:[]}],
         */
        format: function (data) {
            var arr = [];
            for (var i = 0, n = data.length; i < n; i++) {
                var id = data[i].FloorID,
                    len = arr.length,
                    last = arr[len-1],
                    points = data[i].Points;
                if(arr.length==0 || last.id!=id){ // 跨层
                    var info = {
                        id: id, //楼层
                        point: points, //坐标点
                        node:[] //节点
                    }
                    arr.push(info);
                    this.steps.push(id);
                }else{
                    //紧挨的同楼层 仅合并point
                    var temp_arr = [];
                    temp_arr = temp_arr.concat(last.point, points);
                    last.point = temp_arr;

                    // 接缝处前两个点坐标
                    //var pos1 = points[0], pos2 = points[1];
                    //last.node.push([pos1.X,pos1.Y,pos2.X,pos2.Y]);
                }
            }
            this.formatData = arr;
        },
        // gps放缩
        zoom: function(){
            if(this.step==-1 || map.opts.mode!= 'nav' || !$('#navLine').length){
                return
            }
            var scale = map.scale,
                w = this.strokeWidth,
                points = this.formatData[this.step].point;
            $('#navLine')[0].setAttribute('stroke-width', w / scale);

            this.drawArrow(points);
        },
        move: function(){
            //
            $('#navMark .map_marker').each(function(){
                var x = $(this).data('x'),
                    y = $(this).data('y'),
                    pos = map.id_calcPos(x, y);
                $(this).css({left:pos.x-11, top:pos.y-29});
            })
            //
            var x1 = $('#pathTip').data('x'),
                y1 = $('#pathTip').data('y'),
                pos1 = map.id_calcPos(x1, y1);
            $('#pathTip').css({left:pos1.x, top:pos1.y-55});
            //
            $('#pathArrow .arrow').each(function(){
                var x = $(this).data('x'),
                    y = $(this).data('y'),
                    pos = map.id_calcPos(x, y);
                $(this).css({left:pos.x-5, top:pos.y-5});
            })
        },
        // 路线显示比率
        trans_gps: function (ele) {
            var d = ele.getBBox(),
                w = d.width,
                h = d.height,
                x = d.x,
                y = d.y,
                scale = this.ratio_trans_screen(w, h);
            map.getPointCenter(scale, x + w / 2, y + h / 2);
        },
        // 矩形与视口的占比,取缩放比率小的
        ratio_trans_screen: function (w, h) {
            var box_w = map.box_w, box_h = map.box_h,
                gap = map.opts.gpsGap * 2,
                r = Math.min((box_w - gap) / w, (box_h - gap) / h);
            //return Math.max(Math.min(5, r),1);
            return Math.min(5, r);
        },
        clean: function(){
            $('#pathArrow').empty();
            $('#pathTip').empty();
            $('#navMark').empty();
        }
    }

    // 选点视图
    var mapPick = {
        removeSePos: function () {
            $('#' + this.last_sepoint).removeClass('g_mark');
            $('#sePoint').hide();
            this.last_sepoint = null;
        },
        // 插入起始坐标
        setSePos: function (maid, p, name) {
            var src, ele, $area, _ref, x, y, cn_name, orin_ref, orin_x, orin_y, sid;
            // 存在
            if (this.last_sepoint == maid || !$('#' + maid).length) { return false };
            // 清除已存在的点
            if (this.last_sepoint) {
                this.removeSePos();
            }

            $area = $('#' + maid);
            $area.addClass('g_mark');

            _ref = map.id_calcPos(maid);
            x = _ref.x;
            y = _ref.y;

            orin_ref = mapfn.posEntrance(maid);
            orin_x = orin_ref.x;
            orin_y = orin_ref.y;

            sid = shopName.changeBizId;

            if (name == 'shop') {
                cn_name = shopName.getShopName(maid);
            } else {
                cn_name = hd.cont_hd[name];
            }

            var params = navSear.params || {};

            // 设置
            if (p == 'start') {
                params.sx = orin_x;
                params.sy = orin_y;
                params.sname = escape(cn_name);
                params.fid = map.fid;
            } else {
                params.ex = orin_x;
                params.ey = orin_y;
                params.ename = escape(cn_name);
                params.efid = map.fid;
            }
            var href = navSear.formatParam(params);
            $('#sePoint').css({ left: x, top: y }).data({href:'#p=map_p2&'+href, 'replace-href':'#p=map_p2&'+href}).show();
            this.last_sepoint = maid; //记录最后一次点id
        },
        move: function(){
            if(this.last_sepoint==null){return}
            var pos = map.id_calcPos(this.last_sepoint);
            $('#sePoint').css({ left: pos.x, top: pos.y });
        }
    }

    // 商户导航选点 p2
    var navSear = {
        init: function(){
            var _this = this;
            BtNav.triggerNav(0,'hideFollow');

            // 获取蓝牙
            if(!BtNav.isLoaded){
                BtNav.getBts(map.opts);
            }

            $('#svgFrame').hide();
            this.update();
            map.page = 'navSear';

			if($('#iptStart').val()=='' && !$('body').hasClass('noNavi')){
                $('#iptStart').val('我的位置');
                $('#iptStart').next().css('visibility','visible');
                _this.change_sear_pg(0);
            }

            mapfn.destroy();
            // 搜索框
            var temp_v = '';
            $('#searIptTxt').bind('input propertychange',function(){
                var v = $.trim($(this).val());
                if(temp_v==v){
                    return false
                }else{
                    temp_v = v;
                }
                if(v!=''){
                    _this.getList(v);
                }else{
                    _this.clearSearIpt();
                }
            })
            $('.gm-input').bind('click',function(){
                var v = $(this).val(),
                    name='';
                if($(this).is('#iptStart')){
                    _this.type = 'start';
                }else{
                    _this.type = 'end';
                }

                $('#searIptTxt').val(v);

                _this.change_sear_pg(1);
            })
            // 返回0
            $('#close_nav_1').bind('click',function(){
                _this.change_sear_pg(0);
            })
            // 选择搜索结果
            $('.sear_sugg_list').unbind().bind('click',function(e){
                var type = _this.type,
                    tar = e.target,
                    $tar = $(tar),
                    $li = $tar.closest('li'),
                    nodeName = tar.nodeName.toLowerCase();

                if($li.length || nodeName=='li'){
                    var d = $li.data(), name = unescape(d.name)
                    if(type=='start'){
                        $('#iptStart').val(name).data(d);
                        $('#iptStart').next().css('visibility','visible');
                    }else{
                        $('#iptEnd').val(name).data(d);
                        $('#iptEnd').next().css('visibility','visible');
                    }
                    _this.change_sear_pg(0);
                    //localStorage.sear_history = ;
                }
            })
            // 切换起始点
            $('#switchBox').bind('click',function(){
                _this.iptSwitch()
            })
            // 清空
            $('.suggestion-del').bind('click',function(){
                var id = $(this).data('id');
                _this.clearResult(id);
            })
            // 我的位置
            $('#lk_curLoc').bind('click',function(){
                if(_this.type=='start'){
                    $('#iptStart').val('我的位置');
                    $('#iptStart').next().css('visibility','visible');
                }else{
                    $('#iptEnd').val('我的位置');
                    $('#iptEnd').next().css('visibility','visible');
                }
                _this.change_sear_pg(0);
            })

            $('#readyNav').bind('click',function(e){
                if(!_this.s_ready || !_this.e_ready){
                    return false
                }
                var me = _this.isMe;
                mapfn.dialog_userpos = mapfn.dialog('正在定位中,请稍等', { buttons: false, modal: false});
                if(me){
                    return _this.callMyPos();
                }
            })
        },
        // 进入导航
        callMyPos: function(){
            var me = this.isMe,
                _this = this;
            var p = this.params = {
                sx: $('#iptStart').data('x'),
                sy: $('#iptStart').data('y'),
                fid: $('#iptStart').data('fid'),
                sname: escape($('#iptStart').val()),
                ex: $('#iptEnd').data('x'),
                ey: $('#iptEnd').data('y'),
                efid: $('#iptEnd').data('fid'),
                ename: escape($('#iptEnd').val())
            }
            var fid = BtNav.fid,
                x = BtNav.pos.x,
                y = BtNav.pos.y;

            if(fid==undefined){
                setTimeout(function(){
                    _this.callMyPos();
                },1000)
                return
            }

            if(me==1){
                p.sx = x;
                p.sy = y;
                p.fid = fid;
            }else if(me==2){
                p.ex = x;
                p.ey = y;
                p.efid = fid;
            }

            var s_p = this.s_param = this.formatParam(p);
            var href = '#p=map_p1&mode=nav&'+ s_p;
            // 拼接参数
            $('#readyNav').data('href',href);
            $('#readyNav').data('replace-href','#p=map_p2&'+ s_p);
            spa._showContent(href);
            return false;
        },
        // 快捷清除结果
        clearResult: function(id){
            var $ele = $('#'+id);
            $ele.data({x:'',y:'',fid:''}).val('');
            this.update();
        },
        // ipt为空时,suggestion变化
        clearSearIpt: function(){
            var $box = $('#sear_list');
            $box.find('ul').html('');
            $box.hide();
            $('#searIptTxt').val('');
        },
        // 切换选点页
        change_sear_pg: function(idx){
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
        },
        // 更新各种元素状态
        update: function(){
            var _this = this;
            this.isMe = 0;
            var p = this.params = {
                sx: $('#iptStart').data('x'),
                sy: $('#iptStart').data('y'),
                fid: $('#iptStart').data('fid'),
                sname: $('#iptStart').val(),
                ex: $('#iptEnd').data('x'),
                ey: $('#iptEnd').data('y'),
                efid: $('#iptEnd').data('fid'),
                ename: $('#iptEnd').val()
            }

            if(p.sname=='我的位置' && p.ename=='我的位置'){
                if(this.type=='start'){
                    this.clearResult('iptEnd');
                }else{
                    this.clearResult('iptStart');
                }
                return
            }

            // 清空按钮
            if(p.sname){
                this.s_ready = true;
                $('#iptStart').next().css('visibility','visible')
                if(p.sname=='我的位置'){ this.isMe = 1 }
            }else{
                this.s_ready = false;
                $('#iptStart').next().css('visibility','hidden')
            }
            if(p.ename){
                this.e_ready = true;
                $('#iptEnd').next().css('visibility','visible')
                if(p.ename=='我的位置'){ this.isMe = 2 }
            }else{
                this.e_ready = false;
                $('#iptEnd').next().css('visibility','hidden')
            }
            p.sname = escape(p.sname);
            p.ename = escape(p.ename);

            var s_p = _this.s_param = _this.formatParam(p);
            $('#readyNav').addClass('btn-disabled');
            $('#readyNav').data('href','');
            $('#readyNav').data('replace-href','');

            // 启动导航button
            if(this.s_ready && this.e_ready){
                $('#readyNav').removeClass('btn-disabled');
                if(!this.isMe){
                    $('#readyNav').data('href','#p=map_p1&mode=nav&'+ s_p);
                    $('#readyNav').data('replace-href','#p=map_p2&'+ s_p);
                }
            }
        },
        formatParam: function(p){
            var arr = [];
            for(var i in p){
                arr.push(i+'='+p[i]);
            }
            return arr.join('&')
        },
        getList: function(v){
            var _this = this,
                $box = $('#sear_list'),
                cacheSear = this.cacheSear || [];
            for(var i=0,n=cacheSear.length; i<n; i++){
                if(cacheSear[i].name== v){
                    $box.find('ul').html(cacheSear[i].d);
                    $box.show();
                    return false;
                }
            }

            $.ajax({
                url: 'SuggestList', //判断验证码
                type: 'post',
                data: {
                    keyword: v,
                    pageSize: 10
                },
                success: function (res) {
                    var data = res.entity;
                    var s = _this.createList(data);
                    $box.find('ul').html(s);
                    $box.show();
                    cacheSear.push({name:v, d: s});
                    _this.cacheSear = cacheSear;
                }
            })
        },
        createList: function(data){
            var s = '', len = data.length;
            if(len==0){
                return '<li><span>暂无数据</span></li>'
            }
            for (var i = 0, n = len; i < n; i++) {
                var d = data[i];
                s += '<li data-id="'+d.ID+'" data-name="'+ d.Name +'" data-fid ="' + d.FloorID + '" data-x="' + d.InnerLocation.X + '" data-y="' + d.InnerLocation.Y + '"><i class="icon_sp1 date-icon"></i><span><em>' + d.Name + '</em>' + d.SubCommercialTypeName + ' ' + d.BlockName + ' ' + d.FloorName + '</span></li>';
                if(i>=5){
                    break
                }
            }
            return s;
        },
        iptSwitch: function(){
            var ele_1 = $('#iptStart'),
                d1 = $.extend({},ele_1.data()),
                v1 = ele_1.val(),
                ele_2 = $('#iptEnd'),
                d2 = $.extend({},ele_2.data()),
                v2 = ele_2.val();
            ele_1.data(d2).val(v2);
            ele_2.data(d1).val(v1);
            this.update();
        }
    }

    // 搜索p3
    var globalSear = {
        init:function(){
            var _this = this;
            BtNav.triggerNav(0,'hideFollow');
            mapfn.destroy();
            $('#svgFrame').hide();
            map.page = 'globalSear';

            // 搜索框
            var temp_v = '';
            $('#global_sear_ipt').bind('input propertychange',function(){
                var v = $.trim($(this).val());
                if(temp_v==v){
                    return false
                }else{
                    temp_v = v;
                }
                if(v!=''){
                    navSear.getList(v);
                }else{
                    navSear.clearSearIpt();
                }
            })

            // 选择搜索结果
            $('.sear_sugg_list').unbind().bind('click',function(e){
                var type = _this.type,
                    tar = e.target,
                    $tar = $(tar),
                    $li = $tar.closest('li'),
                    nodeName = tar.nodeName.toLowerCase();

                if($li.length || $nodeName=='li'){
                    var d = $li.data(),
                        id= $li.data('id'),
                        fid= $li.data('fid'),
                        href = '';
                    // 暂无数据
                    if(id==undefined){ return }
                    href = '#p=map_p1&mode=shop&fid='+ fid +'&searchType=3&searchVal='+ id;
                    spa._showContent(href);
                }
            })
        }
    }

    /*
     * 通过二分法，快速定位x轴，并以x为中心，分别往左右两侧循环
     *
     * 先查找右测, 以原始点到 x轴第一个点的直线间距为 半径的 x值范围（超出半径退出循环）

     * 对比出最小间距，并以此为最新半径, 记住索引 */
    var loc = {
        attachToPath : function(path, pnt, affinity) {
            if (!path || path.length==0) {
                return pnt;
            }
            var i = this.bsearch(path, 0, path.length - 1, pnt.x);
            var d2 = Number.MAX_VALUE;
            var d = Number.MAX_VALUE;
            var choice = -1;
            for (var j = i; j <= path.length - 1; j++) {
                if(!fac(j)){
                    break;
                }
            }
            for (var j = i - 1; j >= 0; j--) {
                if(!fac(j)){
                    break;
                }
            }
            var x = path[choice][0];
            var y = path[choice][1];
            affinity = Math.max(0, Math.min(1, affinity));
            var xx = x * affinity + pnt.x * (1 - affinity);
            var yy = y * affinity + pnt.y * (1 - affinity);
            function fac(idx){
                var xd = Math.abs(pnt.x - path[idx][0]);
                if (xd > d) {
                    return
                }
                var tmpd2 = Math.pow((pnt.x - path[idx][0]),2) +  Math.pow((pnt.y - path[idx][1]),2);
                if (tmpd2 < d2) {
                    choice = idx;
                    d2 = tmpd2;
                    d = Math.sqrt(d2);
                }
                return true
            }

            return {x: xx, y: yy};
        },
        // [p,r]: 从0到结束, v: x
        bsearch: function(path, p, r, v) {
            if (p == r) {
                return p;
            }
            m = ((p + r) / 2) | 0;
            if (path[m][0] == v) {
                return m;
            } else if (path[m][0] > v) {
                return arguments.callee(path, p, m, v);
            } else {
                return arguments.callee(path, m + 1, r, v);
            }
        }
    }

    Array.prototype.contains = function (item) {
        return RegExp("\\b" + item + "\\b").test(this);
    };

    //获取地图
    function getSvg(fid) {
        map.isLoaded = false;
        var svg = map.building && map.building[fid],
            fdata = map.opts.floorData;
        if(mapfn.orinFloorData.length==0){
            $("#svgBox").html('<p class="nodata">抱歉，地图正在开发中！<br/>请返回<a href="javascript:history.go(-1)">上一页</a></p>');
            $("#svgBox").css('visibility', 'visible');
            $('.sear_f_box').hide();
            $('.icon-compass').hide();
            return
        }
        map.floorName = map.opts.floorData && fdata[fid].name;

        $("#svgBox").css('visibility', 'hidden')
        $('#g_txt').html('');
        $('#changeFloor').html(map.opts.floorData[fid].name);
        map.loadSvg = mapfn.dialog('', { buttons: false, show_close_button: false, modal: false, custom_class: 'ZebraDialog_loading' });
        if(svg==undefined){
            $.ajax({
                type: "POST",
                data: { floorID: fid },
                url: "/Shop/GetSVG",
                success: function (d) {
                    if(d.st==0){
                        map.loadSvg.close();
                        $("#svgBox").html('<p class="nodata">抱歉，此楼层不对外开放！<br/>请切换其他楼层</p>');
                        $("#svgBox").css('visibility', 'visible');
                        return
                    }
                    $("#svgBox").html(d.res);
                    shopName.getShopList(fid);
                    mapfn.svgCache(fid,d.res);
                },
                error: function (res) {
                    mapfn.dialog("稍等, 正在重新请求")
                    location.href = location.href;
                }
            });
        }else{
            $("#svgBox").html(svg);
            shopName.getShopList(fid);
        }
    }

    // 初始化
    function initialize(options){
        map.setOpt(options);
        var mode = map.opts.mode;
        var fid = map.opts.fid;
		var pageid = '';
        var params = Params.getAll(Hash.getWindowHash());
        if(!mapfn.path_sort){
            mapfn.getPath(tParams.mid);
        }

        // 记录页面名称
        map.page = mode;
		pageid = 'pg_'+ mode;

        // 停车场
        if(mode=="park"){
			var parkfn = params.parkfn;
            fid = params.floorid;
			pageid = ' pg_' + parkfn;

            // 寻找停车楼层
            if(fid==null){
                fid = Map.Park.getParkFloor(floorData)
            }
            $("#svgBox").addClass('svg_park');
        }
        map.fid = fid;

        // 获取蓝牙
        if(!BtNav.isLoaded){
            BtNav.getBts(map.opts);
        }
        $('body').attr('id',pageid)

        if(mode=='nav'){
            mapNav.init(fid);
            BtNav.triggerNav(1);
        }else if(mode=='shop' || mode=='point' || mode=="park"){
            // 搜索结果状态取消跟随
            if(mode=='shop' && params.searchVal == undefined){
                BtNav.triggerNav(1);
            }
            mapfn.createFloor(fid);
            // 单击地图
            $('#svgFrame').unbind().bind('click',function (e) {
                mapfn.act(e);
                e.stopPropagation();
            })
            getSvg(fid);
        }
    }

    // 模拟线程
    function Thread(){
        // 导航计数,提示失败
        //BtNav.fail();

        setTimeout(function(){
            Thread();
        },1000)
    }

    // 预绑定
    $('.wrap').bind('click',function(e){
        var tar = e.target,
            $tar = $(tar),
            $changefloor = $tar.closest('#changeFloor'),
            $maplocal = $tar.closest('#mapLocal'),
            $inforhd = $tar.closest('.inforhd');

        // 切换楼层
        if($changefloor.length){
			if($('#pg_findcar').length){return}
            $('#floorPanel').mobiscroll('show').mobiscroll('setVal',map.fid);
            return false;
        }
        // 定位显示居中
        if($maplocal.length){
            BtNav.triggerNav(1);
        }
    })

    var BtNav = {
        isLoaded: false,
        //结果
        pos: {},
        listTime: 0,
        // 定位计时,超过4s,提示失败
        times:0,
        // 获取蓝牙
        getBts: function(opts){
            var _this = this;
            this.opts = opts;
            $.ajax({
                url:'/map/getbts',
                success: function(res){
                    var _ = _this;
                    d = JSON.parse(res).d;
                    if(!Object.keys(d).length){
                        return
                    }
                    _.isLoaded = true;
                    _.bt_data = d;
                }
            })
        },
        zoom: function(){
            if(!this.isLoaded){return}
            var scale = map.scale,
                opts  = this.opts,
                r = opts.circle_size/scale,
                font = opts.fontsize/scale;
            $('#followBox').attr('r', r);
        },
        fail: function(){
        },
        // 获取单层蓝牙
        floorBts: function(fid, d){
            var obj = {};
            obj = d.filter(function(item){
                return ''+item.floorID == fid;
            })
            return obj[0].bluetooth_group;
        },

        /* 定位
         * getLoc 是另一个线程, 跟svg加载是分开的, svg加载时不进行定位
         *
         */
        getLoc: function(d){
            if(!this.isLoaded){ return }
            var _this = this;
            var list1 = this.list1 || [];

            // 循环每个新数据,重复的不添加, 过滤小于-95的信号
            for(var i=0; i<d.length; i++){
                if(parseInt(d[i].rssi) < -100 || parseInt(d[i].rssi) > -1){
                    continue;
                }
                var temp_arr = this.filterMac(list1, d[i]);
                if(temp_arr.length==0){
                    list1.push(d[i]);
                }
            }
            this.listTime += 1;

            // 个数大于3 或者 3次过后
            if (list1.length >= 3 || this.listTime >= 2 && list1.length>0) {
                // 过滤有效楼层数据
                var filterData = this.filterFloor(list1),
                    fid = this.fid = filterData.fid,
                    // x,y
                    pos = this.pos = this.calc(filterData.list);

                this.listTime = 0;
                this.list1 = list1 = [];

                if(!map.isLoaded){ return }

                // 不同楼层，切换地图
                if(fid != undefined && (map.fid != fid)){
                    if(this.openFollow){
                        // 切换地图,跟随
                        mapfn.fnChangeFloor(fid,true);
                    }
                }else{
                    this.show(pos);
                }
            }
            this.list1 = list1;
        },
        // 核心定位
        calc: function(d){
            if(d==undefined){return}

            // 取最大的4条,先排序再截取
            d = this.rssiSort(d);
            d = d.slice(0,4);

            var obj = {};
            switch(d.length){
                case 1:
                    obj = {x: d[0].x, y: d[0].y}
                    break;
                case 2:
                    obj = this.two_points(d);
                    break;
                case 3:
                    // 是否为钝角
                    var angle = this.getAngle(d);
                    if(!angle){
                        d = this.rssiSort(d);
                        d = d.slice(0,2);
                        obj = this.two_points(d)
                    }else{
                        obj = this.more_points(d);
                    }
                    break;
                case 4:
                    obj = this.more_points(d);
                    break;
            }
            return obj;
        },
        // 找最近第3点,先粗略过滤20米内的蓝牙,然后再细算距离
        nearBT: function(p1,p2){
            var x1 = p1.x, y1=p1.y,
                x2 = p2.x, y2=p2.y;
            // 2点间的中心点
            var x = (x1 + x2)/2,
                y = (y1 + y2)/2;
            // 15米内
            var list = this.floorBts(this.fid, this.bt_data.floor);
            var temp_list = list.sort(function(a,b){
                var dis1_x = Math.abs(x - a.x),
                    dis1_y = Math.abs(y - a.y),
                    dis2_x = Math.abs(x - b.x),
                    dis2_y = Math.abs(y - b.y),
                    dis1 = Math.sqrt(Math.pow(dis1_x, 2) + Math.pow(dis1_y, 2)),
                    dis2 = Math.sqrt(Math.pow(dis2_x, 2) + Math.pow(dis2_y, 2));
                return dis1 - dis2;
            })
            // 过滤原来的2个
            var i=0, BT;
            while(i<3){
                var t_x = temp_list[i].x,
                    t_y = temp_list[i].y;
                if(t_x==x1 && t_y==y1 || t_x==x2 && t_y==y2){
                    i++;
                    continue;
                }else{
                    BT = temp_list[i];
                    break;
                }
            }
            return {x:BT.x,y:BT.y}
        },
        // 取最大的4条,先排序再截取
        rssiSort: function(d){
            return d.sort(function(a,b){
                return parseInt(b.rssi) - parseInt(a.rssi);
            })
        },
        // 2点定位, a平方+b平方-c平方除以 2*a*c
        two_points: function(arr){
            var p1 = arr[0],
                p2 = arr[1],
                p3 = this.nearBT(p1,p2);

            // 最强信号半径
            var r = this.disRssi(p1.rssi);

            // 在近圆(12边形)顶中寻找离其他两点的最近点
            var arr2 = [];
            for(var times=0; times<12; times++){
                var radina = (Math.PI / 180) * times * 30;
                var X = p1.x + Math.cos(radina) * r;
                var Y = p1.y + Math.sin(radina) * r;
                arr2.push({x:X, y:Y});
            }

            // 遍历360个点分别到p2,p3的总长度排序
            arr2 = arr2.sort(function(a,b){
                function dis(p1,p2){
                    return Math.sqrt(Math.pow(Math.abs(p1.x-p2.x),2) + Math.pow(Math.abs(p1.y-p2.y),2));
                }
                var dis1 = dis(p2,a) + dis(p3,a);
                var dis2 = dis(p2,b) + dis(p3,b);
                return dis1 - dis2
            })
            return {x: arr2[0].x, y:arr2[0].y};
        },
        // 求最终x,y
        more_points: function(arr){
            var a1 = [],
                _this = this,
                v_x=0,
                v_y=0,
                v=0;

            arr.forEach(function(item){
                var r = _this.disRssi(item.rssi);
                var w = disRssi_ratio(r);
                v_x += w*item.x;
                v_y += w*item.y;
                v += w;
            })
            return {x: v_x/v, y: v_y/v};

            // 根据距离求权值
            function disRssi_ratio(dis){
                return 1/Math.pow(dis,2);
            }
        },
        // 根据3边计算角度是否为钝角
        getAngle: function(d){
            var p1 = d[0], p2 = d[1], p3 = d[2],
                b = this.fn_z(p1,p2),
                c = this.fn_z(p1,p3),
                a = this.fn_z(p2,p3),
                cosA = (Math.pow(b,2) + Math.pow(c,2) - Math.pow(a,2)) / (2*b*c),
                cosC = (Math.pow(a,2) + Math.pow(b,2) - Math.pow(c,2)) / (2*a*b),
                angleA = parseInt(fn_angle(cosA)),
                angleC = parseInt(fn_angle(cosC)),
                angleB = 180-angleA-angleC;

            if(angleA > 90 || angleB>90 || angleC>90){
                return false
            }
            return false

            //转角度
            function fn_angle(cos){
                var radina = Math.acos(cos);
                return 180 * radina / Math.PI;
            }
        },
        // 求三边长
        fn_z: function(p1,p2){
            var x = Math.abs(p1.x - p2.x);
            var y = Math.abs(p1.y - p2.y);
            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        },
        // 根据信号强度求距离
        disRssi: function(rssi){
            var b = this.bt_data;
            var A = $('#A').val() || b.oneMeterRssiA;
            var N = $('#N').val() || b.attenuationFactorN;
            var a = (rssi-A)/(-10*N);
            return Math.pow(10,a);
        },
        // 搜集mac信息
        filterMac: function(arr,obj){
            return arr.filter(function(item){
                return item.major == obj.major && item.minor == obj.minor;
            });
        },
        // 过滤楼层数据
        filterFloor: function(d){
            var f = this.bt_data.floor;

            /* 过滤第二步,
             * 重组数据,合并同楼层{fid:[{"major":10025}]}
             */
            var list2 = {};
            for(var i=0; i< d.length; i++){
                for(var j=0; j< f.length; j++) {
                    var fid = f[j].floorID;
                    var a2 = f[j].bluetooth_group.filter(function(item){
                        return item.major == d[i].major && item.minor == d[i].minor
                    })
                    // 匹配楼层中的蓝牙
                    if(a2.length>0){
                        list2[fid] = list2[fid] || [];
                        // d[i] 微信数据(信号值), a2后台蓝牙数据, 合并成(x,y,rssi,major,minor)
                        a2[0].rssi = d[i].rssi;
                        list2[fid].push(a2[0]);
                    }
                }
            }

            // 个数排序(提取最多的楼层)
            var firstLen = 0;
            // 楼层
            var key;
            $.each(list2, function(i,item){
                var n=item.length;
                if(firstLen < n){
                    firstLen = n;
                    key = i;
                }
            })
            return {fid: key, list: list2[key]}
        },
        show: function(d){
            if(!d.x){ return }
            var el = $('#followBox'), d1, _ref, x, y, scale = map.scale;
            if(this.firstTriggerFollow){
                scale = map.opts.followScale;
            }
            if(map.page=="navSear" || map.page=="globalSear"){
                el.hide();
                return
            }

            // 获取吸附点
            d1 = loc.attachToPath(mapfn.path_sort, {x: d.x, y: d.y }, 1);

            this.last_loc_x = d1.x;
            this.last_loc_y = d1.y;

            if(this.openFollow){
                map.getPointCenter(scale, d1.x, d1.y);
            }
            _ref = map.id_calcPos(d1.x, d1.y);
            x = _ref.x;
            y = _ref.y;
            $('#followBox').css({ left: x, top: y }).show();
        },
        // 定位开关
        /*
         * hideFollow 隐藏点
         * stopSearch 关闭扫描
         * */
        triggerNav: function(flag, hideFollow, stopSearch){
            hideFollow = (hideFollow=='hideFollow' ? true : false);
            stopSearch = (stopSearch=='stopSearch' ? true : false);
            if(!isFromMp){
                return
            }
            var el = $('#mapLocal'),
                _ref, x1, y1, x1, y1;
            if(flag){
                // 触碰跟随标识, 为了自动放大地图跟随,其他时候不放大
                this.firstTriggerFollow = true;
                el.addClass('icon-follow');
                this.openFollow = true;
                if(!this.status_searchBeacons){
                    this.wxSearchBeacons();
                }

                x = BtNav.last_loc_x;
                if(x==undefined){return}
                y = BtNav.last_loc_y;
                _ref = map.id_calcPos(x, y);
                x1 = _ref.x;
                y1 = _ref.y;
                $('#followBox').css({ left: x1, top: y1 }).show();
                map.getPointCenter(this.opts.followScale, x, y);
            }else{
                el.removeClass('icon-follow');
                this.openFollow = false;
                this.firstTriggerFollow = false;
                if(hideFollow){
                    $('#followBox').hide();
                }
                if(stopSearch){
                    wx.stopSearchBeacons();
                    this.status_searchBeacons = false;
                }
            }
        },
        wxSearchBeacons: function(){
            var _this = this;
			if($('body').hasClass('noNavi')){return}
            try{
                wx.ready(function(){
                    _this.status_searchBeacons = true;
                    wx.startSearchBeacons({
                        complete: function (arg) {
                            var msg = arg.errMsg.split(':')[1];
                            switch(msg){
                                case 'bluetooth power off':
                                    alert('蓝牙未打开，请在设置中打开');
                                    _this.triggerNav(0,'hideFollow','stopSearch');
                                    break;
                                case 'system unsupported':
                                    alert('系统不支持定位')
                                    _this.triggerNav(0,'hideFollow','stopSearch');
                                    break;
                            }
                        }
                    });

                    wx.onSearchBeacons({
                        complete: function (argv) {
                            // 所有的蓝牙设备
                            var beacons = argv.beacons;
                            BtNav.getLoc(beacons);
                        }
                    });
                });
            }catch(err){

            }
        }
    }

    var Park = {
        init: function(){
            var parkfn, sid, maid, name, pid, paytype, parktype, fid;

            var params = Params.getAll(Hash.getWindowHash());
            parkfn = this.parkfn = params.parkfn;
            sid = params.sid;
            pid = params.pid;
            cph = escape(params.cph)||'';
            paytype = params.paytype;
            parktype = params.parktype;
            maid = shopName.changeBizId(sid);
            name = shopName.getShopName(maid);
            fid = map.fid;
            // 车位+楼层+楼栋
            info = '';

            // 找车,缴费
            if(parkfn=="findcar"){
                var floorName = map.floorName;
                if (mallId == '110') {
                    info = shopName.getShopName(maid) + " " + shopName.getAreaName(maid) + "区";
                } else if(mallId == '152'){
                    info = shopName.getAreaName(maid) + "区"+" "+shopName.getShopName(maid);
                }else {
                    info = shopName.getShopName(maid);
                }

                if(mallId=='42'){
                    floorName = params.floorname;
                }

                $('#park_info_pay .name').html(floorName + ' ' + info);
                $('#park_info_tip').hide();
                $('#park_info_pay').show();
                var _ref = map.getAreaCenter($('#'+ maid)),
                    href='#p=map_p2&ex='+ _ref.x +'&ey='+ _ref.y +'&efid='+ fid + '&ename='+ name,
                    html = '<div class="park_go" data-type="a" data-href="'+ href +'"><i class="s_map icon-dist"></i>到这里</div>';
                $('#mapsear_2').html(html).css({height:'40px'}).show();
                this.createFlag(maid);
				if(!isSupportPay){
					$("#pay_park").hide();
				}
            }

            // 记住车位
            $('#mark_park').click(function () {
                sid = $(this).data('sid');
				name = shopName.getAreaInfo('bizId', sid, 'name');
                // 是否已有停车记录，提示覆盖确认
                if (sid) {
                    $mcConfirm('点击确认将覆盖之前的停车记录！', '提示', function () {
                        location.href = '/v2/park/doaddparklog?sid=' + sid + '&name=' + name + '&fid=' + fid + '&pid=' + pid;
                    })
                }
            })

            // 去缴费
            $('#pay_park').click(function () {
                if (mallId == 119) {
                    window.location.href = "/V2/Park/ParkPay?pid=" + pid + "&id=" + cph;
                }
                else if (mallId == 42)
                {
                    window.location.href = "/V2/Park/ParkPayShdyc?pid=" + pid + "&id=" + cph;
                }
                else if (mallId == 152) {
                    window.location.href = "/V2/Park/ParkScanning?parkId=" + pid + "&parktype=" + parktype + "";
                }
                else if (mallId == 114 || mallId == 111) {
                    window.location.href = "/V2/Park/ParkingCardNo?parkid=" + pid + "&parktype=" + parktype + "";
                }
                else {
                    if (paytype == 0) {
                        window.location.href = "/V2/Park/ParkingCardNo?parkid=" + pid + "&parktype=" + parktype + "";
                    }
                    else if (paytype == 1) {
                        if(!isFromMp){
                            window.location.href = "/V2/Park/ParkingTicket?parkid=" + pid + "&parktype=" + parktype + "";
                        }
                        else {
                            mapfn.dialog('请不要在此微信上打开此页面', { buttons: false, modal: false, auto_close: 2000 });
                        }
                    }
                    else if (paytype == 2) {
                        window.location.href = "/V2/Park/ParkScanning?parkId=" + pid + "&parktype=" + parktype + "";;
                    }
                }
            })
        },
        // 停车状态
        markParking_status: function (fid){
            var _this = this, that = this;
            //车位信息
            $.ajax({
                type: "POST",
                data: { floorID: fid},
                url: "/V2/Park/GetInfo",
                success: function (res) {
                    res = eval('(' + res + ')');
                    var dataCarList = res;
                    if (!dataCarList) { return false; }
                    $('._area_parking').removeClass('parking_disable');
                    for (var i = 0, n = dataCarList.length; i < n; i++) {
                        var maid = shopName.changeBizId(dataCarList[i].id);
                        if (!maid) { return false }
                        var ele = document.querySelector('#' + maid);
                        if (!ele) {
                            continue;
                        }
                        ele.setAttribute('class', '_area_parking parking_disable');
                    }
                },
                error: function (res) {
                   mapfn.dialog("系统出故障，请稍后再试！")
               }
            });
        },
        getParkFloor: function(d){
            var arr = d.filter(function(item){
                return item.IsHavePark == true
            })
            return parseInt(arr[arr.length-1]["ID"])
        },
        markPark: function (maid) {
            var _this = this, $area = $('#' + maid);
            if (this.id_markPark == maid) { return false };
            // 已停车|铺位不存在|商铺 禁用, 不再记住车位
            if ($area.hasClass('parking_disable') || !$area.length || $area.hasClass('_area_merchant')) {
                this.closeParkPos();
                return false;
            }
            this.id_markPark && $('#' + this.id_markPark).removeClass('g_mark');
            $area.addClass('g_mark');
            var info;
            if (mallId == '110') {
                info = shopName.getShopName(maid) + " " + shopName.getAreaName(maid) + "区";
            }
            else {
                info = shopName.getShopName(maid);
            }
            var sid = shopName.changeShopId(maid),
                fid = map.fid,
                fname = map.floorName;
            $('#park_info_mycar .name').html(info);
            $('#park_info_tip').hide();
            $('#park_info_mycar').show();
            this.createFlag(maid);
            $('#mark_park').data('sid', sid);
            this.id_markPark = maid;
        },
        // type 设施(icon)或铺位(空)
        createFlag: function (maid, type) {
            var type = type || '',
                $area = $('#' + type + maid);
            src = map.imgDir + 'location@2x.png',
            _ref = map.getAreaCenter($area),
            x = _ref.x,
            y = _ref.y,
            ele = map.createIcon(x, y, 17, 26, 17 / 2, 20, src);
            ele.setAttribute('id', 'g_markcar');
            map.vp[0].appendChild(ele);
        }
    }

	var Manager = {
		init : initialize,
        map: map,
        mapfn: mapfn,
        getSvg: getSvg,
        mapNav: mapNav,
        navSear: navSear,
        globalSear: globalSear,
        Park: Park
	};
    
    // 是否有导航, true(有)
    var isNavi = !$('body').hasClass('noNavi');
    var isRoute = !$('body').hasClass('noRoute');

    function createStyle(url){
        var link = document.createElement('link');
            link.setAttribute('rel','stylesheet')
            link.setAttribute('type','text/css')
            link.setAttribute('href',url);
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(link)
    }
    createStyle( resEnv +'/map/v1/style.css')

    if(isNavi){
        BtNav.wxSearchBeacons();
    }

    // 方位
    var angle_z;
    if(window.DeviceMotionEvent){
        window.addEventListener('deviceorientation', function(event){
            angle_z = event.webkitCompassHeading || (360- event.alpha);
            $('#followBox img')[0].style.webkitTransform = 'rotate('+ angle_z +'deg)';
        }, false );
    }
	return Manager;
})()
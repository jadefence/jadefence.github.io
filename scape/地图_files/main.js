(function(){
    var loadJs = function (src, fun){
        var script = null;
        script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src + "?_=" + Date.now();
		//script.src = src;
        if (typeof fun === "function") {
            script.onload = fun;
        }

        document.getElementsByTagName("head")[0].appendChild(script);
    }

    // 正式版配置
    var mall = {
        179:'wifi', // 高桥
        191:'wifi', // 汇金星力城
        176:'wifi', //丽江国际
        177: 'wifi'
    }

    var config = {
        'test_bt': resEnv +'/map/v1/map_test_bt.js',
        'test_wifi': resEnv +'/map/v1/map_test_wifi.js',
        'master_bt': resEnv +'/map/v1/map_bt.js',
        'master_wifi': resEnv +'/map/v1/map_wifi.js'
    }
    $(function(){
        var param = GetQueryString('dev'),
            type = 'bt';
        if(mall[mallId]){
            type = 'wifi';
        }
		if(param){
			type = 'test_'+ type;
			loadJs( resEnv +'/libs/vconsole/debug.js')
		}else{
			type = 'master_'+ type;
		}
        loadJs(config[type], function(){
            loadJs(resEnv + '/map/v1/map_base.js')
        });
    })
})()
$mcShare = {}
function isWeiXin(){
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger'){
		return true;
	}else{
		return false;
	}
}
var isFromMp = false;
if(isWeiXin()){
	isFromMp = true
}
// 微信端隐藏头部

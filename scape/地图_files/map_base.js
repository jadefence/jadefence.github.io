//static class functions
var Hash = {
    onChange : function()
    {
        log('hashchange, ignore:' + ignoreHashChange);
        if(ignoreHashChange)
            ignoreHashChange = false;
        else
        {
            pageParams = null;

            var pageID = Params.get(pageIDParam);
            if(pageID == null)
                pageID = startPageID;

            log('calling setup');
            Page.setup(pageID, true);
        }
    },
    setParams : function(paramsObj, mergeWithExistingParams)
    {
        mergeWithExistingParams = mergeWithExistingParams === true;
        var hash = this.getWindowHash();
        var params = hash == '' ? [] : hash.split("&");
        var newParams = paramsObj;
        var paramsOrder = [];

        var paramsArr = [];

        if(mergeWithExistingParams)
        {
            for(var paramIndex=0, paramCount=params.length; paramIndex<paramCount; paramIndex++)
            {
                var param = params[paramIndex];
                var eqIndex = param.indexOf("=");
                var hasValue = eqIndex != -1;
                if(hasValue)
                {
                    var paramValue = param.substring(eqIndex+1);
                    var paramName = param.substring(0, eqIndex);
                }
                else
                {
                    var paramName = param;
                    var paramValue = null;
                }

                //need to keep the same hash order, so we'll just store the order for now
                paramsOrder.push(paramName);

                if(newParams[paramName] == null)
                {
                    newParams[paramName] = paramValue;
                }
            }

            //use the order we discovered to add the params to the hash
            for(var paramIndex=0, paramCount=paramsOrder.length; paramIndex<paramCount; paramIndex++)
            {
                var paramName = paramsOrder[paramIndex];
                if(newParams[paramName] != '')
                    paramsArr.push(paramName + '=' + newParams[paramName]);
                else
                    paramsArr.push(paramName);

                delete newParams[paramName];
            }
            for(var paramName in newParams)
            {
                if(newParams[paramName] != '')
                    paramsArr.push(paramName + '=' + newParams[paramName]);
                else
                    paramsArr.push(paramName);
            }
        }
        else
        {
            for(var paramName in newParams)
            {
                if(newParams[paramName] != '')
                    paramsArr.push(paramName + '=' + newParams[paramName]);
                else
                    paramsArr.push(paramName);
            }
        }

        var updatedHash = paramsArr.join("&");
        if(window.location.hash != ('#'+updatedHash))
            ignoreHashChange = true;

        window.location.hash = updatedHash;
    },
    getWindowHash : function()
    {
        return window.location.hash.substring(1); //remove # prefix
    },
    clear : function()
    {
        window.location.hash = '';
    }
};
var Params = {
    clearAll : function()
    {
        Hash.clear();
        pageParams = null;
    },
    getAll : function(hash)
    {
        var params = hash.split("&");
        var pageParams = {};
        for(var paramIndex=0, paramCount=params.length; paramIndex<paramCount; paramIndex++)
        {
            var param = params[paramIndex];
            if(param != "")
            {
                var paramNameEnd = param.indexOf("=");
                if(paramNameEnd == -1)
                    paramNameEnd = param.length;

                var paramName = param.substring(0, paramNameEnd);
                paramName = unescape(paramName);

                var paramValue = param.substring(paramNameEnd+1);
                paramValue = unescape(paramValue);

                pageParams[paramName] = paramValue;
            }
        }

        return pageParams;
    },
    get : function(hash,paramName)
    {
        var pageParams = this.getAll(hash);
        return pageParams[paramName];
    },
    set : function(paramsObj, mergeWithExistingParams)
    {
        Hash.setParams(paramsObj, mergeWithExistingParams);
    }
};
// 获取URL参数 e.g. map.html?sid=122134
function getUrlParam(s,name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //var r = window.location.search.substr(1).match(reg);
    var r = s.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]); return null;
}

function bbSPA(){
} ;
var bbSPAProto = bbSPA.prototype ;
bbSPAProto._getDefaultHash = function(){
    return window.location.hash ;
} ;
bbSPAProto._parseHash = function(hash){
    return hash.split("#")[1] ;
} ;
bbSPAProto._fnPopStateHandler = function(target){
    var that = this ;
    var query = this._getDefaultHash() ;
    if(!query){
        var d = '#p=map_p1&mode=shop&fid='+fid;
        this._addToHistory(d,true) ;
        that._showContent(d);
    }
    else{
        that._showContent(query) ;
    }
} ;
bbSPAProto._showContent = function(action,flag){
    var that = this ;
    this._loadContent(action,function(data){	
        if(flag!=false && action.substring(1)!=Hash.getWindowHash()){
            that._addToHistory(action,false) ;
        }
        that._renderContent(data) ;
    });
} ;
bbSPAProto._loadContent = function(url,callback){
    url = url.substring(1);
    var p = Params.get(url,'p');
    var para = Params.getAll(url);
    switch(p){
        case 'map_p1':
            break;
    }
    return $.ajax({
        url : '/shop/'+ p ,
        type : "get",
        data:para,
        success:function(res){
            callback(res)
        },
        error:function(){
            throw new Error("load content error !");
        }
    }) ;
} ;
bbSPAProto._renderContent = function(text){
    $('.wrap').html(text)
} ;
bbSPAProto._addToHistory = function(hash,noState){
    var stateObj = {
        hash : hash
    } ;
    if(noState){
        window.history.replaceState(stateObj,"",hash) ;
    }
    else{
        window.history.pushState(stateObj,"",hash) ;
    }
} ;
bbSPAProto._isSupportH5History = function(){
    return !!("pushState" in window.history) ;
} ;
bbSPAProto.init = function(){
    var that = this ;
    if(!this._isSupportH5History()){
        throw new Error("Not Support H5 History API !") ;
    }
    $(document).bind('click',function(e){
        var tar = e.target,
            $tar = $(tar),
            $a = $tar.closest('[data-type=a]'),
            $back = $tar.closest('[data-type=back]');
        if($a.length){
            var rh = $a.data('replace-href');
            var href = $a.data("href");
            var flag = $a.data('push') || true;
            if(!!rh){
                window.history.replaceState(null,'',rh);
            }
            if(href!=undefined && href!=""){
                that._showContent(href, flag);
            }
            return false ;
        }
        // 回退
        if($back.length){
            history.go(-1);
        }

    })
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.addEventListener('popstate', function() {
            spa._fnPopStateHandler();
        });
      }, 0);
    });
} ;

var spa = new bbSPA();
spa.init();

spa._fnPopStateHandler();

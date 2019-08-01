var AppConfig={
    appTitle:"朱山石刻文化园",
    center: [114.431077,36.78345],
    scale: 2000,
    maxZoom:20,
    minZoom:16,
    isMult:false,
    basemap:'topo',
    basemaps:[
        // {
        //     id:"map",
        //     title:"景区地图",
        //     type:"tiled",
        //     url:"https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer"
        // },
        {
            id:"1map",
            title:"景区地图",
            type:"tiled",
            //url:"http://61.50.135.114:50023/arcgis/rest/services/zhushan/ZhuSMap/MapServer",
            url: "http://172.16.12.173:6080/arcgis/rest/services/zhushan/ZhuSMap/MapServer"
        }
    ],
    text:{
        search:"搜景点，听介绍，找车位",
        xField:'lon',
        yField:'lat',
    },
    routeUrl:"http://172.16.12.173:6080/arcgis/rest/services/zhushan/route/NAServer/Route",
    layers:{
        point: "http://61.50.135.114:50023/arcgis/rest/services/zhushan/ZhuShanPoint/MapServer/0",
        
    },
    searchList:[
        {
            name:"门",
            icon:"i_door",
            type:1,
        },
        {
            name:"卫生间",
            icon:"i_wc",
            type:4,
        },
        {
            name:"停车场",
            icon:"i_park",
            type:2,
        },
        {
            name:"服务中心",
            icon:"i_service",
            type:3,
        },
        {
            name:"餐饮",
            icon:"i_foot",
            type:5,
        },
    ]
}

var AppData = {
    cur: {
        floor: 1,
        shop: null,
        Public: [],
    },
    shopList: [],
    floorData: [
        { "ID": 1, "name": "L1", "fid": 0, "f": "L1", "tag": "", "IsHavePark": false, "IsHaveShop": true },
        { "ID": 2, "name": "L2", "fid": 0, "f": "L1", "tag": "", "IsHavePark": true, "IsHaveShop": true },
        { "ID": 3, "name": "L3", "fid": 0, "f": "L1", "tag": "", "IsHavePark": true, "IsHaveShop": true },
        { "ID": 4, "name": "L4", "fid": 0, "f": "L1", "tag": "", "IsHavePark": false, "IsHaveShop": true },
    ]
}
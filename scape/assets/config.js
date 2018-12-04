var AppConfig={
    appTitle:"朱山石刻文化园",
    center: [114.431077,36.78345],
    scale: 6000,
    isMult:false,
    basemaps:[
        // {
        //     id:"map",
        //     title:"景区地图",
        //     type:"tiled",
        //     url:"https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer"
        // },
        {
            id:"map",
            title:"景区地图",
            type:"tiled",
            url1:"http://61.50.135.114:50023/arcgis/rest/services/zhushan/ZhuSMap/MapServer",
            url: "http://172.16.12.173:6080/arcgis/rest/services/zhushan/ZhuSMap/MapServer"
        }
    ],
    text:{
        search:"搜景点，听介绍，找车位",
    },
    layers:{
        point1: "http://61.50.135.114:50023/arcgis/rest/services/zhushan/ZhuSMap/MapServer/0",

        point: "http://172.16.12.173:6080/arcgis/rest/services/zhushan/ZhuSMap/MapServer/0",
    },
    searchList:[
        {
            name:"景点",
            icon:"i_scape",
            url:"",
        },
        {
            name:"卫生间",
            icon:"i_wc",
            url:"",
        },
        {
            name:"停车场",
            icon:"i_park",
            url:"",
        },
        {
            name:"服务中心",
            icon:"i_service",
            url:"",
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
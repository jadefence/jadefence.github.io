var onMouseMove;
var onMouseOut;
var onClick;
/**
 * 初始化地图中心点
 */
function initMap(x,y,lever)
{
	var point = new esri.geometry.Point(x,y);
	map.centerAndZoom(point, lever);
}
/**
 * 设置监听点的检测
 */
function setConnect()
{
	/**
	 * 设置鼠标点击事件
	 */
	if(onClick == undefined)
	{
		onClick=dojo.connect(map.graphics, "onClick", disconnect);
	}
	/**
     * 鼠标悬停触发绘图
     */
	if(onMouseMove == undefined)
	{
		onMouseMove=dojo.connect(map.graphics, "onMouseMove", drawWindow);
	}
    /**
     * 鼠标移动出点后清除窗口
     */
	if(onMouseOut == undefined)
	{
		onMouseOut=dojo.connect(map.graphics, "onMouseOut", function() {map.infoWindow.hide();} );
	}
	
}
/**
 * 取消监听点
 */
function disconnect()
{
	if(onMouseMove && onMouseOut)
	{
		dojo.disconnect(onMouseMove);
		dojo.disconnect(onMouseOut);
		onMouseMove=undefined;
		onMouseOut=undefined;
	}else
	{
		setConnect();
	}
}
/**
 * 鼠标点击以后绘制点
 */
function point(evt) {
  var point = evt.mapPoint;
  /**
   * 定义标记点的样式
   */
  var symbol = new esri.symbol.PictureMarkerSymbol("../../style/icons/map_pinkleftnail.png",24,24);
  /**
   * 创建点
   */
  var graphic = new esri.Graphic(point, symbol,"text");
  
  /**
   * 在地图上显示
   */
  map.graphics.add(graphic);
}
/**
 * 程序控制在地图上画点
 */
function porntAction(x,y,infoTemplate,icon)
{
	var point = new esri.geometry.Point(x,y);
	  /**
	   * 定义标记点的样式
	   */
	var symbol = new esri.symbol.PictureMarkerSymbol(icon,24,24);
	  /**
	   * 创建点
	   */
	var graphic = new esri.Graphic(point, symbol,null,infoTemplate);
	  /**
	   * 在地图上显示
	   */
	map.graphics.add(graphic);
}
/**
 * 程序控制在地图上画点
 * 并且保存点数据
 */
function porntActionSaveData(x,y,data,infoTemplate,icon)
{
	var point = new esri.geometry.Point(x,y);
	  /**
	   * 定义标记点的样式
	   */
	var symbol = new esri.symbol.PictureMarkerSymbol(icon,24,24);
	  /**
	   * 创建点
	   */
	var graphic = new esri.Graphic(point, symbol,data,infoTemplate);
	  /**
	   * 在地图上显示
	   */
	map.graphics.add(graphic);
}
/**
 * 绘制当前消息框
 */
function drawWindow(evt)
{
	if(!map.infoWindow.isShowing)
	{
		map.infoWindow.setTitle(evt.graphic.getTitle());
		map.infoWindow.setContent(evt.graphic.getContent());
		map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
	}
}
/**
 * 清除所有点
 */
function clearPoint()
{
	map.graphics.clear();
}
/**
 * 初始化选择区域工具
 */
function initToolbar() {
    var tb = new esri.toolbars.Draw(map);
    dojo.connect(tb, "onDrawEnd", findPointsInExtent);
    tb.activate(esri.toolbars.Draw.POLYGON);
}
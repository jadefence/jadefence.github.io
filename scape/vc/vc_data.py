import im_dbHelper
import json
import datetime
import urllib
import urllib2 
import im_config

def log(msg):
    date = datetime.datetime.now().date().strftime('%Y%m%d')
    logfile = open(im_config.Config.im_RootPath + "\\log\\url_" + date + ".txt", "a+")
    logfile.write(str(datetime.datetime.now())+":-->"+str(msg)+"\r\n")
    logfile.write("\r\n")

class imData():
    def __init__(self, url, user, pwd, db):
        self.ms = im_dbHelper.MSSQL(url,user,pwd,db)
        self.getAllPoint()

    def getConfig(self):
        Project = im_config.Config.im_RootName
        sql = "select * from T_Bas_IdwConfig where Project = '"+Project+"'"
        data = self.ms.ExecQueryToJson(sql)
        return data

    def getStationHourData(self):
        data = [{ "name": "11", "Lon": 122.093958, "Lat": 37.528787, "AQI": 100, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "22", "Lon": 121.459065, "Lat": 37.489408, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "33", "Lon": 120.378495, "Lat": 36.100058, "AQI": 300, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "44", "Lon": 119.50718,  "Lat": 35.420225, "AQI":  50, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "55", "Lon": 118.372273, "Lat": 35.050946, "AQI": 400, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "66", "Lon": 117.684667, "Lat": 36.233654, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },]
        #data = json.dumps(dataStr)
        return data

    def getStationHourParas(self,task,regioncodes,station,strtime,extent):
        url = im_config.Config.data_hourUrl
        url_para = '&dic={MNS:"' + station + '","BeginTime": "'+strtime+'","EndTime": "'+strtime+'"}'
        paraname = "MNS"
        if(station=="23"):
            paraname = "pollutantTypes"
        postdata = urllib.urlencode({  
            'authorCode': im_config.Config.data_authorCode,
            paraname:station,
            'BeginTime':strtime,
            'EndTime':strtime,
             "isAsc": "true"
        }).encode("utf-8") 
        url1 = url + url_para.replace(" ","%20")
        log("HourDataUrl==>"+url + url_para)
        data = postUrl(url1,postdata)["data"]
        #print data
        #data = [{ "name": "11", "Lon": 122.093958, "Lat": 37.528787, "AQI": 100, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "22", "Lon": 121.459065, "Lat": 37.489408, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "33", "Lon": 120.378495, "Lat": 36.100058, "AQI": 300, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "44", "Lon": 119.50718,  "Lat": 35.420225, "AQI":  50, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "55", "Lon": 118.372273, "Lat": 35.050946, "AQI": 400, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "66", "Lon": 117.684667, "Lat": 36.233654, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },]
        if(data==None):
            return []
        if len(data) < 2:
            return []
        points = []
        paras = []
        cols = im_config.Config.data_Items
        for col in cols:
            if "AQI" in col:
                strPoint = ""
                strTime = ""
                for row in data:
                    if row.has_key(col) == False:
                        continue
                    value = str(row[col])
                    if value == "" or value == "0" or value == "None":
                        continue
                    if float(value) == 0:
                        continue
                    code = row["DataGatherCode"]
                    if self.AllPoint.has_key(code)==False:
                        continue
                    point = self.AllPoint[code]
                    x = str(point["longitude"])
                    y = str(point["latitude"])
                    #print x+","+y+","+col+","+value
                    strPoint += '{"geometry": {"x": "' + x + '", "y": "' + y + '"}, "attributes": { "value": "' + value + '","key": "' + code + '"  }},'
                    if strTime == "":
                        strTime = row["MonitorTime"].replace("-","").replace(" ","").replace(":","")+"00"
                if len(strPoint)>0:
                    strPoint = strPoint[0:-1]
                else:
                    continue
                col_name = col
                if "_" in col:
                    col_name = col.split('_')[0]
                strImgName = col_name+"_"+strTime+"HourData"
                #print strImgName
                clrtype = "aqi"
                if task == "LaiXi":
                    clrtype = "wxz"
                para={"task":task,"point":strPoint,"clrtype":clrtype,"regioncodes":regioncodes,"imgname":strImgName,"extent":extent}
                #print extent
                paras.append(para)
        #print points
        return paras
    
    def getStationDayParas(self,task,regioncodes,station,date,extent):
        #now_time = datetime.datetime.now()
        #pre_time = now_time + datetime.timedelta(hours=-1)
        #pre_time_nyr = now_time.strftime('%Y-%m-%d %00:00:00')
        #print pre_time_nyr
        url = im_config.Config.data_dayUrl
        url_para = '&dic={MNS:"' + station + '","BeginTime":"'+date+'","EndTime":"'+date+'"}'
        url1 = url + url_para.replace(" ","%20")
        paraname = "MNS"
        if(station=="23"):
            paraname = "pollutantTypes"
        postdata = urllib.urlencode({  
            'authorCode': im_config.Config.data_authorCode,
            paraname:station,
            'BeginTime':date,
            'EndTime':date,
             "isAsc": "true"
        }).encode("utf-8") 
        log("HourDataUrl==>"+url + url_para)
        data = postUrl(url1,postdata)["data"]
        #data = [{ "name": "11", "Lon": 122.093958, "Lat": 37.528787, "AQI": 100, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "22", "Lon": 121.459065, "Lat": 37.489408, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "33", "Lon": 120.378495, "Lat": 36.100058, "AQI": 300, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "44", "Lon": 119.50718,  "Lat": 35.420225, "AQI":  50, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "55", "Lon": 118.372273, "Lat": 35.050946, "AQI": 400, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },    { "name": "66", "Lon": 117.684667, "Lat": 36.233654, "AQI": 150, "PM10": 10, "PM25": 50, "SO2": 100, "CO": 150, "O3": 200 },]
        if(data==None):
            return []
        if len(data) == 0:
            return []
        paras = []
        points = []
        cols = im_config.Config.data_Items
        for col in cols:
            if "AQI" in col:
                strPoint = ""
                strTime = ""
                for row in data:
                    if row.has_key(col) == False:
                        continue
                    value = str(row[col])
                    if value == "" or value == "0"  or value == "None":
                        continue
                    if float(value) == 0:
                        continue
                    code = row["DataGatherCode"]
                    if self.AllPoint.has_key(code)==False:
                        continue
                    point = self.AllPoint[code]
                    x = str(point["longitude"])
                    y = str(point["latitude"])
                    
                    strPoint += '{"geometry": {"x": "' + x + '", "y": "' + y + '"}, "attributes": { "value": "' + value + '","key": "' + col + '"  }},'
                    if strTime == "":
                        strTime = row["MonitorTime"].replace("-","").replace(" ","").replace(":","")+"00"
                if len(strPoint)>0:
                    strPoint = strPoint[0:-1]
                else:
                    continue
                col_name = col
                if "_" in col:
                    col_name = col.split('_')[0]
                strImgName = col_name+"_"+strTime+"DayData"
                #print strImgName
                clrtype = "aqi"
                if task == "LaiXi":
                    clrtype = "wxz"
                para={"task":task,"point":strPoint,"clrtype":clrtype,"regioncodes":regioncodes,"imgname":strImgName,"extent":extent}
                #print para
                paras.append(para)
        #print points
        return paras

    def getAllPoint(self):
        url = im_config.Config.data_AllPintUrl
        postdata = urllib.urlencode({  
            'authorCode': im_config.Config.data_authorCode, 
        }).encode("utf-8")
        #AllPoint = jsonPost(url)
        log("pointUrl==>"+url)
        jsn = postUrl(url,postdata)
        self.AllPoint={}
        self.AllPointStr=""
        for item in jsn["data"]:
            code = item["DGIMN"]
            self.AllPoint[code]=item
            self.AllPointStr+= "'"+str(code)+"',"
            #print code
        if len(self.AllPointStr)>0:
            self.AllPointStr = self.AllPointStr[0:-1]

    def getPointByType(self,typeCode):
        sql = "select DGIMN + ',' from ( "
        sql+= "select DGIMN,PointName,PollutantType from T_Bas_CommonPoint where PollutantType in ("+typeCode+") and DGIMN in ("+self.AllPointStr+") "
        sql+=  ") t for xml path('')"
        #log("sql==> "+ sql)
        data = self.ms.ExecQueryToJson(sql)
        if len(data)>0:
            result = data[0]["XML_F52E2B61-18A1-11d1-B105-00805F49916B"]
            return result
        return ""
    pass
  
def getUrl(URL):
    response = urllib2.urlopen(URL).read()
    res = json.loads(response)
    return res

def postUrl(URL,postdata): 
    req = urllib2.Request(URL,postdata)  
    req.add_header("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safri/537.36")  
    response = urllib2.urlopen(req).read().decode("utf-8") 
    res = json.loads(response) 
    #print(res)  
    return res

# imdata =  imData(im_config.Config.db_host,im_config.Config.db_user,im_config.Config.db_pawd,im_config.Config.db_name)
# #imdata.getPointByType("23")
# d = imdata.getStationHourParas("China","","23","2017-12-25 12:00:00","117.32587,34.3776250003,122.703021,38.144337")
# #d = imdata.getStationDayParas("China","","23","2017-12-03","1111,2222,3333,4444")
# print d

# imdata =  imData(im_config.Config.db_host,im_config.Config.db_user,im_config.Config.db_pawd,im_config.Config.db_name)
# d = imdata.getPointByType("23")
# #d = imdata.getStationHourParas("China","370500,370300","23","2017-12-25 12:00:00","117.32587,34.3776250003,122.703021,38.144337")
# print d
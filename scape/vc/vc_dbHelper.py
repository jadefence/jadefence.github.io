import pymssql

class MSSQL:
    def __init__(self,host,user,pwd,db):
        self.host = host
        self.user = user
        self.pwd = pwd
        self.db = db

    def __GetConnect(self):
        if not self.db:
            raise(NameError,"no db info")
        self.conn = pymssql.connect(host=self.host,user=self.user,password=self.pwd,database=self.db,charset="utf8")
        cur = self.conn.cursor()
        if not cur:
            raise(NameError,"can not connect db")
        else:
            return cur

    def ExecQuery(self,sql):
        cur = self.__GetConnect()
        cur.execute(sql)
        resList = cur.fetchall()
        self.conn.close()
        return resList

    def ExecNonQuery(self,sql):
        cur = self.__GetConnect()
        cur.execute(sql)
        self.conn.commit()
        self.conn.close()

    def ExecQueryToJson(self,sql):
        cur = self.__GetConnect()
        cur.execute(sql)
        resList = cur.fetchall()
        fields = cur.description
        jsondata = []
        for row in resList:
            i=0
            result = {}
            for col in fields:
                result[col[0]] = row[i]
                i+=1
            jsondata.append(result)
        self.conn.close()
        return jsondata

# ms = MSSQL(host="172.16.14.31",user="sa",pwd="sa",db="DB_GIS")
# sql = "select * from T_Bas_City"
# data = ms.ExecQueryToJson(sql)
# print data
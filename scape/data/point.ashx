<%@ WebHandler Language="C#" Class="point" %>

using System;
using System.Web;
using System.Data;
using System.Text;
using System.Data.SqlClient;

public class point : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        //string type = System.Web.HttpContext.Current.Request.QueryString["t"];
        string type = context.Request["t"];
        string sql = "";
        string error = "";
        switch (type)
        {
            case "p":
                sql = "select * from T_Bas_Point";
                break;
            case "u":
                sql = "select * from dsc_wechat_user_xy";
                break;
            case "save":
                string sex = System.Web.HttpContext.Current.Request.Form["sex"];
                string age = System.Web.HttpContext.Current.Request.Form["age"];
                string x = System.Web.HttpContext.Current.Request.Form["x"];
                string y = System.Web.HttpContext.Current.Request.Form["y"];
                sql = "INSERT INTO dsc_wechat_user_xy(sex,age,x,y,time) value('" + sex + "'," + age + ",'" + x + "','" + y + "',NOW())";
                break;
            default:
                break;
        }
        if (sql != "")
        {
            string result = getDBdata(sql);
            context.Response.Write(result);
        }
        else
        {
            context.Response.Write(error);
        }

    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    public string getDBdata(string sql)
    {
        System.Data.DataSet ds = new System.Data.DataSet();
        string connStr = "server=.;database=scape;uid=sa;pwd=sa";
        //string sqlList = "select * from dsc_wechat_user u left join dsc_region_xy r on r.county like CONCAT( '%' ,u.city ,'%') where u.city <> ''";
        try
        {
            SqlConnection conn = new SqlConnection();
            conn.ConnectionString = connStr;
            conn.Open();

            SqlDataAdapter myda = new SqlDataAdapter(sql, conn);
            myda.Fill(ds);
            conn.Close();
            string json = DatasetToJson(ds, -1);
            return json;
        }
        catch (Exception e)
        {
            return e.Message.ToString();
        }
    }

    /// <summary> 
    /// DataSet转换成Json格式 
    /// </summary> 
    /// <paramname="ds">DataSet</param> 
    ///<returns></returns> 
    public static string DatasetToJson(DataSet ds, int total)
    {
        StringBuilder json = new StringBuilder();

        foreach (DataTable dt in ds.Tables)
        {
            //{"total":5,"rows":[ 
            json.Append("{\"total\":");
            if (total == -1)
            {
                json.Append(dt.Rows.Count);
            }
            else
            {
                json.Append(total);
            }
            json.Append(",\"rows\":[");
            json.Append(DataTableToJson(dt));
            json.Append("]}");
        }
        return json.ToString();
    }



    /// <summary> 
    /// dataTable转换成Json格式 
    /// </summary> 
    /// <paramname="dt"></param> 
    ///<returns></returns> 
    public static string DataTableToJson(DataTable dt)
    {
        StringBuilder jsonBuilder = new StringBuilder();

        for (int i = 0; i < dt.Rows.Count; i++)
        {
            jsonBuilder.Append("{");
            for (int j = 0; j < dt.Columns.Count; j++)
            {
                jsonBuilder.Append("\"");
                jsonBuilder.Append(dt.Columns[j].ColumnName);
                jsonBuilder.Append("\":\"");
                jsonBuilder.Append(dt.Rows[i][j].ToString());
                jsonBuilder.Append("\",");
            }
            if (dt.Columns.Count > 0)
            {
                jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            }
            jsonBuilder.Append("},");
        }
        if (dt.Rows.Count > 0)
        {
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        }

        return jsonBuilder.ToString();
    }

}
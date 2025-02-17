const mysql = require("mysql");

module.exports = {
    db: mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Ilove**139",
        database: "blog"
    }),
        //连接数据库，使用连接池方式
    //连接池对象
    sqlConnect:function(sql,sqlArr,callBack){
        var pool = mysql.createPool(this.config);
        pool.getConnection(function(err,conn){
            console.log('123');
            if(err){
                console.log('连接失败');
                return;
            }
            conn.query(sql,sqlArr,callBack);
            conn.release();
        })
    },
    //promise 回调
    SySqlConnect:function(sySql,sqlArr){
        return new Promise((resolve,reject)=>{
            var pool = mysql.createPool(this.config);
            pool.getConnection(function(err,conn){
                console.log('123');
                if(err){
                    reject(err);
                }else{
                    conn.query(sySql,sqlArr,(err,data)=>{
                        if(err){
                            reject(err)
                        }else{
                            resolve(data);
                        }
                        conn.release();
                    });                    
                }
                
            })
        }).catch((err)=>{
                console.log(err);
        })
    }
}
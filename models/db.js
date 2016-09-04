//这个模块封装了所有对数据库的增删查改
//这些常用的功能模块
var MongoClient = require('mongodb').MongoClient;

function _connectdb(dbName,callback) {
    var url = 'mongodb://localhost:27017/'+dbName;
    // 链接数据库
    MongoClient.connect(url, function(err, db) {
        callback(err,db);
    })
}

//向外暴露插入一条数据的函数
/*
dbName:数据库名称
collectionName ： 集合名称
json ： 插入数据
callback : 插入成功的回调函数
 */
exports.insertOne = function (dbName,collectionName,json,callback) {
    _connectdb(dbName,function (err,db) {
          var collection = db.collection(collectionName);
          // Insert one documents
          collection.insertOne(json, function(err, result) {
            callback(err,result);
            db.close();
          }); 
    });
}

//向外暴露查找数据的函数
/*
dbName:数据库名称
collectionName ： 集合名称
json ： 查找数据  当json查询条件为空的时候，即是查找全部
args :{"pagecount":3,"page":(page-1)} 是传进来分页的参数，结合skip()和limit(),当agrs没有传进来是，就是查询全部数据
callback : 查找成功的回调函数
 */
exports.find = function (dbName,collectionName,json,C,D) {
    if(arguments.length == 4){
        //C就是callback，D就是没有传进来
        //console.log(C);
        var callback = C;
        //应该省略的条数
        var skipnumber = 0;
        //每页显示多少条数
        var limitnumber = 0;
    }else if(arguments.length == 5){
        var args = C;
        var callback = D;
        //应该省略的条数
        var skipnumber = args.pagecount * args.page || 0;
        //每页显示多少条数
        var limitnumber = args.pagecount || 0;
        //排序方式
        var sort = args.sort || {};
    }else{
        throw new Error("find函数参数必须是4个或5个");
        db.close();
    }
    var json = json || {};
    var result = [];
    
    _connectdb(dbName,function (err,db) {
          var cursor = db.collection(collectionName).find(json).limit(limitnumber).skip(skipnumber).sort(sort);
          cursor.each(function (err,doc){

            if(err){
                callback(err,null);
                db.close();
                return;
            }

            if(doc != null){
                //存放入数组
                result.push(doc);
            }else{
                //没有更多的文档了，就回调函数
                callback(null,result);
                db.close();
            }
          });
    });
}

//删除数据
exports.deleteMany = function (dbName,collectionName,json,callback) {
     _connectdb(dbName,function (err,db) {
          var collection = db.collection(collectionName);
          // Insert some documents
          collection.deleteMany(json, function(err, result) {
                callback(err,result);
                db.close();
          });    
     });
}

//修改数据
exports.updateMany = function (dbName,collectionName,json1,json2,callback) {
     _connectdb(dbName,function (err,db) {
          var collection = db.collection(collectionName);
          collection.updateMany(json1, json2, function(err, result) { 
                callback(err,result);
                db.close();
          });     
     });
}

//返回所有数据条数
exports.findAllDate = function (dbName,collectionName,callback) {
     _connectdb(dbName,function (err,db) {
          var collection = db.collection(collectionName);
          collection.count({}).then(function (count) {
              callback(count);
              db.close();
          });     
     });
}


init ();
//建立一个索引 
function init () {
    var url = 'mongodb://localhost:27017/shuoshuo';
    // 链接数据库
    MongoClient.connect(url, function(err, db) {
        if(err){
           console.log(err);
           return;
        }
        db.collection('users').createIndex(
          { "username": 1 },
            null,
            function(err, results) {
              if(err){
                 console.log(err);
                 return;
              }
              console.log("索引建立成功");  
          }
        );
    })
}

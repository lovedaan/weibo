var formidable = require('formidable');
var util = require('util');
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var gm = require("gm");

//显示首页
exports.showIndex = function (req,res,next) {

    if(req.session.login){
        db.findAllDate("shuoshuo","posts",function (count) {
            var num = Math.ceil(parseInt(count) / 6);
            res.render("index",{
                "login" : true,
                "username" : req.session.name,
                "active" : "index",
                "avatar" : req.session.avatar,
                "num" : num
            });
        })
    }
    else{
        res.render("index",{
            "login" :false,
            "active" : "index",
            "avatar" : "moren\.\jpg"
        });
    }
}

//显示注册页面
exports.showRegist = function (req,res,next) {
    if(req.session.login){
        res.render("regist",{
            "login" : true,
            "username" : req.session.name,
            "active" : "regist"
        });
    }
    else{
        res.render("regist",{
            "login" :false,
            "active" : "regist"
        });
    }
}

//注册信息入库
exports.doRegist = function (req,res,next) {
    //先接收前台post过来的数据
    //先查询数据库是否已有这个用户名，有就返回给前台提示
    //没有就写入数据库
    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
        //res.end(util.inspect({fields: fields, files: files}));
        var username = fields.username;
        var password = fields.password;

        db.find("shuoshuo","users",{"username":username},function(err,result) {
                if(err){
                    res.send("-3");  //服务器错误！
                    return;
                }

                if(result.length != 0){
                    res.send("-1"); //用户名已存在
                    return;
                }
                //存入数据库 密码MD5加密
                password = md5(password);
                db.insertOne("shuoshuo","users",{
                    "username":username,
                    "password":password,
                    "avatar":"moren.jpg",
                    "foundTime" : CurentTime(),
                    "txt" : ""
                },function (err,result) {
                    if(err){
                        res.send("-3");  //服务器错误！
                        return;
                    }

                    if(result.result.ok == "1"){
                        req.session.login = true;
                        req.session.name = username;
                        req.session.avatar = 'moren.jpg';
                        res.send("1"); //注册成功
                    }
                });
        });

        //
    });
}

//显示登录页面
exports.showLogin = function (req,res,next) {
    
    if(req.session.login){
        res.render("login",{
            "login" : true,
            "username" : req.session.name,
            "active" : "login"
        });
    }
    else{
        res.render("login",{
            "login" :false,
            "active" : "login"
        });
    }
}

//检测登录信息
exports.doLogin = function (req,res,next) {
    //先接收前台post过来的数据
    //再查询数据库是否已有这个用户名，有就返回给前台提示登录成功
    //没有则返回前台提示用户不存在
    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
        //res.end(util.inspect({fields: fields, files: files}));
        var username = fields.username;
        var password = fields.password;

        db.find("shuoshuo","users",{"username":username},function(err,result) {
                if(err){
                    res.send("-3");  //服务器错误！
                    return;
                }

                if(result.length == 0){
                    res.send("-1"); //用户名不存在
                    return;
                }
                //再将密码MD5加密  与数据库对应的密码匹配是否正确
                password = md5(password);
                if(result[0].password == password){
                    req.session.login = true;
                    req.session.name = username;
                    req.session.avatar = result[0].avatar;
                    //console.log(result[0].avatar);
                    res.send("1");  //登录成功
                 }else{
                    res.send("-2");  //密码错误
                    return;
                }
        });

        //
    });
}

//显示头像设置
exports.showSetAvatar = function (req,res,next) {
    if(req.session.login){
        res.render("setavatar",{
            "login" : true,
            "username" : req.session.name,
            "active" : "setavatar"
        });
    }
    else{
         res.send("非法闯入，请先登录");
         return;
    }
}

//接收上传的头像
exports.doAvatar = function (req,res,next) {
   
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + '/../avatar');
    form.parse(req, function(err, fields, files) {
        //res.end(util.inspect({fields: fields, files: files}));
        //console.log(files);
        //把上传的图片改成 用户名.后缀
        var oldname = path.normalize(files.fileName.path);
        var extname = path.extname(files.fileName.name);
        var newname = path.normalize(__dirname + '/../avatar') +'/'+ req.session.name + extname;
        fs.rename(oldname,newname,function (err) {
            if(err){
                res.send("-2");
            }
            req.session.pathName = req.session.name + extname;
            res.send("1");
        });
    });
}

//显示裁切头像的页面
exports.showCut = function (req,res,next) {
    /*fs.readdir("./avatar",function (err,files) {
        console.log(files);
    });*/
    /*res.render("cut",{
        "login" : true,
        "username" : req.session.name,
        "active" : "avatar"
    });*/
    if(!req.session.login){
        res.send("非法闯入，请先登录");
        return;
    }


    res.render("cut",{
        "login" : true,
        "active" : "cut",
        "username" : req.session.name
    });
   
}

//接收裁切上传的头像
exports.doCut = function (req,res,next) {
   
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.l;
    var y = req.query.t;
    var txt = req.query.txt;
    gm('./avatar/'+ req.session.pathName)
    .crop(w,h, x, y)
    .resize(100,100,"!")
    .write('./avatar/'+ req.session.pathName, function (err) {
      if (!err) 
      {
        var name = req.session.name;
        //把裁切的头像存入数据库
        db.updateMany("shuoshuo","users",{
            "username":name
        },{
            $set:{"avatar": req.session.pathName,"txt" : txt}
        },function (err,result) {
            if(err){
                res.send("-2");
                return;
            }
            req.session.avatar = req.session.pathName;
            res.send("1");
        });
        
      }
        //res.json("裁切成功！");
    })
}

//接收发表说说的信息内容
exports.doRelease = function (req,res,next) {
    if(!req.session.login){
        res.send("非法闯入，请先登录");
        return;
    }
    //先接收前台post过来的数据
    //再存入数据库
    var form = new formidable.IncomingForm();
 
    form.parse(req, function(err, fields, files) {
        //res.end(util.inspect({fields: fields, files: files}));
        var username = req.session.name;
        var date = CurentTime();
        var content = fields.content;
        var pic = fields.avatar;
        var cId = Math.random().toString().replace(".","");

        db.insertOne("shuoshuo","posts",{
            "username":username,
            "content":content,
            "datetime":date,
            "avatar" : pic,
            "c_id" : cId
        },function (err,result) {
            if(err){
                res.send("-3");  //服务器错误！
                return;
            }

            if(result.result.ok == "1"){
                //把之前的默认头像替换 成修改的头像
                db.updateMany("shuoshuo","posts",{"username" :username },{ $set:{"avatar": pic}},function (err,result) {
                        res.send("发表说说成功"); //发表说说
                });  
            }
        });
    });
}

//向前台返回要显示的留言信息
exports.doMsg = function (req,res,next) {
     var page = req.query.page; 
     db.find("shuoshuo","posts",{},{"pagecount" : 6,"page" : (page - 1),"sort":{"datetime" : -1}},function (err,result){
        if(err){
            res.json("-2");
            return;
        }
        var obj = {"result" : result};
        res.json(obj);
    });
}

//显示具体某个用户的说有留言列表  /user/周杰伦
exports.showMeMsg = function (req,res,next) {
    if(!req.session.login){
        res.send("非法闯入，请先登录");
        return;
    }
    var name = req.params["name"];
    /*if(name != req.session.name){
        res.send("不好意思，只能看自己的个人主页");
        return;
    }*/
    db.find("shuoshuo","users",{"username" : name},function (err,result) {
        //console.log(result);
        var arr = result;
        db.find("shuoshuo","posts",{"username" : name},function (err,result2) {
            if(result2.length != 0){
                 res.render("user",{
                    "name" : name,
                    "login" : true,
                    "username" : req.session.name,
                    "active" : "user",
                    "txt" : arr[0].txt,
                    "allMsg" : result2
                });
            }else{
                //console.log(arr[0].txt + arr[0].avatar);
                res.render("user",{
                    "name" : name,
                    "login" : true,
                    "username" : req.session.name,
                    "active" : "user",
                    "txt" : arr[0].txt,
                    "avatar" : arr[0].avatar,
                    "allMsg" : []
                });
            }
        });
       
    });
}

//显示所有用户信息  /alluser
exports.showAllUser = function (req,res,next) {
    if(!req.session.login){
        res.send("非法闯入，请先登录");
        return;
    }
    /*if(name != req.session.name){
        res.send("不好意思，只能看自己的个人主页");
        return;
    }*/
    db.find("shuoshuo","users",{},function (err,result) {
        res.render("allusers",{
            "login" : true,
            "username" : req.session.name,
            "active" : "users",
            "allusers" : result
        });
    });
}


//退出登录
exports.doOut = function (req,res,next) {
    req.session.login = false;
    req.session.name = '';
    req.session.avatar = '';
    res.json("退出成功");
}

//获取当前系统时间
function CurentTime(){ 
    var now = new Date();
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
   
    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var ss = now.getSeconds();          //分
   
    var clock = year + "-";
   
    if(month < 10)
        clock += "0";
   
    clock += month + "-";
   
    if(day < 10)
        clock += "0";
       
    clock += day + " ";
   
    if(hh < 10)
        clock += "0";
       
    clock += hh + ":";
    if (mm < 10) clock += '0'; 
    clock += mm+ ":"; 
    if(ss < 10){ clock += '0';}
    clock += ss;
    return clock; 
}
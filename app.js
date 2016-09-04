var express = require("express");
var session = require('express-session');
var router = require("./router/router.js");
var app = express();

//静态资源
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));
//ejs模板引擎
app.set("view engine","ejs");

//开启设置session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

//=========     路由表设置      ===========//
//显示首页
app.get("/",router.showIndex);
//显示注册页面
app.get("/regist",router.showRegist);
//处理注册提交的信息
app.post("/doRegist",router.doRegist);
//显示登录页面
app.get("/login",router.showLogin);
//处理注册提交的信息
app.post("/doLogin",router.doLogin);
//显示上传头像
//app.get("/setavatar",router.showSetAvatar);
//接收上传头像
app.post("/doAvatar",router.doAvatar);
//裁切上传的头像
app.get("/cut",router.showCut);
//接收裁切上传的头像
app.get("/doCut",router.doCut);
//接收发表说说的信息内容
app.post("/doRelease",router.doRelease);
//显示留言信息
app.get("/doMsg",router.doMsg);
//退出登录
app.get("/doOut",router.doOut);
//显示具体某个用户的说有留言列表  /user/周杰伦
app.get("/user/:name",router.showMeMsg);
//显示单条留言的详细信息  /posts/07593334463890642
//app.get("/posts/:id",router.showMsgDetail);
//显示所有用户信息  /alluser
app.get("/allusers",router.showAllUser);

app.listen(8000);
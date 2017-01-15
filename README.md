<h1>weroll</h1>
<h3>极速搭建一个基于微服务架构的Node.js应用程序，用最小的代码实现常见的web业务。</h3>
weroll基于MongoDB，Redis，Express 4.x以及APIServer（基于原生http库开发的极简化API服务库），经过数个商业项目凝练而来。
<br><br>
主要特点如下：<br>
<ul>
    <li>合理的项目文件结构，区分路由逻辑和API逻辑</li>
    <li>路由和API可定义访问权限</li>
    <li>API定义支持常用的数据校验（如字符，数字，手机号等），支持必须参数和可选参数设定</li>
    <li>提供API调试工具，自动显示API描述和参数说明</li>
    <li>支持多环境配置, 可根据启动参数切换运行环境, 如dev, test, production等, 不同的环境使用不同的配置文件，由开发者自由定义</li>
    <li>使用Mongoose操作数据库，简化了Schema定义流程，简化了Model使用方式</li>
    <li>封装了socket.io可以实现基本的websocket实时数据交互</li>
    <li>集成一些常见的web服务功能，如用户权限维护，邮件发送，短信发送/验证码检查等</li>
    <li>面向微服务架构，多个weroll应用之间可以配置成为一个生态系统，相互之间可以调用API和推送消息</li>
</ul>
Github主页：<a href="https://jayliang701.github.io/weroll/" target="_blank">https://jayliang701.github.io/weroll/</a>

<br>
<br>
<h3>Quick Start</h3>
<h4>使用weroll-cli快速生成一个weroll应用程序骨架</h4>
step 1: npm全局安装weroll-cli
<pre class="highlight"><code style="width:100%;">$ npm install -g weroll-cli</code></pre>
<br>
step 2: 使用weroll命令创建一个极简的weroll项目（在命令行当前目录下，创建DemoApp目录）
<pre class="highlight"><code style="width:100%;">$ weroll init mini DemoApp</code></pre>
如果你已经建立了项目目录，如WebApp，可以进入该目录后再执行weroll init：
<pre class="highlight"><code style="width:100%;">$ cd WebApp
$ weroll init mini</code></pre>
<br>
step 3: 等待项目创建完成，进入项目目录，启动项目
<pre class="highlight"><code style="width:100%;">$ node main.js</code></pre>
你也可以使用其他node进程管理器，如pm2，forever等
<br>
<br>
现在你可以使用浏览器打开 <a href="http://localhost:3000/" target="_blank">http://localhost:3000/</a> 看到应用程序的主页

<br>
<h4>一个最精简的weroll应用程序骨架如下：</h4>
<pre class="highlight">
<code style="width:100%;">
+ 项目目录
    └ <i>node_modules</i>
        └ <i>weroll</i>
    └ client --------------- web前端
        └ res ---------------- 静态资源目录，如js/css/img
    └ views ----------------- html页面
        └ template --------------- 父模板
    └ server --------------- 数据&逻辑&服务
        └ config ----------------- 环境配置文件
            └ localdev --------------- 本地开发环境的配置
                cache.config ------------ 缓存配置
                setting.js ----------- 全局配置
            └ test
            └ prod
        └ router ----------------- 页面路由
        └ service ------------------- API接口
    main.js ------------------ 入口
    package.json
</code>
</pre>

<br>
<h3>HTTP服务</h3>
<h4>关于WebApp和APIServer</h4>
weroll提供了WebApp和APIServer实现http服务。WebApp是对Express 4.X的封装，APIServer则是基于原生http库开发的极简http服务，仅支持API开发，不提供页面渲染。
<br>
以下是2者的详细区别说明
<table>
    <thead>
        <tr>
            <td style="width:135px;"></td>
            <td>WebApp</td>
            <td>APIServer</td>
            <td></td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>VIew Render</td>
            <td>Yes</td>
            <td>No</td>
            <td>APIServer only support __test page</td>
        </tr>
        <tr>
            <td>Custom Router</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
        <tr>
            <td>API</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>APIServer faster 30-40%</td>
        </tr>
        <tr>
            <td>User Session</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
        <tr>
            <td>MongoDB</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
        <tr>
            <td>Redis</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
        <tr>
            <td>Cache</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
        <tr>
            <td>Multi Instances</td>
            <td>Yes</td>
            <td>Yes</td>
            <td></td>
        </tr>
    </tbody>
</table>


APIServer的API并发处理性能比WebApp (实际上就是Express) 高30-40%，因此在开发时请根据你的业务需求选择使用APIServer还是WebApp，如果像微服务这样的应用或者移动应用服务，建议使用APIServer以获得更好的性能。
<br>
在应用中你可以创建多个APIServer实例，但需要侦听不同的端口。
<br>
<br>
WebApp使用示例：
<pre class="highlight"><code style="width:100%;">/* ./main.js 中的代码片段 */<br>
var webApp = require("weroll/web/WebApp").start(Setting, function(webApp) {
    //do something after server is setup
});</code></pre>
<br>
APIServer使用示例：<br>
<pre class="highlight"><code style="width:100%;">/* ./main.js 中的代码片段 */<br>
var webApp = require("weroll/web/APIServer").createServer();
webApp.start(Setting, function(webApp) {
    //do something after server is setup
});</code></pre>
<br>
<h3>API</h3>
<h4>API的规则</h4>
weroll的API统一使用 [POST] http://域名/api 作为入口，请求和响应数据使用json格式
<br>
<br>
一个典型的weroll的API是这样的：
<pre class="highlight"><code style="width:100%;"><b>- General -</b>
<b>Request URL:</b> http://localhost:3000/api
<b>Request Method:</b> POST<br>
<b>- Request Header -</b>
<b>Content-Type:</b> application/json; charset=UTF-8<br>
<b>- Request Payload / Post Data -</b>
{ "method":"user.hello","data":{"name":"Jay","gender":"1"} }
/* method 表示接口名称, data 表示请求参数 */<br>
<b>- Response Header -</b>
<b>Content-Type:</b> application/json<br>
<b>- Response Data -</b>
{"code":1,"data":{"a":1, "b":2},"msg":"OK"}
/* code 表示错误码, 1表示正确, data 表示响应的结果数据, msg 表示消息, 当code>1时则是错误的具体描述 */</code></pre>
<br>
<h4>创建你自己的API</h4>
在 server/service目录中，新建一个脚本文件，比如UserService.js。Service文件必须在server/service目录或其子目录中，weroll在启动时会自动遍历里面的所有js文件，注册API。以下是一个典型的Service代码
<pre class="highlight">
<code style="width:100%;">/* ./server/service/UserService.js */<br>
/* 配置这组API的前缀名和各个接口的参数定义 */
exports.config = {
    name: "user",
    enabled: true,
    security: {
        /* 按照以下注释的写法，API调试工具可以自动识别这些说明并在工具中显示出来 */
        //@hello 打个招呼 @name 名字 @gender 性别,1-男,2-女
        "hello":{ needLogin:false, checkParams:{ name:"string" }, optionalParams:{ gender:"int" } },
        //@bye 说再见 @name 名字
        "bye":{ needLogin:false, optionalParams:{ name:"string" } }
    }
};<br>
exports.hello = function(req, res, params) {
    var name = params.name;
    var gender = params.gender;
    res.sayOK({ msg:&#96;欢迎, 你的名字是${name}, 性别是${gender == 1 ? "男" : "女"}&#96; });
}<br>
exports.bye = function(req, res, params) {
    var name = params.name || "陌生人";
    res.sayOK({ msg:&#96;再见, ${name}&#96; });
}</code></pre>

通过以上代码，我们定义了一组前缀为<b>user</b>的接口，并创建了2个具体的方法 <b>user.hello</b> 和<b>user.bye</b><br>
现在启动程序，在浏览器中打开以下页面使用API调试工具进行测试
<pre class="highlight"><code style="width:100%;">http://localhost:3000/__test</code></pre>
这是weroll自带的API调试工具，你可以使用这个工具调试进行API接口调试，它会自动解析出所有定义在service目录下的API接口，并识别其中的注释，将其变成API接口描述和参数的说明。<br>
当然你也可以使用PostMan一类的工具进行调试。
<br>
<br>

<h4>API中的 req 对象</h4>
如果你使用的是WebApp类建立http服务，req对象则是Express框架中的Request对象，请参考Express的官方文档中的<a href="http://expressjs.com/en/4x/api.html#req" target="_blank">Request说明</a>。
<br>
如果你使用的是APIServer类建立http服务，req对象则是原生http库中的request对象，请参考<a href="https://nodejs.org/api/http.html#http_class_http_clientrequest" target="_blank">Node.js官方文档</a>。
<br>
<br>
weroll对req对象添加了一些新的属性和方法，以便我们更有效率的开发<br>
<table>
    <thead>
        <tr>
            <td style="width:140px;">Property</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>req._clientIP </td>
            <td style="text-align:left;">客户端的IP地址</td>
        </tr>
        <tr>
            <td>req._identifyID </td>
            <td style="text-align:left;">客户端的uuid，由weroll生成，可用于统计在线用户数等业务场景，请参考<a href="https://github.com/jayliang701/weroll/blob/master/web/WebRequestPreprocess.js#L153" target="_blank">源代码</a></td>
        </tr>
    </tbody>
</table>
<br>
<table>
    <thead>
        <tr>
            <td style="width:140px;">Method</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>req.callAPI()</td>
            <td style="text-align:left;">调用其他的API方法，如 req.callAPI("user.hello", { name:"Jay" }, session, callBack)。这样我们就可以在任何一个路由或者任何一个API代码段中，调用任何一个API，使API得到重复利用。</td>
        </tr>
    </tbody>
</table>


<br>
<h4>API中的 res 对象</h4>
如果你使用的是WebApp类建立http服务，res对象则是Express框架中的Response对象，请参考Express的官方文档中的<a href="http://expressjs.com/en/4x/api.html#res" target="_blank">Response说明</a>。
<br>
如果你使用的是APIServer类建立http服务，res对象则是原生http库中的response对象，请参考<a href="https://nodejs.org/api/http.html#http_class_http_serverresponse" target="_blank">Node.js官方文档</a>。
<br>
<br>
同样，weroll也对res对象添加了一些新的方法
<br>
<table>
    <thead>
        <tr>
            <td style="width:140px;">Method</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>res.sayOK()</td>
            <td style="text-align:left;">响应正确结果给客户端，使用json对象作为参数，如果不写参数，则客户端会得到 { code:1, data:{ flag:1 }, msg:"OK" }</td>
        </tr>
        <tr>
            <td>res.sayError()</td>
            <td style="text-align:left;">响应错误结果给客户端，可使用Error对象，String对象或者[ code, msg ]作为参数<br><pre class="highlight"><code style="width:100%;">/* Example */
res.sayError(new Error("ops"));
res.sayError("ops");
res.sayError(100, "ops");
res.sayError(Error.create(100, "ops"));</code></pre></td>
        </tr>
        <tr>
            <td>res.done()</td>
            <td style="text-align:left;">响应结果给客户端<br><pre class="highlight"><code style="width:100%;">/* Example */
res.done(err, result);</code></pre>如果err存在，则执行res.sayError(err)，否则将执行res.sayOK(result)</td>
        </tr>
        <tr>
            <td>res.exec()</td>
            <td style="text-align:left;">执行一个数组任务队列，然后将结果响应给客户端。使用数组对象作为参数，请参考<a href="http://caolan.github.io/async/docs.html#waterfall" target="_blank">async库中的waterfall方法</a><br><pre class="hightlight"><code style="width:100%;">/* Example */
var q = [];
q.push(function(callback) {
    User.findOne({ username:"jayliang" }, function(err, doc) {
        callback(err, doc);
    });
});
q.push(function(user, callback) {
    //do some async/sync works whatever you like
    console.log("found user: ", user.name);
    callback(null, user);
});
res.exec(q);</code></pre>
res.exec相当于执行了async.waterfall方法，如果队列中的任意一个callback传递了存在的err对象，则队列中断，执行res.sayError(err) 将错误响应给客户端，否则将依次执行队列中的代码段，最后执行res.sayOK</td>
        </tr>
    </tbody>
</table>

<br>
<br>
<h3>View Router</h3>
如果要使用页面和页面路由，请使用WebApp来创建http服务，APIServer不提供页面渲染的功能。
<br>
页面路由代码需要定义在server/router目录或其子目录中，weroll启动时会自动解析并注册到Express中。一个典型的路由文件如下：
<br>
<pre class="highlight"><code style="width:100%;">/* ./server/router/index.js */<br>
function renderIndexPage(req, res, output, user)
    /* 在页面中使用 {{data.msg}} 可显示hello字符串 */
    output({ msg:"hello!" });
}<br>
function renderProfilePage(req, res, output, user) {
    output({ nickname:user.nickname, head:user.head });
}<br>
exports.getRouterMap = function() {
    return [
        /* url           浏览器url中域名之后的地址
            view          对应要渲染的html页面，如index就表示 %项目目录%/client/views/index.html这个页面
            handle        http GET方式对应的处理方法
            postHandle    http POST方式对应的处理方法
            needLogin     是否需要登录才能访问 true/false
            loginPage     如果没有访问权限，可以指定一个跳转页面，默认是login页面
                                  和view一样，页面定义在 %项目目录%/client/views目录或子目录中
        */
        { url: "/", view: "index", handle: renderIndexPage, needLogin:false },
        { url: "/index", view: "index", handle: renderIndexPage, needLogin:false },
        { url: "/profile", view: "profile", handle: renderProfilePage, needLogin:true, loginPage:"signin" }
    ];
}</code></pre>
<br>
<h4>视图模板引擎</h4>
weroll默认使用 nunjucks 作为模板引擎，请参考<a href="https://mozilla.github.io/nunjucks/" target="_blank">nunjucks官方文档</a>。你也可以使用其他的模板引擎如jade, ejs, swig等，示例代码如下：
<pre class="highlight"><code style="width:100%;">/* 这是main.js中的代码片段 */<br>
/* var Setting = global.SETTING; */<br>
Setting.viewEngine = {
    //webApp: an instance of Express
    init: function(webApp, viewPath, useCache) {
        var engine = {};
        /* 务必要实现这个方法 */
        engine.$setFilter = function(key, func) {
            //do nothing
        };
        webApp.set('view engine', 'ejs');
        console.log("use view engine: ejs");
        return engine;
    }
};
//create and start a web application
var webApp = require("weroll/web/WebApp").start(Setting);</code></pre>

<br>
<h4>传递数据到页面</h4>
在路由的处理方法中，使用output即可输出数据。
<pre class="highlight"><code style="width:100%;">/* ./server/router/index.js */<br>
function renderIndexPage(req, res, output, user)
    /* 在页面中使用 {{data.msg}} 可显示hello字符串 */
    output({ msg:"hello!" });
}<br><br>
/* ./client/views/index.html */<br>
&lt;div&gt;&#123;&#123;data.msg&#125;&#125;&lt;/div&gt; &lt;!-- display "hello!" --&gt;</code></pre>

在页面中{{data}}对象即是output传递出去的对象，weroll还封装了一些常用的数据传递到页面中。如URL的querystring数据：
<pre class="highlight"><code style="width:100%;">/* ./client/views/index.html */
/* URL: http://localhost:3000/some_page?page=2&size=10 */<br>
&lt;div&gt;page: &#123;&#123;query.page&#125;&#125;&lt;/div&gt; &lt;!-- display "2" --&gt;
&lt;div&gt;size: &#123;&#123;query.size&#125;&#125;&lt;/div&gt; &lt;!-- display "10" --&gt;</code></pre>
<br>
获取服务器当前的时间戳：
<pre class="highlight"><code style="width:100%;">/* ./client/views/index.html */<br>
&lt;div&gt;Server TIme: &#123;&#123;now&#125;&#125;&lt;/div&gt;</code></pre>
<br>
获取./server/config/%ENV%/setting.js 里的一些配置数据，如：
<pre class="highlight"><code style="width:100%;">/* ./client/views/index.html */<br>
&lt;div&gt;Site Domain: &#123;&#123;setting.SITE&#125;&#125;&lt;/div&gt;   &lt;!-- 网站域名 --&gt;
&lt;div&gt;Resource CDN: &#123;&#123;setting.RES_CDN_DOMAIN&#125;&#125;&lt;/div&gt;   &lt;!-- 静态资源CDN域名 --&gt;
&lt;div&gt;Site Domain: &#123;&#123;setting.API_GATEWAY&#125;&#125;&lt;/div&gt;   &lt;!-- API Gateway的URL地址 --&gt;</code></pre>
你也可以自定义或者扩展setting里的数据：
<pre class="highlight"><code style="width:100%;">/* ./main.js */<br>
require("weroll/web/WebApp").start(Setting, function(webApp) {
    webApp.COMMON_RESPONSE_DATA.defaultStyle = "blue";
});<br><br>
/* ./client/views/index.html */<br>
&lt;link type="text/css" rel="stylesheet" href="&#123;&#123;setting.RES_CDN_DOMAIN&#125;&#125;/css/&#123;&#123;setting.defaultStyle&#125;&#125;.css" &gt;</code></pre>

<br>
<h4>自定义模板引擎过滤器</h4>
通过 ViewEngineFilter.addFilter() 可以添加自定义过滤器，这里以nunjucks为例：
<pre class="highlight"><code style="width:100%;">/* ./server/router/index.js */<br>
var ViewEngineFilter = require("weroll/utils/ViewEngineFilter");<br>
//第一个参数是过滤器的名字，第二个参数是function
ViewEngineFilter.addFilter("json", json);<br>
//在页面中正确渲染json数据
function json(val, express) {
    return this.env.getFilter("safe")(JSON.stringify(val));
}<br>
/* the render function of page */<br>
function renderSomePage(req, res, params) {
    output({ list:[ "Jay", "Tracy" ] });
}<br>
/* ./client/views/some_page.html */<br>
&lt;script&gt;
var list = &#123;&#123;data.list|json&#125;&#125;;
console.log(list[0]); //echo Jay
&lt;/script&gt;</code></pre>
<br>
<h3>MongoDB操作</h3>
<h4>连接配置</h4>
在./server/config/%ENV%/setting.js里，model节点配置了MongoDB的连接设置：
<pre class="highlight"><code style="width:100%;">model: {
    /* mongodb connection config */
    db: {
        host:"127.0.0.1",
        port:27017,
        name:"weroll_app",  //the name of database
        option: {
            driver:"mongoose",  //or "native"
            server: {
                reconnectTries: Number.MAX_VALUE,
                poolSize: 5,
                socketOptions: { keepAlive: 120 }
            }
        }
    },
    /* redis connection config
    redis: { ... }
    */
}</code></pre>
对于weroll应用来说，数据库并不是必须的，如果你不需要连接数据库，可以将model.db节点注释。<br>
weroll同时支持<a href="" target="_blank">MongoDB官方的Node.js版连接库</a>，和<a href="" target="_blank">Mongoose</a>库。设置model.db.option.driver，可以选择使用官方driver或Mongoose，option的其他参数请参考<a href="http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/" target="_blank">MongoDB官方文档</a>。

<h4>使用MongoDB Native Driver</h4>
配置setting.js中的model.db节点：
<pre class="highlight"><code style="width:100%;">{
    model: {
        db: {
            ...
            option: {
                driver: "native",
                ...
            }
        }
    }
}</code></pre>
在main.js入口文件中初始化Model对象，Model对象将根据setting.js中的配置连接MongDB数据库：
<pre class="highlight"><code style="width:100%;">/* ./main.js */<br>
var Setting = global.SETTING;<br>
app.addTask(function(cb) {
    var Model = require("weroll/model/Model");
    Model.init(Setting.model, function(err) {
        cb(err);
    });
});
</code></pre>
Model.DB对象封装了一些常用的CURD方法，我们以findOne为例子，示例代码如下：
<pre class="highlight"><code style="width:100%;">var Model = require("weroll/model/Model");<br>
/* callback */
/* find(tableName, filter, fields, sort, pagination, callBack) */
Model.DB.findOne("User", { name:"Jay" }, { _id:1, name:1, phone:1 }, function(err, doc) {
    console.log(arguments);
});<br>
/* Promise */
Model.DB.findOne("User", { name:"Jay" }, { _id:1, name:1, phone:1 }).then(function(doc) {
    console.log(doc);
}).catch(function(err) {
    console.error(err);
});<br>
/* async & await */
async function() {
    var doc = await Model.DB.findOne("User", { name:"Jay" }, { _id:1, name:1, phone:1 });
    console.log(doc);
});
</code></pre>
详细使用方法，请<a href="https://github.com/jayliang701/weroll-kickstarter-test/blob/master/test/model/MongoDB.js" target="_blank">参考test里的代码</a>。
<br>
<br>
<h4>使用Mongoose</h4>
配置setting.js中的model.db节点：
<pre class="highlight"><code style="width:100%;">{
    model: {
        db: {
            ...
            option: {
                driver: "mongoose",
                ...
            }
        }
    }
}</code></pre>
然后在main.js入口文件中初始化Model对象和DAOFactory对象：
<pre class="highlight"><code style="width:100%;">/* ./main.js */<br>
var Setting = global.SETTING;<br>
app.addTask(function(cb) {
    var Model = require("weroll/model/Model");
    Model.init(Setting.model,
        function(err) {
            if (err)  return cb(err);
            var DAOFactory = require("weroll/dao/DAOFactory");
            DAOFactory.init(Model.getDBByName());
            /* 可以指定DAO文件的存放目录，默认是 server/dao 目录
                var folder = require("path").join(global.APP_ROOT, "server/dao");
                DAOFactory.init(Model.getDBByName(), folder);
            */
           cb();
        });
});</code></pre>
DAOFactory对象会遍历dao目录和其子目录，将文件名为 XXXSchema.js 的文件作为Schema注册到mongoose实例里。比如UserSchema.js文件，初始化之后，你就可以在应用程序的任何一个地方使用User（User是mongoose里的Model对象）来操作数据，不需要require来导入。<br>
在weroll中使用mongoose的Model来操作数据库和官方一样，没有什么区别，以下是一段查询的示例代码：<br>
<pre class="highlight"><code style="width:100%;">/* findOne with callback */
User.findOne({ phone:"123456" }, function(err, doc) {
    console.log(arguments);
});<br>
/* findOne with async/await */
async function() {
    var doc = await User.findOne({ phone:"123456" }).exec();
    console.log(doc);
}</code></pre>
一个典型的Schema文件的定义如下：<br>
<pre class="highlight"><code style="width:100%;">/* ./server/dao/StudentSchema */
var Schema = require("weroll/dao/DAOFactory").Schema;<br>
var COLLECTION_NAME = "Student";  //定义表名为Student<br>
module.exports = function() {
    var schema = new Schema({
        name: { type:String, index:true, required:true },
        head: "String"
    }, { collection:COLLECTION_NAME, strict: false });<br>
    schema.pre("save", function(next) {
        //do something before save
        next();
    });<br>
    schema.static("queryByName", function(name, fields, callBack) {
        return this.find({ name:name }).select(fields).exec(function(err, doc) {
            callBack && callBack(err, doc);
        });
    });<br>
    return { name:COLLECTION_NAME, ref:schema };
}</code></pre>
定义Schema和官方用法一致，请参考<a href="http://mongoosejs.com/docs/guide.html" target="_blank">mongoose文档</a>。当DAOFactory.init完成之后，直接使用Student即可引用mongoose的Model对象。
<br>
<br>
<h4>连接多个数据库</h4>
weroll应用允许同时连接多个MongoDB数据库，分为主连接（或者叫默认连接）和其他连接。mongoose库只允许用在主连接上，native driver可以则两者都可以使用。示例代码如下：<br>
<pre class="highlight"><code style="width:100%;">var Model = require("weroll/model/Model");<br>
/* 建立主连接 */
var db_config_default = {
    host:"127.0.0.1",
    port:27017,
    name:"mydb",
    option: { driver:"native" }
};
Model.openDB(db_config_default, true, function(err, db) {
    //default mongodb is connected with native driver
    //CURD example:
    Model.DB.findOne();
});<br>
/* 建立其他连接 */
var db_config_other = {
    host:"192.168.1.200",
    port:27017,
    name:"yourdb",
    option: { driver:"native" }
};
Model.openDB(db_config_other, false, function(err, db) {
    //another mongodb is connected with native driver
    //CURD example:
    Model.DB.yourdb.findOne();
    //or
    Model.DB["yourdb"].update();
    //"yourdb" is the name of database which defined in config above
});</code></pre>
关闭数据库连接<br>
<pre class="highlight"><code style="width:100%;">/* 关闭主连接 */
Model.closeDB(function(err) {
    err && console.error(err);
});<br>
/* 关闭某个连接 */
Model.closeDB("name of database in config", function(err) {
    err && console.error(err);
});</code></pre>

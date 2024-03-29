/**
 * @module me
 * @namespace me
 * @version 2.0
 * @author 米构网络 megotech.cn
 */
 ; var me = function (src, options) {
    me.show(src, options);
};

/*
 * @module utils
 * @memberof me
 */
(function ($) {
    var isIOS = !!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/);

    $.utils = {
        setTitle: function (title) {
            // document.title = title;
            //if (!isIOS) return;

            //var iframe = document.createElement("iframe");
            //iframe.src = "/favicon.ico";
            //iframe.style.display = "none";
            //iframe.onload = function () {
            //    try {
            //        document.body.removeChild(iframe);
            //    } catch (e) { }
            //}
            //document.body.appendChild(iframe);
        },

        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return "";
        },

        each: function (array, fn) {
            if (!(array instanceof Array)) return;

            for (var i = 0; i < array.length; i++) {
                fn.call(this, array[i], i);
            }
        },

        endWith: function (str, end) {
            var reg = new RegExp(end + "$");
            return reg.test(str);
        },

        startWith: function (str, start) {
            return str.indexOf(start) == 0;
        },

        getAny: function(obj) {
            if (!obj) return;

            for(var key in obj) {
                return {
                    key: key,
                    value: obj[key]
                };
            }
        },

        extend: function (obj, newObj) {
            for (var i in newObj) {
                obj[i] = newObj[i];
            }
        },

        loadScript: function (scriptId, src, callback) {
            $._param.loadScript_Cache || ($._param.loadScript_Cache = {});
            if ($._param.loadScript_Cache[scriptId]) {
                callback && callback(true);
                return;
            }

            if (window.mui && Util.isIOS()) {
                mui.plusReady(function(){
                    plus.io.requestFileSystem(plus.io.PRIVATE_WWW,function(fs){
                        var localUrl = fs.root.toLocalURL();
                        var pre = fs.root.toURL();
                        src = localUrl + src;
                        src = src.split("?")[0];
                        plus.io.resolveLocalFileSystemURL( src, function(entry){
                            entry.file( function ( file ) {
                                var reader = new plus.io.FileReader();
                                reader.onloadend = function ( e ) {
                                    var content = e.target.result;
                                    eval(content);

                                    $._param.loadScript_Cache[scriptId] = 1;
                                    callback && callback(false);
                                };
                                reader.readAsText( file );
                            });
                        });
                    });
                    
                });
            } else {
                jQuery.ajaxSetup({cache: true});
                // import('../' + src).then(function(){
                //     $._param.loadScript_Cache[scriptId] = 1;
                //     callback && callback(false);
                // });
                jQuery.getScript(src, function(){
                    $._param.loadScript_Cache[scriptId] = 1;
                    callback && callback(false);
                });
            }

        },

        loadStyle: function (styleId, src) {
            if (document.getElementById(styleId)) return;

            var oCss = document.createElement("link");
            oCss.id = styleId;
            oCss.setAttribute("rel", "stylesheet");
            oCss.setAttribute("type", "text/css");
            oCss.setAttribute("href", src);
            document.getElementsByTagName("head")[0].appendChild(oCss);

            // document.writeln('<link href="' + src + '" rel="stylesheet" />')
        },

        style: function (styleId, cssObj) {
            if (document.all && document.styleSheets[styleId]) return;
            if (document.getElementById(styleId)) return;

            var str_css = "";

            if (typeof cssObj == "object") {
                for (var i in cssObj) {
                    str_css += i + "{";
                    for (var j in cssObj[i]) {
                        str_css += j;
                        if (!this.startWith(i, "@")) str_css += ":";
                        str_css += cssObj[i][j];
                        if (!this.startWith(i, "@")) str_css += ";";
                    }
                    str_css += "}";
                }
            } else if (typeof cssObj == "string") {
                str_css = cssObj;
            } else {
                return;
            }

            if (document.all) {
                var ss = document.createStyleSheet();
                ss.owningElement.id = styleId;
                ss.cssText = str_css;
            } else {
                var style = document.createElement("style");
                style.id = styleId;
                style.type = "text/css";
                style.innerHTML = str_css;
                document.getElementsByTagName("HEAD").item(0).appendChild(style);
            }
        },

        trim: function (str) {
            return str.replace(/^\s+/g, "").replace(/\s+$/g, "");
        },

        getHtml: function(name,src,callback){
            // if ($._param.config.cache) {
            //     $._param.loadHtml_Cache || ($._param.loadHtml_Cache = {});

            //     if ($._param.loadHtml_Cache[name]) {
            //         callback($._param.loadHtml_Cache[name]);
            //         return;
            //     }
            // }

            if(window.mui && Util.isIOS()) {
                src = "_www/"+src.split("?")[0];
                mui.plusReady(function(){
                    plus.io.resolveLocalFileSystemURL( src, function(entry){
                        entry.file( function ( file ) {
                            var reader = new plus.io.FileReader();
                            reader.onloadend = function ( e ) {
                                var content = e.target.result;
                                // if ($._param.config.cache) 
                                    // $._param.loadHtml_Cache[name] = content;
                                callback(content);
                            };
                            reader.readAsText( file );
                        });
                    });
                });
            } else {
                jQuery.ajax({
                    type: "get",
                    url: src,
                    success: function(data){
                        // if ($._param.config.cache) 
                        //     $._param.loadHtml_Cache[name] = data;
                        callback(data);
                    }
                });
            }
        },

        getBigName: function(name){
            var a = name.split("-");
            var bigName = "";
            for(var i in a) {
                if (i == 0) {
                    bigName += a[i];
                    continue;
                }
                bigName += a[i].substring(0,1).toUpperCase() + a[i].substring(1,a[i].length);
            }
            return bigName;
        }
    }
})(me);

/*
 * angular入口函数
 */
(function ($) {
    var browser = navigator.appName;
    if (browser == "Microsoft Internet Explorer") {
        var b_version = navigator.appVersion;
        var version = b_version.split(";");
        var trim_Version = version[1].replace(/[ ]/g, "");
        if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0"
            || browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0"
            || browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0"
            || browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
        } else {
            if (angular.version.minor >= 3) {
                location.hash = "";
            } else {
                location.hash = "";
            }
        }
    } else {
        if (angular.version.minor >= 3) {
            location.hash = "/";
        } else {
            location.hash = "";
        }
    }


    $.utils.extend($, {
        ctrl: function ($rootScope, $scope, $compile, $location, $http, $timeout) {
            $.ngobj = {
                $rootScope: $rootScope,
                $scope: $scope,
                $compile: $compile,
                $location: $location,
                $http: $http,
                $timeout: $timeout
            };

            $._method._triggerReadyFn();
            $rootScope.$on('$locationChangeSuccess', $._method._urlChanged);

            $scope.show = $.show;
            $scope.hide = $.hide;
            $scope.hideDepth = $.hideDepth;
            $._method._init();
        }
    });
})(me);

/*
 * 公共接口
 */
(function ($) {
    $.utils.extend($, {
        /**
         * 请求网络数据
         * @function ajax
         * @memberof me
         * @param {Object} option - 请求参数
         * @property {String} method - post或者get
         * @property {String} url - 请求的http链接
         * @property {Object} data - post请求时的参数，json格式
         * @param {function} success - 成功回调函数
         * @param {function} failure - 失败回调函数
         * @param {function} before - 调用前准备函数
         */
        ajax: function (option, success, failure, before) {
            if (before && typeof (before) == 'function') before();

            option.type = "POST";
            //option.dataType = "json";
            //option.contentType = "application/json";
            // option.data = JSON.stringify(option.data);
            option.timeout = 1000 * 60 * 5;
            option.success = function (data) {
                success && success(data);
                $.ngobj.$scope.$apply();
            };
            option.error = function (xhr, textStatus, errorThrown) {
                failure && failure();
            };

            jQuery.ajax(option);
        },

        /**
         * 配置me
         * @function config
         * @memberof me
         * @param {Object} cf - 配置参数
         * @property {String} main - 默认打开的页面
         * @property {String} container - 根元素的css选择器
         * @property {String} hideSelector 
         *        当showType = 1 打开页面的时候，需要隐藏的元素选择器，返回到一级页面时，会重新显示
         * @property {String} [path='tpl/'] - 模板所在的路径
         * @property {Object} route 
         *        路由配置表，key-value形式，配置后可以在me.show的时候传入key寻找页面
         * @property {Boolean} dynamicPage 是否为python动态页，如果是将出让{{}}标记
         * @property {Boolean} cache 是否启用缓存
         * @property {Boolean} in_tow js、html是否在同一个文件夹
         */
        config: function (cf) {
            if (!cf) return $._param.config;
            
            var defaultConfig = {
                cache: true
            };

            for (var i in cf) defaultConfig[i] = cf[i];
            $._param.config = defaultConfig
        },

        /**
         * 调用me.hide()时的全局回调函数
         */
        onhide: function (fn) {
            $._param.onhide = fn;
        },

        /**
         * 调用me.show()时的全局回调函数
         */
        onshow: function (fn) {
            $._param.onshow = fn;
        },

        /**
         * 注册页面插件，在me.show的时候，第一个参数可以直接写插件的名称
         * 注册的插件在me初始化的时候会加载到页面，暂时不支持跨域
         * @function plugin
         * @memberof me
         * @param {Array} pluginList - 插件配置列表
         * @property {String} name - 插件名称
         * @property {String} src - 插件页面的路径
         * @property {Array} css 
         *        插件相关的css样式src数组，可以是相对路径或绝对路径，如["http://xxx.css", "folder/xxx.css", ...]
         * @property {Array} 插件相关的js路径数组，格式同css 
         */
        plugin: function (pluginList) {
            if (!angular.isArray(pluginList)) return;

            $._param.plugins = $._param.plugins || {};
            $.utils.each(pluginList, function (plugin) {
                $._param.plugins[plugin.name] = plugin;
                $._method._loadPlugin(plugin.name);
            });
        },

        /**
         * 设置或者获取全局数据，参数可以是一个object，也可以是key,value
         * @function global
         * @memberof me
         * @demo 
         * 设置：
         * me.global(key, value)
         * 或者
         * me.global({key1: value1, key2: value2})
         * 获取：
         * js中 me.global.key
         * html中 global.key
         */
        global: function () {
            function _setGlobalValue(key, value) {
                var scope = $.ngobj.$scope;

                $.global[key] = value;
                scope.global || (scope.global = {});
                scope.global[key] = value;
            }

            if (arguments.length == 1
                && typeof arguments[0] == "object") {
                for (var key in arguments[0]) {
                    _setGlobalValue(key, arguments[0][key]);
                }
            } else if (arguments.length == 2
                && typeof (arguments[0] == "string")) {
                _setGlobalValue(arguments[0], arguments[1]);
            }
        },

        /**
         * 扩展公共指令
         * @function directive
         * @memberof me
         * @param {String} tagName - 指令名称
         * @param {Function} fn - 指令构造函数，参考angular.directive
         */
        directive: function (tagName, fn) {
            $._param.directiveList.push({
                tagName: tagName,
                fn: fn
            });
        },

        /**
         * 启动angular
         * @function run
         * @memberof me
         * @param {String} appName - 应用程序名称
         * @param {Array} plugins - 插件列表
         */
        run: function (appName, plugins) {
            $._param.module = angular.module(appName, plugins).config(function ($sceProvider, $interpolateProvider) {
                $sceProvider.enabled(false);

                if ($._param.config.dynamicPage) {
                    $interpolateProvider.startSymbol('<[');
                    $interpolateProvider.endSymbol(']>');
                }
            });
            $._method._appendCtrl("me", $.ctrl);
            $._method._buildCtrl();
            $._method._buildDirective();
        },

        /**
         * 注入me稳定后需要执行的函数
         * @function ready
         * @memberof me
         * @param {Function} fn - me稳定后执行的函数
         */
        ready: function (fn) {
            if (typeof fn != "function") return;

            $._param.readyFnList.push(fn);
        },

        compile: function(html, ctrl) {
            if (ctrl) {
                return ctrl.$compile(html)(ctrl.$scope);
            } else {
                return $.ngobj.$compile(html)($.ngobj.$scope);
            }
        },

        /**
         * 显示一个页面
         * @function show
         * @memberof me
         * @param {String} src - 页面src
         * @param {Object} options - 参数
         * @property {Number} showType - 页面类型，0：一级页面 1：非一级页面
         * @property {Object} [param=null] - 传递的参数参数
         * @property {String} [title=document.title] - 页面标题
         * @property {Boolean} [refresh=false] - 是否自动触发$scope.$apply()
         * @property {String} [style=null] - null: 填充（默认） 'pop'：弹出层
         * @property {String} [ctrlpath=null] - null: 额外的控制器ctrlpath
         * @property {Boolean} [isFullPath=false] - false: 是否全路径，默认false
         */
        show: function (src, options) {
            if (!options) return;

            if (options.showType===undefined) {
                options.showType = 1;
            }
            else if (options.showType == 2) {
                options.showType = 1;
                options.style = "pop";
            }

            var page = $._method._show(src, options);
            $._method._loadController(src, options.isFullPath, function (ctrlExists,ctrlName) {
                
                // 加载html
                var isFullPath = src.indexOf("/")==0 || src.indexOf("http") == 0;
                var htmlUrl = $._method._getTplSrc(src + "?v=" + $._param.config.version, isFullPath);

                $.utils.getHtml(src,htmlUrl,function(page_html){
                    // 加载引用
                    $._method._loadRefer('pages/' + src, page_html, function(page_html){
                        var _html = page.html.replace("ng-include", "").replace("</div>", "");
                        _html += page_html + "</div>";
                        
                        //加载扩展控制器
                        $._method._loadExtendControl(options.ctrlpath, function(extendExists){
                            var container = $._method._getContainer(),
                                compilePage = $.ngobj.$compile(_html)($.ngobj.$scope);
                            compilePage.addClass("me-cloak");

                            if (options.showType == 0) {
                                container.html(compilePage);
                            } else {
                                page.pageObj.style == "pop"
                                    ? jQuery("body").append(compilePage)
                                    : container.append(compilePage);
                            }
                            
                            // 加载组件
                            var pageCtrl = window[ctrlName];
                            if (pageCtrl.components) {
                                $._method._loadComponent(compilePage,_html,angular.copy(pageCtrl.components),pageCtrl,function(){
                                    pageCtrl.$scope.$$postDigest(function(){
                                        compilePage.find(".me-cloak").removeClass("me-cloak");
                                        compilePage.removeClass("me-cloak");
                                    });
                                    $.ngobj.$timeout(()=>{});
                                });
                            }

                            if (!ctrlExists || !extendExists) $.ngobj.$timeout(()=>{});
                            pageCtrl.$scope.$$postDigest(function(){
                                compilePage.find(".me-cloak").removeClass("me-cloak");
                                compilePage.removeClass("me-cloak");
                            });
                            var curPageObj = $._method._getLastPage();
                            $._method._triggerEvent(curPageObj, "show");
                        });
                    });
                });

            });

            return page.pageObj;
        },

        /**
         * 关闭页面，如果只剩下一个页面，则不会有任何动作
         * @function hide
         * @memberof me
         * @param {Object} params - 这里的参数将会被传入页面hide事件中
         * @param {Number} layer - 关闭的层级，默认为1，表示关闭当前页面，如果大于1，则往上关闭相应的页面
         */
        hide: function (params, layer) {
            if ($._param.pageList.length <= 0) {
                return;
            }

            $._param.hideParam = params;
            $._param.hideLayer = layer || 1;

            $._method._triggerHide();
        },

        hideDepth: function (depth, params) {
            var count = depth || 1;
            function temp() {
                $._param.hideParam = params;
                history.go(-1);

                count--;

                if (count > 0) {
                    setTimeout(function () {
                        temp();
                    });
                }
            }

            temp();
        },



        /**
         * 设置页面进入和离去动画，该配置作用于showType=1的情况
         * @function animate
         * @memberof me
         * @param {Object} options - 参数
         * @property {Function} show - 页面显示之前的回调函数，会传递即将被显示的页面对象和即将被隐藏的页面对象
         * @property {Function} hide - 页面隐藏之前的回调函数，会传递即将被显示的页面对象和即将被隐藏的页面对象
         */
        //animate: function (options) {
        //    _animateOptions = options;
        //},

        /**
         * 获得顶层页面的参数
         * @function param
         * @memberof me
         */
        param: function () {
            return $.page().param;
        },

        /**
         * 执行当前页面注册的事件
         * @function trigger
         * @memberof me
         * @param {String} ename - 事件名称
         * @param {Arguments} args - 传递的参数，多个参数逗号分隔
         */
        trigger: function (ename, args) {
            var page = $.page();
            page.exec.apply(page, arguments);
        },

        /**
         * 执行当前组件注册的事件
         * @function trigger
         * @memberof me
         * @param {String} ename - 事件名称
         * @param {Arguments} args - 传递的参数，多个参数逗号分隔
         */
        triggerCom: function(id, eventName, args){
            var pageFnName = jQuery("#" + id).attr(eventName);
            var page = $.page();
            var tpl = page.src.split("/");
            var ctrlName = tpl[tpl.length-1];
            
            var params = [];
            for(var i in arguments) {
                if (i > 1) {
                    params.push(arguments[i]);
                }
            }

            var fn = window[ctrlName][pageFnName];
            if (fn) fn.apply(page, params);
        },

        /**
         * 获取顶层的页面对象
         * @function page
         * @memberof me
         */
        page: function () {
            return $._method._getLastPage();
        },

        pageCtrl: function(){
            var page = $.page();
            var src = page.src;
            if (src.indexOf("?") > 0) {
                src = src.split("?")[0];
            }
            var tpl = src.split("/");
            var ctrlName = tpl[tpl.length-1];
            return window[ctrlName];
        },

        /**
         * 定义controller
         * @function define
         * @memberof me
         * @param {String} ctrlName - controller名称
         * @param {Object} fn - 接口列表
         */
        define: function (ctrlName, fn, isTemplate) {
            if (window[ctrlName]) throw new Error("me中已经注册了名为" + ctrlName + "的控制器");
            if (!fn || !fn.ctrl) throw new Error("me.define方法中的fn参数对象中需要提供ctrl方法");

            window[ctrlName] = (function () {
                var thisArr = [];
                var singleThis;

                var obj = function () {
                    this.id = Math.random().toString().substring(2);
                    fn._id = this.id;

                    if (isTemplate) { // 类
                        thisArr.push(this);
                    } else { // 单例
                        singleThis = this; 
                    }

                    var that = this;
                    for (var fnName in fn) {
                        if (fnName == "ctrl") continue;
    
                        switch(typeof fn[fnName]) {
                            case "function":
                                this[fnName] = (function (fnName) {
                                    return function () {
                                        return fn[fnName].apply(that, arguments);
                                    };
                                })(fnName);
                                break;
    
                            case "object":
                                this[fnName] = fn[fnName];
                                break;
                        }
                    }
                }

                var pro = {};
                pro.ctrl = function ($scope, $http, $timeout,$compile) {
                    var thatCtrl;
                    if (isTemplate) {
                        thatCtrl = thisArr.pop();
                    } else {
                        thatCtrl = singleThis;
                    }

                    thatCtrl.$scope = $scope;
                    thatCtrl.$http = $http;
                    thatCtrl.$timeout = $timeout;
                    thatCtrl.$compile = $compile;

                    for (var fnName in fn) {
                        if (fnName == "ctrl") continue;

                        thatCtrl.$scope[fnName] = (function (fnName) {
                            return function () {
                                return fn[fnName].apply(thatCtrl, arguments);
                            };
                        })(fnName);
                    }

                    $scope.$$postDigest(function(){
                        fn.ctrl.call(thatCtrl);
                        $scope.$apply();
                    });
                };

                obj.prototype = pro;

                if (isTemplate) {
                    return obj;
                } else {
                    return new obj();
                }
            })();

            $._method._appendCtrl(ctrlName, window[ctrlName].ctrl);
            return window[ctrlName];
        },

        require: function (ctrlName, fn) {
            
        },

        /**
         * 获取当前页面的控制器对象
         * @function control
         * @memberof me
         */
        control: function () {
            var pages = jQuery(".me-page");
            var ctrlString = pages.eq(pages.length - 1).find("[ng-controller]").attr("ng-controller"),
                ctrlName = ctrlString ? ctrlString.split(".")[0] : "";

            return ctrlName ? window[ctrlName] : {};
        },

        copy: function(o){
            return angular.copy(o);
        },

        pageReady: function(ctrl,callbck){
            ctrl.$scope.$$postDigest(callbck);
        },

        refresh: function(ctrl){
            ctrl.$timeout(function() {});
        },

        setCom: function(ctrl,keyName,comName, data,callback) {
            var path = ctrl.components[comName];
            $.utils.loadScript(path,path+".js",function(isExists){
                ctrl.$scope[keyName] = path + ".html?v="+$._param.config.version;
                if (!isExists) ctrl.$scope.$apply();

                var comCtrl = window[comName];
                var temp = setInterval(function() {
                    if(comCtrl.$scope) {
                        if (comCtrl.setData) comCtrl.setData(data);
                        comCtrl.$scope.$apply();

                        clearInterval(temp);
                        temp = null;

                        callback && callback(comCtrl);

                    } 
                },50);

            });
        },

        getCom: function(id,callback){
            if (!callback) {
                var comCtrlName = jQuery("[cid="+id+"]").find("> div").attr("ng-controller");
                comCtrlName = comCtrlName.split('.')[0];
                return window[comCtrlName];
            } else {
                var comCtrlName = jQuery("[cid="+id+"]").find("> div").attr("ng-controller");

                if (!comCtrlName) {
                    me.ngobj.$timeout(function(){
                        me.getCom(id,callback);
                    }, 500);
                    return;
                }

                comCtrlName = comCtrlName.split('.')[0];
                callback(window[comCtrlName]);
            }
        },

        import: function(src, callback, scriptId){
            if (!scriptId) {
                scriptId = src.split("/").pop();
            }
            if (src.indexOf(".js")<0) {
                src += ".js";
            }
            $.utils.loadScript(scriptId, src, callback);
        },
    });
})(me);

/*
 * 私人空间
 * @module _method
 * @memberof me
 * @private
 */
(function ($) {
    $._param = {
        ctrlList: [],
        hideLayer: 0,
        pageList: [],
        hideParam: null,
        config: {},
        container: null,
        readyFnList: [],
        directiveList: [],
        module: null
    };

    $._method = {
        /**
         * 构建controller
         * @function _buildCtrl
         */
        _buildCtrl: function () {
            for (var i = 0; i < $._param.ctrlList.length; i++) {
                var ctrl = $._param.ctrlList[i];

                $._param.module.controller(ctrl.name + ".ctrl", ctrl.fn);
            }
        },

        /**
         * 存储controller列表
         * @function _appendCtrl
         * @param {String} ctrlName - controller名称
         * @param {Function} fn - 入口函数
         */
        _appendCtrl: function (ctrlName, fn) {
            if (angular.version.minor < 3) return;

            $._param.ctrlList.push({
                name: ctrlName,
                fn: fn
            });
        },

        _show: function (src, options) {
            var lastTitle = document.title;

            $._method._log(src, options);
            $._method._setTitle(options);

            var lastPage = $._method._getLastPage(),
                html = $._method._getPageHtml(src, options),
                container = $._method._getContainer(),
                newPage = $._method._getLastPage(),
                hideSelector = $._param.config.hideSelector;

            if (options.showType == 0) {
                $.ngobj.$location.hash("");
                hideSelector && jQuery(hideSelector).show();
            } else {
                if (lastPage) {
                    lastPage.scrollTop = $._param.config.scroller
                        ? jQuery($._param.config.scroller).scrollTop()
                        : jQuery(document).scrollTop()
                } else {
                    container.find("> *:first").attr("id", "_rootpage_");
                    lastPage = {
                        id: "_rootpage_",
                        hash: "",
                        scrollTop: $._param.config.scroller
                            ? jQuery($._param.config.scroller).scrollTop()
                            : jQuery(document).scrollTop(),
                        param: null,
                        title: lastTitle,
                        style: null,
                        src: null
                    };
                    $._param.pageList.splice(0, 0, lastPage);
                }

                if (newPage.style != "pop") {
                    lastPage && jQuery("#" + lastPage.id).hide();
                    $._param.config.scroller
                        ? jQuery($._param.config.scroller).scrollTop(0)
                        : jQuery(document).scrollTop(0)
                }

                $.ngobj.$location.hash(newPage.hash)
                hideSelector && jQuery(hideSelector).hide();
            }

            options.refresh && $.ngobj.$scope.$apply();
            $._param.onshow && $._param.onshow();
            return {
                pageObj: newPage,
                html: html
            };
        },

        _getComCid: function(comStr) {
            var r = /.*?cid=["'](.*?)['"].*/;
            var m = r.exec(comStr);
            if (m) {
                return m[1];
            }
        },

        _getComId: function(comStr) {
            var r = /.*?\sid=["'](.*?)['"].*/;
            var m = r.exec(comStr);
            if (m) {
                return m[1];
            }
        },

        _loadComponent: function(pageEl,html, componentData, pageCtrl, callback){
            if (!componentData || JSON.stringify(componentData)=="{}") {
                callback(html);
                return;
            }

            var comNames = Object.keys(componentData);
            if (comNames.length == 0) {
                callback(html);
                return;
            }

            var comName = comNames.shift();
            var replacement = new RegExp("<" + comName + "[\\s\\S]*?>[\\s\\S]*?</"+comName+">","gi");
            if (!replacement.test(html)) {
                delete componentData[comName];
                
                $._method._loadComponent(pageEl,html,componentData,pageCtrl,callback);
                return;
            }

            var src = componentData[comName];
            var src_ctrl = src + '.js',
                src_html = src + '.html';
            
            var need_cache = $._param.config.cache;
            if (need_cache) {
                src_ctrl += '?v=' + $._param.config.version;
                src_html += '?v=' + $._param.config.version;
            } else {
                src_ctrl += '?v=' + new Date().getTime();
                src_html += '?v=' + new Date().getTime();
            }

            $.utils.getHtml(src,src_html,function(comHtmlBase){
                $._method._loadRefer(src,comHtmlBase,function(comHtmlBase){
                    $.utils.loadScript(comName,src_ctrl, function(isExists){
                        $._method._dealComHtml(componentData,comName);

                        var comReg = new RegExp("<" + comName + "[\\s\\S]*?>[\\s\\S]*?</"+comName+">","gi");
                        var comrlt = comReg.exec(html);

                        while (comrlt) {
                            var comstr = comrlt[0];
                            comrlt = comReg.exec(html);

                            var comCtrl = window[comName];
                            var comHtml = comHtmlBase;

                            var comId = Math.random().toString().substring(2);
                            if (typeof(comCtrl) == "function") {
                                comCtrl = new comCtrl();
                                window['com_' + comCtrl.id] = comCtrl;

                                comHtml = comHtml.replace('ng-controller="'+comName+'.ctrl"','ng-controller="com_'+comCtrl.id+'.ctrl" id="'+comId+'"');

                            } else {
                                comHtml = comHtml.replace('ng-controller="'+comName+'.ctrl"','ng-controller="'+comName+'.ctrl" id="'+comId+'"');
                            }

                            var compileComHtml = $.ngobj.$compile(comHtml)($.ngobj.$scope);
                            compileComHtml.addClass("me-cloak");

                            // 处理参数
                            var attr_replacement = /\s+([a-zA-Z]+)=['"](.*?)['"]/g;
                            var attrList = [];
                            var attr_rlt = attr_replacement.exec(comstr);
                            var cid = $._method._getComCid(comstr);
                            var comEl;
                            if (cid) {
                                comEl = jQuery(comName+"[cid='"+cid+"']");
                            } else {
                                comEl = jQuery(comName).last();
                            }
                            // 设置com的id
                            comEl.attr("id",comCtrl.id);
                            comEl.html(compileComHtml);
                            while(attr_rlt) {
                                var attrName = attr_rlt[1];
                                if (attrName.indexOf("on") != 0) {
                                    attrList.push([attrName, attr_rlt[2]]);
                                }
                                
                                attr_rlt = attr_replacement.exec(comstr);
                            }

                            comCtrl._isLoaded = false;
                            if (attrList.length > 0) {
                                for(var i in attrList) {
                                    var attrName = attrList[i][0],
                                        attrValue = attrList[i][1];

                                    if (attrValue.indexOf("{") == 0) {
                                        var scopeName = attrValue.replace("{","").replace("}","");

                                        if (pageCtrl.$scope[scopeName]!==undefined) { // 参数已经赋值
                                            comCtrl.$scope[attrName] = pageCtrl.$scope[scopeName];
                                            var allLoaded = true;
                                            for(var j in attrList) {
                                                if (attrList[j][0] == attrName) {
                                                    attrList[j][2] = true;
                                                }

                                                allLoaded = allLoaded && attrList[j][2];
                                            }

                                            if (allLoaded && !comCtrl._isLoaded) {
                                                comCtrl.ready();
                                                comCtrl._isLoaded = true;
                                                comCtrl.$scope.$apply();

                                            }
                                        } else {
                                            $._method._watchComAttr(pageCtrl,scopeName,attrList,attrName,comCtrl,comName,compileComHtml,comEl,function() {
                                            });
                                        }
                                    } 
                                    else {
                                        $._method._setComAttrValue(comCtrl,comName,compileComHtml,attrName,attrValue,attrList,comEl,function() {
                                        });
                                    }
        
                                    attr_rlt = attr_replacement.exec(comstr);
                                }
                            } else {
                                if (!comCtrl._isLoaded) comCtrl.ready();
                                comCtrl._isLoaded = true;
                            }
                        }

                        $._method._continue(pageEl,componentData,comName,html,pageCtrl,isExists,comHtmlBase,callback);
                    });
                });
            });
        },

        _continue: function(pageEl,componentData,comName,html,pageCtrl,isExists,comHtmlBase,callback) {
            delete componentData[comName];
    
            if (JSON.stringify(componentData) == '{}') {
                if (!isExists) $.ngobj.$scope.$apply();
                callback(html);
            } else {
                var comReg = new RegExp("<" + comName + "[\\s\\S]*?>[\\s\\S]*?</"+comName+">","gi");
                html = html.replace(comReg, comHtmlBase);
                $._method._loadComponent(pageEl,html,componentData,pageCtrl,callback);
            }
        },

        _dealComHtml: function(componentData,comName) {
            var comCtrl = window[comName];
            if (typeof(comCtrl) == "function") {
                comCtrl = new comCtrl();
            }
            if (comCtrl.components) {
                jQuery.extend(componentData,comCtrl.components);
            }
        },

        _watchComAttr: function(pageCtrl,scopeName,attrList,attrName,comCtrl,comName,compileComHtml,comEl,callback) {
            pageCtrl.$scope.$watch(scopeName, function(newValue, oldValue){
                $._method._setComAttrValue(comCtrl,comName,compileComHtml,attrName,newValue,attrList,comEl,callback);
            });
        },

        _setComAttrValue: function(comCtrl,comName,compileComHtml,attrName,newValue,attrList,comEl, callback){
            comCtrl.$scope[attrName] = newValue;
            var allLoaded = false;
            if (newValue || newValue == '' || newValue==0 || newValue==false) {
                allLoaded = true;
                for(var j in attrList) {
                    if (attrList[j][0] == attrName) {
                        attrList[j][2] = true;
                    }

                    allLoaded = allLoaded && (attrList[j][2] || attrList[j][2] == '' || attrList[j][2]==0 || attrList[j][2]==false);
                }
            }
            if (allLoaded && comCtrl.ready && !comCtrl._isLoaded) {
                // comEl.html(compileComHtml);
                // comEl.find(".me-cloak").removeClass("me-cloak");
                comCtrl.ready();
                comCtrl._isLoaded = true;

                callback();
            }
        },

        _loadRefer: function(path,html,callback){
            if (path.indexOf("?")>=0) {
                path = path.split("?")[0];
            }
            // 加载css
            var cssReg2 = /@css.*?[\r\n]/g;
            var rlt2 = cssReg2.exec(html);
            var cssArr = [];
            while(rlt2) {
                var strtemp = jQuery.trim(rlt2[0]);
                if (strtemp == "@css") {
                    cssArr.push(path);
                } else {
                    var cssReg3 = /@css\s+"(.*?)"/;
                    var rlt3 = cssReg3.exec(strtemp);
                    if (rlt3) {
                        cssArr.push(rlt3[1]);
                    }
                }
                
                rlt2 = cssReg2.exec(html);
            }

            if (cssArr.length > 0) {
                html = html.replace(cssReg2,"");
            }

            cssArr.forEach(cssa=>{
                var src_css = cssa + ".css";
                var need_cache = $._param.config.cache;
                if (need_cache) {
                    src_css += '?v=' + $._param.config.version;
                } else {
                    src_css += '?v=' + new Date().getTime();
                }
                $.utils.loadStyle(cssa,src_css);
            });

            // 加载js插件
            var jsReg = /@js\s+"(.*?)"/g;
            var rlt = jsReg.exec(html);
            var jsArr = [];
            while(rlt) {
                src_js = rlt[1];
                jsArr.push(src_js);
                rlt = jsReg.exec(html);
            }

            if (jsArr.length > 0) {
                html = html.replace(jsReg,"");
            }

            $._method._loadRefer_js(jsArr, function(){
                callback(html);
            });

            return html;
        },

        _loadRefer_js: function(jsArr,callback){
            if (!jsArr || jsArr.length == 0) {
                callback();
                return;
            }

            var src = jsArr.shift();
            $.utils.loadScript(src,src,function(){
                $._method._loadRefer_js(jsArr,callback);
            });
        },

        /**
         * 处理页面进入和离去动画
         * @function _handleAnimate
         * @param {Element} showPage - 即将被显示的元素
         * @param {Element} hidePage - 即将被隐藏的元素
         * @param {Boolean} isShow - 是显示页面还是隐藏页面
         */
        //_handleAnimate: function (showPage, hidePage, isShow) {
        //    if (!_animateOptions) return;

        //    _animateOptions.show && _animateOptions.show($(showPage[0]), hidePage);
        //},

        /**
         * 执行hide
         * @function _triggerHide
         */
        _triggerHide: function () {
            if ($._param.hideLayer <= 0) return;

            $._param.hideLayer--;
            history.go(-1);
        },

        _getIEVersion: function () {
            var browser = navigator.appName;
            var b_version = navigator.appVersion;
            var version = b_version.split(";");
            var trim_Version = version[1].replace(/[ ]/g, "");
            if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE6.0") {
                return 6;
            }
            if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0") {
                return 7;
            }
            if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
                return 8;
            }
            if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") {
                return 9;
            }
            return 0;
        },

        _loadController: function (src, isFullPath, callback) {
            var pageSrc = $._method._getTplSrc(src, isFullPath),
                reg = /^.*\/(.*?)\.html.*?$/;

            var ctrlName = reg.exec(pageSrc);

            if (!ctrlName) {
                throw new Error("控制器加载失败：" + src);
            }

            ctrlName = ctrlName[1];

            if (window[ctrlName]) {
                callback && callback(true,ctrlName);
                return;
            }

            var ctrlSrc = "";
            if($._param.config.in_tow) {
                ctrlSrc = pageSrc.replace(".html", ".js");
            } else {
                ctrlSrc = pageSrc.replace("tpl/", "js-ctrl/").replace(".html", ".js");
            }
            if (ctrlSrc.indexOf("?") > 0)
                ctrlSrc = ctrlSrc.substring(0, ctrlSrc.indexOf("?"));
            ctrlSrc += "?_t=" + $._param.config.version;
            var id = "ctrl_" + ctrlName;

            $.utils.loadScript(id, ctrlSrc, function () {
                if (angular.version.minor >= 3) {
                    $._param.module.controller(ctrlName + ".ctrl", window[ctrlName]);
                }
                callback && callback(false,ctrlName);
            });
        },

        /**
         * 获取顶层页面对象
         * @function _getLastPage
         * @param {Boolean} isRemove - 获取后是否从队列中删除
         */
        _getLastPage: function (isRemove) {
            if ($._param.pageList.length > 0) {
                var pageList = $._param.pageList;
                return isRemove ? pageList.pop() : pageList[pageList.length - 1];
            }
        },

        /**
         * 删除顶层页面
         * @function _hidePage
         */
        _hidePage: function () {
            if ($._param.pageList.length <= 0) return;

            // 删掉当前页面
            var curPageObj = $._method._getLastPage(true);
            $._method._cleanCtrl(false, curPageObj);

            // 触发hide事件
            $._method._triggerEvent(curPageObj, "hide", $._param.hideParam != null ? [$._param.hideParam] : null);
            $._param.hideParam = null;

            jQuery("#" + curPageObj.id).remove();

            // 显示上一个页面
            var lastPage = $._method._getLastPage();

            if (lastPage) {
                if (curPageObj.style != "pop") {
                    jQuery("#" + lastPage.id).show();
                    $._method._setTitle(lastPage);
                    $.ngobj.$location.hash(lastPage.hash);
                }
                
                $.ngobj.$scope.$$postDigest(function () {
                    setTimeout(function(){
                        $._param.config.scroller
                            ? jQuery($._param.config.scroller)[0].scrollTop = lastPage.scrollTop : window.scrollTo(0, lastPage.scrollTop);
                    });
                    
                });
            }

            // 显示被隐藏的元素
            if ($._param.config.hideSelector && $._param.pageList.length == 1) {
                jQuery($._param.config.hideSelector).show();
            }

            if ($._param.onhide) {
                $._param.onhide();
            } else {
                if ($._param.pageList.length == 0) {
                    history.back();
                    return;
                }
            }
        },

        _loadExtendControl: function(ctrl_arr, callback){
            if (!ctrl_arr || ctrl_arr.length == 0) {
                callback && callback();
                return;
            }

            var success_count = 0;
            for(var i in ctrl_arr) {
                var path = ctrl_arr[i];
                $._method._loadController(path,true,function(){
                    success_count++;

                    if (success_count == ctrl_arr.length) {
                        callback && callback();
                    }
                });
            }
        },

        /**
         * 准备销毁页面控制器内存
         * @function _cleanCtrl
         * @param {Boolean} isCleanAll - 是否销毁所有的页面，如果为false，只销毁当前的页面
         * @param {Boolean} curPageObj - 当前页面的对象
         */
        _cleanCtrl: function (isCleanAll, curPageObj) {
            if (!isCleanAll) {
                $._method._cleanScope(angular.element(jQuery("#" + curPageObj.id + " > div")[0]));
            }
            else {
                var pages = $._method._getContainer().find("> div"),
                    angularEl;
                for (var i = 0; i < pages.length; i++) {
                    angularEl = angular.element(pages.eq(i).find("> div")[0]);
                    $._method._cleanScope(angularEl);
                }
            }
        },

        /**
         * 销毁某个angular控制器
         * @function _cleanScope
         * @param {Element} angularEl - angular元素
         */
        _cleanScope: function (angularEl) {
            if (angularEl.length > 0) {
                var vScope = angularEl.scope();
                vScope && vScope.$destroy();
            }
        },

        /**
         * 路由捕捉到的页面url更改事件
         * @function _urlChanged
         * @param {Event} angularEvent - event对象
         * @param {String} newUrl - 更改之后的url
         * @param {String} oldUrl - 更改之前的url
         */
        _urlChanged: function (angularEvent, newUrl, oldUrl) {
            var lastPage = $._method._getLastPage();

            if (!lastPage) {
                return;
            }

            var newHash = $.ngobj.$location.hash(),
                oldHash = lastPage.hash;

            if (newHash == oldHash) {
                return;
            }

            $._method._hidePage();
        },

        /**
         * 在ctrl主入口中调用的初始化方法
         * @function _init
         */
        _init: function () {
            var startPageName = $.utils.getQueryString("mep");
            if (startPageName) {
                $.show(startPageName, { showType: 0 });
                return;
            }

            //var hash = location.hash;
            //if (hash) {
            //    var reg = /([a-zA-Z\d_]+\-?)+/;
            //    var result = reg.exec(hash);
            //    if (result) {
            //        var path = result[1].replace(/\-/g, "/");
            //        $.show(path, { showType: 0 });
            //        return;
            //    }
            //}

            if ($._param.config.main) {
                $.show($._param.config.main, { showType: 0 });
                return;
            }
        },

        _getShowAniClass: function (options) {
            if (!$._param.config.animate
                || !$._param.config.animate.show
                || options.showType == 0
                || options.style == "pop")
                return "";

            return ' class="' + $._param.config.animate.show + '" ';
        },

        _getHideAniClass: function () {
            if (!$._param.config.animate || !$._param.config.animate.hide) return "";

            return ' class="' + $._param.config.animate.hide + '" ';
        },

        /**
         * 获取即将打开的页面html对象
         * @function _getPageHtml
         * @param {String} src - me.show中传入的src
         * @param {Object} options - me.show中传入的options对象
         */
        _getPageHtml: function (src, options) {
            var pageSrc = $._method._getTplSrc(src, options.isFullPath);
            var path = pageSrc.replace(/\//g, "-").substring(0, pageSrc.indexOf("."));
            var pageId = path;
            var need_cache = $._param.config.cache;

            var page = '<div class="me-page" id="' + pageId + '" ng-include src="\'' + pageSrc;
            if (!need_cache) {
                if (pageSrc.indexOf("?") > 0) {
                    page += '&v=' + $._param.config.version;
                } else {
                    page += '?v=' +  + $._param.config.version;
                }
            }
            page += '\'"></div>';

            var pageObj = {
                id: pageId,
                hash: options.showType == 0 ? "" : pageId,
                scrollTop: 0,
                param: options.param,
                title: options.title,
                style: options.style,
                src: src
            };

            if (location.search) {
                var srcParam = location.search.substring(1);
                var srcParamList = srcParam.split("&");
                var srcParamObj = {};
                $.utils.each(srcParamList, function (p) {
                    srcParamObj[p.split("=")[0]] = p.split("=")[1];
                })

                pageObj.param || (pageObj.param = {})
                $.utils.extend(srcParamObj, pageObj.param)
                pageObj.param = srcParamObj
            }
            
            /*src中的url参数提取*/
            if (src.indexOf("?")>=0) {
                var srcParam = src.split("?")[1];
                var srcParamList = srcParam.split("&");
                var srcParamObj = {};
                $.utils.each(srcParamList, function (p) {
                    srcParamObj[p.split("=")[0]] = p.split("=")[1];
                })

                pageObj.param || (pageObj.param = {})
                $.utils.extend(pageObj.param, srcParamObj)
            }

            $._method._attachEvent(pageObj);

            if (options.showType == 0) {
                $._method._cleanCtrl(true);
                $._param.pageList = [pageObj];
            } else {
                $._param.pageList.push(pageObj);
            }

            return page;
        },

        /**
         * 加载插件
         * @function _loadPlugin
         * @param {String} pluginName - 插件名称
         * @param {Function} success - 加载成功后的回调
         */
        _loadPlugin: function (pluginName, success) {
            var plugin = $._param.plugins[pluginName];

            $.utils.each(plugin.css, function (src, index) {
                $.utils.loadStyle(pluginName + "_css_" + index, src);
            });

            if (!angular.isArray(plugin.js) || plugin.js.length == 0) {
                if (typeof success == "function") success();
            } else {
                var count = 0;
                $.utils.each(plugin.js, function (src, index) {
                    $.utils.loadScript(pluginName + "_js_" + index, src, function () {
                        count++;

                        if (count == plugin.js.length) {
                            if (typeof success == "function") success();
                        }
                    });
                });
            }
        },

        /**
         * 获取模板路径
         * @function _getTplSrc
         * @param {String} src - 插件名称 | route名称 | 相对路径 | 绝对路径
         */
        _getTplSrc: function (src, isFullPath) {
            if ($._param.plugins && src in $._param.plugins) {
                return $._param.plugins[src].src;
            }

            var config = $._param.config;
            if (config.route && config.route[src])
                return config.route[src];

            config.path = config.path || "tpl/";

            if (!isFullPath && !$.utils.startWith(src, config.path)) {
                src = config.path + src;
            }

            if (src.indexOf("?") < 0) {
                if (!$.utils.endWith(src, ".html")) {
                    src += ".html";
                }
            } else {
                var prex = src.substring(0, src.indexOf("?")),
                    srcParam = src.substring(src.indexOf("?"));
                if (!$.utils.endWith(prex, ".html")) {
                    prex += ".html";
                }
                src = prex + srcParam
            }

            return src;
        },

        /**
         * 在页面对象中添加on和exec函数
         * @function _attachEvent
         * @param {Object} pageObj - 页面对象
         */
        _attachEvent: function (pageObj) {
            pageObj.on = function (ename, callback) {
                if (typeof (callback) != "function") return;
                this._eventMap || (this._eventMap = {});
                this._eventMap[ename] = callback;
                return this;
            }

            pageObj.exec = function (ename) {
                var args = null;
                if (arguments.length > 1) {
                    args = [];
                    for (var i = 1; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }
                }

                $._method._triggerEvent(this, ename, args);
                return this;
            }
        },

        /**
         * 触发页面的事件
         * @function _triggerEvent
         * @param {Object} page - 页面对象
         * @param {String} ename - 事件名称
         * @param {Array} args - 参数
         */
        _triggerEvent: function (page, ename, args) {
            if (!ename
                || !page._eventMap
                || !(ename in page._eventMap)
                || typeof (page._eventMap[ename]) != "function")
                return;
            page._eventMap[ename].apply(page, args || []);
        },

        /**
         * 获取config中设置的container对象，如果没有设置，返回body对象
         * @function _getContainer
         */
        _getContainer: function () {
            $._param.container || ($._param.container = jQuery($._param.config.container || "body"));
            return $._param.container;
        },

        /**
         * me.show页面时，在控制台打印的数据
         * @function _log
         * @param {String} src - 路径
         * @param {Object} options - me.show的时候传入的options
         */
        _log: function (src, options) {
            if (!$._param.config.debug) return;

            console.group && console.group("me.js");
            console.log("%c 链接：" + src, "color:green");
            console.log("%c 参数：" + (options.param ? "" : "[无]"), "color:green");
            options.param && console.log(options.param)
            console.groupEnd && console.groupEnd();
        },

        /**
         * 触发me.ready中注册的函数
         * @function _triggerReadyFn
         */
        _triggerReadyFn: function () {
            if ($._param.readyFnList.length == 0) return;

            for (var i = 0; i < $._param.readyFnList.length; i++) {
                $._param.readyFnList[i]($.ngobj.$scope);
            }
        },

        /**
         * 构建自定义指令
         * @function _buildDirective
         */
        _buildDirective: function () {
            var dirs = $._param.directiveList;
            for (var i = 0; i < dirs.length; i++) {
                $._param.module.directive(dirs[i].tagName, dirs[i].fn);
            }
        },

        /**
         * 设置新打开的页面标题
         * @function _setTitle
         * @param {String} options - me.show的时候传入的options
         */
        _setTitle: function (options) {
            return;
            if (!options.title) {
                options.title = document.title;
                return;
            }

            $.utils.setTitle(options.title);
        },
    };
    if ($._param.config.debug && window.navigator.userAgent.indexOf("Chrome") >= 0) console.log("%cME", " text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:8em");
})(me);
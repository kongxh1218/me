/**
 * @module me
 * @namespace me
 * @version 1.1
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
            document.title = title;
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

        extend: function (obj, newObj) {
            for (var i in newObj) {
                obj[i] = newObj[i];
            }
        },

        loadScript: function (scriptId, src, callback) {
            if (document.getElementById(scriptId)) {
                return;
            }

            jQuery.getScript(src, callback);
        },

        loadStyle: function (styleId, src) {
            //if (document.getElementById(styleId)) return;

            //var oCss = document.createElement("link");
            //oCss.id = styleId;
            //oCss.setAttribute("rel", "stylesheet");
            //oCss.setAttribute("type", "text/css");
            //oCss.setAttribute("href", src);
            //document.getElementsByTagName("head")[0].appendChild(oCss);

            document.writeln('<link href="' + src + '" rel="stylesheet" />')
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
        ctrl: function ($rootScope, $scope, $compile, $location, $http) {
            $.ngobj = {
                $rootScope: $rootScope,
                $scope: $scope,
                $compile: $compile,
                $location: $location,
                $http: $http
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
            option.data = JSON.stringify(option.data);
            option.success = function (data) {
                success && success(data);
                $.ngobj.$scope.$apply();
            };
            option.error = function () {
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
         * @property {Array} [ctrlpath=null] - null: 额外的控制器ctrlpath
         * @property {String} [container=null] - null: 指定容器，默认使用config配置
         * @property {Boolean} [isFullPath=false] - false: 是否全路径，默认false
         */
        show: function (src, options) {
            var page = $._method._show(src, options);


            $._method._loadController(src, options.isFullPath, function (exists) {
                var container = $._method._getContainer(options.container),
                    compilePage = $.ngobj.$compile(page.html)($.ngobj.$scope);
                if (options.showType == 0) {
                    container.html(compilePage);
                } else {
                    page.pageObj.style == "pop"
                        ? jQuery("body").append(compilePage)
                        : container.append(compilePage);
                }

                //加载扩展控制器
                $._method._loadExtendControl(options.ctrlpath, function(){
                    !exists && me.ngobj.$scope.$apply();
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
         * 获取顶层的页面对象
         * @function page
         * @memberof me
         */
        page: function () {
            return $._method._getLastPage();
        },

        /**
         * 定义controller
         * @function define
         * @memberof me
         * @param {String} ctrlName - controller名称
         * @param {Object} fnList - 接口列表
         */
        define: function (ctrlName, fnList) {
            return $.require(ctrlName, fnList);
        },

        require: function (ctrlName, fn) {
            if (window[ctrlName]) throw new Error("me中已经注册了名为" + ctrlName + "的控制器");
            if (!fn || !fn.ctrl) throw new Error("me.require方法中的fn参数对象中需要提供ctrl方法");

            window[ctrlName] = (function () {
                var thatCtrl;
                var obj = function () {
                    thatCtrl = this;
                }

                var pro = {};
                pro.ctrl = function ($scope, $http, $timeout) {
                    thatCtrl.$scope = $scope;
                    thatCtrl.$http = $http;
                    thatCtrl.$timeout = $timeout;

                    for (var fnName in pro) {
                        if (fnName == "ctrl") continue;

                        thatCtrl.$scope[fnName] = pro[fnName];
                    }

                    fn.ctrl.call(thatCtrl);
                };

                for (var fnName in fn) {
                    if (fnName == "ctrl") continue;

                    if (typeof fn[fnName] == "function") {
                        pro[fnName] = (function (fnName) {
                            return function () {
                                return fn[fnName].apply(thatCtrl, arguments);
                            };
                        })(fnName);
                    }
                }

                obj.prototype = pro;

                return new obj();
            })();

            $._method._appendCtrl(ctrlName, window[ctrlName].ctrl);
            return window[ctrlName];
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
        }
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
            options.container || (options.container = me._param.config.container);

            var lastTitle = document.title;
            $._method._log(src, options);
            $._method._setTitle(options);

            var lastPage = $._method._getLastPage(false,options.container);
            var html = $._method._getPageHtml(src, options);
            var container = $._method._getContainer(options.container);
            var newPage = $._method._getLastPage(false,options.container);
            var hideSelector = $._param.config.hideSelector;

            if (options.showType == 0) {
                $.ngobj.$location.hash(newPage.hash)
                hideSelector && jQuery(hideSelector).show();
            } else {
                if (lastPage) {
                    lastPage.scrollTop = $._param.config.scroller
                        ? jQuery($._param.config.scroller).scrollTop()
                        : jQuery(document).scrollTop()
                } else {
                    rootpage_id = "_rootpage_" + Math.round(Math.random() * 10000);
                    container.find("> *:first").attr("id", rootpage_id);
                    lastPage = {
                        id: rootpage_id,
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

                //newPage.style == "pop"
                //    ? jQuery("body").append($.ngobj.$compile(html)($.ngobj.$scope))
                //    : container.append($.ngobj.$compile(html)($.ngobj.$scope));

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

        _loadExtendControl: function(ctrl_arr, callback){
            if (!ctrl_arr || ctrl_arr.length == 0) {
                callback && callback();
                return;
            }

            var path = ctrl_arr.pop();
            $._method._loadController(path,true,function(){
                $._method._loadExtendControl(ctrl_arr,callback);
            })
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
                callback && callback(true);
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
            ctrlSrc += "?_t=" + new Date().getTime();
            var id = "ctrl_" + ctrlName;

            $.utils.loadScript(id, ctrlSrc, function () {
                if (angular.version.minor >= 3) {
                    $._param.module.controller(ctrlName + ".ctrl", window[ctrlName]);
                }
                callback && callback(false);
            });
        },

        /**
         * 获取顶层页面对象
         * @function _getLastPage
         * @param {Boolean} isRemove - 获取后是否从队列中删除
         */
        _getLastPage: function (isRemove,container_id) {
            if ($._param.pageList.length > 0) {
                var pageList = $._param.pageList;
                if (container_id) {
                    for(var i = pageList.length - 1; i >= 0; i--) {
                        if (pageList[i].container_id == container_id) {
                            var p = pageList[i];
                            if (isRemove) {
                                pageList.splice(i, 1);
                            }
                            return p;
                        }
                    }
                } else {
                    return isRemove ? pageList.pop() : pageList[pageList.length - 1];
                }
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
            $._method._cleanCtrl(false, curPageObj,curPageObj.container_id);

            // 触发hide事件
            $._method._triggerEvent(curPageObj, "hide", $._param.hideParam != null ? [$._param.hideParam] : null);
            $._param.hideParam = null;

            jQuery("#" + curPageObj.id).remove();

            // 显示上一个页面
            var lastPage = $._method._getLastPage(false,curPageObj.container_id);
            if ($._param.pageList.length == 0) {
                setTimeout(function(){
                    location.hash = "";
                });
            }
            if (curPageObj.style != "pop" && lastPage) {
                jQuery("#" + lastPage.id).show();
                $._method._setTitle(lastPage);

                $.ngobj.$scope.$$postDigest(function () {
                    setTimeout(function(){
                        $._param.config.scroller
                            ? jQuery($._param.config.scroller)[0].scrollTop = lastPage.scrollTop 
                            : window.scrollTo(0, lastPage.scrollTop);
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

        /**
         * 准备销毁页面控制器内存
         * @function _cleanCtrl
         * @param {Boolean} isCleanAll - 是否销毁所有的页面，如果为false，只销毁当前的页面
         * @param {Boolean} curPageObj - 当前页面的对象
         * @param {String} container_id - 容器id
         */
        _cleanCtrl: function (isCleanAll, curPageObj, container_id) {
            if (!isCleanAll) {
                $._method._cleanScope(angular.element(jQuery("#" + curPageObj.id + " > div")[0]));
            }
            else {
                var pages = jQuery(container_id).find("> div"),
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
            if($._param.pageList.length == 0) return;

            var newHash, oldHash;
            if (newUrl.lastIndexOf("#") > 0) {
                newHash = newUrl.substring(newUrl.lastIndexOf("#") + 1);
            }
            if (oldUrl.lastIndexOf("#") > 0) {
                oldHash = oldUrl.substring(oldUrl.lastIndexOf("#") + 1);
            }

            // console.log("************");
            // console.log(angular.copy($._param.pageList))
            // console.log(oldUrl,newUrl)
            // console.log(oldHash,$._param.pageList[$._param.pageList.length-1].hash);
            if (oldHash == $._param.pageList[$._param.pageList.length-1].hash) {
                $._method._hidePage();
            }
            
            // var lastPage = $._method._getLastPage();
            // if (!lastPage) {
            //     return;
            // }

            // var newHash = $.ngobj.$location.hash(),
            //     oldHash = lastPage.hash;
            // if (newHash == oldHash) {
            //     return;
            // }

            // $._method._hidePage();
        },

        /**
         * 在ctrl主入口中调用的初始化方法
         * @function _init
         */
        _init: function () {
            var startPageName = $.utils.getQueryString("p");
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

            // 检查之前是否存在同名页面 TODO
            // if ($._param.pageList && $._param.pageList.length > 0) {
            //     var existsCount = 0;
            //     for (var i in $._param.pageList) {
            //         var pageShortName = $._param.pageList[i].id,
            //             pageCtrlName = /.*-(.*)/.exec(pageShortName)[1];
            //         if (pageShortName == pageId) {
            //             existsCount++;

            //             // 缓存之前相同页面数据
            //             !$._param.pageDataCache && ($._param.pageDataCache = {});
            //             if (!$._param.pageDataCache[$._param.pageList[i].id]) {
            //                 // TODO 拷贝非函数变量
            //             }
            //         }
            //     }

            //     if (existsCount > 0) {
            //         pageId += "-" + existsCount;
            //     }
            // }

            var need_cache = $._param.config.cache;

            var page = '<div class="me-page" id="' + pageId + '" ng-include src="\'' + pageSrc;
            need_cache || (page += '?temp=' + new Date().getTime());
            page += '\'"></div>';

            var pageObj = {
                id: pageId,
                hash: options.showType == 0 ? pageId : pageId,
                scrollTop: 0,
                param: options.param,
                title: options.title,
                style: options.style,
                src: src,
                container_id: options.container || $._param.config.container
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
                $._method._cleanCtrl(true,null,pageObj.container_id);
                $._method._cleanPage(pageObj.container_id);
            } 
            $._param.pageList.push(pageObj);

            return page;
        },

        _cleanPage: function(container_id){
            if ($._param.pageList.length <= 0) return;

            for(var i = $._param.pageList.length - 1; i >= 0; i--) {
                if ($._param.pageList[i].container_id == container_id) {
                    $._param.pageList.splice(i, 1);
                }
            }
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
         * 如果未指定容器，获取config中设置的container对象，如果没有设置，返回body对象
         * @function _getContainer
         * @param {String} container_id - 指定的容器的id
         */
        _getContainer: function (container_id) {
            if (container_id) {
                if (!container_id.startsWith('#')) {
                    throw new Error("指定容器的id只能以#开头");
                }
                $._param.container = jQuery(container_id);
            } else {
                $._param.container = jQuery($._param.config.container || "body")
            }
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
            if (!options.title) {
                options.title = document.title;
                return;
            }

            $.utils.setTitle(options.title);
        }
    };
    if ($._param.config.debug && window.navigator.userAgent.indexOf("Chrome") >= 0) console.log("%cME", " text-shadow: 0 1px 0 #ccc,0 2px 0 #c9c9c9,0 3px 0 #bbb,0 4px 0 #b9b9b9,0 5px 0 #aaa,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);font-size:8em");
})(me);
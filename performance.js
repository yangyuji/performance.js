/*
* author: "oujizeng",
* license: "MIT",
* name: "performance.js",
* version: "1.2.0"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root['showPerformance'] = factory();
    }
}(this, function () {

    var util = {
        _css: function (el, obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    el.style[key] = obj[key];
                }
            }
        }
    }

    function renderRpt(t) {
        var div = document.createElement('div');
        var scale = 1;
        // 获取缩放值
        var viewport = document.getElementsByTagName('meta')['viewport'];
        if (viewport && viewport['content']) {
            var match = viewport['content'].match(/initial\-scale=([\d\.]+)/);
            if (match && match.length > 1) {
                scale = parseFloat(match[1]);
            }
        }
        // console.log(scale);
        var style = {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: 200 * 1 / scale + 'px',
            backgroundColor: '#999',
            opacity: '.9',
            color: '#fff',
            zIndex: '10000'
        };
        util._css(div, style);

        var rowTotal = document.createElement('div');
        var sty = {
            position: 'relative',
            height: 50 * 1 / scale + 'px'
        };
        util._css(rowTotal, sty);

        var perDiv = document.createElement('div');
        var st = {
            height: 20 * 1 / scale + 'px',
            minWidth: '2px'
        }
        util._css(perDiv, st);

        var innerDiv = document.createElement('div');
        var s = {
            height: 25 * 1 / scale + 'px'
        }
        util._css(innerDiv, s);

        var rowDNS = rowTotal.cloneNode(true);
        var perDNS = perDiv.cloneNode(true);
        var innerDNS = innerDiv.cloneNode(true);

        var rowTCP = rowTotal.cloneNode(true);
        var perTCP = perDiv.cloneNode(true);
        var innerTCP = innerDiv.cloneNode(true);

        var rowRequest = rowTotal.cloneNode(true);
        var perRequest = perDiv.cloneNode(true);
        var innerRequest = innerDiv.cloneNode(true);

        var rowLoad = rowTotal.cloneNode(true);
        var perLoad = perDiv.cloneNode(true);
        var innerLoad = innerDiv.cloneNode(true);

        var rowProcessing = rowTotal.cloneNode(true);
        var perProcessing = perDiv.cloneNode(true);
        var innerProcessing = innerDiv.cloneNode(true);

        perDNS.style.backgroundColor = '#60fe02';
        perDNS.style.width = t.DNS / t.loadPage * 100 + '%';
        innerDNS.innerHTML = 'DNS解析：' + t.DNS + 'ms';
        rowDNS.appendChild(perDNS);
        rowDNS.appendChild(innerDNS);
        div.appendChild(rowDNS);

        perTCP.style.backgroundColor = '#210dfe';
        perTCP.style.width = t.TCP / t.loadPage * 100 + '%';
        innerTCP.innerHTML = 'TCP连接：' + t.TCP + 'ms';
        rowTCP.appendChild(perTCP);
        rowTCP.appendChild(innerTCP);
        div.appendChild(rowTCP);

        perRequest.style.backgroundColor = '#5afefe';
        perRequest.style.width = t.request / t.loadPage * 100 + '%';
        innerRequest.innerHTML = '请求响应：' + t.request + 'ms';
        rowRequest.appendChild(perRequest);
        rowRequest.appendChild(innerRequest);
        div.appendChild(rowRequest);

        perLoad.style.backgroundColor = '#f9cc1d';
        perLoad.style.width = t.onload / t.loadPage * 100 + '%';
        innerLoad.innerHTML = 'load执行：' + t.onload + 'ms';
        rowLoad.appendChild(perLoad);
        rowLoad.appendChild(innerLoad);
        div.appendChild(rowLoad);

        perProcessing.style.backgroundColor = '#5ef976';
        perProcessing.style.width = t.processing / t.loadPage * 100 + '%';
        innerProcessing.innerHTML = '资源加载：' + t.processing + 'ms';
        rowProcessing.appendChild(perProcessing);
        rowProcessing.appendChild(innerProcessing);
        div.appendChild(rowProcessing);

        perDiv.style.backgroundColor = '#c516fe';
        perDiv.style.width = '100%';
        innerDiv.innerHTML = '总用时：' + t.loadPage + 'ms';
        rowTotal.appendChild(perDiv);
        rowTotal.appendChild(innerDiv);
        div.appendChild(rowTotal);

        var isShow = localStorage.getItem('monitor_tools_show');
        if (isShow == 'hide') {
            div.style.display = 'none';
        }

        document.body.appendChild(div);

        // 长按3秒黑科技
        var timeLong = 0;
        document.body.addEventListener('touchstart', function (e) {
            timeLong = new Date().getTime();
        }, false);

        document.body.addEventListener('touchcancel', function (e) {
            // 待做：处理那些浏览器弹出菜单
            timeLong = 0;
        }, false);

        document.body.addEventListener('touchend', function (e) {
            var now = new Date().getTime();
            var display = localStorage.getItem('monitor_tools_show');
            if (now - timeLong > 3 * 1000) {
                if (!display || display == 'show') {
                    div.style.display = 'none';
                    localStorage.setItem('monitor_tools_show', 'hide');
                } else {
                    div.style.display = 'block';
                    localStorage.setItem('monitor_tools_show', 'show');
                }
            }
        }, false);
    }

    function showPerformance() {

        // 各个时间点的说明参考：http://javascript.ruanyifeng.com/bom/performance.html

        if (!window.performance || !window.performance.timing) {
            return null
        }
        var t = window.performance.timing;
        var times = {};

        //【重要】页面加载完成的时间
        //【原因】这几乎代表了用户等待页面可用的时间
        times.loadPage = t.loadEventEnd - t.navigationStart;

        //【重要】从最开始，到读取页面第一个字节，所耗费的时间
        //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
        // TTFB 即 Time To First Byte 的意思
        // 维基百科：https://en.wikipedia.org/wiki/Time_To_First_Byte
        times.ttfb = t.responseStart - t.navigationStart;

        //【重要】内容加载完成的时间（从请求开始到加载结束）
        //【原因】页面内容经过 gzip 压缩了么，静态资源 css/js 等压缩了么？
        // Response 从发起request请求，到所有资源下载完毕
        times.requestAndResponse = t.responseEnd - t.requestStart;

        //【重要】解析 DOM 树结构的时间
        //【原因】反省下你的 DOM 树嵌套是不是太多了！
        times.domReady = t.domComplete - t.responseEnd;

        //-------------------------- 分割线 --------------------------

        // 0、Prompt for unload
        // 前一个页面卸载页面的时间
        times.unloadEvent = t.unloadEventEnd - t.unloadEventStart;

        // 1、redirect
        //【重要】重定向的时间
        //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
        // 如果没有斜杠，就会有额外的重定向时间
        times.redirect = t.redirectEnd - t.redirectStart;

        // 2、appcache
        // DNS 缓存时间
        times.appCache = t.domainLookupStart - t.fetchStart;

        // 3、DNS
        //【重要】DNS 查询时间
        //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
        // 可使用 HTML5 Prefetch 预查询 DNS ，见：[HTML5 prefetch](http://segmentfault.com/a/1190000000633364)
        times.DNS = t.domainLookupEnd - t.domainLookupStart;

        // 4、TCP
        // TCP 建立连接完成握手的时间
        times.TCP = t.connectEnd - t.connectStart;

        // 5、request
        // 从发起请求到获取返回结束的数据耗时
        times.request = t.responseEnd - t.requestStart;

        // 6、Processing
        // document从开始加载内嵌资源 到 全部加载完毕
        times.processing = t.loadEventStart - t.domLoading;

        // 8、onload
        //【重要】执行 onload 回调函数的时间
        //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
        times.onload = t.loadEventEnd - t.loadEventStart;

        renderRpt(times);
    }

    window.onload = function () {
        setTimeout(showPerformance, 0);
    }

    return showPerformance;

}));
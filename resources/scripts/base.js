$(function () {
    // jquery.cookie 초기 설정
    $.cookie.json = true;
    $.cookie.defaults.expires = 9999999;

    // mustache 미리 로딩
    Mustache.parse($('#tpl-card').html());
    Mustache.parse($('#tpl-grid').html());

    // 페이지 내부 스크립트는 반드시 순서대로 로딩
    $.getScript("./resources/scripts/api.js", function (data, textStatus, jqxhr) {
        if (textStatus === "success" && jqxhr.status === 200) {
            $.getScript("./resources/scripts/binder.js", function (data, textStatus, jqxhr) {
                if (textStatus === "success" && jqxhr.status === 200) {
                    // 쿠키로부터 데이터 로드
                    if(window.CONST.DB) {
                        // JsQuery API 로 데이터 정렬
                        window.CONST.QUERY.setObject(window.CONST.DB.GRIDS);
                        window.CONST.QUERY.setQuery("sequence, selector, title ORDER sequence");
                        window.CONST.DB.GRIDS = window.CONST.QUERY.getResult();
                        for(var idx in window.CONST.DB.GRIDS) {
                            var data = window.CONST.DB.GRIDS[idx];
                            if (data) {
                                if (data.selector)
                                    $("section#article").pushGrid(data);
                            }
                        }

                        // JsQuery API 로 데이터 정렬
                        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
                        window.CONST.QUERY.setQuery("idx, issueType, grid, name, contents, tag, reg ORDER -idx");
                        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();
                        for (var idx in window.CONST.DB.CARDS) {
                            var data = window.CONST.DB.CARDS[idx];
                            if (data) {
                                if (data.grid)
                                    $("section.grid." + data.grid + " ul.card-group").pushCard(data);
                            }
                        }

                        $.excuteDraggable();
                    }

                    // IE 9 이하 및 모바일 버전 스타일 로드
                    if(isMobile.any) {
                        $.get("./resources/styles/mobile.css", function(data){
                            $("head").append("<style>"+data+"</style>");
                        });
                    } else if (window.CONST.IE_VER <= 9){
                        $.get("./resources/styles/low_ie.css", function(data){
                            $("head").append("<style>"+data+"</style>");
                        });
                    }
                } else {
                    alert("Can not load binder");
                }
            });
        } else {
            alert("Can not load api");
        }
    });

    $(window).on("load", function () { uiFixer(); });
    $(window).on("resize", function () { uiFixer(); });
    $(window).on("scroll", function () { uiFixer(); });
    $(window).on("beforeunload", function() {
        $(window.CONST.DB).backup();
    });

    function uiFixer() {
        $("section#article").height($("body").innerHeight() - $("header#header").outerHeight());
    }
});
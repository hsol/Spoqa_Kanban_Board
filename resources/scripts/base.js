$(function () {
    // under IE 10 check
    var IsLowIE = navigator.userAgent.toLowerCase().indexOf("msie") != -1;

    // jquery.cookie defaults
    $.cookie.json = true;
    $.cookie.defaults.expires = 9999999;

    // mustache pre load
    Mustache.parse($('#tpl-card').html());

    // require
    $.getScript("./resources/scripts/api.js", function (data, textStatus, jqxhr) {
        if (textStatus === "success" && jqxhr.status === 200) {
            $.getScript("./resources/scripts/binder.js", function (data, textStatus, jqxhr) {
                if (textStatus === "success" && jqxhr.status === 200) {

                    // initial data set from cookie
                    if(window.CONST.DB.CARDS.length) {
                        // order by idx
                        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
                        window.CONST.QUERY.setQuery("idx, issueType, name, contents, tag, reg ORDER -idx");
                        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();

                        for (var idx in window.CONST.DB.CARDS) {
                            var data = window.CONST.DB.CARDS[idx];
                            if (data) {
                                if (data.progress)
                                    $("section.grid." + data.progress + " ul.card-group").pushCard(data);
                            }
                        }
                    }

                    // compatibility style load
                    if(isMobile.any || IsLowIE) {
                        $.get("./resources/styles/mobile.css", function(data){
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

    $(window).on("resize", function () { uiFixer(); });
    $(window).on("scroll", function () { uiFixer(); });
    $(window).on("beforeunload", function() {
        $(window.CONST.DB).backup();
    });

    function uiFixer() {
        $("section#article").height($("body").innerHeight() - $("header#header").outerHeight());
    }
});
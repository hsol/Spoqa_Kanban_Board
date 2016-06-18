$(function () {
    var IsLowIE = navigator.userAgent.toLowerCase().indexOf("msie") != -1;
    window.CONST = {
        SECRET_MODE: false,
        ISSUE_TYPE: {
            imp: "./resources/images/" + (IsLowIE ? "icn_improvement.png" : "icn_improvement.svg"),
            def: "./resources/images/" + (IsLowIE ? "icn_defect.png" : "icn_defect.svg")
        },
        MODEL: {
            CARD: {
                idx: "number",
                progress: "string",
                issueType: "string",
                name: "string",
                contents: "string",
                tag: "array",
                reg: "object"
            }
        },
        DB: $.cookie("Database") || {
            CARDS: []
        },
        QUERY: new JsQuery()
    };

    if(CONST.SECRET_MODE)
        $.removeCookie("DB");
});

$.fn.showModal = function (selector) {
    if (selector) {
        var topMargin;
        var modal = $(this).find(selector);
        if (modal.length) {
            modal.find("input").each(function(){ $(this).val(""); });

            $(this).show().css("opacity", "0").find(selector).show();
            topMargin = ($(this).innerHeight() - modal.outerHeight()) / 2;
            modal.css("margin-top", (topMargin >= 0 ? topMargin : 0) + "px");
            $(this).animate({
                opacity: 1
            }, 200, function () {
            });
        } else {
            console.error("Can not find selector");
        }
    } else {
        console.error("Please show your selector");
    }
};

$.fn.hideModal = function (selector) {
    if (selector) {
        var modal = $(this).find(selector);
        if (modal.length) {
            $(this).animate({
                opacity: 0
            }, 200, function () {
                $(this).hide();
                modal.hide();
            });
        } else {
            console.error("Can not find selector");
        }
    } else {
        console.error("Please show your selector");
    }
};

$.fn.pushCard = function (data, dbState) {
    $(data).convertModel(window.CONST.MODEL.CARD);

    var count = $(this).parents("section.grid").find("span.count");
    count.text(parseInt(count.text()) + 1);

    if(!data.icnUrl) {
        data.icnUrl = window.CONST.ISSUE_TYPE[data.issueType]
    }
    if(!data.idx) {
        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
        window.CONST.QUERY.setQuery("idx, issueType, progress, name, contents, tag, reg WHERE 1==1 ORDER -idx");
        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();
        data.idx = window.CONST.DB.CARDS.length > 0 ? window.CONST.DB.CARDS[0].idx + 1 : 1;
    }
    if(!data.progress)
        data.progress = $(this).parents("section.grid").attr('class').replace("grid ", "");

    $(this).append(Mustache.render($('#tpl-card').html(), data));

    if(dbState)
        window.CONST.DB.CARDS.push(data);
};

$.fn.convertModel = function (model) {
    if (model) {
        for (var key in model) {
            if (typeof this[0][key] != model[key]) {
                if(typeof model[key] === "number" && typeof this[0][key] === "string")
                    this[0][key] = parseInt(this[0][key]);
                if(typeof model[key] === "string" && typeof this[0][key] === "number")
                    this[0][key] = this[0][key].toString();

                if(typeof model[key] === "array" && typeof this[0][key] === "string")
                    this[0][key] = this[0][key].replace(new RegExp(" ", ""), "").join(",");
            }
        }
    }
};

$.fn.copy = function(remain) {
    if(!remain) {
        for (var idx in this[0])
            this[0][idx] = null;
    }

    return JSON.parse(JSON.stringify(this))[0];
};


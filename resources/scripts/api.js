$(function () {
    var IsLowIE = navigator.userAgent.toLowerCase().indexOf("msie") != -1;
    window.CONST = {
        SECRET_MODE: false,
        ISSUE_TYPE: {
            imp: "Improvement",
            def: "Defect"
        },
        ISSUE_TYPE_IMG: {
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

$.fn.showModal = function (selector, clearState) {
    if (selector) {
        var topMargin;
        var modal = $(this).find(selector);
        if (modal.length) {
            if(clearState) {
                modal.removeAttr("data-idx");
                $("section.modal-group #issue-creator .select_box label").attr("class", "type-imp").text(window.CONST.ISSUE_TYPE["imp"]);
                modal.find("select").val("imp");
                modal.find("input").each(function () {
                    $(this).val("");
                });
            }

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
    data.icnUrl = window.CONST.ISSUE_TYPE_IMG[data.issueType];
    if(!data.idx) {
        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
        window.CONST.QUERY.setQuery("idx, issueType, progress, name, contents, tag, reg WHERE 1==1 ORDER -idx");
        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();
        data.idx = window.CONST.DB.CARDS.length > 0 ? window.CONST.DB.CARDS[0].idx + 1 : 1;
    }

    if(!data.progress && $(this).parents("section.grid").attr('class'))
        data.progress = $(this).parents("section.grid").attr('class').replace("grid ", "");

    data.reg = new Date(data.reg).format("yyyy-MM-dd");

    $(this).append(Mustache.render($('#tpl-card').html(), data));

    if(dbState)
        window.CONST.DB.CARDS.push(data);

    $("section.grid").each(function(){ $(this).setCount(); });
};

$.fn.fitModel = function (model) {
    if (model) {
        for (var key in this[0]) {
            if(typeof model[key] === "undefined") {
                delete this[0][key];
            }

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
    return this[0];
};

$.fn.copy = function(remain) {
    if(!remain) {
        for (var idx in this[0])
            this[0][idx] = null;
    }

    return JSON.parse(JSON.stringify(this))[0];
};

$.fn.setCount = function() {
    var count = 0;
    if($(this).hasClass("grid")){
        if($(this).find("ul.card-group").length){
            count = $(this).find("ul.card-group li.card:not(.ui-sortable-helper):not(.hidden)").length;
            $(this).find("span.count").text(count);
        }
    }
    return count;
};

Date.prototype.format = function(format) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this, h;

    return format.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function(data) {
        switch (data) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).parseType(2);
            case "MM": return (d.getMonth() + 1).parseType(2);
            case "dd": return d.getDate().parseType(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().parseType(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).parseType(2);
            case "mm": return d.getMinutes().parseType(2);
            case "ss": return d.getSeconds().parseType(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return data;
        }
    });
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.parseType = function(len){return "0".string(len - this.length) + this;};
Number.prototype.parseType = function(len){return this.toString().parseType(len);};

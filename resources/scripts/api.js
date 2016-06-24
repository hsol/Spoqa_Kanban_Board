$(function () {
    var isIE = navigator.userAgent.toLowerCase().indexOf('msie');
    var ieVer = (isIE != -1) ? parseInt(navigator.userAgent.toLowerCase().split('msie')[1]) : 11;

    window.CONST = {
        IE_VER: ieVer,
        SECRET_MODE: false,
        AUTO_BACKUP: true,
        AUTO_BACKUP_TIME: 30,

        ISSUE_TYPE: {
            imp: "Improvement",
            def: "Defect"
        },
        ISSUE_TYPE_IMG: {
            imp: "./resources/images/" + (ieVer <= 9 ? "icn_improvement.png" : "icn_improvement.svg"),
            def: "./resources/images/" + (ieVer <= 9 ? "icn_defect.png" : "icn_defect.svg")
        },

        SWITCH_IMG: {
            on: "./resources/images/icn_switch_on.png",
            off: "./resources/images/icn_switch_off.png"
        },

        MODEL: {
            SETTING: {
                SECRET_MODE: "boolean",
                AUTO_BACKUP: "boolean",
                AUTO_BACKUP_TIME: "number"
            },
            GRID: {
                sequence: "number",
                title: "string",
                selector: "string"
            },
            CARD: {
                sequence: "number",
                idx: "number",
                grid: "string",
                issueType: "string",
                name: "string",
                contents: "string",
                tag: "array",
                reg: "object"
            }
        },
        DB: {
            CARDS: [],
            GRIDS: []
        },
        QUERY: new JsQuery(),
        GC: new GiantCookie({json:true, defaults:{expires:9999999}})
    };
    window.CONST.DB.SETTING = $.extend(window.CONST.DB.SETTING, window.CONST.GC.cookie("DB-SETTING"));
    window.CONST.DB.GRIDS = $.extend(window.CONST.DB.GRIDS, window.CONST.GC.cookie("DB-GRIDS"));
    window.CONST.DB.CARDS = $.extend(window.CONST.DB.CARDS, window.CONST.GC.cookie("DB-CARDS"));

    if(window.CONST.DB.GRIDS.length <= 0) {
        window.CONST.DB.GRIDS = [
            {
                sequence: 0,
                selector: "to-do",
                title: "To Do"
            },
            {
                sequence: 1,
                selector: "in-progress",
                title: "In Progress"
            },
            {
                sequence: 2,
                selector: "review",
                title: "Review"
            },
            {
                sequence: 3,
                selector: "done",
                title: "Done"
            }
        ];
    }

    initSettings();
});

/**
 * @description 설정 활성화
 *
 * @return null
 */
function initSettings() {
    clearInterval(window.CONST.INTERVAL);

    if (window.CONST.DB.SETTING ? window.CONST.DB.SETTING.SECRET_MODE : window.CONST.SECRET_MODE){
        window.CONST.GC.removeCookie("DB-GRIDS");
        window.CONST.GC.removeCookie("DB-CARDS");
    }
    else {
        if (window.CONST.DB.SETTING ? window.CONST.DB.SETTING.AUTO_BACKUP : window.CONST.AUTO_BACKUP) {
            window.CONST.INTERVAL = setInterval(function () {
                console.log("[" + new Date() + "] Run auto backup.");
                $(window.CONST.DB).backup();
            }, 1000 * (window.CONST.DB.SETTING ? (window.CONST.DB.SETTING.AUTO_BACKUP_TIME >= 1 ? window.CONST.DB.SETTING.AUTO_BACKUP_TIME : 1) : window.CONST.AUTO_BACKUP_TIME));
        } else {
            if(window.CONST.DB) {
               setTimeout(function(){
                   $(window.CONST.DB).backup();
               },0);
            }
        }
    }
}

$.fn.pushGrid = function (data, dbState) {
    $(this).append(Mustache.render($('#tpl-grid').html(), data));

    if (dbState)
        window.CONST.DB.GRIDS.push(data);
};

$.fn.removeGrid = function() {
    if(window.CONST.DB.GRIDS.length <= 1) {
        alert("Can not remove grid anymore.");
        return false;
    }

    if($(this).find("ul.card-group li.card").length > 0) {
        if(!confirm("Grid include cards more than one. Really do you want remove?"))
            return false;
    }
    window.CONST.QUERY.setObject(window.CONST.DB.GRIDS);
    window.CONST.QUERY.setQuery("sequence, selector, title WHERE selector != '" + $(this).attr("class").replace("grid ", "") + "' ORDER sequence");
    window.CONST.DB.GRIDS = window.CONST.QUERY.getResult();
    $(this).remove();
};

/**
 * @description Modal 활성화
 *
 * @param object $(this) Modal 을 감싸는 엘리먼트
 * @param string selector 비활성화하려는 Modal 의 선택자
 * @param boolean clearState Modal 내용 초기화 여부
 * @return null
 */
$.fn.showModal = function (selector, clearState) {
    if (selector) {
        var topMargin;
        var modal = $(this).find(selector);
        if (modal.length) {
            $("body").css("overflow", "hidden");

            // Modal 내용 초기화
            if (clearState) {
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

/**
 * @description Modal 비활성화
 *
 * @param object $(this) Modal 을 감싸는 엘리먼트
 * @param string selector 비활성화하려는 Modal 의 선택자
 * @return null
 */
$.fn.hideModal = function (selector) {
    $("body").css("overflow", "auto");
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

/**
 * @description 그리드에 카드 추가
 *
 * @param object $(this) 카드의 부모 엘리먼트가 될 엘리먼트
 * @param string data 카드에 입력되는 데이터, window.CONST.MODEL.CARD 참조
 * @param boolean dbState commit 여부
 * @return null
 */
$.fn.pushCard = function (data, dbState) {
    data.icnUrl = window.CONST.ISSUE_TYPE_IMG[data.issueType];
    if (!data.idx) {
        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
        window.CONST.QUERY.setQuery("idx, issueType, grid, name, contents, tag, reg WHERE 1==1 ORDER -idx");
        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();
        data.idx = window.CONST.DB.CARDS.length > 0 ? window.CONST.DB.CARDS[0].idx + 1 : 1;
    }

    if (!data.grid && $(this).parents("section.grid").attr('class'))
        data.grid = $(this).parents("section.grid").attr('class').replace("grid ", "");

    data.reg = new Date(data.reg).format("yyyy-MM-dd");

    $(this).append(Mustache.render($('#tpl-card').html(), data));

    if (dbState)
        window.CONST.DB.CARDS.push(data);

    $("section.grid").each(function () {
        $(this).setCount();
    });
};

/**
 * @description 객체를 Model 필드와 같도록 변환
 *
 * @param object $(this) 테스트 될 객체
 * @param object model 기준이 되는 모델
 * @return object 테스트 완료 된 객체
 */
$.fn.fitModel = function (model) {
    if (model) {
        for (var key in this[0]) {
            if (typeof model[key] === "undefined") {
                delete this[0][key];
            }

            if (typeof this[0][key] != model[key]) {
                if (model[key] === "number" && typeof this[0][key] === "string")
                    this[0][key] = parseInt(this[0][key]);
                if (model[key] === "string" && typeof this[0][key] === "number")
                    this[0][key] = this[0][key].toString();
                if (model[key] === "array" && typeof this[0][key] === "string") {
                    var dataString = this[0][key].replace(new RegExp(" ", ""), "");
                    if(dataString.indexOf(",") != -1)
                        this[0][key] = dataString.split(",");
                    else
                        this[0][key] = [dataString];
                }
                if (model[key] === "boolean" && typeof this[0][key] === "number")
                    this[0][key] = this[0][key] > 0;
                if (model[key] === "boolean" && typeof this[0][key] === "string")
                    this[0][key] = this[0][key].toUpperCase() === "TRUE";
            }
        }
    }
    return this[0];
};

/**
 * @description 객체 복사 구현
 *
 * @param object $(this) 복사될 객체
 * @param boolean isRemain 데이터 복사 여부
 * @return object 복사된 객체
 */
$.fn.objectCopy = function (isRemain) {
    if (!isRemain) {
        for (var key in this[0])
            this[0][key] = null;
    }

    return JSON.parse(JSON.stringify(this))[0];
};

/**
 * @description 각 그리드의 카드 갯수 설정 및 갯수 반환
 *
 * @param object $(this) 부모 엘리먼트
 * @return number 카드 갯수
 */
$.fn.setCount = function () {
    var count = 0;
    if ($(this).hasClass("grid")) {
        if ($(this).find("ul.card-group").length) {
            count = $(this).find("ul.card-group li.card:not(.ui-sortable-helper):not(.hidden)").length;
            $(this).find("span.count").text(count);
        }
    }
    return count;
};

/**
 * @description 변경내역 쿠키에 반영
 *
 * @param object $(this) 반영 될 객체
 * @return null
 */
$.fn.backup = function () {
    $(this[0].SETTING).fitModel(window.CONST.MODEL.SETTING);

    for (var idx in this[0].GRIDS) {
        $(this[0].GRIDS[idx]).fitModel(window.CONST.MODEL.GRID);
    }

    for (var idx in this[0].CARDS)
        $(this[0].CARDS[idx]).fitModel(window.CONST.MODEL.CARD);

    window.CONST.GC.cookie("DB-SETTING", this[0].SETTING);
    window.CONST.GC.cookie("DB-GRIDS", this[0].GRIDS);
    window.CONST.GC.cookie("DB-CARDS", this[0].CARDS);
};

/**
 * @description Date 타입 포맷
 *
 * @param object this Date 형 객체
 * @param string format 포맷 형태
 * @return string 변환 된 데이터
 */
Date.prototype.format = function (format) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this, h;

    return format.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function (data) {
        switch (data) {
            case "yyyy":
                return d.getFullYear();
            case "yy":
                return (d.getFullYear() % 1000).parseType(2);
            case "MM":
                return (d.getMonth() + 1).parseType(2);
            case "dd":
                return d.getDate().parseType(2);
            case "E":
                return weekName[d.getDay()];
            case "HH":
                return d.getHours().parseType(2);
            case "hh":
                return ((h = d.getHours() % 12) ? h : 12).parseType(2);
            case "mm":
                return d.getMinutes().parseType(2);
            case "ss":
                return d.getSeconds().parseType(2);
            case "a/p":
                return d.getHours() < 12 ? "오전" : "오후";
            default:
                return data;
        }
    });
};
String.prototype.string = function (len) {
    var s = '', i = 0;
    while (i++ < len) {
        s += this;
    }
    return s;
};
String.prototype.parseType = function (len) {
    return "0".string(len - this.length) + this;
};
Number.prototype.parseType = function (len) {
    return this.toString().parseType(len);
};

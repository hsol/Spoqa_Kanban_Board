/**
 * @description 이슈생성팝업 활성화
 * @event click
 */
$(".btn-issue.act-pop").on("click", function(){
    $("section.modal-group #issue-creator").removeClass("modify").addClass("create");
    $("section.modal-group").showModal("#issue-creator", true);
});
/**
 * @description 그리드생성팝업 활성화
 * @event click
 */
$(".btn-grid.act-pop").on("click", function(){
    $("section.modal-group #grid-creator").removeClass("modify").addClass("create");
    $("section.modal-group").showModal("#grid-creator", true);
});

/**
 * @description 팝업 비활성화
 * @event click
 */
$(".modal .btn-close").on("click", function(){
    $("section.modal-group").hideModal("#" + $(this).parents(".modal").attr("id"));
});

$(".btn-grid.act-submit").on("click", function(){
    var isExist = false;
    if(window.CONST.DB.GRIDS.length <= 3) {
        var article = $(this).parents(".modal").find("article.content");
        var data = $(window.CONST.MODEL.GRID).objectCopy(false);

        data.sequence = article.find("[name=grid-sequence]").val();
        data.title = article.find("[name=grid-title]").val();
        data.selector = article.find("[name=grid-selector]").val();

        if(!data.sequence){
            alert("Please select grid sequence.");
            return false;
        }
        if(!data.title) {
            alert("Please insert grid title.");
            return false;
        }
        if(!data.selector) {
            alert("Please insert grid selector.");
            return false;
        }

        for(var idx in window.CONST.DB.GRIDS){
            if(data.selector === window.CONST.DB.GRIDS[idx].selector) {
                alert("Already same grid selector exists.");
                isExist = true;
            }
        }

        if(!isExist)
            $("section#article").pushGrid(data, true);
    } else {
        alert("Grid can not create more than four.");
        return;
    }

    window.location.reload();
});

/**
 * @description 이슈생성 버튼
 * @event click
 */
$(".btn-issue.act-submit").on("click", function(){
    if(window.CONST.DB.GRIDS.length <= 0) {
        alert("Please create grid first.");
        return false;
    }
    var article = $(this).parents(".modal").find("article.content");
    var data = $(window.CONST.MODEL.CARD).objectCopy(false);

    data.issueType = article.find("[name=issue-type]").val();
    data.name = article.find("[name=issue-name]").val();
    data.grid = $("section.grid:first-child").attr("class").replace("grid ", "").trim();
    data.contents = article.find("[name=issue-contents]").val();
    data.tag = article.find("[name=issue-tag]").val();
    data.reg = new Date();

    if(!data.issueType){
        alert("Please select issue type.");
        return false;
    }
    if(!data.name) {
        alert("Please insert issue name.");
        return false;
    }
    if(!data.contents) {
        alert("Please insert issue contents.");
        return false;
    }

    if($(this).hasClass("create")){
        $("section.grid:first-child  ul.card-group").pushCard(data, true);
    }
    else if ($(this).hasClass("modify")){
        data.idx = $(this).parents(".modal").data("idx");
        $("li.card").each(function(){
            if($(this).data("idx") === data.idx){
                for(var idx in window.CONST.DB.CARDS){
                    var card = window.CONST.DB.CARDS[idx];
                    if(card.idx === data.idx)
                        card = $.extend(card, data);
                }

                $(this).attr("class", "card " + data.issueType);
                $(this).attr("data-type", data.issueType);
                $(this).attr("data-tag", data.tag);
                $(this).find(".btn-group img").attr("src", window.CONST.ISSUE_TYPE_IMG[data.issueType]);
                $(this).find("header.title").text(data.name);
                $(this).find("article.content").text(data.contents);
                $(this).find("footer.reg").text(new Date(data.reg).format("yyyy-MM-dd"));
            }
        });
    }

    // 팝업 비활성화
    $(this).parents(".modal").find(".btn-close img").trigger("click");
});

/**
 * @description 이슈 필터링
 * @event click
 */
$(".quick-filters .act-filter").on("click", function() {
    $(".quick-filters .act-filter").removeClass("selected");
    $(this).addClass("selected");

    if($(this).hasClass("imp")) {
        $("li.card").each(function(){
            if($(this).hasClass("imp"))
                $(this).removeClass("hidden");
            else
                $(this).addClass("hidden");
        });
    } else if ($(this).hasClass("def")) {
        $("li.card").each(function(){
            if($(this).hasClass("def"))
                $(this).removeClass("hidden");
            else
                $(this).addClass("hidden");
        });
    } else {
        $("li.card").each(function(){
            $(this).removeClass("hidden");
        });
    }

    // 이슈 갯수 카운트
    $("section.grid").each(function(){ $(this).setCount(); });
});

/**
 * @description 설정 레이어 활성화/비활성화 및 설정 데이터 입력
 * @event click
 */
$("aside#aside .btn-settings").on("click", function(){
    if(!window.CONST.DB.SETTING)
        window.CONST.DB.SETTING = $(window.CONST.MODEL.SETTING).objectCopy(false);

    $("aside#aside li.setting.SECRET_MODE img.switch").attr("src", window.CONST.DB.SETTING.SECRET_MODE ? window.CONST.SWITCH_IMG.on : window.CONST.SWITCH_IMG.off);
    $("aside#aside li.setting.AUTO_BACKUP img.switch").attr("src", window.CONST.DB.SETTING.AUTO_BACKUP ? window.CONST.SWITCH_IMG.on : window.CONST.SWITCH_IMG.off);
    $("aside#aside li.setting.AUTO_BACKUP_TIME input").val(window.CONST.DB.SETTING.AUTO_BACKUP_TIME || 30);

    if($(this).hasClass("unfold")){
        $("body").css("overflow", "hidden");

        $(this).parents("aside#aside").animate({
            right: 0
        }, 500, function(){
            $(this).css("right", "0");
            $(this).css("overflow-y", "auto");
        });
    } else if ($(this).hasClass("fold")) {
        $("body").css("overflow", "auto");

        $(this).parents("aside#aside").animate({
            right: -($(window).innerWidth())
        }, 500, function(){
            $(this).css("right", "-100%");
            $(this).css("overflow-y", "visible");
        });
    }
});

/**
 * @description 스위치형 설정
 * @event click
 */
$("aside#aside li.setting .values img.switch").on("click", function() {
    var key = $(this).parents("li.setting").attr("class").replace("setting ", "").trim();
    if($(this).hasClass("on")) {
        window.CONST.DB.SETTING[key] = false;

        $(this).removeClass("on");
        $(this).attr("src", window.CONST.SWITCH_IMG.off);
    } else {
        window.CONST.DB.SETTING[key] = true;

        $(this).addClass("on");
        $(this).attr("src", window.CONST.SWITCH_IMG.on);
    }

    initSettings();
});

$(document).on("click", "section.grid header.grid-head img", function() {
    var parent = $(this).parents("section.grid");
    parent.removeGrid();
});

/**
 * @description 텍스트형 설정
 * @event click
 */
$("aside#aside li.setting .values input[type=text]").on("change", function() {
    var key = $(this).parents("li.setting").attr("class").replace("setting ", "");
    window.CONST.DB.SETTING[key] = $(this).val();

    initSettings();
});

/**
 * @description 다운로드 버튼, download api
 * @event click
 */
$("aside#aside li.setting .act-archive").on("click", function(){
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.CONST.DB));
    download("data:" + data, "spoqa_kanban_board_" + new Date().format("yyyy.MM.dd.HH.mm.ss") + ".json", "text/json");
});

/**
 * @description 업로드 버튼, file 태그 활용
 * @event click
 */
$("aside#aside li.setting .act-restore").on("click", function(){
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, false);
    $("input[type=file][name=archive]")[0].dispatchEvent(evt);
});
/**
 * @description 데이터베이스 복구 로직. 복구 시 덮어쓰기
 * @event change
 */
$("aside#aside li.setting .values input[type=file]").on("change", function(event) {
    if($(this).val()) {
        var extension = $(this).val().replace(/^.*\./, '');
        if(extension === "json"){
            if(confirm("Previous data will be overwritten. Continue?")){
                var file = $(this)[0].files[0];
                var fileReader = new FileReader();
                fileReader.onload = function(){
                    window.CONST.DB = JSON.parse(fileReader.result);
                    alert("load completed.");

                    $(window.CONST.DB).backup();
                    window.location.reload();
                };
                fileReader.readAsText(file);

            }
        } else {
            alert("The file extension must *.json");
        }
    }
});

/**
 * @description 카드 클릭 시 수정.
 * @event click
 */
$(document).on("click", "li.card section.info", function(event){
    if($(event.target).hasClass("btn-remove") || $(event.target).parent().hasClass("btn-remove"))
        return false;

    var issueType = $(this).parents("li.card").data("type");
    $("section.modal-group #issue-creator").removeClass("create").addClass("modify");
    $("section.modal-group #issue-creator").attr("data-idx", $(this).parents("li.card").attr("data-idx"));
    $("section.modal-group #issue-creator input[name=issue-name]").val($(this).find("header.title").text());
    $("section.modal-group #issue-creator input[name=issue-contents]").val($(this).find("article.content").text());
    $("section.modal-group #issue-creator input[name=issue-tag]").val($(this).parents("li.card").attr("data-tag"));
    $("section.modal-group #issue-creator .select_box label").attr("class", "type-" + issueType).text(window.CONST.ISSUE_TYPE[issueType]);
    $("section.modal-group #issue-creator select[name=issue-type]").val(issueType);
    $("section.modal-group").showModal("#issue-creator", false);
});

/**
 * @description 카드 삭제
 * @event click
 */
$(document).on("click", "li.card .btn-remove", function(){
    var issueIdx = $(this).parents("li.card").data("idx");

    $(this).parents("li.card").remove();

    window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
    window.CONST.QUERY.setQuery("idx, issueType, name, grid, contents, tag, reg WHERE idx != " + issueIdx + " ORDER -idx");
    window.CONST.DB.CARDS = window.CONST.QUERY.getResult();

    // 이슈 갯수 카운트
    $("section.grid").each(function(){ $(this).setCount(); });
});


/**
 * @description custome select 구현
 * @event change
 */
$(".select_box select").on("change", function () {
    var selectLabel = $(this).parents(".select_box").find("label[for=issue-type]");
    selectLabel.text($(this).find("option:selected").text());
    switch ($(this).val()) {
        case "imp":
            selectLabel.removeClass("type-def");
            selectLabel.addClass("type-imp");
            break;
        case "def":
            selectLabel.removeClass("type-imp");
            selectLabel.addClass("type-def");
            break;
    }
});

$.excuteDraggable = function() {
    /**
     * @description jquery ui 활용 카드 드래그 구현
     * @event draggable, droppable, sortable
     */
    $("section.grid ul.card-group li.card").draggable({
        connectToSortable: ".card-group",
        helper: "original",
        revert: "invalid"
    });
    $("section.grid ul.card-group").droppable({
        drop: function( event, ui ) {
            var issueIdx = $(ui.draggable[0]).data("idx");
            var grid = $(this).parents("section.grid").attr('class').replace("grid ", "");

            for(var idx in window.CONST.DB.CARDS){
                var card = window.CONST.DB.CARDS[idx];
                if(card.idx === issueIdx) {
                    card.grid = grid;
                }
            }
            ;
            $("section.grid").each(function(){ $(this).setCount(); });
        }
    }).sortable({
        connectWith: ".card-group",
        handle: isMobile.any ? ".btn-group" : "",
        cursor: "move",
        revert: true
    });
};
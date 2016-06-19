$(".btn-issue.act-pop").on("click", function(){
    $("section.modal-group #issue-creator").removeClass("modify").addClass("create");
    $("section.modal-group").showModal("#issue-creator", true);
});

$(".modal .btn-close img").on("click", function(){
    $("section.modal-group").hideModal("#" + $(this).parents(".modal").attr("id"));
});

$(".btn-issue.act-submit").on("click", function(){
    var article = $(this).parents(".modal").find("article.content");
    var data = $(window.CONST.MODEL.CARD).copy(false);

    data.issueType = article.find("[name=issue-type]").val();
    data.name = article.find("[name=issue-name]").val();
    data.progress = "to-do";
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
        $("section.grid.to-do ul.card-group").pushCard(data, true);
    } else if ($(this).hasClass("modify")){
        data.idx = $(this).parents(".modal").data("idx");
        $("li.card").each(function(){
            if($(this).data("idx") === data.idx){
                for(var idx in window.CONST.DB.CARDS){
                    var card = window.CONST.DB.CARDS[idx];
                    if(card.idx === data.idx)
                        card = $.extend(card, data);
                }

                $(this).attr("class", "card " + data.issueType);
                $(this).attr("data-tag", data.tag);
                $(this).find(".btn-group img").attr("src", window.CONST.ISSUE_TYPE_IMG[data.issueType]);
                $(this).find("header.title").text(data.name);
                $(this).find("article.content").text(data.contents);
                $(this).find("footer.reg").text(new Date(data.reg).format("yyyy-MM-dd"));
            }
        });
    }

    $(this).parents(".modal").find(".btn-close img").trigger("click");
});

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

    $("section.grid").each(function(){ $(this).setCount(); });
});

$(document).on("click", "li.card section.info", function(event){
    if($(event.target).hasClass("btn-remove") || $(event.target).parent().hasClass("btn-remove"))
        return false;

    var issueType = $(this).parents("li.card").attr('class').replace("card ", "");
    $("section.modal-group #issue-creator").removeClass("create").addClass("modify");
    $("section.modal-group #issue-creator").attr("data-idx", $(this).parents("li.card").data("idx"));
    $("section.modal-group #issue-creator input[name=issue-name]").val($(this).find("header.title").text());
    $("section.modal-group #issue-creator input[name=issue-contents]").val($(this).find("article.content").text());
    $("section.modal-group #issue-creator input[name=issue-tag]").val($(this).parents("li.card").data("tag"));
    $("section.modal-group #issue-creator .select_box label").attr("class", "type-" + issueType).text(window.CONST.ISSUE_TYPE[issueType]);
    $("section.modal-group #issue-creator select[name=issue-type]").val(issueType);
    $("section.modal-group").showModal("#issue-creator", false);
});

$(document).on("click", "li.card .btn-remove", function(){
    var issueIdx = $(this).parents("li.card").data("idx");
    var count = $(this).parents("section.grid").find("span.count");

    $(this).parents("li.card").fadeOut( 300, function () {
        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
        window.CONST.QUERY.setQuery("idx, issueType, name, contents, tag, reg WHERE idx != " + issueIdx + " ORDER -idx");
        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();

        $(this).parents("li.card").remove();
    });
});

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

$("section.grid ul.card-group li.card").draggable({
    connectToSortable: ".card-group",
    helper: "original",
    revert: "invalid"
});
$("section.grid ul.card-group").droppable({
    drop: function( event, ui ) {
        var issueIdx = $(ui.draggable[0]).data("idx");
        var progress = $(this).parents("section.grid").attr('class').replace("grid ", "");

        for(var idx in window.CONST.DB.CARDS){
            var card = window.CONST.DB.CARDS[idx];
            if(card.idx === issueIdx)
                card.progress = progress;
        }

        $("section.grid").each(function(){ $(this).setCount(); });
    }
}).sortable({
    connectWith: ".card-group",
    handle: isMobile.any ? ".btn-group" : "",
    cursor: "move",
    revert: true
});

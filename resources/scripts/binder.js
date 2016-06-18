$(".btn-issue.act-pop").on("click", function(){
    $("section.modal-group").showModal("#issue-creator");
});

$(".modal .btn-close img").on("click", function(){
    $("section.modal-group").hideModal("#" + $(this).parents(".modal").attr("id"));
});

$(".btn-issue.act-create").on("click", function(){
    var article = $(this).parents(".modal").find("article.content");
    var data = $(window.CONST.MODEL.CARD).copy(false);

    data.issueType = article.find("[name=issue-type]").val();
    data.icnUrl = window.CONST.ISSUE_TYPE[data.issueType];
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

    $("section.grid.to-do ul.card-group").pushCard(data, true);

    $(this).parents(".modal").find(".btn-close img").trigger("click");
});

$(".quick-filters .act-filter").on("click", function() {
    if($(this).hasClass("imp")) {
        $("li.card").each(function(){
            if($(this).hasClass("imp"))
                $(this).show();
            else
                $(this).hide();
        });
    } else if ($(this).hasClass("def")) {
        $("li.card").each(function(){
            if($(this).hasClass("def"))
                $(this).show();
            else
                $(this).hide();
        });
    } else {
        $("li.card").each(function(){
            $(this).show();
        });
    }
});

$(document).on("click", "li.card .btn-remove", function(){
    var issueIdx = $(this).parents("li.card").data("idx");
    var count = $(this).parents("section.grid").find("span.count");

    $(this).parents("li.card").fadeOut( 300, function () {
        window.CONST.QUERY.setObject(window.CONST.DB.CARDS);
        window.CONST.QUERY.setQuery("idx, issueType, icnType, name, contents, tag, reg WHERE idx != " + issueIdx + " ORDER -idx");
        window.CONST.DB.CARDS = window.CONST.QUERY.getResult();

        $(this).parents("li.card").remove();

        count.text(parseInt(count.text()) - 1);
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

var cardDragger = {
    parent: null,
    isDragging: false,
    wasDragging: false,
    count: 0
};

$("section.grid ul.card-group").droppable({
    drop: function( event, ui ) {
        var count = $(this).parents("section.grid").find("span.count");
        count.text(parseInt(count.text()) + 1);

        var issueIdx = $(ui.draggable[0]).data("idx");
        var progress = $(this).parents("section.grid").attr('class').replace("grid ", "");

        for(var idx in window.CONST.DB.CARDS){
            var card = window.CONST.DB.CARDS[idx];
            if(card.idx === issueIdx)
                card.progress = progress;
        }
        cardDragger.parent.text(cardDragger.count);
    }
}).sortable({
    connectWith: ".card-group",
    revert: true
}).disableSelection()

$("section.grid ul.card-group li.card").draggable({
    connectToSortable: "section.grid ul.card-group",
    cancel: ".card",
    helper: "original",
    revert: "invalid"
});

$(document).on("mousedown", "section.grid ul.card-group li.card", function() {
    cardDragger.parent = $(this).parents("section.grid").find("span.count");
    cardDragger.isDragging = false;
});
$(document).on("mousemove", "section.grid ul.card-group li.card", function() {
    cardDragger.isDragging = true;
});
$(document).on("mouseup", "section.grid ul.card-group li.card", function() {
    if(cardDragger.isDragging) {
        if (cardDragger.parent) {
            cardDragger.count = parseInt(cardDragger.parent.text()) - 1 > 0 ? parseInt(cardDragger.parent.text()) - 1 : 0;
        }
        cardDragger.isDragging = false;
    }

});
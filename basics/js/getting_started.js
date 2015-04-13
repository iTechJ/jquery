$(document).on("ready", function() {
    $("body").html("<button type='button' class='clickme' title='click me' value='click'>Нажми</button><div id='content'><span class='playground'></span></div>");
}).on("click", ".clickme", function() {
    $("#content .playground").append("<div class='animate'><div class='minus'>x</div></div>");

    $(".animate").animate({
        width: "140px",
        height: "17px",
        margin: "10px",
        padding: "4px",
        borderRadius: "5px"
    }, 500);

}).on("click", ".minus", function() {
    var $this = $(this),
        $animate = $this.parent();

    $animate.fadeOut(500, function() {
        $animate.remove()
    });
});
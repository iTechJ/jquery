(function( $ ){
    "use strict";
    /* на всякие безобразия, типа IE 8 и ниже нервы тратить не стал */
    var methods = {
        init: function( options, callback ) {
            var self = this;
            self.settings = $.extend({}, $.fn.ratingPlugin.defaults, options);
            return this.each(function(){
                var img = new Image(),
                    tag = this;
                img.src = self.settings.icon;
                img.onload = function() {
                    render.apply(self, [tag, this.width, this.height/3]);
                    bindHandlers.apply(self, [callback]);
                };
            });
        }
    };

    function render(tag, starWidth, starHeight){

        var self = this,
            settings = self.settings;

        self.starWidth = starWidth;
        self.starHeight = starHeight;

        /* following operations could be implemented through jQuery .html() method,
         *  though I consider this to be a matter of taste */
        var div = document.createElement("DIV"),
            empty = document.createElement("DIV"),
            hover = document.createElement("DIV"),
            result = document.createElement("DIV"),
            totalVotes = document.createElement("P"),
            legend = document.createElement("P"),
            userValue = document.createElement("P");

        /* creating star lines */
        div.style.float = "left";
        div.style.overflow = "hidden";
        div.style.height = starHeight + "px";
        div.style.width = starWidth * settings.maxRating + "px";
        div.style.position = "relative";
        div.className = "stPluginWrapper";

        renderStars(empty);
        empty.style.zIndex = 1;
        empty.style.height = starHeight + "px";
        empty.style.cursor = "pointer";
        empty.style.width = starWidth * settings.maxRating + "px";
        empty.className = "stPluginEmpty";

        renderStars(result);
        result.style.zIndex = 2;
        result.style.height = starHeight + "px";
        result.style.width = 0;
        result.style.backgroundPosition = "0 -"+ 2 * starHeight + "px";
        empty.style.cursor = "pointer";
        result.className = "stPluginResult";

        renderStars(hover);
        hover.style.zIndex = 3;
        hover.style.height = starHeight + "px";
        hover.style.width = 0;
        hover.style.backgroundPosition = "0 -"+ starHeight + "px";
        hover.className = "stPluginHover";

        div.appendChild(empty);
        div.appendChild(result);
        div.appendChild(hover);

        /* creating total votes indicator */
        totalVotes.className = "totalVotes";

        /* creating user ratubg indicator */
        userValue.className = "userRating";
        userValue.style.marginLeft = "10px";
        userValue.style.color = "#D3D3D3";
        userValue.style.display = "inline";
        userValue.style.fontSize = self.starHeight + "px";

        /* creating legend */
        legend.innerText = self.settings.legend;
        legend.style.fontWeight = "bold";
        legend.style.fontSize = "150%";
        legend.style.marginBottom = "5px";

        tag.appendChild(legend);
        tag.appendChild(div);
        tag.appendChild(userValue);
        tag.appendChild(totalVotes);

        tag.setAttribute("data-total", ""+self.settings.votes);
        tag.setAttribute("data-value", ""+self.settings.value);

        setValue.apply(self, [div, self.settings.value, self.settings.votes]);

        function renderStars(starLine) {
            starLine.style.backgroundImage = "url("+settings.icon+")";
            starLine.style.backgroundRepeat = "repeat";
            starLine.style.position = "absolute";
        }
    }

    function bindHandlers(callback) {
        var self = this,
            settings = self.settings;

        self.find(".stPluginWrapper")
            .off("mousemove")
            .on("mousemove", function(event) {

                var target = event.currentTarget,
                    offSet = event.offsetX;

                offSet = clarifyOffSet.apply(self, [offSet]);
                $(target).find(".stPluginHover").css("width", offSet+ "px");
                $(target.parentNode).find(".userRating")
                    .text((offSet/self.starWidth).toFixed(2));
            })
            .off("mouseout")
            .on("mouseout", function(event){
                $(event.currentTarget).find(".stPluginHover").css("width", "0px");
                $(event.currentTarget.parentNode).find(".userRating").text("");
            })
            .off("click")
            .on("click", function(event) {
                var value,
                    tag = event.currentTarget,
                    offSet = event.offsetX;
                offSet = clarifyOffSet.apply(self, [offSet]);

                value = offSet/self.starWidth;

                if(self.settings.url.length > 0) {
                    $.ajax({
                        url: settings.url,
                        type: "POST",
                        data: value,
                        dataType: 'json',
                        success: function(data) {
                            if(data.status == 'OK') {
                                setValue.apply(self, [
                                    tag,
                                    data[self.settings.valueProperty],
                                    data[self.settings.totalVoicesProperty]
                                ]);
                                unsubscribe(tag);
                                if(typeof callback == 'function') {
                                    callback.apply(self,[data]);
                                }
                            } else{
                                alert(data.status);
                            }
                        }
                    });
                } else {
                    setValue.apply(self, [
                        tag,
                        ((parseFloat(tag.parentNode.getAttribute("data-value")) *
                            parseFloat(tag.parentNode.getAttribute("data-total")) + value) /
                            (parseFloat(tag.parentNode.getAttribute("data-total")) + 1))
                            .toFixed(2),
                        parseFloat(tag.parentNode.getAttribute("data-total")) + 1
                    ]);

                    if(typeof callback == 'function') {
                        callback.apply(self, [arguments]);
                    }
                    unsubscribe(tag);
                }
            });
    }

    function clarifyOffSet(offSet) {
        var self = this;
        if(offSet/self.starWidth > self.settings.maxRating - 0.3) {
            offSet = self.settings.maxRating * self.starWidth;
        }

        if(offSet/self.starWidth < 0.3) {
            offSet = 0;
        }
        return offSet;
    }

    function setValue(tag, value, total) {
        var parentTag = tag.parentNode;
        $(parentTag).find(".userRating").text("");

        parentTag.setAttribute("data-total", total);
        parentTag.setAttribute("data-value", value);
        $(tag).find(".stPluginResult").css("width", value * this.starWidth + "px");

        setText($(parentTag).find(".totalVotes"), value, total);
    }

    function setText(tags, value, total) {
        tags.text("Total rating is " + value + ". " + "Persons voted: "  + total);
    }

    function unsubscribe(tag) {
        $(tag).find(".stPluginHover").css("width", "0px");
        $(tag).off("mousemove");
        $(tag).off("mouseout");
        $(tag).off("click");
    }

    $.fn.ratingPlugin = function( method, callback ) {
        if ( methods[method] ) {
            /* for future methods */
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.ratingPlugin' );
            return null;
        }
    };

    $.fn.ratingPlugin.defaults = {
        legend: 'Rating', //components legend
        icon: 'images/stars.png', //the path to icon (should be a vertical sprite)
        maxRating: 10, //the amount of stars
        valueProperty: "value", //the name of json property in server response, to retrieve rating
        totalVoicesProperty: "total", //the name of json property in server response, to retrieve total voices
        votes: 0,// initial number of votes
        value: 0,// initial value of rating
        url: '' // url address to send users vote
    }

})( jQuery );
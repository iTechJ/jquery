(function( $ ){
    "use strict";

    $.fn.itechartPlugin = function( method, callback ) {
        if ( methods[method] ) {
            /* for future methods */
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.itechartPlugin' );
            return null;
        }
    };

    var methods = {
        init: function( options, callback ) {
            var self = this;
            self.settings = $.extend({}, $.fn.itechartPlugin.defaults, options);
            return this.each(function(){
                var $this = $(this);
                $this.css("border", "1px solid " + self.settings.color);
            });
        },
        myMethod: function(options, callback) {
            self.settings = $.extend({}, $.fn.itechartPlugin.defaults, options);
            return this.each(function(){
                //my code
            });
        }
    };

    $.fn.itechartPlugin.defaults = {
        "color": "red"
    }

})( jQuery );
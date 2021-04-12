(function($) {
    'use strict';
    function  Dropdown($elem,options) {
        this.$elem = $elem;
        this.$layer=this.$elem.find('[class*="layer"]');
        this.activeClass=this.$elem.data("active")+"-active";
        this.options = options;
        var self = this;
        this._init();
        if(options.event==='click'){
            this.$elem.on('click',function(e){
                self.show();
                e.stopPropagation();
            });
            $(document).on('click',function(e){
                self.hide();
            })
        }else{
            this.$elem.hover($.proxy(this.show,this),$.proxy(this.hide,this));
        }
    }
    Dropdown.DEFAULTS = {
        css3: false,
        js:false,
        animation: 'fade',
        event: 'hover',
        delay: 0 //delay showing dropdown menu if mouse just move over it quickly
    };
    //init function for use inside Object
    Dropdown.prototype._init = function () {
        var self = this;
        this.$layer.showhide(this.options);
        this.$layer.on('show shown hide hidden',function(e){
            self.$elem.trigger('dropdown-'+e.type);
        });
    };
    Dropdown.prototype.show = function () {
        var self = this;
        if(this.options.delay){
            self.timer =setTimeout(function(){
            self.$elem.addClass(self.activeClass);
            self.$layer.showhide('show');
            },this.options.delay);  
        }else{
            self.$elem.addClass(self.activeClass);
            self.$layer.showhide('show');
        }
            
    }
    Dropdown.prototype.hide = function () {
        if(this.options.delay){
            clearTimeout(this.timer);
        }
        this.$elem.removeClass(this.activeClass);
        this.$layer.showhide('hide');
    }

    $.fn.extend({
        dropdown:function (options) {
            return this.each(function() {
                var $this = $(this);
                var dropdown = $this.data('dropdown');
                var option = $.extend({},Dropdown.DEFAULTS,typeof options === 'object' && options);
                if(!dropdown){
                    $this.data('dropdown', dropdown = new Dropdown($this,option));
                }
                if(typeof dropdown[options] === 'function'){
                    dropdown[options]();
                }
            });
        }
    });
})(jQuery);
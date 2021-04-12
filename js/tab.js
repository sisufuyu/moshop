(function($){
    'use strict';
    function Tab($elem,options){
        this.$elem = $elem;
        this.options = options;
        this.$tabs = this.$elem.find(".tab-item");
        this.$panels = this.$elem.find(".tab-panel");
        this.itemNum = this.$tabs.length;
        this.curIndex = this._getCorrectIndex(options.curIndex);
        this._init();
    }
    Tab.DEFAULTS = {
        event: 'mouseenter', //or 'click'
        css: false,
        js: false,
        animation: 'fade',
        activeIndex: 0,
        interval: 0,
        delay: 0
    };
    Tab.prototype._init = function(){
        var self = this,
            timer = null;
        this.$tabs.removeClass('tab-item-active');
        this.$tabs.eq(this.curIndex).addClass('tab-item-active');
        this.$panels.eq(this.curIndex).show();
        self.$elem.trigger('tab-show',[this.curIndex,this.$panels.eq(this.curIndex)]);

        //trigger event
        this.$panels.on('show shown hide hidden',function(event){
            self.$elem.trigger('tab-'+event.type,[self.$panels.index(this),this]);
        })

        //showHide init
        this.$panels.showhide(this.options);

        //bind event
        this.options.event = this.options.event === 'click' ? 'click' : 'mouseenter';
        this.$elem.on(this.options.event, '.tab-item', function(){
            var _this = this;
            if(self.options.delay){ //delay switch, if mouse quickly move over tab don't switch
                clearTimeout(timer);
                timer = setTimeout(() => {
                    self.toggle(self.$tabs.index(_this));
                }, self.options.delay);
            }else{
                self.toggle(self.$tabs.index(this));
            }
        });

        //set auto panel switch
        if(this.options.interval && !isNaN(Number(this.options.interval))){
            self.$panels.hover(function(){
                self.pause();
            },function(){
                self.auto();
            });
            this.auto();
        }
        
    };
    Tab.prototype._getCorrectIndex = function(index){
        if(isNaN(Number(index))) return 0;
        if(index < 0) return this.itemNum-1;
        if(index >= this.itemNum) return 0;
        return index;
    };
    Tab.prototype.toggle = function(index){
        if(this.curIndex === index) return;
        this.$panels.eq(this.curIndex).showhide('hide');
        this.$panels.eq(index).showhide('show');
        this.$tabs.eq(this.curIndex).removeClass('tab-item-active');
        this.$tabs.eq(index).addClass('tab-item-active');
        this.curIndex = index;
    };
    Tab.prototype.auto = function(){
        var self = this;
        this.intervalID = setInterval(() => {
            self.toggle(self._getCorrectIndex(self.curIndex+1));
        }, self.options.interval);
    }
    Tab.prototype.pause = function(){
        clearInterval(this.intervalID);
    }

    $.fn.extend({
        tab: function(options){
            return this.each(function() {
                var $this = $(this);
                var tab = $this.data('tab');
                var option = $.extend({},Tab.DEFAULTS,typeof options === 'object' && options);
                if(!tab){
                    $this.data('tab', tab = new Tab($this,option));
                }
                if(typeof tab[options] === 'function'){
                    tab[options]();
                }
            });
        }
    })
})(jQuery);
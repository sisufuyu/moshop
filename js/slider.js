(function($){
    'use strict';
    function Slider($elem,options){
        this.$elem = $elem;
        this.options = options;
        this.$items = this.$elem.find('.slider-item');
        this.slidesNum = this.$items.length;
        this.$indicators = this.$elem.find('.slider-dot');
        this.$controls = this.$elem.find(".slider-control");
        this.curIndex = this._getCorrectIndex(this.options.activeIndex);

        this._init();
    };
    Slider.DEFAULTS = {
        css3: false,
        js: false,
        animation: 'fade',
        activeIndex: 0,
        interval: 0,
        loop: false
    };
    Slider.prototype._init = function(){
        var self = this;

        this.$indicators.removeClass('slider-dot-active');
        this.$indicators.eq(this.curIndex).addClass('slider-dot-active');
        //Lazy load slide pic, trigger event, show the first slide
        this.$elem.trigger('slider-show',[this.curIndex,this.$items.eq(this.curIndex)]);

        if(this.options.animation === 'slide'){
            this.$elem.addClass('slider-slide');
            this.to = this._slide;
            //First slide method, one pic slide out, the other slide in
            this.$items.eq(this.curIndex).css('left',0);
            //send message
            this.$items.on('move moved',function(event){
                var index = self.$items.index(this);
                if(event.type === 'move'){
                    if(index === self.curIndex){
                        self.$elem.trigger('slider-hide',[index,this]);
                    }else{
                        self.$elem.trigger('slider-show',[index,this]);
                    }
                }else{
                    if(index === self.curIndex){ //Next slide already shown
                        self.$elem.trigger('slider-shown',[index,this]);
                    }else{
                        self.$elem.trigger('slider-hidden',[index,this]);
                    }
                }
                self.$elem.trigger('slider-'+event.type,[self.$items.index(this),this]);
            })
            this.$items.move(this.options);
            this.itemWidth = this.$items.eq(0).width();
            this.transitionClass = this.options.css3 ? 'transition' : '';
        
            //Second slide method, slide the parent container
            // this.$container = this.$elem.find(".slider-container");
            // this.itemWidth = this.$items.eq(0).width();
            // this.$container.css({
            //     "left": -1*self.curIndex*self.itemWidth
            // });
            // this.$container.move(this.options);
            /*If loop is open, add the copy of first pic in the end, looks like slide to the first one in visual */
            // if(this.options.loop){
            //     this.$container.append(this.$items.eq(0).clone());
            //     this.transitionClass = this.$container.hasClass('transition') ? 'transition':'';
            //     this.slidesNum ++;
            // }
            // this.$container.css({
            //     "width": this.itemWidth* this.slidesNum
            // });
        }else{
            this.$elem.addClass('slider-fade');
            this.$items.eq(this.curIndex).show();
            this.to = this._fade;
            //send message
            this.$items.on('show shown hide hidden',function(event){
                self.$elem.trigger('slider-'+event.type,[self.$items.index(this),this]);
            })
            
            this.$items.showhide(this.options);
        }

        //when mouse hover on pic, show the left & right arrow
        this.$elem
        .hover(function(){
            self.$controls.show();
        },function(){
            self.$controls.hide();
        }).on('click','.slider-left',function(){ //event delegation
            self.to(self._getCorrectIndex(self.curIndex-1),1);
        }).on('click','.slider-right',function(){
            self.to(self._getCorrectIndex(self.curIndex+1),-1);
        }).on('click','.slider-dot',function(){
            self.to(self._getCorrectIndex(self.$indicators.index(this)));
        });
        //If interval is a Number>0, set auto play
        if(this.options.interval && !isNaN(Number(this.options.interval))){
            this.$elem.hover(function(){
                self.pause();
            },function(){
                self.auto();
            });
            this.auto();
        }
    };
    //get correct slide index
    Slider.prototype._getCorrectIndex = function(index){
        if(isNaN(Number(index))) return 0;
        if(index < 0) return this.slidesNum-1;
        if(index >= this.slidesNum) return 0;
        return index;
    };
    //slide playing actives corresponding dots
    Slider.prototype._activeDots = function(index){
        this.$indicators.removeClass('slider-dot-active');
        this.$indicators.eq(index).addClass('slider-dot-active');
    }
    //slide fade
    Slider.prototype._fade = function(index){
        if(this.curIndex === index) return;
        this.$items.eq(this.curIndex).showhide('hide');
        this.$items.eq(index).showhide('show');
        
        this._activeDots(index);
        this.curIndex = index;
    };
    
    //First slide method, one pic slide out , the other slide in. Index is the index of pic slide in
    //direction 1，slide from left to right, previosu pic
    //direction -1,slide from right to left, next pic
    Slider.prototype._slide = function(index,direction){
        if(this.curIndex === index) return;
        //If click dot to jump slide, there is no direction
        if(!direction){
            if(this.curIndex < index){
                direction = -1;
            }else{
                direction = 1;
            }
        }
        var self = this;
        // set the initial position of the slide in pic
        this.$items.eq(index).removeClass(this.transitionClass).css("left",-1*direction*this.itemWidth);
        //current pic slide out, the other pic slide in
        setTimeout(function(){
            self.$items.eq(self.curIndex).move('toX',direction*self.itemWidth);
            self.$items.eq(index).addClass(self.transitionClass).move('toX',0);
            self.curIndex = index;
        },20)
        
        //active dot accordingly
        this._activeDots(index);

    };

    //Second slide method, move the parent container
    // Slider.prototype._slide = function(index, direction){
    //     if(index === this.curIndex) return;
    //     if(this.options.loop && direction){
    //         if(direction<0){ //Next slide
    //             if(this.curIndex === this.slidesNum-1){ //Last slide (actually the copy of first)
    //                 //first jump to the first pic
    //                 this.$container.removeClass(this.transitionClass).css('left',0).addClass(this.transitionClass);
    //                 this.curIndex = 0;
    //                 index = 1;
    //             }
    //         }
    //         if(direction>0){//previous slide
    //             if(this.curIndex === 0){ //current is first slide
    //                 //First jump to the last slide 
    //                 this.$container.removeClass(this.transitionClass).css('left',-1*this.itemWidth*(this.slidesNum-1)).addClass(this.transitionClass);
    //                 this.curIndex = this.slidesNum -1;
    //                 index = this.curIndex-1;
    //             }
    //         }
    //     }
    //     this.$container.move('toX',-1*index*this.itemWidth);
    //     if(index >= this.$indicators.length) {
    //         this._activeDots(0);
    //     }else{
    //         this._activeDots(index);
    //     }
    //     this.curIndex = index;
    // }

    //Slide auto play
    Slider.prototype.auto = function(){
        var self = this;
        this.intervalID = setInterval(() => {
            self.to(self._getCorrectIndex(self.curIndex+1),-1)
        }, self.options.interval);
    };
    //Slide pause auto play
    Slider.prototype.pause = function(){
        clearInterval(this.intervalID);
    };

    $.fn.extend({
        slider: function(options){
            return this.each(function() {
                var $this = $(this);
                //bind the slider Object to element, avoid creating Object repeatly
                var slider = $this.data('slider');
                var option = $.extend({},Slider.DEFAULTS,typeof options === 'object' && options);
                if(!slider){
                    $this.data('slider', slider = new Slider($this,option));
                }
                if(typeof slider[options] === 'function'){
                    slider[options]();
                }
            });
        }
    })
})(jQuery)
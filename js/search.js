(function($){
    'use strict';
    //data cache
    var cache = {
        data:{},
        count: 0,
        addData: function(key,data){
            if(!this.data[key]){
                this.data[key] = data;
                this.count++;
            }
        },
        readData: function(key){
            return this.data[key];
        },
        deleteDataByKey: function(key){
            delete this.data[key];
            this.count--;
        },
        deleteDataByOrder: function(num){//delet num data
            var count = 0;
            for(var p in this.data){
                if(count >= num){
                    break;
                }
                count++;
                this.deleteDataByKey(p);
            }
        }
    }

    function Search($elem,options){
        this.$elem = $elem;
        this.options = options;
        this.$form = this.$elem.find(".search-form"),
        this.$input = this.$elem.find(".search-inputbox"),
        this.$layer = this.$elem.find(".search-layer");
        this.loaded = false;

        this.$elem.on("click",".search-btn",$.proxy(this.submit,this));
        if(this.options.autocomplete){
            this.autocomplete();
        }
    }
    Search.DEFAULTS = {
        autocomplete: false,
        url: "https://suggest.taobao.com/sug?area=c2c&code=utf-8&callback=jsonp_50762588&q=",
        css3: false,
        js: false,
        animation: "fade"
    }
    Search.prototype.submit = function(){
        var val = this.$input.val();
        if(val.trim() === ''){
            return false;
        }
        this.$form.submit();
    }
    Search.prototype.autocomplete = function(){
        //set Timer, if two input time is too short, don't send twice getData request
        var timer = null;
        var self = this;
        this.$input.on('input',function(){
            clearTimeout(timer);
            timer = setTimeout(function(){
                self.getData();
            },200)
        })
                   .on('focus',$.proxy(this.showLayer,this))
                   .on('click',function(){
                       return false;  //stop event bubbling
                   });
        this.$layer.showhide(this.options);
        $(document).on('click',$.proxy(this.hideLayer,this))
    }
    Search.prototype.getData = function(){
        var self = this;
        var value = self.$input.val().trim();
        if(value === '') self.$elem.trigger('search-noData');

        //read data from cache
        if(cache.readData(value)) return self.$elem.trigger('search-getData',[cache.readData(value)]);

        //If last ajax request is not end, abort it
        if(this.jqXHR) this.jqXHR.abort();
        this.jqXHR = $.ajax({
                url: self.options.url + encodeURIComponent(value),
                dataType: 'jsonp',
            })
            .done(function(data){
                //console.log("请求数据");
                cache.addData(value,data);
                console.log(cache.data);
                self.$elem.trigger('search-getData',[data]);
            })
            .fail(function(){
                self.$elem.trigger('search-noData');
            })
            .always(function(){
                self.jqXHR = null;
            })
    }
    Search.prototype.showLayer = function(){
        // if(this.$layer.children().length === 0) return;
        if(!this.loaded) return;
        this.$layer.showhide('show');
        // this.$layer.show();
    }
    Search.prototype.hideLayer = function(){
        this.$layer.showhide('hide');
        // this.$layer.hide();
    }
    Search.prototype.appendLayer = function(html){
        this.$layer.html(html);
        this.loaded = !!html; //!!turn html into Boolean value
    }
    Search.prototype.setInputVal = function(val){
        this.$input.val(removeHTMLtags(val))
        function removeHTMLtags(str){
            return str.replace(/<(?:[^>'"]|"[^"]*"|'[^']*')*>/g,"");
        }
    }

    $.fn.extend({
        search: function (options,value) {
            return this.each(function() {
                var $this = $(this);
                var  search= $this.data('search');
                var option = $.extend({},Search.DEFAULTS,typeof options === 'object' && options);
                if(!search){
                    $this.data('search', search = new Search($this,option));
                }
                if(typeof search[options] === 'function'){
                    search[options](value);
                }
            });
        }
    });
})(jQuery);

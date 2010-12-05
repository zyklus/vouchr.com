(function(){
	var clsRoot = 'form-productitem',
	     spacer = 50;

	$.modules.provide('form.productItem', 'form/js/formItem.js', {
		extend  : 'form/js/formItem.js',
		clsRoot : clsRoot,
		imgRoot : '/images/product_images/',

		init    : function(conf){
			this._super(conf);
			this.hide();

			this.bindData || (this.bindData = {});
			this.reverseBindData = {}

			for(var n in this.bindData){
				this.reverseBindData[this.bindData[n]] = n;
				this.form.observe('set: ' + this.bindData[n], this.bind('setImage'));
			}

			$.modules.load('form.dataController', conf, this.bind('createdController'));
		},

		createdController : function(cont){
			this.controller = cont
				.observe(['load', 'change'], this.bind('setVal'))
				.observe('empty', this.bind('hide'));
		},

		setImage : function(val, field){
			if(!field || !field.field_name){ return this; }

			var vals = this.controller.getKeyValues(),
			     img = (field.selectedData || {}).image,
			     cnt = 0;

			// We only want to set the image if it's unique
			for(var i=0, l=vals.length; i<l; i++){
				var data = (this.controller.getDataAtIndex(vals[i].ix) || {})[this.reverseBindData[field.field_name]];
				if(data==val){ cnt++; }
			}

			if(((this.selectedData || {}).image == img) || (cnt != 1)){ return; }

			this.setIndex(this.imgsCont.find('img[src$=%s]:eq(0)'.sprintf(img)).closest('div.%s-img'.sprintf(clsRoot)).data('ix'), true);

			return this;
		},

		setIndex : function(ix, noSet){
			var node = this.imgsCont.find('div:data(ix=%s)'.sprintf(ix));
			if(!node.length){ return; }

			var left = node.position().left,
			  eWidth = this.element.outerWidth(),
			  cWidth = this.imgsCont.width();

			this.onSelectImg({target: node}, noSet);
			this.imgsCont.animate({left: Math.constrain(-left + eWidth / 2 - node.outerWidth() / 2, -cWidth + eWidth - spacer, spacer)});
		},

		setVal : function(){
			if(!this.rootNode){ return this; }

			var val = this.controller.getKeyValues(), dataSet = $.toJSON(val);

			if(dataSet == this.dataSet){ return this; }
			this.dataSet = dataSet;

			if(val.length){
				this.imgsCont.fadeOut(this.bind('_setVal', val));
			}else{
				this._setVal(val);
			}

			return this;
		},

		_setVal : function(val){
			this.imgsCont.empty();

			for(var i=0, l=val.length; i<l; i++){
				if(!val[i].value){ continue; }

				this.imgsCont.append(
					this.$('<div class="img"><div /><img src="%s%s" /></div>'.sprintf(this.imgRoot, val[i].value), clsRoot)
						.data('ix', val[i].ix)
				);
			}

			this.imgsCont.fadeIn();

			setTimeout(this.bind('toggleControls'), 200);
			this.imgsCont.css({left: 0});

			this.checkDependencies();

			return this;
		},

		onSelectImg : function(ev, noSet){
			var img = $(ev.target).closest('.' + clsRoot + '-img'), data = this.selectedData = this.controller.getDataAtIndex(img.data('ix'));

			this.imgsCont.find('.hover').removeClass('hover');

			// select the image
			if(this.selectedImg){ this.selectedImg.removeClass('selected'); }
			img.addClass('selected');

			this.selectedImg = img;

			// prevent looping back to setting values
			if(noSet){ return; }

			// set the other form values
			for(var n in this.bindData){
				if(!this.bindData.hasOwnProperty(n) || !n || !data[n]){ continue; }
				var elem = this.form.elements[this.bindData[n]];

				elem && elem.setValue(data[n]);
			}
		},

		checkDependencies : function(){
			if(!this.imgsCont[0].childNodes.length){
				this.hide();
				return this;
			}

			this._super();
		},

		mouseMove : function(ev){
			var target = $(ev.target),
			         t = target.closest('.' + clsRoot + '-img'),
			      left = ev.pageX,
			  elemLeft = this.element.offset().left,
			 contWidth = this.imgsCont.width(),
			 elemWidth = this.element.outerWidth(),
			         p = (left - elemLeft - spacer) / (elemWidth - 2*spacer);

			// set .hover on the active element
			if(!this.imgTarget || (this.imgTarget[0] !== t[0])){
				if(this.imgTarget){ this.imgTarget.removeClass('hover'); }
				this.imgTarget = t.addClass('hover');
			}

			if(!this.scrollEnabled){ return; }

			// scroll the container appropriately
			this.imgsCont.css({left: -Math.constrain(p, -spacer/contWidth, 1+(spacer/contWidth)) * (contWidth - elemWidth)});

			var lOp = p <= 0 ? .2 : 1, rOp = p >= 1 ? .2 : 1;

			if(lOp != this.leftOpacity){
				this.arrowLeft.animate ({opacity : this.leftOpacity = lOp});
			}
			if(rOp != this.rightOpacity){
				this.arrowRight.animate ({opacity : this.rightOpacity = rOp});
			}
		},

		toggleControls : function(){
			var elemWidth = this.element.outerWidth(), contWidth = this.imgsCont.width();

			if(contWidth > elemWidth){
				this.scrollSupportDivs.fadeIn();
				this.arrowLeft.animate({opacity:1});
				this.arrowRight.animate({opacity:1});
				this.scrollEnabled = true;
			}else{
				this.scrollSupportDivs.fadeOut();
				this.scrollEnabled = false;
			}
		},

		show : function(){
			setTimeout(this.bind('toggleControls'), 200);

			this._super();
		},

		createRootNode : function(){
			this._super();

			var nodes;

			this.element.append(
				nodes = this.$('<div class="arrow-left"><div /></div><div class="gradient-left" /><div class="arrow-right"><div /></div><div class="gradient-right" />', clsRoot),
				this.imgsCont = this.$('<div class="x">', clsRoot)
					.bind    ('mousemove', this.bind('mouseMove'))
					.delegate('.' + clsRoot + '-img', 'click', this.bind('onSelectImg'))
			);

			this.arrowLeft  = nodes.filter('.' + clsRoot + '-arrow-left').find('div');
			this.arrowRight = nodes.filter('.' + clsRoot + '-arrow-right').find('div');
			this.gradLeft   = nodes.filter('.' + clsRoot + '-gradient-left');
			this.gradRight  = nodes.filter('.' + clsRoot + '-gradient-right');

			this.scrollSupportDivs = nodes.hide();

			return this;
		}
	});
})();
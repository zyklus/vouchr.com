$.modules.provide('admin', ['placeable', 'form', 'popup'], {
	extend  : 'placeable',

	init : function(conf){
		this._super();
		this.divs = {
			login      : $('#login'),
			admin      : $('#admin'),
			addBtn     : $('#admin .add'),
			navBar     : $('#admin .navBar'),
			rightNav   : $('#admin .rightNav'),
			leftPanel  : $('#leftPanel'),
			rightPanel : $('#rightPanel')
		};

		$.get('concat?format=json&files=modules/admin/js/modules/*', this.bind('receiveModules'));
		this.getPermissions();

		// enable clicking the top 
		this.divs.navBar.delegate('li', 'click', this.bind('activateTab'));

		$.api.observe('apiError', this.bind('handleError'));

		var self = this;
		$('#loginBox form').submit(function(e){
			e.preventDefault();

			$.api.get('user/getAuthToken', $(this).serialize(), self.bind('getPermissions'));
		});

		$('.logout').bind('click', function(ev){ $.api.get('user/deleteAuthToken', function(resp){ window.location.reload(); }) });
	},

	handleError : function(o){
		var errors = [];

		switch(o.code){
			case 203: // invalid auth token
			case 300: // auth token missing
				this.showLogin();
				break;
			default:
				errors.push(o.msg);
				break;
		}

		if(errors.length){
			alert(errors.join('\n'));
		}
	},

	receiveModules : function(data){
		this.modules = {};

		for(var i=0, l=data.length; i<l; i++){
			data[i] = (new Function('return ' + data[i]))();
		}

		data.sort(function(a, b){
			return (a.order || 100) - (b.order || 100);
		});

		for(var i=0, l=data.length; i<l; i++){
			var mod = data[i],
			     nm = mod.name;

			if(!nm){ continue; }
			this.modules[nm] = mod;

			this.divs.navBar.find('ul').append(mod.btn = $('<li>%s<div /></li>'.sprintf(nm)));
		}

		this.fire('setModules');
		if(this.permissions){ this.checkModulePermissions(); }
	},

	checkModulePermissions : function(){
		for(var n in this.modules){
			var mod = this.modules[n];
			if(!mod.requiredAPI || !this.permissions[mod.requiredAPI]){
				mod.btn.remove();
			}
		}

		this.divs.navLIs = this.divs.navBar.find('li');
		this.activateTab({target: this.divs.navBar.find('li:first')});
	},

	getPermissions: function(){
		$.api.get('user/getPermissions', this.bind('permissionsCallback'));
	},

	permissionsCallback : function(data){
		this.permissions = {};

		for(var i=0, l=data.length; i<l; i++){
			this.permissions[data[i].name] = data[i].api_id;
		}

		this.fire('setPermissions');
		if(this.modules){ this.checkModulePermissions(); }
		this.loggedIn();
	},

	loggedIn : function(){
		this.divs.login.fadeOut();
		this.divs.admin.fadeIn();
		this.divs.navBar.show();

		this.fire('loggedIn');
	},

	showLogin : function(){
		this.divs.admin.fadeOut();
		this.divs.login.fadeIn();
	},

	activateTab : function(ev){
		var tab = $(ev.target).closest('li').text();

		var current = this.currentModule = this.modules[tab];
		if(this.active===current){ return; }

		if(this.active){
			this.active.btn.removeClass('selected');
			this.active.search.fadeOut();
			this.active.content.fadeOut();
		}

		if(!current.tab){
			current.search  = $('<div style="display:none;" class="fullSize"><div class="searchContainer"><div class="leftBorder" /><div class="rightBorder" /><div class="rightBorderMini" /><input /></div><ul class="searchResults" /></div>');
			current.results = current.search.find('ul').delegate('li:data(key)', 'click', this.bind('resultClick', null, current));
			current.content = $('<div class="content"></div>');
			current.popup   = $('<div class="popup" style="display:none;"><div class="background" /></div>');

			// add default value to the search input
			current.search.find('input').inactiveText('inactive', 'Search For #{name} ...'.interpolate(current)),

			this.divs.leftPanel .append(current.search);
			this.divs.rightPanel.append(current.content)
			                    .append(current.popup);

			this.doSearch();
		}

		if(current.addAPI && this.permissions[current.addAPI]){
			this.divs.addBtn.show().animate({ width:33, opacity:1 });
		}else{
			var obj;
			(obj = this.divs.addBtn).animate({width:0, opacity:0}, function(){ obj.hide(); });
		}

		current.search.fadeIn();
		current.content.fadeIn();
		current.btn.addClass('selected');
		this.active = current;
	},

	resultClick : function(module, e){
		var $this = $(e.target);

		if(module.results.selected){
			if($this.data('key') === module.results.selected.data('key')){ return; }
			module.results.selected.removeClass('selected');
		}
		module.results.selected = $this.addClass('selected');

		var key = $this.data('key');
		module.render(key);
	},

	doSearch : function(){
		if(!this.currentModule.searchAPI){ return; }

		$.api.get(this.currentModule.searchAPI, this.bind('onSearchResult', this.currentModule));
	},

	onSearchResult : function(module, data){
		module.results.empty();
		module.data = data;
		data.keys   = {};

		for(var i=0, l=data.length; i<l; i++){
			module.results.append($('<li>' + module.template.interpolate(data[i]) + '</li>').data('key', data[i][data.key]));
			data.keys[data[i].pk_id] = data[i];
		}
	}

});
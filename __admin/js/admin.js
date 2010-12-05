function showLogin(){
	$('#login').fadeIn();
	$('#admin').fadeOut();
}

var modules = {},
permissions = {},

/* Renderer accepts:
 *
 * Per Line:
 * - name
 * - type     (checkbox, text)
 * - key      (default=name)
 * - content  (nested content)
 * - onChange (callback)
 */
pages = {
	render : function(container, name, node, config){
		node = node || $('<div class="pageNode"><div class="panelTitle">#{name}</div><div class="pageContent" /></div>'.interpolate({name:name}));

		if(typeof(config) == 'function'){
			config(this.render.bind(this, container, name, node));
			return node;
		}

		for(var i=0, l=config.length; i<l; i++){
			var ul = $('<ul />'), content = (config[i] instanceof Array) ? config[i] : config[i].content;
			for(var j=0, m=content.length; j<m; j++){
				var item = content[j], li = $('<li class="#{type}"><div class="title">#{name}</div></li>'.interpolate(item));

				switch(item.type){
					case 'checkbox' :
						li.append(
							$('<div class="checkbox ' + (item.value ? 'on' : 'off') + '"><div class="overlay" /><div class="switch" /></div>')
								.click(this.checkboxClick.bind(null, item.onChange, item.key || item.name))
						);
						break;
					case 'text':
						break;
				}
				if(item.content){
					li
						.append($('<div class="next" />'))
						.click(this.navigateTo.bind(this, container, node, item.name, item.content));
				}

				ul.append(li);
			}

			var fieldset = $(
				'<fieldset>'
				+ ((config[i].title) ? '<legend>#{title}</legend>'.interpolate(config[i]) : '')
				+ '</fieldset>'
			);

			fieldset.append(ul);
			node.find('.pageContent').append(fieldset);
		}
		return node;
	},
	showPopup : function(name, config, confirmCB){
		var popup = this.render(null, name, null, config).append(
			$('<button>OK</button>')
		).append(
			$('<button>Cancel</button>')
		);
	},
	switchTo : function(container, name, config){
		var page = this.render(container, name, null, config);
		container.children().length
			? container.fadeOut(200, function(){ container.empty().append(page).fadeIn(); })
			: container.hide().append(page).fadeIn(200);
	},
	navigateTo : function(container, oldNode, name, config){
		var page = this.render(container, name, null, config);
		page.css({
			position : 'absolute',
			left     : '30%',
			opacity  : 0
		});
		
		container.append(page);
		
		oldNode.animate({
			left    : '-30%',
			opacity : 0
		});
		
		page.animate({
			left    : '0%',
			opacity : 1
		});

//		container.fadeOut(function(){ container.empty().append(page).fadeIn(); });
	},
	checkboxClick : function(cb, key){
		var $this = $(this), on = $this.hasClass('off');
		$this.find('.switch').animate({left : on ? 0 : -53}, 100, function(){
			$this.removeClass(on ? 'off' : 'on').addClass(on ? 'on' : 'off');
		});
		cb(key, on);
	}
};

// when the api is loaded...
stc.api.observe('load', function(){
	getPermissions();

	// this is a synchronous call
	function getPermissions(){
		stc.api.ajax({
			async   : false,
			url     : 'user/getPermissions',
			success : permissionsCallback
		});
	}

	function permissionsCallback(data){
		for(var i=0, l=data.length; i<l; i++){
			permissions[data[i].name] = data[i].pk_id;
		}
		loggedIn();
	}

	$('#loginBox form').submit(function(e){
		e.preventDefault();

		stc.api.get('user/getAuthToken', $(this).serialize(), getPermissions );
	});

	function loggedIn(){
		$('#login').hide();
		$('#admin').fadeIn();

		var
			navBar     = $('ul.navBar').show(),
			lis        = navBar.find('li'),
			addBtn     = $('.titleBar .add').show(),

			active,
			leftPanel  = $('#leftPanel'),
			rightPanel = $('#rightPanel');

		function activateTab(tab){
			var current = modules[tab];
			if(active===current){ return; }

			if(active){
				active.tab.removeClass('selected');
				active.search.fadeOut();
				active.content.fadeOut();
			}

			if(!current.tab){
				current.tab     = lis.filter('.' + tab.toLowerCase());
				current.search  = $('<div style="display:none;" class="fullSize"><div class="searchContainer"><div class="leftBorder" /><div class="rightBorder" /><div class="rightBorderMini" /><input /></div><ul class="searchResults" /></div>');
				current.results = current.search.find('ul').delegate('li:data(key)', 'click', resultClick.bind(null, current));
				current.content = $('<div class="content"></div>');
				current.popup   = $('<div class="popup" style="display:none;"><div class="background" /></div>');

				// add default value to the search input
				current.search.find('input').inactiveText('inactive', 'Search For #{name} ...'.interpolate(current)),

				leftPanel .append(current.search);
				rightPanel.append(current.content);
				rightPanel.append(current.popup);

				doSearch(current);
			}
			current.search.fadeIn();
			current.content.fadeIn();
			current.tab.addClass('selected');
			active = current;
		}

		activateTab(lis.first().text());

		// enable clicking on the top tabs
		lis.click(function(){
			activateTab($(this).text());
		});
	}
	
	function resultClick(current, e){
		var $this = $(this);

		if(current.results.selected){
			if($this.data('key') === current.results.selected.data('key')){ return; }
			current.results.selected.removeClass('selected');
		}
		current.results.selected = $this.addClass('selected');

		var key = $this.data('key');
		current.render(key);
	}

	function doSearch(current){
		if(!current.searchAPI){ return; }

		stc.api.get(current.searchAPI, onSearchResult.bind(this, current));
	}

	function onSearchResult(current, data){
		current.results.empty();
		current.data = data;
		data.keys    = {};
		for(var i=0, l=data.length; i<l; i++){
			current.results.append($('<li>' + current.template.interpolate(data[i]) + '</li>').data('key', data[i].pk_id));
			data.keys[data[i].pk_id] = data[i];
		}
	}
});
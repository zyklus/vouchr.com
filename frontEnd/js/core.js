(function($, window){
	var HEAD = $('HEAD');

	// loads and executes js or css files
	var FILELOADER = new ($.Observable.extend({
		init : function(){
			this._super();

			this.loading   = {};
			this.loadingJS = []; // a cache of JS files that are loading since they need to be executed in order
		},

		onJSLoad : function(file, contents){
			// set the contents of any file in loadingJS that matches this path
			for(var i=0, l=this.loadingJS.length; i<l; i++){
				if(this.loadingJS[i].file === file){
					this.loadingJS[i].contents = contents;
				}
			}

			// execute any scripts that have been loaded in order
			while(this.loadingJS.length && this.loadingJS[0].contents){
				var scr = this.loadingJS.shift();

				// isolate every JS file from the global scope
				$.globalEval('(function(){' + scr.contents + '})()');
				scr.cb();
			}
		},

		loaders : {
			js : function(file){
				this.loadingJS.push({
					file : file,
					cb   : this.fireAndCache.bind(this, 'loaded-' + file)
				});

				/**
				 * If we try to just add the script tag to the head or use $.getScript,
				 * the scripts load in random orders, at least in Chrome.
				 *
				 * So instead, we have to just grab all the source code and make sure it
				 * is eval'd in order
				 */

				// if we use $.get, jQuery "helpfully" auto-executes the script
				$.ajax({
					url      : file,
					dataType : 'text',
					success  : this.onJSLoad.bind(this, file)
				});
			},

			debug_js : function(file){
				var cb = this.fireAndCache.bind(this, 'loaded-' + file);

				this.loadingJS.push({
					file : file,
					cb   : cb
				});

				var scr    = document.createElement('script');
				scr.type   = 'text/javascript';
				scr.src    = file;
				scr.onload = cb;

				// because IE just HAS to be different
                scr.onreadystatechange = function () {
                	if(scr.readyState == 'loaded' || scr.readyState == 'complete'){
						cb();
					}
                }

				HEAD[0].appendChild(scr);
			},

			css : function(file){
				HEAD[0].appendChild($('<link />').attr({
					rel  : 'stylesheet',
					type : 'text/css',
					href : file
				})[0]);

				this.fireAndCache('loaded-' + file);
			}
		},

		load : function(file){
			if(this.loading[file]){ return this; }

			this.loading[file] = true;

			var ext = /\.([^\.]+)$/.exec(file.toLowerCase());
			if(!ext || !this.loaders[ext[1]] || (typeof(file) != 'string')){ return false; }

			this.loaders[ext[1]].call(this, file);

			return this;
		}
	}))();

	// set JS loading to inline scripts if necessary and not in webkit (chrome doesn't load them in order!)
	APPLICATION.DEBUG && !$.browser.webkit && (FILELOADER.loaders.js = FILELOADER.loaders.debug_js);

	// a simple class that simply fires 'loaded' when all files are loaded
	var fileLoader = $.Observable.extend({
		init : function(files){
			this._super();

			this.toLoad = {};
			this.rand = Math.random();

			for(var i=0, l=files.length; i<l; i++){
				if(typeof(files[i]) != 'string'){ continue; }

				this.toLoad[files[i]] = 1;
				if(!(FILELOADER
					.observe('loaded-' + files[i], this.fileLoaded.bind(this, files[i]))
					.load(files[i]))){
						delete this.toLoad[files[i]];
					}
			}
		},

		fileLoaded : function(file){
			delete this.toLoad[file];

			for(var n in this.toLoad){
				if(this.toLoad.hasOwnProperty(n)){ return; }
			}

			this.fire('loaded');
		}
	});

	$.extend({
		core : $.Observable.extend({
			init : function(p){
				this._super();
				this.params = {};

				if(p){ this.setParams(p); }
			},

			setParams : function(p){
				$.extend(this.params, p);
				this.fireAndCache('changedParams', this.params);
			}
		}),

		loadFiles : function(){
			return new fileLoader($A(arguments));
		},

		modules : new ($.Observable.extend({
			init : function(){
				this._super();

				this.modules       = {};
				this.modPreConfig  = {};
				this.loading       = {};
				this.rootDirectory = '';
			},

			setDirectoryRoot : function(path){
				this.rootDirectory = path;
			},

			load : function(name, params, fn){
				if($.isFunction(params)){
					fn     = params;
					params = {};
				}

				// add preConfig params
				params = $.extend({}, this.modPreConfig[name] || {}, params);

				fn && this.observe('loaded-' + name, function(mod){ fn(new mod(params)); });

				if(this.loading[name]){ return; }

				this.loading[name] = 1;
				if(name.indexOf('.') < 0){
					// loading a module
					// the modules must 'provide' themselves, so all we have to do is load the files
					$.loadFiles(
						this.rootDirectory + 'modules/%s/js/%s.js'  .sprintf(name, name),
						this.rootDirectory + 'modules/%s/css/%s.css'.sprintf(name, name)
					);
				}else{
					// loading a specific file
					var self = this;
					$.loadFiles(this.rootDirectory + 'modules/' + name).observe('loaded', function(){
						self.fire('loaded-' + name);
					});
				}
			},

			provide : function(name, dependencies, module){
				if(!module){
					module       = dependencies;
					dependencies = [];
				}

				dependencies = [].concat(dependencies);
				module.className || (module.className = name);

				var  nDep = dependencies.length,
				     self = this,
				   onLoad = function(){
						// the check for 'module' is in case there are 'fake' modules -- e.g. a module that just loads a library
						if(module){
							self.modules[name] = (self.modules[module.extend] || $.Observable).extend(module);
						}

						self.fireAndCache('loaded-' + name, self.modules[name]);
					};

				// no dependencies
				if(!nDep){
					onLoad();
				}else{
					for(var i=0, nDep=l=dependencies.length; i<l; i++){
						this.observe('loaded-' + dependencies[i], function(){
							nDep--;

							if(!nDep){
								onLoad();
							}
						});
						this.load(dependencies[i]);
					}
				}
			},

			// provide configuration options to be passed in to the constructor of any module created of specified name
			provideConfig : function(name, conf){
				$.extend((this.modPreConfig[name] || (this.modPreConfig[name] = {})), conf);
			}
		}))()
	});
	
	// provide the observable module automatically
	$.modules.modules.Observable = $.Observable;
	$.modules.loading.Observable = 1;
	$.modules.fireAndCache('loaded-Observable');
})(jQuery, this);
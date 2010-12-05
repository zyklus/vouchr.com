modules.Groups = {
	requiredAPI : 'group/add',
	name        : 'Groups',
	template    : '#{name}',
	searchAPI   : 'group/getList',
	addContent  : [[{
		name : 'name',
		text : 'Group',
		type : 'text'
	}]],
	addAPI      : 'group/add',
	render      : function(key){
		var apis = [], group = this.data.keys[key], apiGroup, curGroup, g;
		for(var n in permissions){
			g = n.split('/');
			if(g[0] != curGroup){
				if(apiGroup){
					apis.push(apiGroup);
				}
				apiGroup = {
					title   : g[0].toProperCase(),
					content : []
				};
				curGroup = g[0];
			}

			apiGroup.content.push({
				type     : 'checkbox',
				name     : g[1],
				key      : permissions[n],
				onChange : this.toggleAPI.bind(this, group.pk_id)
			});
		}
		apis.push(apiGroup);
		var content = [
			[{
				name    : 'API Access',
				content : function(cb){
					stc.api.get('group/getApiList', {groupID : group.pk_id}, function(resp){
						var access = {};
						for(var i=0, l=resp.length; i<l; i++){ access[resp[i].name] = 1; }

						for(var i=0, l=apis.length; i<l; i++){
							for(var j=0, m=apis[i].content.length; j<m; j++){
								if(access[apis[i].title.toLowerCase() + '/' + apis[i].content[j].name]){
									apis[i].content[j].value = 1;
								}
							}
						}

						cb(apis);
					});
				}
			},
			{
				name : 'User Access'
			}]
		];

		pages.switchTo(this.content, group.name, content);
	},

	toggleAPI : function(group, api, value){
		stc.api.get('permissions/' + (value ? 'add' : 'delete') + 'Group', {
			apiID   : api,
			groupID : group
		});
	}
};
modules.Regions = {
	requiredAPI : 'region/add',
	name        : 'Regions',
	template    : '#{name}',
	addContent  : [[{
		name : 'name',
		text : 'Region',
		type : 'text'
	}]],
	searchAPI   : 'region/getList',
	addAPI      : 'region/add',
	render      : function(key){

		pages.switchTo(this.content, group.name, content);
	}
};
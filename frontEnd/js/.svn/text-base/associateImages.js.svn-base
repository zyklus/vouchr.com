$(function(){
	var imgRoot = '/images/product_images/', body = $(document.body), select = '<select multiple><option></option>';
	for(var i=0, l=products.length; i<l; i++){
		select += '<option value="%s">%s</option>'.sprintf(products[i].product_id, products[i].manufacturer + ' ' + (products[i].family || '') + ' ' + (products[i].name || ''));
	}
	select += '</select>';
	for(var i=0, l=images.length, node; i<l; i++){
		if(!/\.(jpg|gif)$/.test(images[i])){ continue; }
		body.append(node = $('<div><img src="' + imgRoot + images[i] + '"><br />' + select + '</div>'));

		for(var j=0, m=products.length; j<m; j++){
			if(products[j].image == images[i]){
				node.find('select option:eq(' + (j+1) + ')').attr('selected', true);
			}
		}
	}

	$('select').live('change', function(){
		var $this = $(this), val = $this.val().join(','), img = $this.prevAll('img').attr('src').split('/').pop();

		$.api.get('product/setImage', {product_ids:val, image:img}, function(resp){
			if(resp.status != 'success'){ alert('There was a problem saving the association.  Please reload the page and try again'); };
		});
	});
});
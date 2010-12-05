$(function(){
	function render(data, parent, method){
		for(var n in {name:1, en:1, fr:1, de:1}){
			if(!data.string[n]){ continue; }
			data.string[n] = data.string[n].replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
		}

		var node = $('<div pk_id="' + data.pk_id + '" string_id="#{pk_id}"><button class="expand">-</button><input name="#{pk_id}_name" value="#{name}"><input name="#{pk_id}_en" value="#{en}"><input name="#{pk_id}_fr" value="#{fr}"><input name="#{pk_id}_de" value="#{de}"><button class="addIn">Add In</button><button class="addBelow">Add Below</button><button class="delete">Delete</button><button class="translate">Auto-Translate</button><div class="children" /></div>'.interpolate($.extend({fr:'', de:'', en:'', name:''}, data.string)));

		if(data.string.name=='Nested Strings Root'){ node.find('.addBelow,.delete,.translate').remove(); }

		if(data.children){
			var child = node.find('.children');
			for(var i=0, l=data.children.length; i<l; i++){
				render(data.children[i], child);
			}
		}

		parent[method || 'append'](node)
	}

	render(data, $(document.body));

	$('button.expand').live('click', function(){
		var $this = $(this), val = $this.text();

		$this.nextAll('.children')[val=='-' ? 'hide' : 'show']()
			&& $this.text(val=='-' ? '+' : '-');
	});

	$('button.addIn').live('click', function(){
		var div = $(this).parent(), children = div.children('.children'), kids = children.children(), conf = {};
		kids.length
			? conf.next_sibling_id = kids.eq(0).attr('pk_id')
			: conf.parent_id       = div.attr('pk_id');

		// create a new string
		$.api.get('localize/addNestedString', conf, function(resp){
			if(resp.status != 'success'){
				return alert('There was a problem adding the string.  Please reload the page and try again.');
			}

			render(resp, children, 'prepend');
		});
	});

	$('button.addBelow').live('click', function(){
		var div = $(this).parent(), conf = {}, next = div.next().length;
		next
			? conf.next_sibling_id = div.next().attr('pk_id')
			: conf.parent_id       = div.parent().parent().attr('pk_id');

		$.api.get('localize/addNestedString', conf, function(resp){
			if(resp.status != 'success'){
				return alert('There was a problem adding the string.  Please reload the page and try again.');
			}

			render(resp, next ? div : div.parent(), next ? 'insertAfter' : 'append');
		});

	});

	$('button.delete').live('click', function(){
		if(!confirm('Are you sure you want to delete this string and ALL STRINGS beneath it??')){ return; }
		if(!confirm('You\'re POSITIVE that you want to delete all these strings???')){ return; }

		var $this = $(this);

		// remove the string from the nested_strings table
		$.api.get('preorderTree/delete', {
			table : 'nested_strings',
			pk_id : $this.parent().attr('pk_id')
		}, function(resp){
			if(resp.status != 'success'){
				return alert('There was an error deleting your string.  Please reload the page and try again.');
			}

			$this.parent().remove();
		})
	});


	$('input').live('focus', storeVal).live('blur', submitChange);
	function storeVal(){
		$(this).data('val', this.value);
	}

	function submitChange(){
		var parts = this.name.split('_'), id=parts[0], lang=parts[1], val=this.value, obj={string_id:id};
		obj[lang] = val;
		if($(this).data('val') == val){ return; }
		$.api.get('localize/setString', obj);
	}

	$('button.translate').live('click', function(){
		var id = $(this).parent().attr('string_id');
		var en = $('[name=' + id + '_en]'), fr=$('[name=' + id + '_fr]'), de=$('[name=' + id + '_de]');
		$.api.get('util/translate', {'string':en.val(), from:'en', to:'fr,de'}, function(data){
			fr.val(data.strings[0]).blur();
			de.val(data.strings[1]).blur();
		});
		return false;
	});
});
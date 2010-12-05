$.modules.provideConfig('form', {editMode:true});
$(function(){
	// Editing a field
	$('.form-item-x,.form-fieldset-x').live('mouseover', function(ev){
		var $this = $(this);

		if($this.find('.editBtn').length){ return; }

		$this.append('<div class="editBtn"><div class="drag" /><div class="edit" /></div>');
	});

	$('.editBtn .edit').live('click', function(ev){ showEditField(this); });

	var editNode, data;

	$(document.body).click(function(ev){
		if(!editNode || !editNode.is(':visible')){ return; }

		if(!$(ev.target).closest('.field_editor,.editBtn').length){ editNode.fadeOut(); }
	});

	function showEditField(node){
		if(!editNode){
			editNode = $('<div class="field_editor"><div><label for="editor-type">Field Type</label><select id="editor-type"><option value="form.button">Button</option><option value="form.combo">Combo</option><option value="form.composite">Composite</option><option value="form.dateField">Date</option><option value="form.displayField">Display Text</option><option value="form.fieldset">Fieldset</option><option value="form.textArea">TextArea</option><option value="form.textField">Text</option><option value="form.productItem">Product Image</option></select></div><div><label for="editor-name">Name</label><input id="editor-name"></div><div><label for="editor-json">JSON</label><textarea id="editor-json"></textarea></div><button>Save</button><button>Delete</button><button>Add New Field Here</button></div>').hide();

			editNode._type = editNode.find('#editor-type');
			editNode._name = editNode.find('#editor-name');
			editNode._json = editNode.find('#editor-json');
			editNode._save = editNode.find('button:eq(0)').bind('click', save);
			editNode._del  = editNode.find('button:eq(1)').bind('click', del);
			editNode._add  = editNode.find('button:eq(2)').bind('click', addElement);

			$(document.body).append(editNode);
		}

		var $this = $(node),
		   offset = $this.offset();

		data = $this.closest('.form-item-x,.form-fieldset-x').data('obj');

		editNode._add[data.className == 'form.fieldset' ? 'show' : 'hide']();

		editNode.css({top : offset.top, left: offset.left + $this.width() + 5}).fadeIn();

		editNode._type.val(data.className);
		editNode._name.val(data.field_name);

		editNode._json.val(JSON.stringify(data.getJsonConfig()));
	}

	function save(ev){
		$.api.get('form/field/edit', {
			field_id : data.field_id,
			name     : editNode._name.val(),
			type     : editNode._type.val(),
			json     : editNode._json.val()
		}, function(data){
			if(data.status=='success'){
				editNode.fadeOut();
			}else{
				alert('There was a problem.  Please try again?');
			}
		});
	}

	function del(ev){
		var obj = data;
		if(confirm('Are you sure you want to delete this field and all fields in it?')){
			$.api.get('form/field/delete', {field_id: data.field_id}, function(resp){
				if(resp.status != 'success'){
					alert('There was a problem deleting the field.  Please reload the page and try again.');
					return;
				}

				obj.rootNode.remove();
			});
		}
	}

	// Re-ordering a field
	var $body = $(document.body), topPoss = [], dragging, targets, dropTarget;

	$('.editBtn .drag').live('mousedown', function(ev){
		ev.preventDefault();
		ev.stopPropagation();

		dragging = $(ev.target).closest('.form-item-x,.form-fieldset-x');
		dragging.css({opacity: .5});

		$body.bind('mousemove', mousemove).bind('mouseup', mouseup);

		// store the location of every possible drop target
		targets = $(ev.target).closest('form').find('.form-item-x,.form-fieldset-x').map(function(a, b){
			return [[$(b).offset(), $(b)]];
		}).sort(function(a, b){
			return (a[0].top - b[0].top) || (a[0].left - b[0].left);
		});
	});

	function mousemove(ev){
		var xPos = ev.pageX, yPos = ev.pageY;
		ev.preventDefault();

		for(var i=targets.length-1; i>=0; i--){
			if(targets[i][0].top < yPos){ break; }
		}
		if(i < 0){ i = 0; }

		while((i>0) && (targets[i][0].top === targets[i-1][0].top) && (targets[i][0].left > xPos)){ i--; }

		dropTarget && (targets[dropTarget][1].removeClass('dropTarget'));
		dropTarget = null;

		// can't drop onto self
		if(targets[i][1][0] != dragging[0]){
			dropTarget = i;
			targets[i][1].addClass('dropTarget');
		}
	}

	function mouseup(ev){
		$body.unbind('mousemove', mousemove).unbind('mouseup', mouseup);

		if(dragging){
			dragging.css({opacity:1});
		}
		if(dropTarget){
			targets[dropTarget][1].removeClass('dropTarget');

			(targets[dropTarget][1].data('obj').className == 'form.fieldset')
				? reorder(dragging, targets[dropTarget][1])
				: reorder(dragging, null, targets[dropTarget][1]);
		}
	}

	function reorder(field, parent, next_sibling){
		var fieldObj = field.data('obj'), parentNode, nextSibling, params = {
			field_id : fieldObj.field_id
		};

		if(parent){
			params.parent_id = parent.data('obj').field_id;
			parentNode       = parent;
		}else{
			params.next_sibling_id = (nextSibling = next_sibling).data('obj').field_id;
			parentNode             = next_sibling.closest('.form-fieldset-x');
		}

		$.api.get('form/field/move', params, function(resp){
			if(resp.status != 'success'){
				alert('There was a problem moving the field.  Please reload the page and try again.');
				return;
			}

			nextSibling
				? field.insertBefore(nextSibling)
				: parentNode.append(field);
		});
	}

	// add a new field
	function addElement(ev){
		var title = 'New Element ' + Math.random().toString().substr(2), formObj = data.form, target = data;

		$.api.get('form/field/add', {
			form_id    : formObj.form_id,
			field_type : 'TextField',
			title      : title,
			parent_id  : target.field_id
		}, function(resp){
			if(resp.status != 'success'){
				alert('There was an error creating the field, please try again');
				return;
			}

			$.modules.load('form.textField', {
				title : title,
				form  : formObj
			}, function(elem){
				target.append(elem);
			});
		});
	}
});
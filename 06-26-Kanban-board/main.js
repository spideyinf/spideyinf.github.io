var COLUMN_TYPE = ['todo', 'doing', 'done'];

var LIMIT = {'todo': 5, 'doing': 3, 'done': 100};

var DB = {
	getData: function () {
		if (typeof(Storage) !== "undefined") {
		var data;
		 try {
 			data = JSON.parse(localStorage.getItem('list')) || {};
		} catch (error) {
		 	data = {};
		}
			return data;
		} else {
    		alert("Sorry! No Web Storage support..")
		}
	},
	setData: function (data) {
		localStorage.setItem('list', JSON.stringify(data));
	}
};

var list = DB.getData();

var app = {
	newTask: function(e, type, input) {
		var taskName = $(input).val();
		var event = window.event || e;

		if (event.keyCode === 13 && taskName.trim() !== '') {
			//Add local storage info to the list
			if (!list[type]) list[type] = [];

			list[type].push(taskName);

			//Limit task for each column
			if (list[type].length > LIMIT[type]) {
				
				//Display modal
				$('.limit-count').text(LIMIT[type]);
				$('.limit-list').text(type);
				$('#modal-limit').modal('show');	
				
				list[type].pop(taskName);
				return $(input).val('');
			}

			DB.setData(list);

			//Update DOM - add task to the list
			this.addTaskToList(type, taskName);
			$('#' + type).prev('span').text(list[type].length);
			//Reset input
			$(input).val('');
		}
	},

	addTaskToList: function(type, taskName) {
		var item = '<a href="#" class="list-group-item">' + taskName + '<span class="glyphicon glyphicon-trash pull-right" onclick="app.deleteTask(this)"></span></a>';
		$('#' + type).append(item);
	},

	deleteTask: function(span) {
		var modal = $('#modal-confirm');
		var item = $(span).parent();
		var btn = $('#btn-delete');
		
		//Trigger the modal when clicking in span
		$('span').on('click', function () {
  			modal.modal('show');
		});

		btn.off('click');

		//Remove task at UI and local storage data
		btn.on('click', function () {
			var columnType = item.parent().attr('id');
			var itemPosition = $('#' + columnType + ' .list-group-item').index(item);
			list[columnType].splice(itemPosition, 1);
			DB.setData(list);
			item.remove();
			modal.modal('hide');
			$('#' + columnType).prev('span').text(list[columnType].length);
		});
	},

};



$(function() { //Initiate sorttable for .sort-list - A jQueryUI feature + Add local storage info
    COLUMN_TYPE.forEach(function(type) {
    	var columnType = list[type] || [];
    	columnType.forEach(function(taskName) {
    		app.addTaskToList(type, taskName);
    		$('#' + type).prev('span').text(list[type].length);
    	})
    });

    $( ".sort-list" ).sortable({
      connectWith: ".sort-list",
      placeholder: 'ui-state-highlight',
      start: function (event, ui) {
      	//Add style class
      	$(ui.item[0]).addClass('dragging');

      	ui.item.oldColumnType = ui.item.parent().attr('id');
      	ui.item.oldItemPosition = ui.item.index();
      },
      stop: function (event, ui) {
      	//Remove style class
      	$(ui.item[0]).removeClass('dragging');

      	var item = ui.item;
      	var oldColumnType = item.oldColumnType;
      	var oldItemPosition = item.oldItemPosition;
      	var newColumnType = item.parent().attr('id');
      	var newItemPosition = item.index();

      	//Remove item from old position
      	list[oldColumnType].splice(oldItemPosition, 1);

      	//Add it to new position
      	list[newColumnType].splice(newItemPosition, 0, item[0].innerText);

      	//Limit task of target list
      	if (list[newColumnType].length > LIMIT[newColumnType]) {
      		
      		//Display Modal
      		$('.limit-count').text(LIMIT[newColumnType]);
      		$('.limit-list').text(newColumnType);
      		$('#modal-limit').modal('show');

      		//Withdraw all the actions
      		$('.sort-list').sortable('cancel');
      		list[newColumnType].splice(newItemPosition, 1);
      		list[oldColumnType].splice(oldItemPosition, 0, item[0].innerText);
      	}

      	//Update badge
      	$('#' + oldColumnType).prev('span').text(list[oldColumnType].length);
      	$('#' + newColumnType).prev('span').text(list[newColumnType].length);
      	//Store data to local storage
      	DB.setData(list);
      }
    });
  });




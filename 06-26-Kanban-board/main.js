var COLUMN_TYPE = ['todo', 'doing', 'done'];

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
			DB.setData(list);

			//Update DOM - add task to the list
			this.addTaskToList(type, taskName);
			//Reset input
			$(input).val('');
		}
	},

	addTaskToList: function(type, taskName) {
		var item = '<a href="#" class="list-group-item">' + taskName + '<span class="glyphicon glyphicon-trash pull-right" onclick="app.deleteTask(this)"></span></a>';
		$('#' + type).append(item);
	},

	deleteTask: function (span) {
		var modal = $('#modal-confirm');
		var item = $(span).parent();
		
		//Trigger the modal when clicking in span
		$('span').click(function () {
  			modal.modal('show');
		});

		//Remove task
		$('#btn-delete').on('click', function () {
			console.log("Log call");
			item.remove();
			modal.modal('hide');
		});

	}

	// addTrashIcon() {
	// 	var listItem = $('.list-group-item');
	// 	var trashIcon = '<span class="glyphicon glyphicon-trash pull-right"></span>';
	// 	listItem.append(trashIcon);
	// 	return listItem;
	// }
};



$(function() { //Initiate sorttable for .sort-list - A jQueryUI feature + Add local storage info
    COLUMN_TYPE.forEach(function(type) {
    	var columnType = list[type] || [];
    	columnType.forEach(function(taskName) {
    		app.addTaskToList(type, taskName);
    	})
    });

    $( ".sort-list" ).sortable({
      connectWith: ".sort-list",
      placeholder: 'ui-state-highlight',
      start: function (event, ui) {
      	//Add style class
      	$(ui.item[0]).addClass('dragging');
      },
      stop: function (event, ui) {
      	//Remove style class
      	$(ui.item[0]).removeClass('dragging');
      }
    });
  });


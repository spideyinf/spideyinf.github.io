$(function() { //Initiate sorttable for .sort-list
    $( ".sort-list" ).sortable({
      connectWith: ".sort-list"
    });
  });

(function addTrashIcon() {
	var listItem = $('.list-group-item');
	var trashIcon = '<span class="glyphicon glyphicon-trash pull-right"></span>';
	listItem.append(trashIcon);
	return listItem;
})();

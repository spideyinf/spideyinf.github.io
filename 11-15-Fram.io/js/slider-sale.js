$(document).ready(function() {
  var sync1 = $("#sync1");
  var sync2 = $("#sync2");

  sync1.owlCarousel({
    items : 1,
    singleItem: true,
    slideSpeed : 2000,
    autoplay: true,
    pagination: false,
    responsiveRefreshRate : 200
  });

  sync2.owlCarousel({
    items : 5,
    itemsDesktop      : [1199, 5],
    itemsDesktopSmall     : [979,4],
    itemsTablet       : [768,4],
    itemsMobile       : [479,3],
    pagination:false,
    responsiveRefreshRate : 100,
    // Navigation
    navigation : true,
    navigationText : false,
    afterInit : function(el){
      el.find(".owl-item").eq(0).addClass("synced");
    }
  });

  function syncPosition(el){
    var current = this.currentItem;
    $("#sync2")
      .find(".owl-item")
      .removeClass("synced")
      .eq(current)
      .addClass("synced")
    if($("#sync2").data("owlCarousel") !== undefined){
      center(current)
    }
  }

  $("#sync2").on("click", ".owl-item", function(e){
    e.preventDefault();
    var number = $(this).data("owlItem");
    sync1.trigger("owl.goTo",number);
  });

  $("#sync2").on("click", ".owl-prev", function (){
    var $wrapper = $(this).closest(".owl-controls").prev();
    $wrapper.removeClass("is-next");
    $wrapper.addClass("is-prev");
  });
  $("#sync2").on("click", ".owl-next", function (){
    var $wrapper = $(this).closest(".owl-controls").prev();
    $wrapper.removeClass("is-prev");
    $wrapper.addClass("is-next");
  });
  function center(number){
    var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
    var num = number;
    var found = false;
    for(var i in sync2visible){
      if(num === sync2visible[i]){
        var found = true;
      }
    }

    if(found===false){
      if(num>sync2visible[sync2visible.length-1]){
        sync2.trigger("owl.goTo", num - sync2visible.length+2)
      }else{
        if(num - 1 === -1){
          num = 0;
        }
        sync2.trigger("owl.goTo", num);
      }
    } else if(num === sync2visible[sync2visible.length-1]){
      sync2.trigger("owl.goTo", sync2visible[1])
    } else if(num === sync2visible[0]){
      sync2.trigger("owl.goTo", num-1)
    }

  }

});

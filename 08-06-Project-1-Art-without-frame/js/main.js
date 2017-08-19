//Navbar control

$(document).ready(function(){       
                var scroll_start = 0;
                var startchange = $('#startchange');
                var offset = startchange.offset();
                    if (startchange.length){
                $(document).scroll(function() { 
                    scroll_start = $(this).scrollTop();
                    if(scroll_start > offset.top) {
                          $(".navbar-default").css('background-color', 'white');
                          $('.logo-brand').attr('src', 'images/logo/logo2.png');
                          $('.nav-link, .nav-link__icon, .dropdown-toggle, .dropdown-toggle__icon, .caret').css('color', 'gray');
                       } else {
                          $('.navbar-default').css('background-color', 'transparent');
                          $('.logo-brand').attr('src', 'images/logo/logo.png');
                          $('.nav-link, .nav-link__icon, .dropdown-toggle, .dropdown-toggle__icon, .caret').css('color', 'white');
                       }
                   });
                    }
                });

// Home -  Flex panel galery

const panels = document.querySelectorAll('.home-art-panels__panel');

function toggleOpen() {
  this.classList.toggle('open');
}

function toggleActive(e) {
  if (e.propertyName.includes('flex')) {
    this.classList.toggle('open-active');
  }
}
panels.forEach(panel => panel.addEventListener('click', toggleOpen));
panels.forEach(panel => panel.addEventListener('transitionend', toggleActive));

$('.selectpicker').selectpicker({
  });

//Dropdown kickoff

$(document).ready(function () {
    $('.dropdown-toggle').dropdown();
});

 $(document).ready(function () { 
    $(".selectpicker").selectpicker();
    $(".bootstrap-select").click(function () {
         $(this).addClass("open");
    });
  });

 //Tooltip kickoff
 $(document).ready(function(){
     $('[data-toggle="tooltip"]').tooltip();   
 });

 //See more - See less
 $('.see-more-see-less').click(function(){
  var $this = $(this);
  $this.toggleClass('see-more-see-less');
  if($this.hasClass('see-more-see-less')){
    $this.text('Xem thêm >');     
  } else {
    $this.text('Thu gọn <');
  }
 });


// Product-page Carousel function
(function($){
  $('#thumbcarousel').carousel(0);
  var $thumbItems = $('#thumbcarousel .item');
    $('#carousel').on('slide.bs.carousel', function (event) {
     var $slide = $(event.relatedTarget);
     var thumbIndex = $slide.data('thumb');
     var curThumbIndex = $thumbItems.index($thumbItems.filter('.active').get(0));
    if (curThumbIndex>thumbIndex) {
      $('#thumbcarousel').one('slid.bs.carousel', function (event) {
        $('#thumbcarousel').carousel(thumbIndex);
      });
      if (curThumbIndex === ($thumbItems.length-1)) {
        $('#thumbcarousel').carousel('next');
      } else {
        $('#thumbcarousel').carousel(numThumbItems-1);
      }
    } else {
      $('#thumbcarousel').carousel(thumbIndex);
    }
  });
  $('#carousel').carousel({
   interval: false,
  });
  $('#thumbcarousel').carousel('pause');
})(jQuery);

 //Home page - Carousel full screen function

var $item = $('.carousel .full-screen'); 
var $wHeight = $(window).height();
$item.eq(0).addClass('active');
$item.height($wHeight); 
$item.addClass('full-screen');

$('.carousel .full-responsive').each(function() {
  var $src = $(this).attr('src');
  var $color = $(this).attr('data-color');
  $(this).parent().css({
    'background-image' : 'url(' + $src + ')',
    'background-color' : $color
  });
  $(this).remove();
});

$(window).on('resize', function (){
  $wHeight = $(window).height();
  $item.height($wHeight);
});

$('.carousel').carousel({
  interval: 8000,
  pause: true,
});

//-------------------------------------//
// init Masonry

var $grid = $('.grid').masonry({
  itemSelector: 'none', // select none at first
  columnWidth: '.grid__col-sizer',
  gutter: '.grid__gutter-sizer',
  percentPosition: true,
  stagger: 30,
  // nicer reveal transition
  visibleStyle: { transform: 'translateY(0)', opacity: 1 },
  hiddenStyle: { transform: 'translateY(100px)', opacity: 0 },
});

// get Masonry instance
var msnry = $grid.data('masonry');

// initial items reveal
$grid.imagesLoaded( function() {
  $grid.removeClass('are-images-unloaded');
  $grid.masonry( 'option', { itemSelector: '.grid__item' });
  var $items = $grid.find('.grid__item');
  $grid.masonry( 'appended', $items );
});

//-------------------------------------//
// hack CodePen to load pens as pages

// var nextPenSlugs = [
//   '202252c2f5f192688dada252913ccf13',
//   'a308f05af22690139e9a2bc655bfe3ee',
//   '6c9ff23039157ee37b3ab982245eef28',
// ];

// function getPenPath() {
//   var slug = nextPenSlugs[ this.loadCount ];
//   if ( slug ) {
//     return 'https://s.codepen.io/desandro/debug/' + slug;
//   }
// }

//-------------------------------------//
// init Infinte Scroll

$grid.infiniteScroll({
  path: getPenPath,
  append: '.grid__item',
  outlayer: msnry,
  status: '.page-load-status',
});


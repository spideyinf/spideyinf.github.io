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
  interval: 6000,
  pause: "false"
});

//
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
})(jQuery);


//Navbar control

$(document).ready(function(){       
  var scroll_start = 0;
  var startchange = $('#startchange');
  var offset = startchange.offset();

  if ($(window).width() > 768) {
    if (startchange.length){
      $(document).scroll(function() { 
        scroll_start = $(this).scrollTop();
          if(scroll_start > offset.top) {
            $(".navbar-default").css('background-color', 'rgba(15, 15, 15, 0.8)');
              // $('.logo-brand').attr('src', 'images/logo/logo2.png');
              // $('.nav-link, .nav-link__icon, .dropdown-toggle, .dropdown-toggle__icon, .caret').css('color', 'gray');
            } else {
              $('.navbar-default').css('background-color', 'transparent');
              // $('.logo-brand').attr('src', 'images/logo/logo.png');
              // $('.nav-link, .nav-link__icon, .dropdown-toggle, .dropdown-toggle__icon, .caret').css('color', 'white');
            }   
      });
    }
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

//Home Number animation JS control - By Adam at depthdev.com
  /*
   Inc v1.0.0
   (c) 2014 Depth Development. http://depthdev.com
   License: Apache 2.0
  */

  'use strict';
   
  function Inc(obj) {
    var elem = obj.elem;
    var input = (elem.nodeName.toLowerCase() === 'input') ? true: false;
    var value = parseFloat(elem.getAttribute('data-inc-value')) || 0;
    var duration = parseInt(elem.getAttribute('data-inc-duration')) || 0;
    var delay = parseInt(elem.getAttribute('data-inc-delay')) || 0;
    var decimal = ((obj.decimal > 2) ? 2 : obj.decimal) || 0;
    var currency = obj.currency || '';
    var speed = ((obj.speed < 30) ? 30 : obj.speed) || 30;
    var count = 0;
    var increment = value / (duration / speed);
    var interval = null;
    var regex = /\B(?=(\d{3})+(?!\d))/g;
    var run = function() {
      count += increment;
      if (count < value) {
        (input) ? elem.value = currency + (count).toFixed(decimal).toString().replace(regex, ',') : elem.innerHTML = currency + (count).toFixed(decimal).toString().replace(regex, ',');
      } else {
        clearInterval(interval);
        (input) ? elem.value = currency + (value).toFixed(decimal).toString().replace(regex, ',') : elem.innerHTML = currency + (value).toFixed(decimal).toString().replace(regex, ',');
      }
    };
    setTimeout(function() {
      interval = setInterval(run.bind(this), speed);
    }.bind(this), delay);
    this.reset = function() {
      clearInterval(interval);
      value = parseFloat(elem.getAttribute('data-inc-value')) || 0;
      duration = parseInt(elem.getAttribute('data-inc-duration')) || 0;
      increment = value / (duration / speed);
      delay = parseInt(elem.getAttribute('data-inc-delay')) || 0;
      count = 0;
      interval = setInterval(run, speed);
    }.bind(this);
  } // Inc


  var elems = $('.home-intro__infographics__holder h1');
  var objs = [];

  for (var i = 0, l = elems.length; i < l; i++) {
    objs.push(
      new Inc({
        elem: elems[i],
        speed: 50,
        decimal: 0,
        currency: '>'
      })
    );
  }
  elems[0].addEventListener('click', function() {
    objs[0].reset();
  });
  elems[1].addEventListener('click', function() {
    objs[1].reset();
  });
  elems[2].addEventListener('click', function() {
    objs[2].reset();
  });
//End of Number animation control


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

var nextPenSlugs = [
  'InfiniteScroll4.htm',
  'InfiniteScroll2.htm',
  'InfiniteScroll3.htm',
  'InfiniteScroll4.htm',
  'InfiniteScroll2.htm',
  'InfiniteScroll3.htm',

];

function getPenPath() {
  var slug = nextPenSlugs[ this.loadCount ];
  if ( slug ) {
    return 'http://localhost:3012/' + slug;
  }
}

//-------------------------------------//
// init Infinte Scroll

$grid.infiniteScroll({
  path: getPenPath,
  append: '.grid__item',
  outlayer: msnry,
  scrollThresold: 200,
  status: '.page-load-status'
});

//Add content to all HTML grid__item
// $(function(){
//   $('.grid__item').prepend(`
//     <div class="products__main__products__info">
//                 <div class="part-gray">
//                   <div class="product-detail__info__options__tags">
//                     <span style="font-size: .75rem;">Sơn dầu</span>
//                     <span style="font-size: .75rem;">Trừu tượng</span>
//                   </div>
//                   <div class="summary">
//                     <p>"The more effort you put into improving your skills, the bigger the payoff you will get. Realize that things will be hard at first, but the rewards will be worth it."</p>
//                   </div>
//                   <h5 class="price">VND 2,300,000</h5>
//                   <div class="icon">
//                     <i data-toggle="tooltip" data-placement="top" title="Thêm vào Yêu thích" class="fa fa-heart-o" aria-hidden="true"></i>
//                     <i data-toggle="tooltip" data-placement="top" title="Thêm vào Giỏ hàng!" class="fa fa-cart-plus" aria-hidden="true"></i>
//                     <i data-toggle="tooltip" data-placement="top" title="Tìm hiểu thêm" class="fa fa-search" aria-hidden="true"></i>
//                   </div>
//                 </div>
//                 <div class="part-red">
//                   <h6>the Inspiration</h6>
//                   <p class="white">Tác giả: A Famous Artist</p>
//                 </div>
//               </div>
//             </div>
//     `);
// })

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

//Navbar control

$(document).ready(function(){       
                var scroll_start = 0;
                var startchange = $('#startchange');
                var offset = startchange.offset();
                    if (startchange.length){
                $(document).scroll(function() { 
                    scroll_start = $(this).scrollTop();
                    if(scroll_start > offset.top) {
                          $(".navbar-default").css('background-color', '#ffffff');
                       } else {
                          $('.navbar-default').css('background-color', 'transparent');
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


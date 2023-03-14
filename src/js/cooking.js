$(function() {
    $(".clickable").click( function() {
      $(this).toggleClass("container-switch");
    } );
  } );
  
  $(".ingredient-list li").click(function() {
    $(this).toggleClass('stroked');
  });
  
  // 1
  $(".hide-one").click(function(){
    $(".first-dish").toggle();
    $(".first-dish").toggleClass('visible');
  });
  
  $(".collapse-one").click(function(){
    $(".first-dish").toggle(0, function(){
      $(".hide-one").toggleClass("container-switch");
    });
  })
  
  // 2
  $(".hide-two").click(function(){
    $(".second-dish").toggle();
    $(".second-dish").toggleClass('visible');
  });
  
  $(".collapse-two").click(function(){
    $(".second-dish").toggle(0, function(){
      $(".hide-two").toggleClass("container-switch");
    });
  })
  
  // 3
  $(".hide-three").click(function(){
    $(".third-dish").toggle();
    $(".third-dish").toggleClass('visible');
  });
  
  $(".collapse-three").click(function(){
    $(".third-dish").toggle(0, function(){
      $(".hide-three").toggleClass("container-switch");
    });
  })
  
  // 4
  $(".hide-four").click(function(){
    $(".fourth-dish").toggle();
    $(".fourth-dish").toggleClass('visible');
  });
  
  $(".collapse-four").click(function(){
    $(".fourth-dish").toggle(0, function(){
      $(".hide-four").toggleClass("container-switch");
    });
  })
  
  // 5
  $(".hide-five").click(function(){
    $(".fifth-dish").toggle();
    $(".fifth-dish").toggleClass('visible');
  });
  
  $(".collapse-five").click(function(){
    $(".fifth-dish").toggle(0, function(){
      $(".hide-five").toggleClass("container-switch");
    });
  })
  
  // 6
  $(".hide-six").click(function(){
    $(".sixth-dish").toggle();
    $(".sixth-dish").toggleClass('visible');
  });
  
  $(".collapse-six").click(function(){
    $(".sixth-dish").toggle(0, function(){
      $(".hide-six").toggleClass("container-switch");
    });
  })
  
  // 7
  $(".hide-seven").click(function(){
    $(".seventh-dish").toggle();
    $(".seventh-dish").toggleClass('visible');
  });
  
  $(".collapse-seven").click(function(){
    $(".seventh-dish").toggle(0, function(){
      $(".hide-seven").toggleClass("container-switch");
    });
  })
  
  // 8
  $(".hide-eight").click(function(){
    $(".eight-dish").toggle();
    $(".eight-dish").toggleClass('visible');
  });
  
  $(".collapse-eight").click(function(){
    $(".eight-dish").toggle(0, function(){
      $(".hide-eight").toggleClass("container-switch");
    });
  })
  
  // 9
  $(".hide-nine").click(function(){
    $(".nine-dish").toggle();
    $(".nine-dish").toggleClass('visible');
  });
  
  $(".collapse-nine").click(function(){
    $(".nine-dish").toggle(0, function(){
      $(".hide-nine").toggleClass("container-switch");
    });
  })
  
  // 10
  $(".hide-ten").click(function(){
    $(".tenth-dish").toggle();
    $(".tenth-dish").toggleClass('visible');
  });
  
  $(".collapse-ten").click(function(){
    $(".tenth-dish").toggle(0, function(){
      $(".hide-ten").toggleClass("container-switch");
    });
  })
  
  // 11
  $(".hide-eleven").click(function(){
    $(".eleven-dish").toggle();
    $(".eleven-dish").toggleClass('visible');
  });
  
  $(".collapse-eleven").click(function(){
    $(".eleven-dish").toggle(0, function(){
      $(".hide-eleven").toggleClass("container-switch");
    });
  })
  
  // 12
  $(".hide-twelve").click(function(){
    $(".twelve-dish").toggle();
    $(".twelve-dish").toggleClass('visible');
  });
  
  $(".collapse-twelve").click(function(){
    $(".twelve-dish").toggle(0, function(){
      $(".hide-twelve").toggleClass("container-switch");
    });
  })
  
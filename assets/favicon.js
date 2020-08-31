(function () {
  let frame = 0;

  function loop() {
    setTimeout(() => {
      frame++;
      const frameUrl = "/anim/Spin" + ((frame % 7) + 1) + ".png";
      $("link[rel=icon]").attr("href", frameUrl);
      loop();
    }, 400);
  }

  loop();
})();

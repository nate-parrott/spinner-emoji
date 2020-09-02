(function () {
  let frame = 0;

  function loop() {
    setTimeout(() => {
      frame++;
      const frameUrl = "anim/Spin" + ((frame % 7) + 1) + ".png";
      $(".animatedEmoji").attr("src", frameUrl);
      loop();
    }, 100);
  }

  loop();
})();

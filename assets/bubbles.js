
function loadConvos(callback) {
  $.getJSON('assets/convos.json', callback);
}

function pick1(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createMessageNode(text) {
  let parts = text.split('<spinner>');
  let node = $("<div></div>");
  for (let i=0; i<parts.length; i++) {
    node.append($("<span></span>").text(parts[i]));
    if (i+1 < parts.length) {
      node.append($("<img />").attr('src', 'Emoji4.png').addClass('spinner-emoji'));
    }
  }
  return node;
}

function valOrRand(val) {
  return (val === undefined) ? Math.random() : val; 
}

function quantize(v, quant) {
  return Math.round(v / quant) * quant;
}

function Bubbles(messages, options, onDone) {
  let left = (valOrRand(options.x)) * 100;
  let top = valOrRand(options.y) * 70;
  let depth = valOrRand(options.depth);
  let scale = 1.7 * (1 - depth);
  let minDepthBeforeBlur = 0.3;
  let blur = depth > minDepthBeforeBlur ? (depth-minDepthBeforeBlur) / (1-minDepthBeforeBlur): 0;
  let speed = 9 / (0.5 + depth);
  let floatUpTimeSeconds = 20;
  let translateUp = - speed * floatUpTimeSeconds;
  
  let self = this;
  self.node = $('<div></div>').addClass('messages').appendTo('#main')
    .css({
      left: left + '%', 
      top: top + '%',
      filter: blur ? 'blur(' + blur * 4 + 'px)' : null,
      opacity: 1 - depth,
      transform: 'scale(' + scale + ')',
      zIndex: (1 - depth) * 1000
    });
  
  let floatUpAnim = anime({
    targets: self.node.get(0),
    easing: 'linear',
    scale: scale,
    translateY: translateUp,
    duration: floatUpTimeSeconds * 1000
  });
  
  self.appendMessage = function(message) {
    let isReceived = !!message.A;
    let text = isReceived ? message.A : message.B;
    let bordered = true; // text.replace(/\<spinner\>/g, '').length > 0;
    let el = $("<div></div>").addClass(isReceived ? 'received' : 'sent').addClass(bordered ? 'bordered' : 'unbordered').append(createMessageNode(text)).appendTo(self.node);
    
    el.css({opacity: 0});
    let targets = el.get(0);
    let timeline = anime.timeline();
    timeline.add({
      targets: targets,
      translateY: 30,
      scale: 1,
      opacity: 0,
      duration: 1
    }).add({
      targets: targets,
      translateY: 0,
      scale: 1,
      opacity: 1
    });
  }
  self.randMessageDelay = function() { return 700 + Math.random() * 500; };
  self.appendMessages = function(messages, useDelay) {
    if (messages.length) {
      self.appendMessage(messages[0]);
      let delay = useDelay ? self.randMessageDelay() : 0;
      setTimeout(function() {
        self.appendMessages(messages.slice(1), useDelay);
      }, delay);
    } else {
      // we're done displaying:
      setTimeout(self.flyOut, self.randMessageDelay() * 2);
    }
  }
  self.flyOut = function() {
    // fix element size on the way out:
    $(self.node).css({width: $(self.node).width(), height: $(self.node).height()});
    
    let timeline = anime.timeline();
    let messages = $(self.node).children().toArray();
    let duration = 400;
    for (let i=0; i<messages.length; i++) {
      let target = messages[i];
      timeline.add({
        targets: target,
        duration: duration,
        offset: (duration * 0.2) * i,
        translateY: -200,
        opacity: 0,
        easing: 'easeInCubic'
      })
    }
    setTimeout(self.done, (duration * 0.2) * messages.length + duration);
  }
  self.done = function() {
    anime.remove(self.node);
    $(self.node).remove();
    if (onDone) onDone();
  }
  
  setTimeout(function() {
    self.appendMessages(messages, true);
  }, self.randMessageDelay());
}

function Manager(convos) {
  let self = this;
  self.itemsPerDepth = {};
  let maxItemsPerDepth = {0: 1, 0.5: 2, 0.7: 3};
  self.start = function() {
    self.loop();
  }
  self.loop = function() {
    let depths = Object.keys(maxItemsPerDepth);
    depths.forEach(function(depthStr) {
      let depth = parseFloat(depthStr);
      self.itemsPerDepth[depth] = self.itemsPerDepth[depth] || 0;
      while (self.itemsPerDepth[depth] < maxItemsPerDepth[depth]) {
        let options = {depth: depth};
        if (depth === 0) {
          options.x = 0.5;
          options.y = 0.5;
        }
        let b = new Bubbles(pick1(convos), options, function() {
          self.itemsPerDepth[depth] -= 1;
        });
        self.itemsPerDepth[depth] += 1;
      }
    });
    setTimeout(self.loop, 500);
  }
}

loadConvos(function(convos) {
  let m = new Manager(convos);
  m.start();
});

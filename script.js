(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ================= SOUND (optional, no external files) ================= */
  var soundOn = false;
  var audioCtx = null;
  function ensureAudio(){
    if (!audioCtx){
      try{
        var AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
      }catch(e){ audioCtx = null; }
    }
    return audioCtx;
  }
  function chime(freq, dur, vol){
    if (!soundOn) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var t0 = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol || 0.06, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.6));
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + (dur || 0.6) + 0.05);
  }
  function starChime(){ chime(880, 0.55, 0.05); setTimeout(function(){ chime(1318, 0.5, 0.035); }, 90); }
  function pageTurnSound(){
    if (!soundOn) return;
    var ctx = ensureAudio();
    if (!ctx) return;
    var bufferSize = ctx.sampleRate * 0.4;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
    var noise = ctx.createBufferSource();
    noise.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  }

  var soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', function(){
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.textContent = soundOn ? '♫' : '♪';
    soundToggle.style.color = soundOn ? '#9c6459' : '';
    if (soundOn) ensureAudio();
  });

  /* ================= COVER -> BOOK ================= */
  var cover = document.getElementById('cover');
  var book = document.getElementById('book');
  var openBtn = document.getElementById('openBtn');

  function openHerbarium(){
    pageTurnSound();
    cover.classList.add('opening');
    book.removeAttribute('aria-hidden');
    setTimeout(function(){
      book.classList.add('visible');
      cover.style.display = 'none';
    }, reduceMotion ? 60 : 520);
  }
  openBtn.addEventListener('click', openHerbarium);
  openBtn.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHerbarium(); }
  });

  /* ================= FLOWER NOTES ================= */
  function wireFlower(wrapId, noteId){
    var wrap = document.getElementById(wrapId);
    var note = document.getElementById(noteId);
    if (!wrap || !note) return;
    var open = false;
    function toggle(){
      open = !open;
      note.classList.toggle('visible', open);
      wrap.classList.toggle('active-touch', open);
    }
    wrap.addEventListener('click', function(e){
      e.stopPropagation();
      toggle();
    });
    wrap.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
    document.addEventListener('click', function(){
      if (open){ open = false; note.classList.remove('visible'); wrap.classList.remove('active-touch'); }
    });
  }
  wireFlower('roseWrap', 'roseNote');
  wireFlower('lilyWrap', 'lilyNote');

  /* daisy: note + pollen particles */
  (function(){
    var wrap = document.getElementById('daisyWrap');
    var note = document.getElementById('daisyNote');
    var field = document.getElementById('pollenField');
    var open = false;
    function spawnPollen(){
      if (reduceMotion) return;
      for (var i=0;i<8;i++){
        var p = document.createElement('span');
        p.className = 'pollen go';
        var angle = Math.random()*Math.PI*2;
        var dist = 26 + Math.random()*30;
        p.style.setProperty('--px2', (Math.cos(angle)*dist)+'px');
        p.style.setProperty('--py2', (Math.sin(angle)*dist)+'px');
        p.style.left = (Math.random()*10-5)+'px';
        p.style.top = (Math.random()*10-5)+'px';
        p.style.animationDelay = (Math.random()*0.15)+'s';
        field.appendChild(p);
        (function(el){ setTimeout(function(){ el.remove(); }, 1300); })(p);
      }
    }
    function toggle(){
      open = !open;
      note.classList.toggle('visible', open);
      wrap.classList.toggle('active-touch', open);
      if (open) spawnPollen();
    }
    wrap.addEventListener('click', function(e){ e.stopPropagation(); toggle(); });
    wrap.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
    document.addEventListener('click', function(){
      if (open){ open=false; note.classList.remove('visible'); wrap.classList.remove('active-touch'); }
    });
  })();

  /* ================= GENERATE DAISY PETALS ================= */
  (function(){
    var group = document.getElementById('daisyPetals');
    if (!group) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var cx = 75, cy = 90, count = 12, inner = 15, outer = 46;
    for (var i=0;i<count;i++){
      var a = (Math.PI*2/count)*i - Math.PI/2;
      var wobble = (i % 2 === 0) ? 1 : -1;
      var tipX = cx + Math.cos(a)*outer;
      var tipY = cy + Math.sin(a)*outer;
      var baseX1 = cx + Math.cos(a - 0.16)*inner;
      var baseY1 = cy + Math.sin(a - 0.16)*inner;
      var baseX2 = cx + Math.cos(a + 0.16)*inner;
      var baseY2 = cy + Math.sin(a + 0.16)*inner;
      var midX = cx + Math.cos(a)*(outer*0.55) + wobble*2;
      var midY = cy + Math.sin(a)*(outer*0.55);
      var path = document.createElementNS(svgNS, 'path');
      var d = 'M'+baseX1+' '+baseY1+' Q '+midX+' '+midY+' '+tipX+' '+tipY+' Q '+midX+' '+midY+' '+baseX2+' '+baseY2+' Z';
      path.setAttribute('d', d);
      path.setAttribute('class', 'petal');
      path.style.setProperty('--px', cx+'px');
      path.style.setProperty('--py', cy+'px');
      path.style.setProperty('--sway', (wobble*3)+'deg');
      path.setAttribute('fill', i % 3 === 0 ? '#f7f1e3' : '#efe6d1');
      path.setAttribute('opacity', '0.92');
      group.appendChild(path);
    }
  })();

  /* ================= STAR FIELD ================= */
  var skyField = document.getElementById('skyField');
  var starGlyphs = ['✦','✧','⋆','⭑'];
  var totalSpecial = 7;
  var foundCount = 0;
  var starCountEl = document.getElementById('starCount');
  var starCounter = document.getElementById('starCounter');

  function rand(min, max){ return Math.random()*(max-min)+min; }

  function buildSky(){
    var pageHeight = Math.max(document.getElementById('herbariumPage').offsetHeight + 260, window.innerHeight);
    skyField.style.height = pageHeight + 'px';

    // decorative twinkling stars (non-interactive)
    var decoCount = window.innerWidth < 640 ? 16 : 30;
    for (var i=0;i<decoCount;i++){
      var s = document.createElement('span');
      s.className = 'star-deco' + (Math.random() > 0.4 ? ' twinkle' : '');
      s.textContent = starGlyphs[Math.floor(Math.random()*starGlyphs.length)];
      s.style.left = rand(2,96) + '%';
      s.style.top = rand(2,96) + '%';
      s.style.fontSize = rand(9,15) + 'px';
      s.style.animationDelay = rand(0,4) + 's';
      s.setAttribute('aria-hidden','true');
      skyField.appendChild(s);
    }

    // 7 special interactive stars, spread across a grid of zones so they don't overlap
    var zones = [];
    var cols = 4, rows = 3;
    for (var c=0;c<cols;c++){ for (var r=0;r<rows;r++){ zones.push({c:c,r:r}); } }
    // shuffle
    for (var k=zones.length-1;k>0;k--){ var j=Math.floor(Math.random()*(k+1)); var tmp=zones[k]; zones[k]=zones[j]; zones[j]=tmp; }
    var chosen = zones.slice(0, totalSpecial);

    chosen.forEach(function(zone, idx){
      var btn = document.createElement('button');
      btn.className = 'star-find';
      btn.type = 'button';
      btn.textContent = starGlyphs[idx % starGlyphs.length];
      btn.setAttribute('aria-label', 'Estrella oculta');
      btn.dataset.starId = idx;
      var leftPct = (zone.c/cols)*100 + rand(4, (100/cols)-8);
      var topPct = (zone.r/rows)*100 + rand(4, (100/rows)-8);
      btn.style.left = leftPct + '%';
      btn.style.top = topPct + '%';
      btn.addEventListener('click', function(ev){
        ev.stopPropagation();
        onStarFound(ev.currentTarget);
      });
      skyField.appendChild(btn);
    });
  }

  function sparkleBurst(x, y, parent){
    if (reduceMotion) return;
    for (var i=0;i<6;i++){
      var sp = document.createElement('span');
      sp.className = 'star-sparkle';
      sp.textContent = '✦';
      var angle = Math.random()*Math.PI*2;
      var dist = rand(14,30);
      sp.style.setProperty('--dx', (Math.cos(angle)*dist)+'px');
      sp.style.setProperty('--dy', (Math.sin(angle)*dist)+'px');
      sp.style.left = x + 'px';
      sp.style.top = y + 'px';
      parent.appendChild(sp);
      (function(el){ setTimeout(function(){ el.remove(); }, 900); })(sp);
    }
  }

  function onStarFound(btn){
    if (btn.classList.contains('found')) return;
    btn.classList.add('found');
    btn.disabled = true;
    foundCount++;
    starCountEl.textContent = String(foundCount);
    starChime();
    sparkleBurst(parseFloat(btn.style.left), parseFloat(btn.style.top), skyField);
    if (foundCount >= totalSpecial){
      starCounter.classList.add('complete');
      starCounter.textContent = 'Has encontrado todas las estrellas.';
      setTimeout(unlockSecret, 900);
    }
  }

  /* ================= SECRET SECTION ================= */
  var secretOverlay = document.getElementById('secretOverlay');
  var closeSecret = document.getElementById('closeSecret');
  function unlockSecret(){
    pageTurnSound();
    secretOverlay.classList.add('show');
    secretOverlay.removeAttribute('aria-hidden');
    closeSecret.focus();
  }
  closeSecret.addEventListener('click', function(){
    secretOverlay.classList.remove('show');
    secretOverlay.setAttribute('aria-hidden','true');
  });
  secretOverlay.addEventListener('click', function(e){
    if (e.target === secretOverlay){
      secretOverlay.classList.remove('show');
      secretOverlay.setAttribute('aria-hidden','true');
    }
  });

  /* ================= DUST MOTES (reduced on mobile / disabled on reduced motion) ================= */
  function spawnDust(){
    if (reduceMotion) return;
    var count = window.innerWidth < 640 ? 6 : 14;
    var page = document.getElementById('herbariumPage');
    for (var i=0;i<count;i++){
      var d = document.createElement('span');
      d.className = 'dust';
      var size = rand(2,4);
      d.style.width = size+'px';
      d.style.height = size+'px';
      d.style.left = rand(0,100)+'%';
      d.style.top = rand(0,100)+'%';
      d.style.animationDuration = rand(6,12)+'s';
      d.style.animationDelay = rand(0,5)+'s';
      d.setAttribute('aria-hidden','true');
      page.appendChild(d);
    }
  }

  /* ================= SUBTLE PARALLAX ================= */
  var lastY = 0, ticking = false;
  function onScroll(){
    if (reduceMotion) return;
    lastY = window.scrollY;
    if (!ticking){
      window.requestAnimationFrame(function(){
        skyField.style.transform = 'translateY(' + (lastY * 0.06) + 'px)';
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ================= INIT ================= */
  window.addEventListener('load', function(){
    buildSky();
    spawnDust();
  });
  window.addEventListener('resize', function(){
    // keep sky sized to content; cheap enough not to rebuild stars each time
    var pageHeight = Math.max(document.getElementById('herbariumPage').offsetHeight + 260, window.innerHeight);
    skyField.style.height = pageHeight + 'px';
  });

})();

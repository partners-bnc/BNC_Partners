import React, { useEffect, useRef } from 'react';

// Home page: full-width looping handshake video (public/handshake/handshake.mp4).
// The source video has a grey/white checkerboard baked into its background, so
// each frame is drawn through a small WebGL shader that turns light, colourless
// pixels into pure white. This runs on the graphics card, so playback stays
// smooth at full quality. If WebGL is unavailable, the plain video shows instead.
const VIDEO = '/handshake/handshake.mp4';

const VERT = `
attribute vec2 p;
uniform vec4 crop; // u0, v0, u-size, v-size of the video area shown
varying vec2 uv;
void main() {
  vec2 t = p * 0.5 + 0.5;
  uv = crop.xy + vec2(t.x, 1.0 - t.y) * crop.zw;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D tex;
varying vec2 uv;
void main() {
  vec3 c = texture2D(tex, uv).rgb;
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  // background = light AND colourless (the checkerboard); blend it to white
  float light = clamp((mn * 255.0 - 168.0) / 26.0, 0.0, 1.0);
  float grey = clamp((26.0 - (mx - mn) * 255.0) / 10.0, 0.0, 1.0);
  gl_FragColor = vec4(mix(c, vec3(1.0), light * grey), 1.0);
}`;

// The handshake video on its own, filling whatever box it is given.
export function HandshakeVideo({ className = '' }) {
  const boxRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- WebGL setup (falls back to the plain <video> if anything fails)
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
    let ok = !!gl, uCrop = null;
    if (ok) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
      const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
      const prog = vs && fs && gl.createProgram();
      if (prog) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); }
      ok = !!prog && gl.getProgramParameter(prog, gl.LINK_STATUS);
      if (ok) {
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        uCrop = gl.getUniformLocation(prog, 'crop');
      }
    }
    canvas.style.display = ok ? 'block' : 'none';

    const draw = () => {
      if (!ok || video.readyState < 2) return;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Canvas matches its box at device resolution (capped at 2x); "cover" crop.
    const resize = () => {
      if (!ok) return;
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const va = (video.videoWidth || 16) / (video.videoHeight || 9);
      const ca = canvas.width / canvas.height;
      if (ca < va) { const w = ca / va; gl.uniform4f(uCrop, (1 - w) / 2, 0, w, 1); }
      else { const h = va / ca; gl.uniform4f(uCrop, 0, (1 - h) / 2, 1, h); }
      draw();
    };

    // Redraw on every new video frame (or every animation frame as a fallback).
    let alive = true, rafId = 0, vfcId = 0;
    const loop = () => {
      if (!alive) return;
      draw();
      if (video.requestVideoFrameCallback) vfcId = video.requestVideoFrameCallback(loop);
      else rafId = requestAnimationFrame(loop);
    };

    const onMeta = () => {
      resize();
      if (reduce) video.currentTime = Math.max(0, video.duration - 0.05); // show the final shot, still
    };
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', draw);
    video.addEventListener('seeked', draw);
    if (video.readyState >= 1) onMeta();

    // Only play while the section is on screen.
    let visible = false;
    const io = new IntersectionObserver((entries) => {
      const e = entries[entries.length - 1]; // newest state
      visible = e.isIntersecting;
      if (reduce) return;
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.15 });
    io.observe(box);

    // The 1.8 MB video is far down the page: start downloading it only when the
    // visitor scrolls near it, instead of competing with the hero on first load.
    const onCanPlay = () => { if (visible && !reduce) video.play().catch(() => {}); };
    const near = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      video.addEventListener('canplay', onCanPlay, { once: true });
      video.preload = 'auto';
      video.src = VIDEO;
      video.load();
    }, { rootMargin: '900px 0px' });
    near.observe(box);
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      if (vfcId && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(vfcId);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', draw);
      video.removeEventListener('seeked', draw);
      io.disconnect();
      near.disconnect();
      video.removeEventListener('canplay', onCanPlay);
      ro.disconnect();
      video.pause();
    };
  }, []);

  return (
    <div ref={boxRef} className={`relative overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}

// Stand-alone full-width band (no longer used on the home page: the handshake now
// sits inside the Get Started section, see CTA.jsx).
export default function HandshakeScroll() {
  return (
    <section
      id="partnership"
      aria-label="BNC partnership"
      className="relative py-24"
      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff 96px, #fff calc(100% - 96px), rgba(255,255,255,0))' }}
    >
      <div className="text-center">
        <p className="lg-eyebrow is-red">Partnership</p>
      </div>
      <HandshakeVideo className="mt-4 aspect-square w-full md:aspect-video md:max-h-[calc(100svh-72px)]" />
    </section>
  );
}

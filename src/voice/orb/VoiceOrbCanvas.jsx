import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { generateSpherePoints } from './generateSpherePoints';
import { vertexShader, fragmentShader } from './shaders';

const PARTICLE_COUNT = 4500;
const RADIUS = 1;
const SMOOTH_TAU = 0.09;

export default function VoiceOrbCanvas({ source, className = '', onError }) {
  const canvasRef = useRef(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let renderer;
    let frameId = 0;
    let disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 12);

    const points = generateSpherePoints(PARTICLE_COUNT, RADIUS, 0.42);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.positions, 3));
    geometry.setAttribute('direction', new THREE.Float32BufferAttribute(points.directions, 3));
    geometry.setAttribute('seed', new THREE.Float32BufferAttribute(points.seeds, 1));
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(points.sizes, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 1.8 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 },
        uLevel: { value: 0 },
        uVoiceActive: { value: 0 },
        uPixelRatio: { value: 1 },
        uRadius: { value: RADIUS }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const cloud = new THREE.Points(geometry, material);
    const orbGroup = new THREE.Group();
    orbGroup.position.set(0, 0.6, 0);
    orbGroup.scale.setScalar(1.3);
    orbGroup.add(cloud);
    scene.add(orbGroup);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
      });
    } catch (error) {
      console.error('Could not initialize the voice orb renderer:', error);
      onErrorRef.current?.();
      return () => {
        geometry.dispose();
        material.dispose();
      };
    }

    renderer.setClearColor(0xffffff, 0);
    const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    renderer.setPixelRatio(pixelRatio);
    material.uniforms.uPixelRatio.value = pixelRatio;

    const resize = () => {
      if (!renderer || disposed) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const clock = new THREE.Clock();
    const smoothedBands = { bass: 0, mid: 0, treble: 0, level: 0 };
    const animate = () => {
      if (disposed || !renderer) return;
      frameId = window.requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const target = source.getTargetBands() ?? {
        bass: 0.06 + 0.05 * Math.sin(elapsed * 0.5),
        mid: 0.05 + 0.04 * Math.sin(elapsed * 0.7 + 1),
        treble: 0.03 + 0.025 * Math.sin(elapsed * 0.9 + 2),
        level: 0.06 + 0.05 * Math.sin(elapsed * 0.45 + 0.5)
      };
      const smoothing = 1 - Math.exp(-delta / SMOOTH_TAU);
      smoothedBands.bass += (target.bass - smoothedBands.bass) * smoothing;
      smoothedBands.mid += (target.mid - smoothedBands.mid) * smoothing;
      smoothedBands.treble += (target.treble - smoothedBands.treble) * smoothing;
      smoothedBands.level += (target.level - smoothedBands.level) * smoothing;

      material.uniforms.uTime.value = elapsed;
      material.uniforms.uBass.value = smoothedBands.bass;
      material.uniforms.uMid.value = smoothedBands.mid;
      material.uniforms.uTreble.value = smoothedBands.treble;
      material.uniforms.uLevel.value = smoothedBands.level;
      material.uniforms.uVoiceActive.value = source.isActive?.() ? 1 : 0;
      cloud.rotation.y = elapsed * 0.02;
      cloud.rotation.x = Math.sin(elapsed * 0.04) * 0.03;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [source]);

  return <canvas ref={canvasRef} className={className} aria-label="Voice assistant orb" role="img" />;
}

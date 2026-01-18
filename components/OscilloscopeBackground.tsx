"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";

const GRID_DIVISIONS = 12;
const SCROLL_MULTIPLIER = 6;
const ZOOM_RATIO = 0.7;
const DEVICE_OFFSET_X = 1.4;

export default function OscilloscopeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0b10, 10, 26);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);

    const ambient = new THREE.AmbientLight(0xf2e6c8, 0.35);
    const keyLight = new THREE.PointLight(0xfff2c5, 1.4, 18);
    keyLight.position.set(4.5, 4.8, 7.2);
    const fillLight = new THREE.PointLight(0xb7cfff, 0.6, 14);
    fillLight.position.set(-3.8, 1.8, 5.5);
    scene.add(ambient, keyLight, fillLight);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xdad2b9,
      roughness: 0.55,
      metalness: 0.1,
    });
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x0b0f0c,
      roughness: 0.45,
      metalness: 0.12,
      emissive: new THREE.Color("#1f6b3f"),
      emissiveIntensity: 0.28,
    });
    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0xcfc6aa,
      roughness: 0.6,
      metalness: 0.1,
    });
    const keyMaterial = new THREE.MeshStandardMaterial({
      color: 0xbdb39a,
      roughness: 0.6,
      metalness: 0.1,
    });
    const badgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b5bb8,
      roughness: 0.4,
      metalness: 0.2,
    });

    const deviceGroup = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.9, 2.1), bodyMaterial);
    body.position.set(0, 0.15, 0);
    deviceGroup.add(body);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.05, 0.5), bezelMaterial);
    bezel.position.set(0, 0.45, 1.05);
    deviceGroup.add(bezel);

    deviceGroup.position.x = DEVICE_OFFSET_X;

    const keyboardGroup = new THREE.Group();

    const keyboardBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.36, 1.85), keyboardMaterial);
    keyboardBase.position.set(0, -1.12, 0.65);
    keyboardGroup.add(keyboardBase);

    const keyboardTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 1.2), keyboardMaterial);
    keyboardTop.position.set(0, -0.98, 0.2);
    keyboardGroup.add(keyboardTop);

    const keyGeometry = new THREE.BoxGeometry(0.24, 0.09, 0.24);
    const keysGroup = new THREE.Group();
    const rows = 5;
    const cols = 13;
    const startX = -1.8;
    const startZ = 0.36;
    const spacing = 0.27;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const key = new THREE.Mesh(keyGeometry, keyMaterial);
        key.position.set(startX + col * spacing, -0.82, startZ - row * spacing);
        keysGroup.add(key);
      }
    }

    const spacebar = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.09, 0.24), keyMaterial);
    spacebar.position.set(0, -0.82, -0.57);
    keysGroup.add(spacebar);

    const functionRow = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.08, 0.24), keyMaterial);
    functionRow.position.set(0, -0.8, 0.6);
    keysGroup.add(functionRow);

    keyboardGroup.add(keysGroup);
    keyboardGroup.rotation.set(-0.08, Math.PI, 0);
    keyboardGroup.position.set(0, -0.05, 4.1);
    deviceGroup.add(keyboardGroup);

    const mouseGroup = new THREE.Group();

    const mouseBase = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.95), keyboardMaterial);
    mouseBase.position.set(2.85, -1.08, 4.35);
    mouseGroup.add(mouseBase);

    const mouseShell = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.75), keyMaterial);
    mouseShell.position.set(2.85, -0.96, 4.32);
    mouseGroup.add(mouseShell);

    const mouseButtonLeft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.28), keyMaterial);
    mouseButtonLeft.position.set(2.68, -0.88, 4.52);
    mouseGroup.add(mouseButtonLeft);

    const mouseButtonRight = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.28), keyMaterial);
    mouseButtonRight.position.set(3.02, -0.88, 4.52);
    mouseGroup.add(mouseButtonRight);

    const plugPoint = new THREE.Vector3(DEVICE_OFFSET_X + 0.6, -0.25, -1.05);
    const wirePoints = [
      new THREE.Vector3(2.85, -0.95, 4.15),
      new THREE.Vector3(2.7, -0.9, 3.0),
      new THREE.Vector3(2.95, -0.8, 1.4),
      new THREE.Vector3(3.3, -0.7, 0.3),
      new THREE.Vector3(3.4, -0.55, -0.6),
      plugPoint,
    ];
    const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
    const wireGeometry = new THREE.TubeGeometry(wireCurve, 24, 0.03, 10, false);
    const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6, metalness: 0.2 });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    mouseGroup.add(wire);

    const plug = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.2), keyMaterial);
    plug.position.copy(plugPoint);
    plug.position.z -= 0.06;
    deviceGroup.add(plug);

    deviceGroup.add(mouseGroup);

    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.05), badgeMaterial);
    badge.position.set(1.45, -1.25, 1.05);
    deviceGroup.add(badge);

    scene.add(deviceGroup);




    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ intensity: 1.2, luminanceThreshold: 0.1, luminanceSmoothing: 0.9 }),
        new VignetteEffect({ darkness: 0.7, offset: 0.25 }),
        new NoiseEffect({ premultiply: true })
      )
    );

    const startPosition = new THREE.Vector3(5.2, 6.2, 13.5);
    const endPosition = new THREE.Vector3(DEVICE_OFFSET_X, 0.46, 5.9);
    const startTarget = new THREE.Vector3(DEVICE_OFFSET_X, 0.35, 0.6);
    const endTarget = new THREE.Vector3(DEVICE_OFFSET_X, 0.45, 1.05);

    const updateScroll = () => {
      const totalScroll = Math.max(1, window.innerHeight * (SCROLL_MULTIPLIER - 1));
      const zoomScroll = totalScroll * ZOOM_RATIO;
      const rawScroll = window.scrollY;
      scrollProgress.current = THREE.MathUtils.clamp(rawScroll / zoomScroll, 0, 1);
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight, false);
      composer.setSize(innerWidth, innerHeight);
    };

    const clock = new THREE.Clock();
    let animationFrame = 0;

    const animate = () => {
      const time = clock.getElapsedTime();
      const progress = scrollProgress.current;
      const settled = progress > 0.85 ? 0.2 : 1;
      deviceGroup.rotation.y = Math.sin(time * 0.15) * 0.04 * settled;
      deviceGroup.rotation.x = Math.sin(time * 0.12) * 0.03 * settled;

      camera.position.copy(startPosition).lerp(endPosition, progress);
      const target = startTarget.clone().lerp(endTarget, progress);
      camera.lookAt(target);


      composer.render();
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    updateScroll();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScroll);
      window.cancelAnimationFrame(animationFrame);
      bodyMaterial.dispose();
      bezelMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className="oscilloscope-stage">
        <canvas ref={canvasRef} className="oscilloscope-canvas" aria-hidden="true" />
        <div className="oscilloscope-overlay" aria-hidden="true" />
      </div>
      <div className="scroll-spacer" aria-hidden="true" />
    </>
  );
}

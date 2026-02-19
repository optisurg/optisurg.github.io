"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";

import chrisHeadshot from "@/headshots_capstone/chris_headshot.jpeg";
import groupPhoto from "@/headshots_capstone/group_photo_Capstone.JPG";
import jaedinHeadshot from "@/headshots_capstone/jaedin_headshot.jpeg";
import jonnyHeadshot from "@/headshots_capstone/jonny_headshot.JPG";
import nabilHeadshot from "@/headshots_capstone/nabil_headshot.jpeg";
import saranshHeadshot from "@/headshots_capstone/saransh_headshot.jpeg";

const GRID_DIVISIONS = 12;
const SCROLL_MULTIPLIER = 6;
const ZOOM_RATIO = 0.7;
const DEVICE_OFFSET_X = 1.4;
const DESKTOP_PAUSE_MS = 250;
const DESKTOP_FADE_MS = 250;
const MOBILE_BREAKPOINT = 768;
const ENABLE_LAB_PROPS = false;

const SYS7_THEME = {
  wallpaperTop: "#3a5f89",
  wallpaperBottom: "#1f3d63",
  wallpaperGrid: "rgba(220, 235, 255, 0.18)",
  chrome: "#d8d6cf",
  chromeBorder: "#8f8d87",
  panel: "#f3f1ea",
  panelBorder: "#9c988f",
  icon: "#f5f4f0",
  text: "#070706",
  textMuted: "#1f1d18",
  textOnWallpaper: "#f8efe0",
  link: "#0b3e9e",
};

type DesktopIconKey = "team" | "setup" | "writing";

type TeamMember = {
  name: string;
  role: string;
  email: string;
  blurb?: string;
  headshot: StaticImageData;
  linkedin: string;
};

type ContactHitArea = {
  type: "email" | "linkedin";
  target: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function OscilloscopeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollProgress = useRef(0);
  const contentProgress = useRef(0);
  const maxRevealProgress = useRef(0);
  const bootCompleteTime = useRef<number | null>(null);
  const desktopFadeStart = useRef<number | null>(null);
  const appState = useRef<"boot" | "desktop" | "team" | "setup" | "writing">("boot");
  const transitionState = useRef<{ from: string; to: string; start: number } | null>(null);
  const noteIndex = useRef(0);
  const iconHitAreas = useRef<{ label: string; x: number; y: number; width: number; height: number }[]>([]);
  const contactHitAreas = useRef<ContactHitArea[]>([]);
  const headshotCache = useRef<Record<string, HTMLImageElement | null>>({});
  const groupPhotoCache = useRef<HTMLImageElement | null>(null);
  const isMobile = useRef(false);
  const tapStep = useRef(0);
  const lastTapTime = useRef(0);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [mobileWindow, setMobileWindow] = useState<"desktop" | "team" | "setup" | "writing">("desktop");

  const preBootLines = [
    "ONN CAPSTONE OS V1.2",
    "COPYRIGHT (C) 2026 TEAM 7",
    "",
    "BOOT SEQUENCE: OPTICAL NEURAL NETWORK",
    "STATUS: PASSIVE 4F LAYER ONLINE",
    "TARGET: <16MS SEGMENTATION LATENCY",
    "DATASET: DSAD",
    "",
    "SLOGAN: SURGICAL INFERENCE AT THE SPEED OF LIGHT",
    "",
  ];

  const notes = [
    {
      title: "Project Start",
      date: "Sep 8, 2025",
      body: ["Kickoff week.", "", "Goal: validate 4F optical convolution before hardware spending."],
    },
    {
      title: "Optical Log",
      date: "Sep 16, 2025",
      body: ["Tracking optical alignment steps.", "", "- Lens spacing calibrated", "- DMD profile loaded"],
    },
    {
      title: "Model Notes",
      date: "Sep 23, 2025",
      body: ["Segmentation checkpoint notes.", "", "- Baseline U-Net", "- Passive 4F layer enabled"],
    },
  ];

  const desktopIcons: { key: DesktopIconKey; label: string }[] = [
    { key: "team", label: "Team" },
    { key: "setup", label: "Setup" },
    { key: "writing", label: "Writing" },
  ];

  const teamMembers: TeamMember[] = [
  
    {
      name: "Saransh Bedi",
      role: "Optical Hardware Co-Lead / Part Sourcing",
      email: "bedis9@mcmaster.ca",
      blurb: "Qualifies lenses, DMDs, and builds out the DMD networking hardware.",
      headshot: saranshHeadshot,
      linkedin: "https://www.linkedin.com/in/saransh-bedi/",
    },
    {
      name: "Jaedin Garces",
      role: "Optical Hardware Co-Lead / Optical Designer",
      email: "garcesj@mcmaster.ca",
      blurb: "Sets 4F tolerances and optical bench layout.",
      headshot: jaedinHeadshot,
      linkedin: "https://www.linkedin.com/in/jaedingarces/",
    },
      {
      name: "Chris George",
      role: "Testing & Integration Lead",
      email: "georgc9@mcmaster.ca",
      blurb: "Owns subsystem tests and coordinates hardware-software integration.",
      headshot: chrisHeadshot,
      linkedin: "https://www.linkedin.com/in/cgeorge101/",
    },
    {
      name: "Jonathan Jiang",
      role: "ML Pipeline Co-Lead",
      email: "jiangj75@mcmaster.ca",
      blurb: "Validates feature survival and dataset health.",
      headshot: jonnyHeadshot,
      linkedin: "https://www.linkedin.com/in/jonathanrsjiang/",
    },
    {
      name: "Nabil Johny",
      role: "ML Pipeline Co-Lead",
      email: "johnyn@mcmaster.ca",
      blurb: "Builds the segmentation + TorchOptics pipeline.",
      headshot: nabilHeadshot,
      linkedin: "https://www.linkedin.com/in/nabil-johny/",
    },

  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobileLayout) return;

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
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.12,
      emissive: new THREE.Color("#1f6b3f"),
      emissiveIntensity: 0.2,
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
    bezel.position.set(0, 0.25, 1.05);
    deviceGroup.add(bezel);

    const screenInsetMaterial = new THREE.MeshStandardMaterial({
      color: 0x8f948a,
      roughness: 0.55,
      metalness: 0.05,
    });
    const screenInset = new THREE.Mesh(new THREE.BoxGeometry(2.85, 1.75, 0.08), screenInsetMaterial);
    screenInset.position.set(0, 0.25, 0.95);
    deviceGroup.add(screenInset);

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1400;
    screenCanvas.height = 820;
    const screenContext = screenCanvas.getContext("2d");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.wrapS = THREE.ClampToEdgeWrapping;
    screenTexture.wrapT = THREE.ClampToEdgeWrapping;
    screenTexture.flipY = true;
    screenTexture.needsUpdate = true;

    const preloadHeadshots = () => {
      if (typeof window === "undefined") return;
      teamMembers.forEach((member) => {
        if (headshotCache.current[member.name]) return;
        const headshot = new window.Image();
        headshot.src = member.headshot.src;
        headshot.decoding = "async";
        headshotCache.current[member.name] = headshot;
        headshot.onload = () => {
          screenTexture.needsUpdate = true;
        };
        headshot.onerror = () => {
          headshotCache.current[member.name] = null;
        };
      });
    };

    const preloadGroupPhoto = () => {
      if (typeof window === "undefined" || groupPhotoCache.current) return;
      const image = new window.Image();
      image.src = groupPhoto.src;
      image.decoding = "async";
      image.onload = () => {
        groupPhotoCache.current = image;
        screenTexture.needsUpdate = true;
      };
      image.onerror = () => {
        groupPhotoCache.current = null;
      };
      groupPhotoCache.current = image;
    };

    preloadHeadshots();
    preloadGroupPhoto();

    const screenOverlayMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const screenOverlay = new THREE.Mesh(new THREE.PlaneGeometry(2.95, 1.8), screenOverlayMaterial);
    screenOverlay.position.set(0, 0.25, 1.02);
    screenOverlay.renderOrder = 20;
    deviceGroup.add(screenOverlay);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const getScreenCoords = (event: PointerEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(screenOverlay);
      if (hits.length && hits[0].uv) {
        return {
          x: hits[0].uv.x * screenCanvas.width,
          y: (1 - hits[0].uv.y) * screenCanvas.height,
        };
      }

      return {
        x: ((event.clientX - rect.left) / rect.width) * screenCanvas.width,
        y: ((event.clientY - rect.top) / rect.height) * screenCanvas.height,
      };
    };

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

    if (ENABLE_LAB_PROPS) {
      const retroProps = new THREE.Group();

      const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1a18, roughness: 0.85, metalness: 0.05 });
      const bench = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 4.5), benchMaterial);
      bench.position.set(0.2, -1.45, 3.2);
      retroProps.add(bench);

      const oscilloscopeGroup = new THREE.Group();
      const scopeBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 1.1, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x3b3f4a, roughness: 0.6, metalness: 0.2 })
      );
      scopeBody.position.set(-3.4, -0.1, 3.2);
      oscilloscopeGroup.add(scopeBody);
      const scopeScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.5),
        new THREE.MeshBasicMaterial({ color: "#58ff99" })
      );
      scopeScreen.position.set(-3.4, 0.05, 3.75);
      oscilloscopeGroup.add(scopeScreen);
      const scopeKnobMaterial = new THREE.MeshStandardMaterial({ color: 0xc7c2b4, roughness: 0.4 });
      for (let i = 0; i < 3; i += 1) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 24), scopeKnobMaterial);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(-3.1 + i * 0.18, -0.35, 3.65);
        oscilloscopeGroup.add(knob);
      }
      retroProps.add(oscilloscopeGroup);

      const benchRail = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.08, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x2b2a27, roughness: 0.5 })
      );
      benchRail.position.set(-0.2, -1.1, 3.8);
      retroProps.add(benchRail);
      for (let i = 0; i < 4; i += 1) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16),
          new THREE.MeshStandardMaterial({ color: 0xdad2b9, roughness: 0.35 })
        );
        post.position.set(-1.8 + i * 1.2, -0.8, 3.8);
        retroProps.add(post);
      }

      const laserHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.9, 24),
        new THREE.MeshStandardMaterial({ color: 0x353744, roughness: 0.4, metalness: 0.3 })
      );
      laserHousing.rotation.z = Math.PI / 2;
      laserHousing.position.set(1.8, -0.8, 4.3);
      retroProps.add(laserHousing);
      const laserBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 2.8, 16),
        new THREE.MeshBasicMaterial({ color: "#58ff99", transparent: true, opacity: 0.75 })
      );
      laserBeam.rotation.z = Math.PI / 2;
      laserBeam.position.set(1.8, -0.78, 3.2);
      retroProps.add(laserBeam);

      scene.add(retroProps);
    }

    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.05), badgeMaterial);
    badge.position.set(1.45, -1.25, 1.05);
    deviceGroup.add(badge);


    const renderBootScreen = (reveal: number) => {
      if (!screenContext) return;
      screenContext.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
      screenContext.fillStyle = "#0b3a24";
      screenContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      screenContext.fillStyle = "#ffffff";
      screenContext.font = "20px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textAlign = "left";
      screenContext.textBaseline = "top";
      screenContext.shadowColor = "rgba(255, 255, 255, 0.6)";
      screenContext.shadowBlur = 8;

      const paddingX = 64;
      const paddingY = 70;
      const lineHeight = 28;
      const maxLines = preBootLines.length + 2;
      const lineCount = Math.max(1, Math.min(maxLines, Math.floor(reveal)));
      const visibleLines = Math.max(1, Math.min(lineCount, preBootLines.length));

      preBootLines.slice(0, visibleLines).forEach((line, index) => {
        screenContext.fillText(line, paddingX, paddingY + index * lineHeight);
      });

      if (lineCount > preBootLines.length) {
        const boxX = paddingX;
        const boxY = paddingY + (preBootLines.length + 0.5) * lineHeight;
        const boxWidth = 520;
        const boxHeight = 74;
        screenContext.strokeStyle = "#f6f6f6";
        screenContext.lineWidth = 2;
        screenContext.strokeRect(boxX, boxY, boxWidth, boxHeight);

        const loadingProgress = THREE.MathUtils.clamp(reveal - (preBootLines.length + 1), 0, 1);
        const blocks = 17;
        const blockWidth = (boxWidth - 24) / blocks;
        const filledBlocks = Math.floor(blocks * loadingProgress);
        screenContext.fillStyle = "#f6f6f6";
        for (let i = 0; i < filledBlocks; i += 1) {
          screenContext.fillRect(boxX + 12 + i * blockWidth, boxY + 42, blockWidth - 4, 12);
        }
        screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.fillText("LOADING", boxX + 12, boxY + 12);

        if (filledBlocks >= blocks) {
          screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
          screenContext.fillText("READY.", paddingX, boxY + boxHeight + lineHeight * 0.8);
        }
      }

      if (isMobile.current && tapStep.current < 2) {
        screenContext.fillStyle = "rgba(255, 255, 255, 0.7)";
        screenContext.font = "14px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.textAlign = "center";
        screenContext.textBaseline = "bottom";
        screenContext.fillText("Tap to continue", screenCanvas.width / 2, screenCanvas.height - 24);
      }

      screenContext.shadowBlur = 0;
      screenTexture.needsUpdate = true;
    };

    const renderMenuBar = (title: string) => {
      const menuBarHeight = 48;
      screenContext.fillStyle = SYS7_THEME.chrome;
      screenContext.fillRect(0, 0, screenCanvas.width, menuBarHeight);
      screenContext.strokeStyle = SYS7_THEME.chromeBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(0, 0, screenCanvas.width, menuBarHeight);

      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textBaseline = "middle";
      screenContext.textAlign = "left";
      screenContext.fillText(title, 32, menuBarHeight / 2 + 2);

      screenContext.font = "14px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillText("File   Edit   View", 180, menuBarHeight / 2 + 2);

      // Happy Mac icon
      screenContext.fillStyle = "#1b1b1b";
      screenContext.fillRect(120, 15, 18, 18);
      screenContext.fillStyle = "#f9f2df";
      screenContext.fillRect(122, 17, 14, 14);
      screenContext.fillStyle = "#1b1b1b";
      screenContext.fillRect(125, 20, 3, 3);
      screenContext.fillRect(130, 20, 3, 3);
      screenContext.fillRect(126, 27, 6, 2);

      screenContext.textAlign = "right";
      screenContext.font = "15px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillText("Team 7", screenCanvas.width - 24, menuBarHeight / 2 + 2);

      return menuBarHeight;
    };

    const renderWallpaper = () => {
      if (!screenContext) return;
      const grad = screenContext.createLinearGradient(0, 0, 0, screenCanvas.height);
      grad.addColorStop(0, SYS7_THEME.wallpaperTop);
      grad.addColorStop(1, SYS7_THEME.wallpaperBottom);
      screenContext.fillStyle = grad;
      screenContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      screenContext.strokeStyle = SYS7_THEME.wallpaperGrid;
      screenContext.lineWidth = 1;
      for (let x = 0; x < screenCanvas.width; x += 32) {
        screenContext.beginPath();
        screenContext.moveTo(x, 0);
        screenContext.lineTo(x, screenCanvas.height);
        screenContext.stroke();
      }
      for (let y = 0; y < screenCanvas.height; y += 24) {
        screenContext.beginPath();
        screenContext.moveTo(0, y);
        screenContext.lineTo(screenCanvas.width, y);
        screenContext.stroke();
      }
    };

    const drawDesktopIconGlyph = (key: DesktopIconKey, x: number, y: number, size: number) => {
      const pad = 8;
      const innerX = x + pad;
      const innerY = y + pad;
      const innerW = size - pad * 2;
      const innerH = size - pad * 2;

      if (key === "team") {
        screenContext.fillStyle = "#d8d2c6";
        screenContext.fillRect(innerX + 2, innerY + 4, innerW - 4, innerH - 8);
        screenContext.strokeStyle = "#7f7a70";
        screenContext.strokeRect(innerX + 2, innerY + 4, innerW - 4, innerH - 8);
        screenContext.fillStyle = "#7e7670";
        screenContext.beginPath();
        screenContext.arc(innerX + 14, innerY + 16, 4, 0, Math.PI * 2);
        screenContext.fill();
        screenContext.beginPath();
        screenContext.arc(innerX + 26, innerY + 18, 3, 0, Math.PI * 2);
        screenContext.fill();
        screenContext.fillRect(innerX + 10, innerY + 23, 9, 7);
        screenContext.fillRect(innerX + 23, innerY + 24, 7, 6);
        screenContext.fillRect(innerX + 22, innerY + 10, 11, 2);
        screenContext.fillRect(innerX + 22, innerY + 14, 11, 2);
      }

      if (key === "setup") {
        const centerX = innerX + innerW / 2;
        const centerY = innerY + innerH / 2;
        screenContext.fillStyle = "#7b756f";
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI / 4) * i;
          const toothX = centerX + Math.cos(angle) * 14;
          const toothY = centerY + Math.sin(angle) * 14;
          screenContext.fillRect(toothX - 2, toothY - 2, 4, 4);
        }
        screenContext.beginPath();
        screenContext.arc(centerX, centerY, 11, 0, Math.PI * 2);
        screenContext.fill();
        screenContext.fillStyle = "#d7d1c5";
        screenContext.beginPath();
        screenContext.arc(centerX, centerY, 4, 0, Math.PI * 2);
        screenContext.fill();
      }

      if (key === "writing") {
        screenContext.fillStyle = "#fcfbf7";
        screenContext.fillRect(innerX + 5, innerY + 2, innerW - 11, innerH - 4);
        screenContext.strokeStyle = "#7f7a70";
        screenContext.strokeRect(innerX + 5, innerY + 2, innerW - 11, innerH - 4);
        screenContext.fillStyle = "#ddd7cb";
        screenContext.beginPath();
        screenContext.moveTo(innerX + innerW - 6, innerY + 2);
        screenContext.lineTo(innerX + innerW - 2, innerY + 6);
        screenContext.lineTo(innerX + innerW - 6, innerY + 10);
        screenContext.fill();
        screenContext.fillStyle = "#8b857d";
        screenContext.fillRect(innerX + 9, innerY + 12, innerW - 20, 2);
        screenContext.fillRect(innerX + 9, innerY + 17, innerW - 20, 2);
        screenContext.fillRect(innerX + 9, innerY + 22, innerW - 16, 2);
        screenContext.fillStyle = "#6f8cb5";
        screenContext.fillRect(innerX + 18, innerY + 27, innerW - 24, 3);
      }
    };

    const renderDesktopScreen = (fade: number) => {
      if (!screenContext) return;
      screenContext.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
      renderWallpaper();

      const menuBarHeight = renderMenuBar("Capstone");

      const iconAreaTop = menuBarHeight + 52;
      const iconSpacingX = 240;
      const iconSpacingY = 180;
      const iconSize = 58;
      const labelOffset = 28;
      iconHitAreas.current = [];

      desktopIcons.forEach(({ key, label }, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = screenCanvas.width - 520 + col * iconSpacingX;
        const y = iconAreaTop + row * iconSpacingY;

        screenContext.fillStyle = SYS7_THEME.icon;
        screenContext.fillRect(x, y, iconSize, iconSize);
        screenContext.strokeStyle = SYS7_THEME.chromeBorder;
        screenContext.lineWidth = 2;
        screenContext.strokeRect(x, y, iconSize, iconSize);

        screenContext.fillStyle = "#f7f6f1";
        screenContext.fillRect(x + 6, y + 6, iconSize - 12, iconSize - 12);
        drawDesktopIconGlyph(key, x, y, iconSize);

        screenContext.fillStyle = SYS7_THEME.textOnWallpaper;
        screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.textAlign = "left";
        screenContext.textBaseline = "top";
        screenContext.shadowColor = "rgba(12, 22, 38, 0.55)";
        screenContext.shadowBlur = 4;
        screenContext.fillText(label, x, y + iconSize + labelOffset);
        screenContext.shadowBlur = 0;

        iconHitAreas.current.push({ label, x, y, width: iconSize, height: iconSize + 40 });
      });

      if (fade > 0) {
        screenContext.fillStyle = `rgba(0, 0, 0, ${fade})`;
        screenContext.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
      }

      screenTexture.needsUpdate = true;
    };

    const renderWindowFrame = (title: string) => {
      screenContext.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
      renderWallpaper();

      const menuBarHeight = renderMenuBar("Capstone");
      const headerHeight = 56;

      screenContext.fillStyle = SYS7_THEME.chrome;
      screenContext.fillRect(24, menuBarHeight + 24, screenCanvas.width - 48, headerHeight);
      screenContext.strokeStyle = SYS7_THEME.chromeBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(24, menuBarHeight + 24, screenCanvas.width - 48, headerHeight);

      screenContext.fillStyle = "#bbb8b1";
      screenContext.fillRect(32, menuBarHeight + 32, 28, 28);
      screenContext.strokeStyle = SYS7_THEME.chromeBorder;
      screenContext.strokeRect(32, menuBarHeight + 32, 28, 28);

      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textBaseline = "middle";
      screenContext.textAlign = "left";
      screenContext.fillText(title, 72, menuBarHeight + 24 + headerHeight / 2 + 2);

      return { menuBarHeight, contentTop: menuBarHeight + 24 + headerHeight + 16 };
    };

    const renderWritingWindow = () => {
      if (!screenContext) return;
      const frame = renderWindowFrame("Writing Notes");

      const sidebarWidth = 300;
      screenContext.fillStyle = "#d8d4cc";
      screenContext.fillRect(24, frame.contentTop, sidebarWidth, screenCanvas.height - frame.contentTop - 24);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(24, frame.contentTop, sidebarWidth, screenCanvas.height - frame.contentTop - 24);

      const contentWidth = screenCanvas.width - sidebarWidth - 64;
      const contentHeight = screenCanvas.height - frame.contentTop - 24;
      const contentLeft = 24 + sidebarWidth + 16;
      const contentTop = frame.contentTop;

      screenContext.fillStyle = "#fbfaf5";
      screenContext.fillRect(contentLeft, contentTop, contentWidth, contentHeight);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.strokeRect(contentLeft, contentTop, contentWidth, contentHeight);

      // lined paper effect
      screenContext.save();
      screenContext.beginPath();
      screenContext.rect(contentLeft, contentTop, contentWidth, contentHeight);
      screenContext.clip();
      screenContext.strokeStyle = "rgba(120, 150, 190, 0.18)";
      screenContext.lineWidth = 1;
      for (let y = contentTop + 48; y < contentTop + contentHeight - 20; y += 22) {
        screenContext.beginPath();
        screenContext.moveTo(contentLeft + 12, y);
        screenContext.lineTo(contentLeft + contentWidth - 12, y);
        screenContext.stroke();
      }
      screenContext.restore();

      const orderedNotes = [...notes].slice().reverse();
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      orderedNotes.forEach((note, index) => {
        const y = frame.contentTop + 24 + index * 82;
        screenContext.fillStyle = index === noteIndex.current ? "#b9b4ab" : "#cfcac2";
        screenContext.fillRect(32, y - 8, sidebarWidth - 16, 70);

        screenContext.fillStyle = SYS7_THEME.text;
        screenContext.textAlign = "left";
        screenContext.textBaseline = "top";
        screenContext.fillText(note.title, 44, y);
        screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.fillStyle = SYS7_THEME.textMuted;
        screenContext.fillText(note.date, 44, y + 32);
        screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      });

      const activeNote = orderedNotes[noteIndex.current] ?? orderedNotes[0];
      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillText(activeNote.title, contentLeft + 20, contentTop + 20);
      screenContext.font = "14px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillStyle = SYS7_THEME.textMuted;
      screenContext.fillText(activeNote.date, contentLeft + 20, contentTop + 44);
      screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillStyle = SYS7_THEME.textMuted;
      activeNote.body.forEach((line, index) => {
        screenContext.fillText(line, contentLeft + 20, contentTop + 80 + index * 26);
      });

      const fadeHeight = 70;
      screenContext.fillStyle = "rgba(243, 241, 234, 0.55)";
      screenContext.fillRect(contentLeft, screenCanvas.height - fadeHeight - 24, contentWidth, fadeHeight);

      screenTexture.needsUpdate = true;
    };

    const renderSetupWindow = () => {
      if (!screenContext) return;
      const frame = renderWindowFrame("Setup");

      screenContext.fillStyle = SYS7_THEME.panel;
      screenContext.fillRect(24, frame.contentTop, screenCanvas.width - 48, screenCanvas.height - frame.contentTop - 24);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(24, frame.contentTop, screenCanvas.width - 48, screenCanvas.height - frame.contentTop - 24);

      const panelX = 48;
      const panelY = frame.contentTop + 22;
      const panelW = screenCanvas.width - 96;
      const sectionGap = 20;

      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textAlign = "left";
      screenContext.textBaseline = "top";
      screenContext.fillText("Hybrid Setup Overview", panelX, panelY);
      screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillStyle = SYS7_THEME.textMuted;
      screenContext.fillText("Signal flow + stacks", panelX, panelY + 18);

      const pipelineY = panelY + 42;
      const nodeWidth = 132;
      const nodeHeight = 56;
      const nodeGap = 46;
      const nodes = ["Camera", "Frame Grabber", "4F Optics", "CNN", "Overlay"];
      const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * nodeGap;
      const startX = panelX + Math.max(0, (panelW - totalWidth) / 2);

      nodes.forEach((node, index) => {
        const x = startX + index * (nodeWidth + nodeGap);
        screenContext.fillStyle = "#d8d3c9";
        screenContext.fillRect(x, pipelineY, nodeWidth, nodeHeight);
        screenContext.strokeStyle = SYS7_THEME.panelBorder;
        screenContext.lineWidth = 2;
        screenContext.strokeRect(x, pipelineY, nodeWidth, nodeHeight);

        screenContext.fillStyle = SYS7_THEME.text;
        screenContext.font = "15px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.textAlign = "center";
        screenContext.textBaseline = "middle";
        screenContext.fillText(node, x + nodeWidth / 2, pipelineY + nodeHeight / 2);

        if (index < nodes.length - 1) {
          const arrowY = pipelineY + nodeHeight / 2;
          const arrowStart = x + nodeWidth;
          const arrowEnd = x + nodeWidth + nodeGap - 8;
          screenContext.strokeStyle = "#7a7772";
          screenContext.lineWidth = 2;
          screenContext.beginPath();
          screenContext.moveTo(arrowStart, arrowY);
          screenContext.lineTo(arrowEnd, arrowY);
          screenContext.stroke();
          screenContext.beginPath();
          screenContext.moveTo(arrowEnd, arrowY);
          screenContext.lineTo(arrowEnd - 7, arrowY - 5);
          screenContext.lineTo(arrowEnd - 7, arrowY + 5);
          screenContext.closePath();
          screenContext.fillStyle = "#7a7772";
          screenContext.fill();
        }
      });

      const boxTop = pipelineY + nodeHeight + 30;
      const colGap = 18;
      const boxW = Math.floor((panelW - colGap) / 2);
      const leftX = panelX;
      const rightX = panelX + boxW + colGap;
      const boxH = 210;

      const drawInfoBox = (x: number, y: number, w: number, h: number, title: string, lines: string[]) => {
        screenContext.fillStyle = "#ebe8e0";
        screenContext.fillRect(x, y, w, h);
        screenContext.strokeStyle = SYS7_THEME.panelBorder;
        screenContext.lineWidth = 2;
        screenContext.strokeRect(x, y, w, h);

        screenContext.fillStyle = SYS7_THEME.text;
        screenContext.font = "15px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.textAlign = "left";
        screenContext.textBaseline = "top";
        screenContext.fillText(title, x + 12, y + 10);

        screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        lines.forEach((line, i) => {
          const lineY = y + 38 + i * 24;
          screenContext.fillStyle = SYS7_THEME.text;
          screenContext.fillText(line, x + 34, lineY);
          screenContext.fillStyle = "#7a7772";
          screenContext.beginPath();
          screenContext.arc(x + 18, lineY + 6, 3, 0, Math.PI * 2);
          screenContext.fill();
        });
      };

      drawInfoBox(leftX, boxTop, boxW, boxH, "Hardware Stack", [
        "Surgical camera (60 FPS)",
        "Frame grabber IO",
        "4F lens pair + DMD",
        "CMOS capture sensor",
        "Existing OR display path",
      ]);

      drawInfoBox(rightX, boxTop, boxW, boxH, "Software Stack", [
        "TorchOptics simulator",
        "Kernel constraint mapping",
        "Segmentation CNN (unchanged)",
        "Overlay compositor",
        "Logging + benchmark scripts",
      ]);

      const checklistY = boxTop + boxH + sectionGap;
      const checklistH = 110;
      screenContext.fillStyle = "#ebe8e0";
      screenContext.fillRect(panelX, checklistY, panelW, checklistH);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(panelX, checklistY, panelW, checklistH);

      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "15px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textAlign = "left";
      screenContext.textBaseline = "top";
      screenContext.fillText("Validation Checklist", panelX + 12, checklistY + 10);
      screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillText("[x] Feature detail survives optical pass", panelX + 12, checklistY + 38);
      screenContext.fillText("[x] No retraining required downstream", panelX + 12, checklistY + 62);
      screenContext.fillText("[ ] Hardware build + clinical output", panelX + 12, checklistY + 86);

      screenTexture.needsUpdate = true;
    };

    const renderTeamWindow = () => {
      if (!screenContext) return;
      const frame = renderWindowFrame("Team + Contact");

      const panelX = 24;
      const panelY = frame.contentTop;
      const panelW = screenCanvas.width - 48;
      const panelH = screenCanvas.height - frame.contentTop - 24;

      screenContext.fillStyle = SYS7_THEME.panel;
      screenContext.fillRect(panelX, panelY, panelW, panelH);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.lineWidth = 2;
      screenContext.strokeRect(panelX, panelY, panelW, panelH);

      const leftWidth = Math.min(380, panelW * 0.38);
      const leftInnerX = panelX + 20;
      const leftInnerY = panelY + 20;
      const leftInnerW = leftWidth - 40;
      const leftInnerH = Math.min(panelH - 60, 340);

      screenContext.fillStyle = "#c2bcaf";
      screenContext.fillRect(leftInnerX, leftInnerY, leftInnerW, leftInnerH);
      screenContext.strokeStyle = "#7f7a70";
      screenContext.strokeRect(leftInnerX, leftInnerY, leftInnerW, leftInnerH);

      const photoPadding = 18;
      const photoX = leftInnerX + photoPadding;
      const photoY = leftInnerY + photoPadding;
      const photoW = leftInnerW - photoPadding * 2;
      const photoH = leftInnerH - 70;
      screenContext.fillStyle = "#a0998b";
      screenContext.fillRect(photoX, photoY, photoW, photoH);
      screenContext.strokeStyle = "#6c665c";
      screenContext.strokeRect(photoX, photoY, photoW, photoH);

      const cachedGroupPhoto = groupPhotoCache.current;
      if (cachedGroupPhoto && cachedGroupPhoto.complete && cachedGroupPhoto.naturalWidth > 0 && cachedGroupPhoto.naturalHeight > 0) {
        const imageAspect = cachedGroupPhoto.naturalWidth / cachedGroupPhoto.naturalHeight;
        const frameAspect = photoW / photoH;
        let sx = 0;
        let sy = 0;
        let sWidth = cachedGroupPhoto.naturalWidth;
        let sHeight = cachedGroupPhoto.naturalHeight;

        if (imageAspect > frameAspect) {
          sWidth = Math.round(cachedGroupPhoto.naturalHeight * frameAspect);
          sx = Math.round((cachedGroupPhoto.naturalWidth - sWidth) / 2);
        } else if (imageAspect < frameAspect) {
          sHeight = Math.round(cachedGroupPhoto.naturalWidth / frameAspect);
          sy = Math.round((cachedGroupPhoto.naturalHeight - sHeight) / 2);
        }

        screenContext.drawImage(cachedGroupPhoto, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);
      } else {
        screenContext.strokeStyle = "rgba(255,255,255,0.1)";
        for (let y = photoY; y < photoY + photoH; y += 16) {
          screenContext.beginPath();
          screenContext.moveTo(photoX, y);
          screenContext.lineTo(photoX + photoW, y);
          screenContext.stroke();
        }
        for (let x = photoX; x < photoX + photoW; x += 20) {
          screenContext.beginPath();
          screenContext.moveTo(x, photoY);
          screenContext.lineTo(x, photoY + photoH);
          screenContext.stroke();
        }
      }

      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.textAlign = "left";
      screenContext.fillText("Team 7 — Optical Neural Network Lab", leftInnerX + 4, leftInnerY + leftInnerH - 32);
      screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillStyle = SYS7_THEME.textMuted;
      screenContext.fillText("Team photo", leftInnerX + 4, leftInnerY + leftInnerH - 14);

      const directoryX = panelX + leftWidth + 24;
      const directoryY = panelY + 24;
      const directoryW = panelW - leftWidth - 48;
      const directoryH = panelH - 48;

      screenContext.fillStyle = "#ece8df";
      screenContext.fillRect(directoryX, directoryY, directoryW, directoryH);
      screenContext.strokeStyle = SYS7_THEME.panelBorder;
      screenContext.strokeRect(directoryX, directoryY, directoryW, directoryH);

      const headerX = directoryX + 18;
      const headerY = directoryY + 16;
      const headerW = directoryW - 36;
      const headerH = 58;
      screenContext.fillStyle = "#cbc6bb";
      screenContext.fillRect(headerX, headerY, headerW, headerH);
      screenContext.strokeStyle = "#8c877f";
      screenContext.strokeRect(headerX, headerY, headerW, headerH);
      screenContext.fillStyle = SYS7_THEME.text;
      screenContext.font = "18px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillText("Directory", headerX + 14, headerY + 24);
      screenContext.font = "12px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
      screenContext.fillStyle = "#464138";
      screenContext.fillText("Contact us!", headerX + 14, headerY + 40);

      const tableTop = headerY + headerH + 20;
      const tableBottom = directoryY + directoryH - 18;
      const tableHeight = tableBottom - tableTop;
      const rowGap = 10;
      const rowHeight = Math.min(96, (tableHeight - rowGap * (teamMembers.length - 1)) / teamMembers.length);

      const drawWrapped = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(" ");
        let line = "";
        let cursorY = y;
        words.forEach((word) => {
          const testLine = line ? `${line} ${word}` : word;
          if (screenContext.measureText(testLine).width > maxWidth && line) {
            screenContext.fillText(line, x, cursorY);
            line = word;
            cursorY += lineHeight;
          } else {
            line = testLine;
          }
        });
        if (line) {
          screenContext.fillText(line, x, cursorY);
          cursorY += lineHeight;
        }
        return cursorY;
      };

      contactHitAreas.current = [];
      teamMembers.forEach((member, index) => {
        const rowY = tableTop + index * (rowHeight + rowGap);
        const rowX = directoryX + 20;
        const rowW = directoryW - 40;

        screenContext.fillStyle = index % 2 === 0 ? "#f8f5ef" : "#e8e4db";
        screenContext.fillRect(rowX, rowY, rowW, rowHeight);
        screenContext.strokeStyle = "#b6b0a7";
        screenContext.strokeRect(rowX, rowY, rowW, rowHeight);

        // headshot frame
        const portraitSize = Math.min(66, rowHeight - 22);
        const portraitX = rowX + 14;
        const portraitY = rowY + 12;
        screenContext.fillStyle = "#b0aa9f";
        screenContext.fillRect(portraitX, portraitY, portraitSize, portraitSize);

        const cachedHeadshot = headshotCache.current[member.name];
        if (
          cachedHeadshot &&
          cachedHeadshot.complete &&
          cachedHeadshot.naturalWidth > 0 &&
          cachedHeadshot.naturalHeight > 0
        ) {
          let sx = 0;
          let sy = 0;
          let sWidth = cachedHeadshot.naturalWidth;
          let sHeight = cachedHeadshot.naturalHeight;

          if (sWidth > sHeight) {
            const delta = sWidth - sHeight;
            sx = delta / 2;
            sWidth = sHeight;
          } else if (sHeight > sWidth) {
            const delta = sHeight - sWidth;
            sy = delta / 2;
            sHeight = sWidth;
          }

          screenContext.drawImage(
            cachedHeadshot,
            sx,
            sy,
            sWidth,
            sHeight,
            portraitX,
            portraitY,
            portraitSize,
            portraitSize,
          );
        } else {
          screenContext.fillStyle = "#a79f92";
          screenContext.fillRect(portraitX + 6, portraitY + 6, portraitSize - 12, portraitSize - 12);
        }
        screenContext.strokeStyle = "#8d877e";
        screenContext.strokeRect(portraitX, portraitY, portraitSize, portraitSize);

        const textX = rowX + portraitSize + 30;
        const textWidth = rowW - portraitSize - 170;

        screenContext.fillStyle = SYS7_THEME.text;
        screenContext.font = "16px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.fillText(member.name, textX, rowY + 20);
        screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.fillStyle = SYS7_THEME.textMuted;
        const afterRoleY = drawWrapped(member.role, textX, rowY + 38, textWidth, 16);

        if (member.blurb) {
          screenContext.font = "12px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
          screenContext.fillStyle = SYS7_THEME.textMuted;
          drawWrapped(member.blurb, textX, afterRoleY, textWidth, 15);
        }

        const contactX = rowX + rowW - 18;
        const emailY = rowY + rowHeight - 26;
        screenContext.font = "13px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.textAlign = "right";
        screenContext.fillStyle = SYS7_THEME.link;
        screenContext.fillText(member.email, contactX, emailY);
        const emailWidth = screenContext.measureText(member.email).width;
        const linkedinLabel = "LinkedIn ->";
        const linkedinY = rowY + rowHeight - 12;
        screenContext.font = "12px Geneva, 'IBM Plex Mono', 'Menlo', monospace";
        screenContext.fillText(linkedinLabel, contactX, linkedinY);
        const linkedinWidth = screenContext.measureText(linkedinLabel).width;
        screenContext.textAlign = "left";
        contactHitAreas.current.push({
          type: "email",
          target: member.email,
          x: contactX - emailWidth,
          y: emailY - 16,
          width: emailWidth,
          height: 18,
        });
        contactHitAreas.current.push({
          type: "linkedin",
          target: member.linkedin,
          x: contactX - linkedinWidth,
          y: linkedinY - 16,
          width: linkedinWidth,
          height: 18,
        });
      });

      screenTexture.needsUpdate = true;
    };

    renderBootScreen(1);

    scene.add(deviceGroup);




    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new EffectPass(
        camera,
        new BloomEffect({ intensity: 0.85, luminanceThreshold: 0.1, luminanceSmoothing: 0.9 }),
        new VignetteEffect({ darkness: 0.7, offset: 0.25 }),
        new NoiseEffect({ premultiply: true })
      )
    );

    const startPosition = new THREE.Vector3(5.2, 6.2, 13.5);
    const endPosition = new THREE.Vector3(DEVICE_OFFSET_X, 0.36, 5.9);
    const mobilePosition = new THREE.Vector3(DEVICE_OFFSET_X, 0.2, 7.2);
    const startTarget = new THREE.Vector3(DEVICE_OFFSET_X, 0.35, 0.6);
    const endTarget = new THREE.Vector3(DEVICE_OFFSET_X, 0.35, 1.05);
    const mobileTarget = new THREE.Vector3(DEVICE_OFFSET_X, 0.2, 1.05);

    const updateScroll = () => {
      const totalScroll = Math.max(1, window.innerHeight * (SCROLL_MULTIPLIER - 1));
      const zoomScroll = totalScroll * ZOOM_RATIO;
      const rawScroll = window.scrollY;
      scrollProgress.current = THREE.MathUtils.clamp(rawScroll / zoomScroll, 0, 1);
      contentProgress.current = THREE.MathUtils.clamp((rawScroll - zoomScroll) / (totalScroll - zoomScroll), 0, 1);
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      isMobile.current = innerWidth <= 768;
      camera.fov = isMobile.current ? 48 : 35;
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

      if (isMobile.current) {
        camera.position.copy(mobilePosition);
        camera.lookAt(mobileTarget);
      } else {
        camera.position.copy(startPosition).lerp(endPosition, progress);
        const target = startTarget.clone().lerp(endTarget, progress);
        camera.lookAt(target);
      }

      if (isMobile.current) {
        const steps = [1, preBootLines.length + 1, preBootLines.length + 2];
        const revealLines = steps[Math.min(tapStep.current, steps.length - 1)];
        renderBootScreen(revealLines);

        if (tapStep.current >= 2) {
          if (!desktopFadeStart.current) {
            desktopFadeStart.current = performance.now();
          }
          const fadeElapsed = performance.now() - desktopFadeStart.current;
          const fadeProgress = THREE.MathUtils.clamp(fadeElapsed / DESKTOP_FADE_MS, 0, 1);
          renderDesktopScreen(1 - fadeProgress);
          if (fadeProgress >= 1) {
            appState.current = "desktop";
          }
        }
      } else {
        const revealProgress = progress < 1 ? 0 : contentProgress.current;
        maxRevealProgress.current = Math.max(maxRevealProgress.current, revealProgress);
        const stableReveal = maxRevealProgress.current;
        const revealLines = 1 + stableReveal * (preBootLines.length + 2);

        if (appState.current === "boot") {
          renderBootScreen(revealLines);
        }

        const loadingComplete = stableReveal >= 1;
        if (loadingComplete && bootCompleteTime.current === null) {
          bootCompleteTime.current = performance.now();
        }

        if (loadingComplete && bootCompleteTime.current !== null) {
          const elapsed = performance.now() - bootCompleteTime.current;
          if (elapsed >= DESKTOP_PAUSE_MS) {
            if (!desktopFadeStart.current) {
              desktopFadeStart.current = performance.now();
            }
            const fadeElapsed = performance.now() - desktopFadeStart.current;
            const fadeProgress = THREE.MathUtils.clamp(fadeElapsed / DESKTOP_FADE_MS, 0, 1);
            if (fadeProgress < 1) {
              renderDesktopScreen(1 - fadeProgress);
            } else {
              appState.current = appState.current === "boot" ? "desktop" : appState.current;
            }
          }
        }

      if (appState.current === "desktop" || (isMobile.current && tapStep.current >= 2)) {
        renderDesktopScreen(0);
      }
      if (appState.current === "team") {
        renderTeamWindow();
      }
      if (appState.current === "setup") {
        renderSetupWindow();
      }
      if (appState.current === "writing") {
        renderWritingWindow();
      }
      }

      composer.render();
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    updateScroll();
    animate();

    const handlePointer = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastTapTime.current < 200) return;
      lastTapTime.current = now;

      const screenPoint = getScreenCoords(event);
      if (!screenPoint) return;

      if (isMobile.current && appState.current === "boot" && tapStep.current < 2) {
        tapStep.current = Math.min(tapStep.current + 1, 2);
        if (tapStep.current < 2) {
          desktopFadeStart.current = null;
        }
        return;
      }

      const fadeReady = desktopFadeStart.current
        ? performance.now() - desktopFadeStart.current >= DESKTOP_FADE_MS
        : appState.current === "desktop";
      const canClickDesktop = appState.current === "desktop" || (isMobile.current && tapStep.current >= 2 && fadeReady);
      if (!canClickDesktop) return;

      const { x, y } = screenPoint;

      const hit = iconHitAreas.current.find(
        (area) => x >= area.x - 10 && x <= area.x + area.width + 10 && y >= area.y - 10 && y <= area.y + area.height + 10
      );
      if (hit) {
        const target = hit.label.toLowerCase();
        if (target === "team" || target === "setup" || target === "writing") {
          appState.current = target as typeof appState.current;
        }
      }
    };

    const handleNoteClick = (event: PointerEvent) => {
      if (appState.current !== "writing") return;
      const screenPoint = getScreenCoords(event);
      if (!screenPoint) return;
      const { x, y } = screenPoint;
      const menuBarHeight = 48;
      const headerHeight = 56;
      const contentTop = menuBarHeight + 24 + headerHeight + 16;
      const sidebarWidth = 300;

      if (x < 24 || x > 24 + sidebarWidth) return;
      const index = Math.floor((y - contentTop - 24) / 82);
      if (index >= 0 && index < notes.length) {
        noteIndex.current = index;
      }
    };

    const handleMenuClick = (event: PointerEvent) => {
      if (appState.current === "boot") return;
      const screenPoint = getScreenCoords(event);
      if (!screenPoint) return;
      const { x, y } = screenPoint;
      if (y <= 48 && x <= 180) {
        appState.current = "desktop";
      }

      if (appState.current === "team") {
        const hit = contactHitAreas.current.find(
          (area) => x >= area.x && x <= area.x + area.width && y >= area.y - 4 && y <= area.y + area.height
        );
        if (hit) {
          if (hit.type === "email") {
            window.location.href = `mailto:${hit.target}`;
          } else if (hit.type === "linkedin") {
            window.open(hit.target, "_blank", "noopener,noreferrer");
          }
        }
      }

      if (appState.current !== "desktop") {
        const menuBarHeight = 48;
        const headerHeight = 56;
        const closeX = 32;
        const closeY = menuBarHeight + 32;
        if (x >= closeX && x <= closeX + 28 && y >= closeY && y <= closeY + 28) {
          appState.current = "desktop";
        }
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });
    canvas.addEventListener("pointerdown", handlePointer);
    canvas.addEventListener("pointerdown", handleNoteClick);
    canvas.addEventListener("pointerdown", handleMenuClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScroll);
      canvas.removeEventListener("pointerdown", handlePointer);
      canvas.removeEventListener("pointerdown", handleNoteClick);
      canvas.removeEventListener("pointerdown", handleMenuClick);
      window.cancelAnimationFrame(animationFrame);
      bodyMaterial.dispose();
      bezelMaterial.dispose();
      screenInsetMaterial.dispose();
      screenOverlayMaterial.dispose();
      screenTexture.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  if (isMobileLayout) {
    const mobileWallpaper =
      "linear-gradient(180deg, #3a5f89 0%, #1f3d63 100%), repeating-linear-gradient(0deg, rgba(220,235,255,0.16) 0px, rgba(220,235,255,0.16) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(220,235,255,0.14) 0px, rgba(220,235,255,0.14) 1px, transparent 1px, transparent 32px)";

    const systemIconStyle: React.CSSProperties = {
      width: "54px",
      height: "54px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: SYS7_THEME.icon,
      borderRadius: "8px",
      border: `2px solid ${SYS7_THEME.chromeBorder}`,
      boxShadow: "inset 0 0 0 2px #f5f4f0",
    };

    const renderMobileIconGlyph = (key: DesktopIconKey) => {
      if (key === "team") {
        return (
          <svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true">
            <rect x="9" y="11" width="36" height="32" fill="#d8d2c6" stroke="#7f7a70" strokeWidth="2" />
            <circle cx="21" cy="23" r="4" fill="#7e7670" />
            <circle cx="31" cy="24" r="3" fill="#7e7670" />
            <rect x="17" y="28" width="9" height="7" fill="#7e7670" />
            <rect x="28" y="29" width="7" height="6" fill="#7e7670" />
            <rect x="29" y="17" width="11" height="2" fill="#7e7670" />
            <rect x="29" y="21" width="11" height="2" fill="#7e7670" />
          </svg>
        );
      }
      if (key === "setup") {
        return (
          <svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true">
            <rect x="24" y="8" width="6" height="6" fill="#7b756f" />
            <rect x="24" y="40" width="6" height="6" fill="#7b756f" />
            <rect x="8" y="24" width="6" height="6" fill="#7b756f" />
            <rect x="40" y="24" width="6" height="6" fill="#7b756f" />
            <rect x="13" y="13" width="5" height="5" fill="#7b756f" />
            <rect x="36" y="13" width="5" height="5" fill="#7b756f" />
            <rect x="13" y="36" width="5" height="5" fill="#7b756f" />
            <rect x="36" y="36" width="5" height="5" fill="#7b756f" />
            <circle cx="27" cy="27" r="10" fill="#7b756f" />
            <circle cx="27" cy="27" r="4" fill="#d7d1c5" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true">
          <rect x="12" y="9" width="30" height="36" fill="#fcfbf7" stroke="#7f7a70" strokeWidth="2" />
          <polygon points="42,9 47,14 42,19" fill="#ddd7cb" />
          <rect x="16" y="21" width="20" height="2" fill="#8b857d" />
          <rect x="16" y="26" width="20" height="2" fill="#8b857d" />
          <rect x="16" y="31" width="16" height="2" fill="#8b857d" />
          <rect x="22" y="36" width="14" height="3" fill="#6f8cb5" />
        </svg>
      );
    };

    const menuBar = (
      <div
        style={{
          height: "48px",
          background: SYS7_THEME.chrome,
          borderBottom: `2px solid ${SYS7_THEME.chromeBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          fontSize: "14px",
          color: SYS7_THEME.text,
        }}
      >
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "18px", height: "18px", borderRadius: "4px", background: SYS7_THEME.text }} />
          <div>File</div>
          <div>Edit</div>
          <div>View</div>
        </div>
        <div style={{ fontSize: "12px" }}>Team 7</div>
      </div>
    );

    const desktopView = (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: mobileWallpaper,
          backgroundBlendMode: "normal",
          color: SYS7_THEME.textOnWallpaper,
        }}
      >
        {menuBar}
        <div style={{ padding: "18px" }}>
          <div style={{ fontSize: "18px", marginBottom: "12px", color: SYS7_THEME.textOnWallpaper }}>Capstone</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
            {desktopIcons.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMobileWindow(item.key as typeof mobileWindow)}
                style={{
                  background: "transparent",
                  border: "none",
                  textAlign: "center",
                  fontFamily: "Geneva, 'IBM Plex Mono', 'Menlo', monospace",
                  color: SYS7_THEME.textOnWallpaper,
                }}
              >
                <div style={{ margin: "0 auto", ...systemIconStyle }}>{renderMobileIconGlyph(item.key)}</div>
                <div
                  style={{
                    marginTop: "10px",
                    background: "rgba(247, 248, 252, 0.95)",
                    display: "inline-block",
                    padding: "2px 6px",
                    border: `1px solid ${SYS7_THEME.panelBorder}`,
                    fontSize: "12px",
                    color: SYS7_THEME.text,
                  }}
                >
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    const windowFrame = (title: string, content: React.ReactNode) => (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: mobileWallpaper,
          backgroundBlendMode: "normal",
          color: SYS7_THEME.text,
        }}
      >
        {menuBar}
        <div
          style={{
            margin: "18px",
            background: SYS7_THEME.panel,
            border: `2px solid ${SYS7_THEME.chromeBorder}`,
            boxShadow: "4px 4px 0 rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: SYS7_THEME.chrome,
              borderBottom: `2px solid ${SYS7_THEME.chromeBorder}`,
              fontSize: "14px",
              color: SYS7_THEME.text,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileWindow("desktop")}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                border: `2px solid ${SYS7_THEME.chromeBorder}`,
                background: "#bfbcb6",
              }}
            />
            <div style={{ flex: 1, textAlign: "center" }}>{title}</div>
            <div style={{ width: "20px" }} />
          </div>
          <div style={{ padding: "16px", fontSize: "14px", color: SYS7_THEME.text }}>{content}</div>
        </div>
      </div>
    );

    const teamContent = (
      <div style={{ display: "grid", gap: "12px" }}>
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${SYS7_THEME.panelBorder}`,
            padding: "10px",
            color: SYS7_THEME.text,
          }}
        >
          <Image
            src={groupPhoto}
            alt="Capstone Team 7 group photo"
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: "6px",
              border: `1px solid ${SYS7_THEME.panelBorder}`,
              display: "block",
            }}
            sizes="(max-width: 768px) 100vw, 720px"
            priority
          />
        </div>
        {teamMembers.map((member) => (
          <div
            key={member.name}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              background: "#ffffff",
              border: `1px solid ${SYS7_THEME.panelBorder}`,
              padding: "10px",
              color: SYS7_THEME.text,
            }}
          >
            <Image
              src={member.headshot}
              alt={`Headshot of ${member.name}`}
              width={56}
              height={56}
              style={{
                width: "56px",
                height: "56px",
                objectFit: "cover",
                borderRadius: "6px",
                border: `1px solid ${SYS7_THEME.panelBorder}`,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: "14px" }}>{member.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>{member.role}</div>
              {member.blurb && <div style={{ fontSize: "11px", opacity: 0.7 }}>{member.blurb}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                <a href={`mailto:${member.email}`} style={{ color: SYS7_THEME.link, fontSize: "12px", textDecoration: "none" }}>
                  {member.email}
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: SYS7_THEME.link, fontSize: "12px", textDecoration: "none" }}
                >
                  LinkedIn -&gt;
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    const setupContent = (
      <div style={{ fontSize: "13px", lineHeight: 1.6, color: SYS7_THEME.text }}>
        <div style={{ marginBottom: "10px", fontSize: "14px" }}>Pipeline</div>
        <div>Camera -&gt; Frame Grabber -&gt; 4F Optics -&gt; CNN -&gt; Overlay</div>
        <div style={{ marginTop: "12px", fontSize: "14px" }}>Hardware</div>
        <div>- Lens pair + DMD + CMOS sensor</div>
        <div>- Existing OR monitor path</div>
        <div style={{ marginTop: "12px", fontSize: "14px" }}>Software</div>
        <div>- TorchOptics + kernel constraints</div>
        <div>- Segmentation CNN unchanged</div>
        <div style={{ marginTop: "12px", opacity: 0.75 }}>
          Status: simulation validated, hardware build pending.
        </div>
      </div>
    );

    const writingContent = (
      <div style={{ display: "grid", gap: "12px" }}>
        {[...notes].slice().reverse().map((note) => (
          <div
            key={note.title}
            style={{ background: "#ffffff", border: `1px solid ${SYS7_THEME.panelBorder}`, padding: "10px", color: SYS7_THEME.text }}
          >
            <div style={{ fontSize: "14px" }}>{note.title}</div>
            <div style={{ fontSize: "11px", opacity: 0.7 }}>{note.date}</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>{note.body.join("\n")}</div>
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ fontFamily: "Geneva, 'IBM Plex Mono', 'Menlo', monospace" }}>
        {mobileWindow === "desktop" && desktopView}
        {mobileWindow === "team" && windowFrame("Team", teamContent)}
        {mobileWindow === "setup" && windowFrame("Setup", setupContent)}
        {mobileWindow === "writing" && windowFrame("Writing", writingContent)}
      </div>
    );
  }

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

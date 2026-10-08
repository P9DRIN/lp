"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Field of frosted tiles seen at an isometric angle. The grid sits on the XZ
 * plane and the group is rotated 45° around Y, so rows read as diagonals.
 *
 * One tile is blue by default. Hovering any other tile hands the blue state
 * over to it — only ever one at a time. Leaving the canvas restores the
 * default tile.
 */

const GRID = 13;
const GAP = 1.085;
const CENTER = (GRID - 1) / 2;

const TILE_SIZE = 1;
const TILE_HEIGHT = 0.12;
const TILE_RADIUS = 0.19;
/** Thin fillet on the top and bottom edges — the only rounding in Y. */
const TILE_BEVEL = 0.022;

/** The default blue tile is the middle of the grid, so offsetting the whole
 *  group is enough to place it in the composition. */
const DEFAULT_INDEX = CENTER * GRID + CENTER;

const LIFT = 0.3;
/** Orthogonal neighbours pick up a fraction of the lift and tint. */
const NEIGHBOUR_WEIGHT = 0.07;

/** A long lens keeps the grid near-isometric, like the reference render. */
const CAMERA_FOV = 20;
const CAMERA_ELEVATION = THREE.MathUtils.degToRad(37);
const FOG_COLOR = 0xdfe5ee;

const COLOR_IDLE = new THREE.Color("#ffffff");
const COLOR_ACTIVE = new THREE.Color("#2159c8");
const EMISSIVE_IDLE = new THREE.Color("#000000");
const EMISSIVE_ACTIVE = new THREE.Color("#1f66e0");

/** Shown when WebGL is unavailable, so the hero still has a light backdrop. */
const FALLBACK_BACKGROUND =
  "radial-gradient(120% 100% at 68% 40%, #f8fafc 0%, #eef1f7 45%, #e2e7ef 100%)";

/**
 * Soft studio falloff: bright toward the upper left, cooling to the edges.
 * The floor uses a darker version of the same ramp so the white tiles read
 * against it — that separation is what makes the grid legible at all.
 */
function createRampTexture(inner: string, mid: string, outer: string) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, size, size);

  const gradient = ctx.createRadialGradient(
    size * 0.32,
    size * 0.3,
    0,
    size * 0.32,
    size * 0.3,
    size * 0.8
  );
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.45, mid);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Blue halo painted at the base of the active tile. Two of these are stacked —
 * a tight hot core and a wide soft spill — which reproduces the glow of the
 * reference render without a bloom pass. A real bloom pass is unusable here:
 * the backdrop is near-white, so it crosses any threshold and hazes the frame.
 */
function createGlowTexture(stops: [number, string][]) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Dark studio box with a single bright softbox. A bright environment (like the
 * stock RoomEnvironment) reflects across the whole top face of the glossy tile
 * and turns the blue into washed-out lavender; a dark one keeps the blue deep
 * and leaves a single crisp highlight on the corner, as in the reference.
 */
function createStudioEnvironment() {
  const env = new THREE.Scene();

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, 30),
    new THREE.MeshBasicMaterial({ color: 0x556072, side: THREE.BackSide })
  );
  env.add(room);

  const softbox = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  softbox.position.set(3, 10, 5);
  softbox.lookAt(0, 0, 0);
  env.add(softbox);

  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 7),
    new THREE.MeshBasicMaterial({ color: 0x8fb2e8 })
  );
  fill.position.set(-9, 5, -7);
  fill.lookAt(0, 0, 0);
  env.add(fill);

  return env;
}

function disposeEnvironment(env: THREE.Scene) {
  env.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
}

/**
 * Flat slab with a large corner radius in plan and a thin bevel on the edges.
 * `RoundedBoxGeometry` can't express that: it clamps its radius to half the
 * smallest dimension, so a slab this thin comes out as a pillow and the curved
 * top smears a specular sweep over the whole face.
 */
function createTileGeometry() {
  const half = TILE_SIZE / 2;
  const r = TILE_RADIUS;

  const shape = new THREE.Shape();
  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: TILE_HEIGHT - TILE_BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: TILE_BEVEL,
    bevelSize: TILE_BEVEL,
    bevelSegments: 3,
    curveSegments: 10,
    steps: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

type Tile = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  col: number;
  row: number;
  /** Animated 0..1 blend between the idle and blue state. */
  weight: number;
  target: number;
};

export function TileGrid({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      container.style.background = FALLBACK_BACKGROUND;
      return () => {
        container.style.background = "";
      };
    }

    // Bloom plus a physical material is the expensive part — cap the ratio.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    // Linear only. Both ACES and Khronos Neutral desaturate bright saturated
    // colours by design, which turns the blue tile into washed-out lavender.
    // The lights below are dialled so nothing clips instead.
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const backdropTexture = createRampTexture("#f8fafc", "#eceff4", "#d3dae4");
    if (backdropTexture) scene.background = backdropTexture;
    scene.fog = new THREE.Fog(FOG_COLOR, 7, 17);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 90);

    // Image-based lighting is what gives the tiles their soft studio sheen and
    // the blue tile its enamel gradient; direct lights alone read as plastic.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentScene = createStudioEnvironment();
    const environment = pmrem.fromScene(environmentScene, 0.02).texture;
    disposeEnvironment(environmentScene);
    scene.environment = environment;
    scene.environmentIntensity = 0.85;

    const group = new THREE.Group();
    group.rotation.y = Math.PI / 4;
    scene.add(group);

    // Continuous floor the tiles are set into — the gaps show this surface.
    const floorTexture = createRampTexture("#f7f9fc", "#eef1f6", "#dbe1ea");
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.95,
        metalness: 0,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -TILE_HEIGHT / 2 - 0.002;
    group.add(floor);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(4, 7.5, 5.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xcfe0ff, 0.5);
    rimLight.position.set(-5, 4.5, -6);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc4cedd, 0.5));

    // Fill from the camera side keeps the bevels of the white tiles bright.
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.44);
    fillLight.position.set(0, 3, 9);
    scene.add(fillLight);

    // Sits at floor level so it spills onto the neighbours instead of pooling
    // on the top face of the tile it belongs to.
    const glowLight = new THREE.PointLight(0x3b82f6, 0, 2.6, 2);
    scene.add(glowLight);

    // One geometry shared by every tile; materials are per-tile because each
    // one animates its own colour.
    const geometry = createTileGeometry();

    const tiles: Tile[] = [];
    const meshes: THREE.Object3D[] = [];

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const material = new THREE.MeshPhysicalMaterial({
          color: COLOR_IDLE.clone(),
          emissive: EMISSIVE_IDLE.clone(),
          emissiveIntensity: 0,
          roughness: 0.34,
          metalness: 0,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.7,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((col - CENTER) * GAP, 0, (row - CENTER) * GAP);
        mesh.userData.index = row * GRID + col;
        group.add(mesh);

        tiles.push({ mesh, col, row, weight: 0, target: 0 });
        meshes.push(mesh);
      }
    }

    const coreTexture = createGlowTexture([
      [0, "rgba(236,246,255,1)"],
      [0.22, "rgba(120,180,255,0.9)"],
      [0.55, "rgba(46,120,245,0.3)"],
      [1, "rgba(46,120,245,0)"],
    ]);
    const haloTexture = createGlowTexture([
      [0, "rgba(80,150,255,0.55)"],
      [0.35, "rgba(56,132,255,0.24)"],
      [1, "rgba(56,132,255,0)"],
    ]);

    /** Both discs ride together; `glow` is the group that follows the tile. */
    const glow = new THREE.Group();
    glow.position.y = TILE_HEIGHT / 2 + 0.006;
    glow.renderOrder = 2;
    group.add(glow);

    const coreMaterial = new THREE.MeshBasicMaterial({
      map: coreTexture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      fog: false,
    });
    const core = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), coreMaterial);
    core.rotation.x = -Math.PI / 2;
    glow.add(core);

    const haloMaterial = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      fog: false,
    });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), haloMaterial);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -0.002;
    glow.add(halo);

    let activeIndex = DEFAULT_INDEX;

    function applyTargets() {
      const active = tiles[activeIndex];
      for (const tile of tiles) {
        const distance =
          Math.abs(tile.col - active.col) + Math.abs(tile.row - active.row);
        tile.target = distance === 0 ? 1 : distance === 1 ? NEIGHBOUR_WEIGHT : 0;
      }
    }
    applyTargets();

    // Start settled on the default so the very first frame is already correct.
    for (const tile of tiles) tile.weight = tile.target;
    glow.position.x = tiles[activeIndex].mesh.position.x;
    glow.position.z = tiles[activeIndex].mesh.position.z;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerMoved = false;
    let pointerInside = false;

    function onPointerMove(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerInside =
        pointer.x >= -1 && pointer.x <= 1 && pointer.y >= -1 && pointer.y <= 1;
      pointerMoved = true;
    }

    function resetToDefault() {
      pointerInside = false;
      pointerMoved = false;
      if (activeIndex !== DEFAULT_INDEX) {
        activeIndex = DEFAULT_INDEX;
        applyTargets();
      }
    }

    // Listening on the window keeps hovering alive over the copy layered on
    // top of the canvas; the ray simply misses when the pointer is elsewhere.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", resetToDefault);

    function resize() {
      const { clientWidth, clientHeight } = container!;
      if (!clientWidth || !clientHeight) return;

      const aspect = clientWidth / clientHeight;
      camera.aspect = aspect;

      // Framing: pull back and centre on narrow viewports, push the blue tile
      // to the right of the headline on wide ones.
      const distance = aspect >= 1.9 ? 11.2 : aspect >= 1.2 ? 13 : 12.5;
      const offsetX = aspect >= 1.9 ? 1.8 : aspect >= 1.2 ? 1 : 0;
      // On narrow screens the copy owns the top, so drop the grid down-screen.
      const offsetZ = aspect >= 1.2 ? 0 : 2.4;

      camera.position.set(
        0,
        distance * Math.sin(CAMERA_ELEVATION),
        distance * Math.cos(CAMERA_ELEVATION)
      );
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      group.position.x = offsetX;
      group.position.z = offsetZ;

      // Fog only hides the far edge of the grid. It has to start well past
      // the focal plane, or it veils the subject itself in flat grey.
      scene.fog = new THREE.Fog(FOG_COLOR, distance * 1.2, distance * 2.3);

      renderer.setSize(clientWidth, clientHeight, false);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Don't burn frames while the hero is scrolled away or the tab is hidden.
    let onScreen = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden) onScreen = false;
      else if (containerRef.current) onScreen = true;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const clock = new THREE.Clock();
    const worldPosition = new THREE.Vector3();
    let frameId = 0;

    function frame() {
      frameId = requestAnimationFrame(frame);

      const delta = Math.min(clock.getDelta(), 0.1);
      if (!onScreen) return;

      if (pointerMoved) {
        pointerMoved = false;
        if (pointerInside) {
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(meshes, false)[0];
          const nextIndex = hit
            ? (hit.object.userData.index as number)
            : DEFAULT_INDEX;
          if (nextIndex !== activeIndex) {
            activeIndex = nextIndex;
            applyTargets();
          }
        } else {
          resetToDefault();
        }
      }

      // Frame-rate independent smoothing; reduced motion snaps instead.
      const ease = reducedMotion ? 1 : 1 - Math.pow(0.0025, delta);
      const elapsed = clock.getElapsedTime();
      const breath = reducedMotion ? 0 : Math.sin(elapsed * 1.05);

      for (const tile of tiles) {
        tile.weight += (tile.target - tile.weight) * ease;
        tile.mesh.position.y =
          LIFT * tile.weight + breath * 0.022 * tile.weight;

        const material = tile.mesh.material;
        material.color.lerpColors(COLOR_IDLE, COLOR_ACTIVE, tile.weight);
        material.emissive.lerpColors(
          EMISSIVE_IDLE,
          EMISSIVE_ACTIVE,
          tile.weight
        );
        // Emissive carries the saturation: white key light alone would grey
        // the blue out the way it does on the idle tiles.
        material.emissiveIntensity = tile.weight * 0.06;
        material.roughness = 0.34 - tile.weight * 0.26;
        material.clearcoatRoughness = 0.1 - tile.weight * 0.07;
        // Dropping the reflection on the blue keeps it from going violet.
        // A neutral reflection would grey the blue out — pull it down instead.
        material.envMapIntensity = 0.7 - tile.weight * 0.25;
      }

      const active = tiles[activeIndex];
      glow.position.x += (active.mesh.position.x - glow.position.x) * ease;
      glow.position.z += (active.mesh.position.z - glow.position.z) * ease;
      coreMaterial.opacity = 0.95 + breath * 0.04;
      haloMaterial.opacity = 0.7 + breath * 0.05;

      active.mesh.getWorldPosition(worldPosition);
      glowLight.position.set(worldPosition.x, 0.16, worldPosition.z);
      glowLight.intensity = 1.4;

      renderer.render(scene, camera);
    }

    frame();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", resetToDefault);

      for (const tile of tiles) tile.mesh.material.dispose();
      geometry.dispose();
      floor.geometry.dispose();
      floor.material.dispose();
      floorTexture?.dispose();
      core.geometry.dispose();
      coreMaterial.dispose();
      coreTexture?.dispose();
      halo.geometry.dispose();
      haloMaterial.dispose();
      haloTexture?.dispose();
      backdropTexture?.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

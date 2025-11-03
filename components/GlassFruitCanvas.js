import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function getHueColor(hex) {
  const color = new THREE.Color(hex);
  return color;
}

export default function GlassFruitCanvas({ fruit }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // Subtle gradient background via CSS; keep scene background transparent
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0.6, 0.4, 1.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
    scene.add(hemi);

    const keyLight = new THREE.SpotLight(0xffffff, 2.4, 10, Math.PI / 6, 0.3, 1.5);
    keyLight.position.set(2.5, 3, 2);
    keyLight.target.position.set(0, 0.2, 0);
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-2, 1.5, -2);
    scene.add(rimLight);

    // Ground plane for subtle reflections
    const groundGeo = new THREE.CircleGeometry(3, 64);
    const groundMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e9edf3'),
      metalness: 0.0,
      roughness: 0.9,
      reflectivity: 0.2,
      clearcoat: 0.2,
      transparent: true,
      opacity: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.8;
    scene.add(ground);

    // Fruit geometry (ellipsoid for realism)
    const fruitGeo = new THREE.SphereGeometry(0.65, 192, 192);

    // Glassy physical material
    const hue = getHueColor(fruit?.hue || '#a3e4b5');
    const fruitMat = new THREE.MeshPhysicalMaterial({
      color: hue,
      metalness: 0.0,
      roughness: 0.06,
      transmission: 1.0, // enable real glass refraction
      thickness: 1.2,    // perceived glass thickness in world units
      ior: 1.45,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#ffffff'),
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      attenuationColor: hue,
      attenuationDistance: 1.8
    });

    const fruitMesh = new THREE.Mesh(fruitGeo, fruitMat);
    fruitMesh.scale.set(1.0, 0.88, 1.0); // subtle squash like many fruits
    fruitMesh.position.set(0, -0.15, 0);
    scene.add(fruitMesh);

    // Subtle internal seed-like highlights for Watermelon feel
    const seedsGroup = new THREE.Group();
    for (let i = 0; i < 18; i++) {
      const seedGeo = new THREE.SphereGeometry(0.02, 16, 16);
      const seedMat = new THREE.MeshStandardMaterial({ color: '#1b1b1b', metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.35 });
      const seed = new THREE.Mesh(seedGeo, seedMat);
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 0.35 + Math.random() * 0.07;
      seed.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.8,
        r * Math.sin(phi) * Math.sin(theta)
      );
      seedsGroup.add(seed);
    }
    seedsGroup.position.y = -0.05;
    scene.add(seedsGroup);

    // Simple orbit interaction
    let isPointerDown = false;
    let lastX = 0, lastY = 0;
    let rotX = 0, rotY = 0;

    function onPointerDown(e) {
      isPointerDown = true;
      lastX = e.clientX; lastY = e.clientY;
    }
    function onPointerUp() { isPointerDown = false; }
    function onPointerMove(e) {
      if (!isPointerDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      rotY += dx * 0.005;
      rotX += dy * 0.005;
      rotX = Math.max(-0.6, Math.min(0.6, rotX));
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    // Zoom
    function onWheel(e) {
      camera.position.z = Math.max(0.8, Math.min(2.0, camera.position.z + e.deltaY * 0.0015));
    }
    window.addEventListener('wheel', onWheel, { passive: true });

    // Animate
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      requestAnimationFrame(animate);

      const target = new THREE.Vector3(
        Math.sin(rotY) * 0.1,
        -0.05 + Math.sin(t * 0.6) * 0.005 + rotX * 0.05,
        Math.cos(rotY) * 0.1
      );
      camera.lookAt(0, -0.05, 0);

      fruitMesh.rotation.y = rotY * 0.6 + t * 0.1;
      fruitMesh.rotation.x = rotX * 0.3;

      // Gentle bob
      fruitMesh.position.y = -0.15 + Math.sin(t * 0.9) * 0.01;

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);

      container.removeChild(renderer.domElement);
      renderer.dispose();
      fruitGeo.dispose();
      groundGeo.dispose();
      // materials are GC'd, but dispose if needed
    };
  }, [fruit?.hue]);

  return <div ref={containerRef} className="canvas-container" aria-label={`Glass ${fruit?.label || 'fruit'}`} />;
}

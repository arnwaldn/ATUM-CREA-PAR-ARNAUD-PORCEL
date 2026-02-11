# WebXR Expert Agent

> **Spécialisation**: Développement VR/AR pour le web avec WebXR, A-Frame, Three.js, et technologies immersives

## IDENTITÉ

Je suis l'expert WebXR d'ULTRA-CREATE, spécialisé dans:
- **WebXR API**: VR/AR native pour navigateurs
- **A-Frame**: Framework VR déclaratif (HTML-like)
- **Three.js VR**: Rendu 3D avancé avec VR
- **Babylon.js XR**: Alternative avec WebXR natif
- **8th Wall**: AR web sans app
- **Hand Tracking**: Interaction naturelle

## STACK TECHNIQUE

### Frameworks Core
```yaml
VR/AR Frameworks:
  - A-Frame 1.5+ (recommandé pour débutants)
  - Three.js + WebXR (contrôle avancé)
  - Babylon.js (features riches)
  - PlayCanvas (editor visuel)
  - React Three Fiber + XR

AR Spécifique:
  - 8th Wall (AR sans app)
  - AR.js (open source)
  - MindAR (face/image tracking)
  - WebXR AR Module

Outils:
  - Blender (3D assets)
  - glTF/GLB (format 3D web)
  - Draco compression
  - KTX2 textures
```

### Setup Projet
```json
{
  "dependencies": {
    "aframe": "^1.5.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/xr": "^5.7.0",
    "@react-three/drei": "^9.92.0"
  }
}
```

## TEMPLATES DE CODE

### A-Frame VR Scene (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <title>VR Experience</title>
  <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js"></script>
</head>
<body>
  <a-scene
    vr-mode-ui="enabled: true"
    loading-screen="dotsColor: #6750A4; backgroundColor: #1C1B1F"
    renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true"
  >
    <!-- Assets -->
    <a-assets>
      <img id="sky" src="assets/sky.jpg">
      <img id="floor" src="assets/floor.jpg">
      <a-asset-item id="model" src="assets/model.glb"></a-asset-item>
      <audio id="ambient" src="assets/ambient.mp3" preload="auto"></audio>
    </a-assets>

    <!-- Environment -->
    <a-sky src="#sky" rotation="0 -90 0"></a-sky>

    <a-plane
      src="#floor"
      rotation="-90 0 0"
      width="50"
      height="50"
      repeat="10 10"
      shadow="receive: true"
    ></a-plane>

    <!-- 3D Model -->
    <a-entity
      gltf-model="#model"
      position="0 0 -5"
      scale="1 1 1"
      animation-mixer
      shadow="cast: true; receive: true"
    ></a-entity>

    <!-- Interactive objects -->
    <a-box
      position="-2 1 -4"
      color="#6750A4"
      class="clickable"
      animation="property: rotation; to: 0 360 0; dur: 5000; loop: true; easing: linear"
      event-set__mouseenter="scale: 1.2 1.2 1.2"
      event-set__mouseleave="scale: 1 1 1"
      shadow
    ></a-box>

    <!-- Lighting -->
    <a-entity light="type: ambient; color: #BBB"></a-entity>
    <a-entity
      light="type: directional; color: #FFF; intensity: 0.6; castShadow: true"
      position="-1 2 1"
    ></a-entity>

    <!-- Camera + Controllers -->
    <a-entity id="rig" movement-controls="fly: false; speed: 0.1">
      <a-entity
        camera
        look-controls="pointerLockEnabled: true"
        position="0 1.6 0"
      >
        <a-cursor
          fuse="true"
          fuse-timeout="1500"
          color="#FFFFFF"
          animation__click="property: scale; from: 0.1 0.1 0.1; to: 1 1 1; dur: 200; startEvents: click"
          raycaster="objects: .clickable"
        ></a-cursor>
      </a-entity>

      <!-- VR Controllers -->
      <a-entity
        id="leftHand"
        laser-controls="hand: left"
        raycaster="objects: .clickable; far: 5"
      ></a-entity>

      <a-entity
        id="rightHand"
        laser-controls="hand: right"
        raycaster="objects: .clickable; far: 5"
      ></a-entity>
    </a-entity>

    <!-- Audio -->
    <a-entity sound="src: #ambient; autoplay: true; loop: true; volume: 0.3"></a-entity>
  </a-scene>
</body>
</html>
```

### A-Frame Custom Component
```javascript
// components/teleport-controls.js
AFRAME.registerComponent('teleport-controls', {
  schema: {
    cameraRig: { type: 'selector', default: '#rig' },
    teleportOrigin: { type: 'selector', default: '' },
    hitCylinderColor: { type: 'color', default: '#6750A4' },
    curveHitColor: { type: 'color', default: '#6750A4' },
    curveMissColor: { type: 'color', default: '#FF0000' },
    curveNumberPoints: { type: 'int', default: 30 },
    curveLineWidth: { type: 'number', default: 0.025 },
    maxLength: { type: 'number', default: 10 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } }
  },

  init: function () {
    this.active = false;
    this.hitPoint = new THREE.Vector3();
    this.rigPosition = new THREE.Vector3();
    this.newRigPosition = new THREE.Vector3();

    // Create curve geometry
    this.createCurve();

    // Create hit indicator
    this.createHitIndicator();

    // Bind events
    this.el.addEventListener('triggerdown', this.onTriggerDown.bind(this));
    this.el.addEventListener('triggerup', this.onTriggerUp.bind(this));
  },

  createCurve: function () {
    const numPoints = this.data.curveNumberPoints;
    const curveGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numPoints * 3);
    curveGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.curveMaterial = new THREE.LineBasicMaterial({
      color: this.data.curveHitColor,
      linewidth: this.data.curveLineWidth
    });

    this.curveMesh = new THREE.Line(curveGeometry, this.curveMaterial);
    this.el.sceneEl.object3D.add(this.curveMesh);
    this.curveMesh.visible = false;
  },

  createHitIndicator: function () {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.data.hitCylinderColor,
      transparent: true,
      opacity: 0.5
    });

    this.hitIndicator = new THREE.Mesh(geometry, material);
    this.el.sceneEl.object3D.add(this.hitIndicator);
    this.hitIndicator.visible = false;
  },

  onTriggerDown: function () {
    this.active = true;
    this.curveMesh.visible = true;
  },

  onTriggerUp: function () {
    if (this.hitIndicator.visible && this.data.cameraRig) {
      // Teleport
      const rig = this.data.cameraRig.object3D;
      rig.position.copy(this.hitPoint);
    }

    this.active = false;
    this.curveMesh.visible = false;
    this.hitIndicator.visible = false;
  },

  tick: function () {
    if (!this.active) return;

    // Raycast and update curve
    this.updateCurve();
  },

  updateCurve: function () {
    // Simplified: cast ray from controller
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, -0.5, -1).normalize();

    this.el.object3D.getWorldPosition(this.rigPosition);
    this.el.object3D.getWorldDirection(direction);

    raycaster.set(this.rigPosition, direction);

    const intersects = raycaster.intersectObjects(
      this.el.sceneEl.object3D.children,
      true
    );

    if (intersects.length > 0) {
      this.hitPoint.copy(intersects[0].point);
      this.hitIndicator.position.copy(this.hitPoint);
      this.hitIndicator.visible = true;
      this.curveMaterial.color.set(this.data.curveHitColor);
    } else {
      this.hitIndicator.visible = false;
      this.curveMaterial.color.set(this.data.curveMissColor);
    }
  },

  remove: function () {
    if (this.curveMesh) {
      this.el.sceneEl.object3D.remove(this.curveMesh);
    }
    if (this.hitIndicator) {
      this.el.sceneEl.object3D.remove(this.hitIndicator);
    }
  }
});
```

### Three.js + WebXR
```javascript
// src/webxr-scene.js
import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class WebXRScene {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.mixers = [];

    this.init();
    this.setupXR();
    this.createEnvironment();
    this.setupControllers();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1C1B1F);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 3);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // Loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  setupXR() {
    this.renderer.xr.enabled = true;

    // Add VR button
    const vrButton = VRButton.createButton(this.renderer);
    this.container.appendChild(vrButton);

    // XR session events
    this.renderer.xr.addEventListener('sessionstart', () => {
      console.log('VR session started');
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      console.log('VR session ended');
    });
  }

  createEnvironment() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid helper
    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    this.scene.add(grid);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Demo objects
    this.createInteractiveObjects();

    // Load 3D model
    this.loadModel('/models/scene.glb');
  }

  createInteractiveObjects() {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x6750A4 });

    for (let i = 0; i < 5; i++) {
      const cube = new THREE.Mesh(geometry, material.clone());
      cube.position.set(
        (Math.random() - 0.5) * 8,
        0.25 + Math.random() * 2,
        -3 - Math.random() * 3
      );
      cube.castShadow = true;
      cube.userData.interactive = true;
      this.scene.add(cube);
    }
  }

  loadModel(url) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, -5);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(model);

        // Handle animations
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          this.mixers.push(mixer);
        }
      },
      (progress) => {
        console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  setupControllers() {
    const controllerModelFactory = new XRControllerModelFactory();

    // Controller 0 (Right)
    this.controller0 = this.renderer.xr.getController(0);
    this.controller0.addEventListener('selectstart', () => this.onSelectStart(0));
    this.controller0.addEventListener('selectend', () => this.onSelectEnd(0));
    this.scene.add(this.controller0);

    const controllerGrip0 = this.renderer.xr.getControllerGrip(0);
    controllerGrip0.add(controllerModelFactory.createControllerModel(controllerGrip0));
    this.scene.add(controllerGrip0);

    // Controller 1 (Left)
    this.controller1 = this.renderer.xr.getController(1);
    this.controller1.addEventListener('selectstart', () => this.onSelectStart(1));
    this.controller1.addEventListener('selectend', () => this.onSelectEnd(1));
    this.scene.add(this.controller1);

    const controllerGrip1 = this.renderer.xr.getControllerGrip(1);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    this.scene.add(controllerGrip1);

    // Raycaster for interaction
    this.raycaster = new THREE.Raycaster();
    this.tempMatrix = new THREE.Matrix4();

    // Add ray visualization
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    const line0 = new THREE.Line(lineGeometry, lineMaterial);
    this.controller0.add(line0);

    const line1 = new THREE.Line(lineGeometry.clone(), lineMaterial);
    this.controller1.add(line1);
  }

  onSelectStart(controllerId) {
    const controller = controllerId === 0 ? this.controller0 : this.controller1;

    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const intersect of intersects) {
      if (intersect.object.userData.interactive) {
        // Highlight
        intersect.object.material.emissive = new THREE.Color(0x6750A4);
        intersect.object.material.emissiveIntensity = 0.5;

        // Attach to controller
        controller.attach(intersect.object);
        controller.userData.selected = intersect.object;
        break;
      }
    }
  }

  onSelectEnd(controllerId) {
    const controller = controllerId === 0 ? this.controller0 : this.controller1;

    if (controller.userData.selected) {
      const object = controller.userData.selected;
      object.material.emissive = new THREE.Color(0x000000);
      object.material.emissiveIntensity = 0;

      this.scene.attach(object);
      controller.userData.selected = undefined;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta();

      // Update animation mixers
      for (const mixer of this.mixers) {
        mixer.update(delta);
      }

      this.renderer.render(this.scene, this.camera);
    });
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}

// Initialize
const container = document.getElementById('app');
const xrScene = new WebXRScene(container);
```

### React Three Fiber + XR
```tsx
// src/App.tsx
import { Canvas } from '@react-three/fiber';
import {
  XR,
  Controllers,
  Hands,
  VRButton,
  Interactive,
  useController
} from '@react-three/xr';
import {
  Environment,
  Text,
  useGLTF,
  OrbitControls
} from '@react-three/drei';
import { useState, useRef } from 'react';
import * as THREE from 'three';

function InteractiveBox({ position }: { position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  return (
    <Interactive
      onHover={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onSelectStart={() => setGrabbed(true)}
      onSelectEnd={() => setGrabbed(false)}
    >
      <mesh
        ref={ref}
        position={position}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={grabbed ? '#00ff00' : hovered ? '#ff00ff' : '#6750A4'}
        />
      </mesh>
    </Interactive>
  );
}

function VRModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <primitive
      object={scene}
      position={[0, 0, -3]}
      scale={1}
    />
  );
}

function VRScene() {
  return (
    <>
      {/* Environment */}
      <Environment preset="sunset" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[50, 50, '#444444', '#222222']} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
      />

      {/* Interactive objects */}
      <InteractiveBox position={[-2, 1, -3]} />
      <InteractiveBox position={[0, 1, -3]} />
      <InteractiveBox position={[2, 1, -3]} />

      {/* 3D Model */}
      {/* <VRModel url="/models/scene.glb" /> */}

      {/* VR UI */}
      <Text
        position={[0, 2.5, -3]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Bienvenue en VR
      </Text>
    </>
  );
}

export default function App() {
  return (
    <>
      <VRButton />
      <Canvas shadows>
        <XR>
          <Controllers />
          <Hands />
          <VRScene />
          <OrbitControls />
        </XR>
      </Canvas>
    </>
  );
}
```

### AR avec WebXR (8th Wall style)
```javascript
// src/ar-scene.js
async function initAR() {
  // Check WebXR AR support
  if (!navigator.xr) {
    console.error('WebXR not supported');
    return;
  }

  const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
  if (!isARSupported) {
    console.error('AR not supported on this device');
    return;
  }

  // Setup Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Add lighting for AR
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Reticle for placement
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x6750A4 })
  );
  reticle.visible = false;
  reticle.matrixAutoUpdate = false;
  scene.add(reticle);

  // Hit test source
  let hitTestSource = null;
  let hitTestSourceRequested = false;

  // Start AR button
  const arButton = document.createElement('button');
  arButton.textContent = 'Start AR';
  arButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    font-size: 16px;
    background: #6750A4;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  `;
  document.body.appendChild(arButton);

  arButton.addEventListener('click', async () => {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    });

    renderer.xr.setReferenceSpaceType('local');
    await renderer.xr.setSession(session);
    arButton.style.display = 'none';
  });

  // Controller for placement
  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (reticle.visible) {
      // Place object at reticle position
      const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const material = new THREE.MeshStandardMaterial({ color: 0x6750A4 });
      const mesh = new THREE.Mesh(geometry, material);

      reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.scale.set(1, 1, 1);
      scene.add(mesh);
    }
  });
  scene.add(controller);

  // Render loop
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if (!hitTestSourceRequested) {
        session.requestReferenceSpace('viewer').then((refSpace) => {
          session.requestHitTestSource({ space: refSpace }).then((source) => {
            hitTestSource = source;
          });
        });
        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);

          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      }
    }

    renderer.render(scene, camera);
  });
}

initAR();
```

## BEST PRACTICES WebXR

### Performance
```javascript
// 1. Target 72-90 FPS
// 2. Optimize draw calls
scene.traverse((obj) => {
  if (obj.isMesh) {
    obj.frustumCulled = true;
  }
});

// 3. Use instanced rendering
const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

// 4. Level of Detail (LOD)
const lod = new THREE.LOD();
lod.addLevel(highDetailMesh, 0);
lod.addLevel(mediumDetailMesh, 10);
lod.addLevel(lowDetailMesh, 20);

// 5. Texture optimization
// - Use compressed textures (KTX2, Basis)
// - Max 2K resolution
// - Power of 2 dimensions
```

### UX Guidelines
```yaml
Confort:
  - Éviter locomotion rapide
  - Fournir points de référence fixes
  - Téléportation > déplacement continu
  - Fade to black lors des transitions

Interaction:
  - Feedback visuel + haptique
  - Objets à portée de main (1-2m)
  - UI suivant le regard (pas fixé au monde)
  - Indicateurs de zone interactive

Accessibilité:
  - Support assis et debout
  - Alternatives clavier/souris
  - Sous-titres pour audio
  - Mode daltonien
```

### Structure Projet
```
webxr-experience/
├── public/
│   ├── models/           # GLB/GLTF
│   ├── textures/         # KTX2, PNG
│   ├── audio/            # MP3, OGG
│   └── draco/            # Draco decoder
├── src/
│   ├── components/       # A-Frame components
│   ├── scenes/           # Scene configurations
│   ├── controllers/      # Input handling
│   ├── utils/            # Helpers
│   └── main.js
├── index.html
└── package.json
```

## WORKFLOW

```
1. CONCEPT
   ├─ Définir expérience VR/AR
   ├─ Storyboard interactions
   └─ Target devices (Quest, web, etc.)

2. PROTOTYPAGE
   ├─ A-Frame pour itération rapide
   ├─ Test sur casque dès que possible
   └─ User testing fréquent

3. DÉVELOPPEMENT
   ├─ Optimiser assets 3D
   ├─ Implémenter interactions
   └─ Ajouter audio spatial

4. OPTIMISATION
   ├─ Profiler avec Oculus Debug
   ├─ Réduire draw calls
   └─ Compression textures/modèles

5. DÉPLOIEMENT
   ├─ HTTPS obligatoire
   ├─ Test multi-devices
   └─ Fallback desktop
```

---

*WebXR Expert - ULTRA-CREATE v24.0*

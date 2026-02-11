// Teleport controls component for A-Frame
// Arc-style teleportation for VR locomotion

AFRAME.registerComponent('teleport-controls', {
  schema: {
    cameraRig: { type: 'selector', default: '#rig' },
    teleportOrigin: { type: 'selector', default: '#camera' },
    button: { type: 'string', default: 'trigger' },
    curveHitColor: { type: 'color', default: '#6750A4' },
    curveMissColor: { type: 'color', default: '#FF4444' },
    hitCylinderColor: { type: 'color', default: '#6750A4' },
    hitCylinderRadius: { type: 'number', default: 0.3 },
    hitCylinderHeight: { type: 'number', default: 0.1 },
    curveNumberPoints: { type: 'number', default: 30 },
    curveLineWidth: { type: 'number', default: 0.025 },
    maxLength: { type: 'number', default: 10 },
    landingNormal: { type: 'vec3', default: { x: 0, y: 1, z: 0 } }
  },

  init: function () {
    this.active = false;
    this.hit = false;
    this.hitPoint = new THREE.Vector3();
    this.p0 = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();

    // Create curve visualization
    this.createCurve();

    // Create hit indicator
    this.createHitIndicator();

    // Bind controller events
    this.onButtonDown = this.onButtonDown.bind(this);
    this.onButtonUp = this.onButtonUp.bind(this);

    this.el.addEventListener(`${this.data.button}down`, this.onButtonDown);
    this.el.addEventListener(`${this.data.button}up`, this.onButtonUp);
  },

  createCurve: function () {
    const numPoints = this.data.curveNumberPoints;

    // Create buffer geometry for curve
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numPoints * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.curveMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.data.curveHitColor),
      linewidth: this.data.curveLineWidth
    });

    this.curveMesh = new THREE.Line(geometry, this.curveMaterial);
    this.curveMesh.visible = false;
    this.curveMesh.frustumCulled = false;

    this.el.sceneEl.object3D.add(this.curveMesh);
  },

  createHitIndicator: function () {
    // Cylinder indicator
    const geometry = new THREE.CylinderGeometry(
      this.data.hitCylinderRadius,
      this.data.hitCylinderRadius,
      this.data.hitCylinderHeight,
      32,
      1,
      true
    );

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.hitCylinderColor),
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    this.hitIndicator = new THREE.Mesh(geometry, material);
    this.hitIndicator.visible = false;

    // Add ring on top
    const ringGeometry = new THREE.RingGeometry(
      this.data.hitCylinderRadius * 0.8,
      this.data.hitCylinderRadius,
      32
    );
    ringGeometry.rotateX(-Math.PI / 2);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.data.hitCylinderColor),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    this.hitRing = new THREE.Mesh(ringGeometry, ringMaterial);
    this.hitRing.position.y = this.data.hitCylinderHeight / 2;
    this.hitIndicator.add(this.hitRing);

    this.el.sceneEl.object3D.add(this.hitIndicator);
  },

  onButtonDown: function () {
    this.active = true;
    this.curveMesh.visible = true;
  },

  onButtonUp: function () {
    if (this.hit && this.data.cameraRig) {
      this.teleport();
    }

    this.active = false;
    this.hit = false;
    this.curveMesh.visible = false;
    this.hitIndicator.visible = false;
  },

  teleport: function () {
    const cameraRig = this.data.cameraRig.object3D;
    const teleportOrigin = this.data.teleportOrigin?.object3D || cameraRig;

    // Calculate offset between camera and rig
    const cameraWorldPos = new THREE.Vector3();
    teleportOrigin.getWorldPosition(cameraWorldPos);

    const rigWorldPos = new THREE.Vector3();
    cameraRig.getWorldPosition(rigWorldPos);

    const offset = new THREE.Vector3().subVectors(rigWorldPos, cameraWorldPos);
    offset.y = 0; // Keep same height

    // Set new position
    cameraRig.position.copy(this.hitPoint).add(offset);

    console.log('Teleported to:', this.hitPoint);
  },

  tick: function () {
    if (!this.active) return;

    this.updateCurve();
  },

  updateCurve: function () {
    // Get controller position and direction
    this.el.object3D.getWorldPosition(this.p0);
    this.el.object3D.getWorldQuaternion(this.quaternion);

    this.direction.set(0, 0, -1);
    this.direction.applyQuaternion(this.quaternion);

    // Calculate parabolic curve
    const gravity = -9.8;
    const initialVelocity = 5;
    const numPoints = this.data.curveNumberPoints;
    const positions = this.curveMesh.geometry.attributes.position.array as Float32Array;

    let hit = false;
    let hitPoint = new THREE.Vector3();

    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * 2; // Time parameter
      const x = this.p0.x + this.direction.x * initialVelocity * t;
      const y = this.p0.y + this.direction.y * initialVelocity * t + 0.5 * gravity * t * t;
      const z = this.p0.z + this.direction.z * initialVelocity * t;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Check for ground hit
      if (!hit && y <= 0 && i > 0) {
        hit = true;
        hitPoint.set(x, 0, z);
      }
    }

    this.curveMesh.geometry.attributes.position.needsUpdate = true;

    // Update visuals based on hit
    if (hit) {
      this.hit = true;
      this.hitPoint.copy(hitPoint);
      this.hitIndicator.position.copy(hitPoint);
      this.hitIndicator.visible = true;
      this.curveMaterial.color.set(this.data.curveHitColor);
    } else {
      this.hit = false;
      this.hitIndicator.visible = false;
      this.curveMaterial.color.set(this.data.curveMissColor);
    }
  },

  remove: function () {
    this.el.removeEventListener(`${this.data.button}down`, this.onButtonDown);
    this.el.removeEventListener(`${this.data.button}up`, this.onButtonUp);

    if (this.curveMesh) {
      this.el.sceneEl.object3D.remove(this.curveMesh);
      this.curveMesh.geometry.dispose();
      (this.curveMesh.material as THREE.Material).dispose();
    }

    if (this.hitIndicator) {
      this.el.sceneEl.object3D.remove(this.hitIndicator);
    }
  }
});

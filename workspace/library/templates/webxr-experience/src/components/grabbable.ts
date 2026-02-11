// Grabbable component for A-Frame
// Allows objects to be picked up and moved with VR controllers

AFRAME.registerComponent('grabbable', {
  schema: {
    constrainToHand: { type: 'boolean', default: true },
    dropOnRelease: { type: 'boolean', default: true },
    physics: { type: 'boolean', default: false }
  },

  init: function () {
    this.el.classList.add('grabbable');

    this.grabbed = false;
    this.grabber = null;
    this.originalParent = this.el.parentElement;
    this.originalPosition = new THREE.Vector3();
    this.originalRotation = new THREE.Euler();

    // Store original transform
    this.el.object3D.getWorldPosition(this.originalPosition);
    this.originalRotation.copy(this.el.object3D.rotation);

    // Bind event handlers
    this.onGrabStart = this.onGrabStart.bind(this);
    this.onGrabEnd = this.onGrabEnd.bind(this);

    // Listen for grab events
    this.el.addEventListener('grab-start', this.onGrabStart);
    this.el.addEventListener('grab-end', this.onGrabEnd);

    // Alternative: listen on controllers
    const leftController = document.getElementById('left-controller');
    const rightController = document.getElementById('right-controller');

    if (rightController) {
      rightController.addEventListener('triggerdown', () => {
        this.checkAndGrab(rightController);
      });

      rightController.addEventListener('triggerup', () => {
        if (this.grabber === rightController) {
          this.release();
        }
      });
    }

    if (leftController) {
      leftController.addEventListener('triggerdown', () => {
        this.checkAndGrab(leftController);
      });

      leftController.addEventListener('triggerup', () => {
        if (this.grabber === leftController) {
          this.release();
        }
      });
    }
  },

  checkAndGrab: function (controller: Element) {
    const raycaster = controller.components.raycaster;
    if (!raycaster) return;

    const intersections = raycaster.intersections;
    if (intersections.length > 0) {
      const firstHit = intersections[0].object.el;
      if (firstHit === this.el && !this.grabbed) {
        this.grab(controller);
      }
    }
  },

  onGrabStart: function (evt: CustomEvent) {
    if (this.grabbed) return;
    this.grab(evt.detail.hand || evt.target);
  },

  onGrabEnd: function () {
    this.release();
  },

  grab: function (grabber: Element) {
    if (this.grabbed) return;

    this.grabbed = true;
    this.grabber = grabber;

    // Visual feedback
    this.el.setAttribute('material', 'emissive', '#6750A4');
    this.el.setAttribute('material', 'emissiveIntensity', '0.3');

    if (this.data.constrainToHand) {
      // Attach to controller
      const worldPos = new THREE.Vector3();
      this.el.object3D.getWorldPosition(worldPos);

      grabber.object3D.attach(this.el.object3D);

      // Position in front of controller
      this.el.object3D.position.set(0, 0, -0.2);
    }

    // Emit event
    this.el.emit('grabbed', { grabber: this.grabber });

    console.log('Object grabbed');
  },

  release: function () {
    if (!this.grabbed) return;

    // Remove visual feedback
    this.el.setAttribute('material', 'emissive', '#000000');
    this.el.setAttribute('material', 'emissiveIntensity', '0');

    if (this.data.constrainToHand && this.data.dropOnRelease) {
      // Get world position before detaching
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();

      this.el.object3D.getWorldPosition(worldPos);
      this.el.object3D.getWorldQuaternion(worldQuat);

      // Reattach to original parent
      if (this.originalParent) {
        this.originalParent.object3D.attach(this.el.object3D);
      }

      // Set world position
      this.el.object3D.position.copy(worldPos);
      this.el.object3D.quaternion.copy(worldQuat);
    }

    // Emit event
    this.el.emit('released', { grabber: this.grabber });

    this.grabbed = false;
    this.grabber = null;

    console.log('Object released');
  },

  tick: function () {
    // Additional update logic if needed
  },

  remove: function () {
    this.el.removeEventListener('grab-start', this.onGrabStart);
    this.el.removeEventListener('grab-end', this.onGrabEnd);
  }
});

// TypeScript declaration
declare global {
  namespace AFRAME {
    interface ComponentDefinition {
      grabbable: {
        schema: {
          constrainToHand: { type: 'boolean'; default: true };
          dropOnRelease: { type: 'boolean'; default: true };
          physics: { type: 'boolean'; default: false };
        };
      };
    }
  }
}

import './components/grabbable';
import './components/teleport-controls';

// Wait for A-Frame to load
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (scene) {
    scene.addEventListener('loaded', () => {
      console.log('Scene loaded');

      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
          loadingOverlay.remove();
        }, 500);
      }
    });

    // VR session events
    scene.addEventListener('enter-vr', () => {
      console.log('Entered VR mode');
    });

    scene.addEventListener('exit-vr', () => {
      console.log('Exited VR mode');
    });
  }

  // Check WebXR support
  checkXRSupport();
});

async function checkXRSupport(): Promise<void> {
  const vrButton = document.getElementById('enterVRButton');

  if (!navigator.xr) {
    console.warn('WebXR not supported');
    if (vrButton) {
      vrButton.textContent = 'VR Not Supported';
      vrButton.setAttribute('disabled', 'true');
    }
    return;
  }

  try {
    const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    const arSupported = await navigator.xr.isSessionSupported('immersive-ar');

    console.log('VR Support:', vrSupported);
    console.log('AR Support:', arSupported);

    if (!vrSupported && vrButton) {
      vrButton.innerHTML = '<span>VR Not Available</span>';
      vrButton.classList.add('disabled');
    }
  } catch (error) {
    console.error('Error checking XR support:', error);
  }
}

// Expose for debugging
declare global {
  interface Window {
    AFRAME: typeof AFRAME;
  }
}

console.log('WebXR Experience initialized');
console.log('A-Frame version:', window.AFRAME?.version);

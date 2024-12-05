import React, { useRef, useEffect } from 'react';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

export default function TitleBackground() {
  const glRef = useRef<GLView>(null); // Using GLView as the reference type

  useEffect(() => {
    if (!glRef.current) return; // Check if the ref is set

    const gl = glRef.current.gl; // The GL context is accessed here

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: gl.canvas });

    renderer.setSize(300, 300);
    camera.position.z = 3;

    // Create the cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();  // Clean up on unmount
    };
  }, []);

  const onContextCreate = (gl: WebGLRenderingContext) => {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.5, 0.5, 0.5, 1); // Set background color to gray
  };

  return (
    <GLView
      style={{ width: 300, height: 300 }}
      ref={glRef} // Reference the GLView component
      onContextCreate={onContextCreate} // Initialize WebGL context
    />
  );
}

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { TreeOfLife } from "@/app/models/TreeOfLife.interface";

// Helper to convert ID-based path references to array indices
const getPathIndices = (tree: TreeOfLife): [number, number][] => {
  return tree.paths.map((path) => [
    tree.sephiroth.findIndex((s) => s.id === path.sourceId),
    tree.sephiroth.findIndex((s) => s.id === path.targetId),
  ]);
};

interface TreeOfLifeVisualizationProps {
  tree: TreeOfLife;
  onSephirahClick?: (sephirahInfo: any) => void;
  onPathClick?: (pathInfo: any) => void;
}

export interface TreeOfLifeVisualizationRef {
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export default React.forwardRef<
  TreeOfLifeVisualizationRef,
  TreeOfLifeVisualizationProps
>(function TreeOfLifeVisualization(
  { tree, onSephirahClick, onPathClick },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const spheresRef = useRef<THREE.Object3D[]>([]);
  const linesRef = useRef<THREE.Object3D[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [isMobile, setIsMobile] = useState(false);

  // Reference to event handler functions for proper cleanup
  const controlChangeHandlerRef = useRef<() => void>(() => {});

  // Reference to the current Tree of Life data
  const treeRef = useRef<TreeOfLife>(tree);

  // Update tree reference when prop changes
  useEffect(() => {
    console.log("Tree prop updated:", tree);
    treeRef.current = tree;
    // Trigger re-render of the scene
    updateScene();
  }, [tree]);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const updateScene = () => {
    if (!sceneRef.current || !treeRef.current) return;

    console.log("Updating scene with tree:", treeRef.current);

    // Create arrays to track all objects that need to be removed
    const objectsToRemove: THREE.Object3D[] = [];

    // Find and collect all objects to remove
    sceneRef.current.traverse((object) => {
      if (
        object.type === "Mesh" ||
        object.type === "Line" ||
        (object.type === "Sprite" && object.name.startsWith("label-"))
      ) {
        objectsToRemove.push(object);
      }
    });

    // Clean up all collected objects
    objectsToRemove.forEach((object) => {
      sceneRef.current?.remove(object);

      // Dispose geometries and materials
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      }

      if (object instanceof THREE.Sprite) {
        if (object.material) {
          (object.material as THREE.SpriteMaterial).dispose();
          if ((object.material as THREE.SpriteMaterial).map) {
            (object.material as THREE.SpriteMaterial).map?.dispose();
          }
        }
      }
    });

    // Add new objects
    const currentTree = treeRef.current;
    const pathIndices = getPathIndices(currentTree);

    const createdSpheres: THREE.Object3D[] = [];
    const createdLines: THREE.Object3D[] = [];

    // Create spheres
    currentTree.sephiroth.forEach((sephirah, index) => {
      // Create sphere
      const sphereSize = sephirah.renderOptions?.size || 1.2;
      const sphereGeometry = new THREE.SphereGeometry(sphereSize, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: sephirah.color,
        transparent: true,
        opacity: 0.9,
      });

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(...sephirah.position);

      // Store data for interaction
      sphere.userData = {
        sephirahInfo: {
          ...sephirah,
          interpretation: sephirah.description,
          description:
            (sephirah as any).traditionalDescription || sephirah.description,
        },
        sephirahIndex: index,
      };

      sceneRef.current?.add(sphere);
      createdSpheres.push(sphere);

      // Create glow effect
      const glowSize = sphereSize * 1.3;
      const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: sephirah.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
      });

      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      glowSphere.position.set(...sephirah.position);
      glowSphere.userData = { isGlow: true };
      sceneRef.current?.add(glowSphere);
      createdSpheres.push(glowSphere);

      // Create label
      if (sephirah.name) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 128;
        const context = canvas.getContext("2d");

        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);

          // Text style
          context.fillStyle = "#ffffff";
          context.font = "bold 24px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";

          // Background
          const metrics = context.measureText(sephirah.name);
          const textWidth = metrics.width;
          const bgPadding = 10;
          context.fillStyle = "#00000088";
          context.fillRect(
            canvas.width / 2 - textWidth / 2 - bgPadding,
            canvas.height / 2 - 12 - bgPadding,
            textWidth + bgPadding * 2,
            24 + bgPadding * 2
          );

          // Text
          context.fillStyle = "#ffffff";
          context.fillText(sephirah.name, canvas.width / 2, canvas.height / 2);

          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
          });

          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.name = `label-${sephirah.id}`;
          sprite.scale.set(5, 2.5, 1);

          // Position below sphere
          const yOffset = isMobile ? -2.5 : -2;
          sprite.position.set(
            sephirah.position[0],
            sephirah.position[1] + yOffset,
            sephirah.position[2]
          );

          sprite.userData = { isLabel: true, labelForSephirah: sephirah.id };
          sceneRef.current?.add(sprite);
        }
      }
    });

    // Create paths
    currentTree.paths.forEach((path, pathIndex) => {
      const [startIdx, endIdx] = pathIndices[pathIndex];

      // Safety check
      if (
        startIdx === -1 ||
        endIdx === -1 ||
        startIdx >= currentTree.sephiroth.length ||
        endIdx >= currentTree.sephiroth.length
      ) {
        console.error(
          `Invalid path indices: ${startIdx}, ${endIdx} for path:`,
          path
        );
        return;
      }

      const startPos = currentTree.sephiroth[startIdx].position;
      const endPos = currentTree.sephiroth[endIdx].position;

      // Handle curved paths
      let points;
      if (path.curved) {
        const controlPoint = path.controlPoint
          ? new THREE.Vector3(...path.controlPoint)
          : new THREE.Vector3(0, 9, 0);

        points = [
          new THREE.Vector3(...startPos),
          controlPoint,
          new THREE.Vector3(...endPos),
        ];

        const curve = new THREE.QuadraticBezierCurve3(
          points[0],
          points[1],
          points[2]
        );
        points = curve.getPoints(20);
      } else {
        points = [new THREE.Vector3(...startPos), new THREE.Vector3(...endPos)];
      }

      // Create tube for visual representation
      const thickness = path.renderOptions?.thickness || 0.12;
      const tubePath = new THREE.CatmullRomCurve3(points);
      const segments = path.curved ? 20 : 1;
      const tubeGeometry = new THREE.TubeGeometry(
        tubePath,
        segments,
        thickness,
        8,
        false
      );

      const material = new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.8,
      });

      const tube = new THREE.Mesh(tubeGeometry, material);
      sceneRef.current?.add(tube);

      // Create line for interaction
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.8,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);

      line.userData = {
        pathInfo: {
          ...path,
          interpretation: path.description,
          description: (path as any).traditionalDescription || path.description,
        },
        pathIndex,
      };

      sceneRef.current?.add(line);
      createdLines.push(line);
    });

    // Store references
    spheresRef.current = createdSpheres;
    linesRef.current = createdLines;
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      // Adjust for mobile
      const distance = isMobile ? 30 : 25;
      cameraRef.current.position.set(0, 0, distance);
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      const zoomStep = isMobile ? 3 : 2;
      cameraRef.current.position.z -= zoomStep;
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      const zoomStep = isMobile ? 3 : 2;
      cameraRef.current.position.z += zoomStep;
      controlsRef.current.update();
    }
  };

  // Handle mouse/touch position updates
  const updatePointerPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x =
      ((clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    const y =
      -((clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

    mouseRef.current.set(x, y);
  };

  const onMouseMove = (event: MouseEvent) => {
    updatePointerPosition(event.clientX, event.clientY);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 0) return;
    updatePointerPosition(event.touches[0].clientX, event.touches[0].clientY);
  };

  // Handle interactions
  const onClick = (event: MouseEvent | TouchEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current)
      return;

    // Get pointer position
    let clientX: number, clientY: number;

    if ("touches" in event) {
      // Touch event
      if (event.changedTouches.length === 0) return;
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    updatePointerPosition(clientX, clientY);

    // Raycast
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Check spheres first
    const sphereIntersects = raycasterRef.current.intersectObjects(
      spheresRef.current.filter((obj) => !obj.userData.isGlow)
    );

    if (sphereIntersects.length > 0) {
      const clickedSphere = sphereIntersects[0].object;
      if (clickedSphere.userData.sephirahInfo && onSephirahClick) {
        onSephirahClick(clickedSphere.userData.sephirahInfo);
      }
      return;
    }

    // Then check paths
    const lineIntersects = raycasterRef.current.intersectObjects(
      linesRef.current
    );

    if (lineIntersects.length > 0) {
      const clickedLine = lineIntersects[0].object;
      if (clickedLine.userData.pathInfo && onPathClick) {
        onPathClick(clickedLine.userData.pathInfo);
      }
    }
  };

  // Check hover effects
  const checkHover = () => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current)
      return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Reset all objects
    spheresRef.current.forEach((obj) => {
      if (obj.userData.isGlow) return;

      const sphere = obj as THREE.Mesh<
        THREE.SphereGeometry,
        THREE.MeshBasicMaterial
      >;
      if (sphere.material) {
        sphere.material.opacity = 0.9;
      }
    });

    linesRef.current.forEach((obj) => {
      const line = obj as THREE.Line<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      >;
      if (line.material) {
        line.material.opacity = 0.8;
      }
    });

    // Check for hover on spheres
    const sphereIntersects = raycasterRef.current.intersectObjects(
      spheresRef.current.filter((obj) => !obj.userData.isGlow)
    );

    if (sphereIntersects.length > 0) {
      const hoveredSphere = sphereIntersects[0].object as THREE.Mesh<
        THREE.SphereGeometry,
        THREE.MeshBasicMaterial
      >;

      if (hoveredSphere.material) {
        hoveredSphere.material.opacity = 1.0;
      }

      if (containerRef.current) {
        containerRef.current.style.cursor = "pointer";
      }
      return;
    }

    // Check for hover on lines
    const lineIntersects = raycasterRef.current.intersectObjects(
      linesRef.current
    );

    if (lineIntersects.length > 0) {
      const hoveredLine = lineIntersects[0].object as THREE.Line<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      >;

      if (hoveredLine.material) {
        hoveredLine.material.opacity = 1.0;
      }

      if (containerRef.current) {
        containerRef.current.style.cursor = "pointer";
      }
      return;
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "default";
    }
  };

  // Set up scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a25);
    sceneRef.current = scene;

    // Create camera with mobile adjustments
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 70 : 60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    // Adjust distance for mobile
    camera.position.z = isMobile ? 30 : 25;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls with mobile adjustments
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // Mobile-specific control adjustments
    if (isMobile) {
      controls.minDistance = 15;
      controls.maxDistance = 45;
      controls.minPolarAngle = Math.PI / 4; // 45 degrees
      controls.maxPolarAngle = (Math.PI * 3) / 4; // 135 degrees
    } else {
      controls.minDistance = 10;
      controls.maxDistance = 50;
    }

    controlsRef.current = controls;

    // Add event listeners
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("click", onClick);
    window.addEventListener("touchend", onClick);

    // Handle control changes
    const controlChangeHandler = () => {
      // Update anything that needs to be updated on control changes
    };
    controls.addEventListener("change", controlChangeHandler);
    controlChangeHandlerRef.current = controlChangeHandler;

    // Handle window resizing
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      cameraRef.current.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Build initial scene
    updateScene();

    // Animation loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Check hover effects
      checkHover();

      // Update labels to face camera
      if (cameraRef.current) {
        const cameraPosition = cameraRef.current.position.clone();

        scene.traverse((object) => {
          if (object.type === "Sprite" && object.name.startsWith("label-")) {
            // Make sprite face camera
            object.lookAt(cameraPosition);
          }
        });
      }

      // Animate paths
      linesRef.current.forEach((line, i) => {
        const lineMesh = line as THREE.Line<
          THREE.BufferGeometry,
          THREE.LineBasicMaterial
        >;

        if (lineMesh.material) {
          const pulseTime = Date.now() * 0.001 * 0.5 + i * 0.2;
          lineMesh.material.opacity = 0.6 + Math.sin(pulseTime) * 0.2;
        }
      });

      // Update controls and render
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      // Remove event listeners
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchend", onClick);
      window.removeEventListener("resize", handleResize);

      // Remove control listeners
      if (controlsRef.current) {
        controlsRef.current.removeEventListener(
          "change",
          controlChangeHandlerRef.current
        );
        controlsRef.current.dispose();
      }

      // Dispose of all scene objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();

            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((m) => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }

      // Remove renderer
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Clear references
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [onSephirahClick, onPathClick, isMobile]);

  // Expose methods
  React.useImperativeHandle(ref, () => ({
    resetCamera,
    zoomIn,
    zoomOut,
  }));

  return <div ref={containerRef} className="absolute inset-0" />;
});

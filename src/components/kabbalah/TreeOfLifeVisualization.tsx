import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
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

  const updateScene = () => {
    if (!sceneRef.current || !treeRef.current) return;

    console.log("Updating scene with tree:", treeRef.current);

    // Create arrays to track all objects that need to be removed
    const objectsToRemove: THREE.Object3D[] = [];

    // Find and collect all objects to remove (spheres, glow spheres, lines, tubes, and text labels)
    sceneRef.current.traverse((object) => {
      // Remove spheres (both regular and glow spheres)
      if (object.type === "Mesh") {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry instanceof THREE.SphereGeometry) {
          objectsToRemove.push(mesh);
        }
        // Also remove tube geometries used for path rendering
        if (mesh.geometry instanceof THREE.TubeGeometry) {
          objectsToRemove.push(mesh);
        }
      }

      // Remove lines
      if (object.type === "Line") {
        objectsToRemove.push(object);
      }

      // Remove text labels (sprites)
      if (object.type === "Sprite" && object.name.startsWith("label-")) {
        objectsToRemove.push(object);
      }
    });

    // Clean up all collected objects
    objectsToRemove.forEach((object) => {
      sceneRef.current?.remove(object);

      // Dispose geometries and materials to prevent memory leaks
      if (object.type === "Mesh" || object.type === "Line") {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        if (mesh.material) {
          const material = mesh.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else {
            material.dispose();
          }
        }
      }

      if (object.type === "Sprite") {
        const sprite = object as THREE.Sprite;
        if (sprite.material) {
          const material = sprite.material as THREE.SpriteMaterial;
          if (material.map) {
            material.map.dispose();
          }
          material.dispose();
        }
      }
    });

    // Reset our reference arrays before we start creating new objects
    spheresRef.current = [];
    linesRef.current = [];

    console.log(`Cleared ${objectsToRemove.length} objects from the scene`);

    // Re-create spheres and lines based on new tree data
    const currentTree = treeRef.current;
    const createdSpheres: THREE.Object3D[] = [];
    const createdLines: THREE.Object3D[] = [];

    // Create the Sephiroth (spheres)
    currentTree.sephiroth.forEach((sephirah) => {
      const sphereSize =
        sephirah.renderOptions?.size ||
        currentTree.visualSettings?.sphereSize ||
        1.2;
      const geometry = new THREE.SphereGeometry(sphereSize, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: sephirah.color,
        metalness: 0.1,
        roughness: 0.2,
        emissive: new THREE.Color(sephirah.color),
        emissiveIntensity: sephirah.renderOptions?.glowIntensity || 0.8,
        flatShading: false,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...sephirah.position);

      // Store both traditional and personalized interpretations in userData
      const sephirahData = {
        ...sephirah,
        interpretation: sephirah.description, // Store personalized interpretation
        description:
          (sephirah as any).traditionalDescription || sephirah.description, // Use traditional description if available
      };

      // Store the sephirah info in userData for easy reference
      sphere.userData = { sephirahInfo: sephirahData };
      sceneRef.current?.add(sphere);
      createdSpheres.push(sphere);

      // Add a glow effect using a larger transparent sphere
      const glowGeometry = new THREE.SphereGeometry(sphereSize * 1.6, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: sephirah.renderOptions?.glowColor || sephirah.color,
        transparent: true,
        opacity: 0.25, // Static opacity for the glow
        depthWrite: false, // Prevents the glow from being occluded
      });
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      glowSphere.position.set(...sephirah.position);
      sceneRef.current?.add(glowSphere);

      // Add text label
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        // Increase canvas size for better resolution
        canvas.width = 512;
        canvas.height = 512;

        // Set high quality text rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        // Clear the canvas with a transparent background
        context.clearRect(0, 0, canvas.width, canvas.height);

        // No background box - just text on transparent background

        // Draw the number with slight text shadow for better visibility against lines
        context.fillStyle = "#ffffff";
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 5;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;

        // Draw the number
        if (currentTree.visualSettings?.showNumbers !== false) {
          context.font = "Bold 64px Arial";
          context.textAlign = "center";
          context.fillText(sephirah.number.toString(), canvas.width / 2, 180);
        }

        // Draw the English name (display name)
        if (currentTree.visualSettings?.showEnglishNames !== false) {
          const displayName =
            sephirah.displayName?.replace("\n", " - ") || sephirah.name;
          context.font = `Bold 42px ${
            currentTree.visualSettings?.textLabelFont || "Arial"
          }`;
          context.fillText(displayName, canvas.width / 2, 260);
        }

        // Draw the Hebrew name
        if (currentTree.visualSettings?.showHebrewNames !== false) {
          try {
            context.font = `Bold 54px ${
              currentTree.visualSettings?.textLabelFont || "Arial"
            }`;
            // Ensure hebrewName is a string before drawing
            const hebrewText =
              typeof sephirah.hebrewName === "string"
                ? sephirah.hebrewName
                : String(sephirah.hebrewName || "");
            context.fillText(hebrewText, canvas.width / 2, 340);
          } catch (error) {
            console.warn("Error rendering Hebrew text:", error);
            // Use fallback text if Hebrew rendering fails
            context.fillText(sephirah.name, canvas.width / 2, 340);
          }
        }

        let texture = null;
        try {
          texture = new THREE.CanvasTexture(canvas);
          // Improve the texture quality
          texture.anisotropy = 16;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
        } catch (error) {
          console.error("Error creating texture:", error);
          // Create a simple fallback texture
          const fallbackCanvas = document.createElement("canvas");
          fallbackCanvas.width = 128;
          fallbackCanvas.height = 128;
          const fallbackContext = fallbackCanvas.getContext("2d");
          if (fallbackContext) {
            fallbackContext.fillStyle = "#ffffff";
            fallbackContext.textAlign = "center";
            fallbackContext.font = "Bold 24px Arial";
            fallbackContext.fillText(sephirah.name, 64, 64);
            texture = new THREE.CanvasTexture(fallbackCanvas);
          }
        }

        // Only create sprite if we have a valid texture
        if (texture) {
          const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0, // Full opacity since we have no background
            depthTest: false, // Disable depth testing to ensure visibility over lines
            depthWrite: false, // Don't write to depth buffer
            sizeAttenuation: true,
          });

          const sprite = new THREE.Sprite(spriteMaterial);

          // Initial position, will be adjusted in the animation loop
          sprite.position.copy(sphere.position);

          // Make the label bigger
          const textScale = currentTree.visualSettings?.textLabelSize || 4.0;
          const customScale = sephirah.renderOptions?.textScale || 1.0;
          sprite.scale.set(textScale * customScale, textScale * customScale, 1);

          // Give the sprite a unique name for identification
          sprite.name = `label-${sephirah.name}`;

          // Store a reference to the associated sphere for dynamic positioning
          sprite.userData = { sphereRef: sphere, sephirahInfo: sephirahData };

          // Set high render order to ensure it renders on top of lines
          sprite.renderOrder = 2000;

          sceneRef.current?.add(sprite);
        }
      }
    });

    // Store the created spheres in ref
    spheresRef.current = createdSpheres;

    // Create the paths (lines)
    const pathIndices = getPathIndices(currentTree);

    currentTree.paths.forEach((path, pathIndex) => {
      const [startIdx, endIdx] = pathIndices[pathIndex];

      // Safety check to make sure indices are valid
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
        // Return a dummy object to avoid errors
        return;
      }

      const startPos = currentTree.sephiroth[startIdx].position;
      const endPos = currentTree.sephiroth[endIdx].position;

      // Handle curved paths
      let points;
      if (path.curved) {
        // Create a curved path
        const controlPoint = path.controlPoint
          ? new THREE.Vector3(...path.controlPoint)
          : new THREE.Vector3(0, 9, 0); // Default control point if not specified

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
        // Get points along the curve for a smooth path
        points = curve.getPoints(20);
      } else {
        points = [new THREE.Vector3(...startPos), new THREE.Vector3(...endPos)];
      }

      // Create thicker lines by using a tube geometry
      let tubePath, tubeGeometry;
      const thickness =
        path.renderOptions?.thickness ||
        currentTree.visualSettings?.pathThickness ||
        0.12;

      if (path.curved) {
        tubePath = new THREE.CatmullRomCurve3(points);
        tubeGeometry = new THREE.TubeGeometry(
          tubePath,
          20,
          thickness,
          8,
          false
        );
      } else {
        tubePath = new THREE.CatmullRomCurve3(points);
        tubeGeometry = new THREE.TubeGeometry(tubePath, 1, thickness, 8, false);
      }

      const opacity = path.renderOptions?.opacity || 0.8;
      const material = new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: opacity,
      });

      const tube = new THREE.Mesh(tubeGeometry, material);
      sceneRef.current?.add(tube);

      // We still need a line object for raycasting
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: path.color,
        opacity: opacity,
        transparent: true,
        linewidth: 2,
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);

      // Store both traditional and personalized interpretations in userData
      const pathData = {
        ...path,
        interpretation: path.description, // Store personalized interpretation
        description: (path as any).traditionalDescription || path.description, // Use traditional if available
      };

      line.userData = { pathInfo: pathData, pathIndex: pathIndex }; // Store the path data
      sceneRef.current?.add(line);

      createdLines.push(line);
    });

    // Store the created lines in ref
    linesRef.current = createdLines;

    console.log("Scene updated with new tree data");
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 25);
      controlsRef.current.reset();
    }
  };

  const zoomIn = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.z -= 2;
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.z += 2;
      controlsRef.current.update();
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x =
      ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    mouseRef.current.y =
      -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

    checkHover();
  };

  const handleClick = (event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x =
      ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    mouseRef.current.y =
      -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    // Increase the precision for raycasting
    raycasterRef.current.params.Line = { threshold: 0.2 };
    raycasterRef.current.params.Points = { threshold: 0.2 };

    // Check for sphere intersections
    const sphereIntersects = raycasterRef.current.intersectObjects(
      spheresRef.current
    );
    if (sphereIntersects.length > 0) {
      const sphere = sphereIntersects[0].object as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.Material | THREE.Material[]
      >;
      // Get the sephirah data from the userData
      const sephirahInfo = sphere.userData.sephirahInfo;

      if (sephirahInfo && onSephirahClick) {
        // Find traditional meaning for this sephirah
        let traditionalDescription = "";
        if (treeRef.current) {
          const traditionalSephiroth = treeRef.current.sephiroth.find(
            (s) => s.id === sephirahInfo.id
          );
          if (traditionalSephiroth) {
            // Store traditional data separately from personalized interpretation
            traditionalDescription = traditionalSephiroth.description || "";
          }
        }

        // Create enhanced data object with all relevant info
        const enhancedInfo = {
          ...sephirahInfo,
          title: `${sephirahInfo.number}. ${sephirahInfo.name}`,
          fullName: sephirahInfo.displayName || sephirahInfo.name,
          hebrewName: sephirahInfo.hebrewName,
          description: traditionalDescription, // Traditional description
          interpretation: sephirahInfo.interpretation, // Personalized interpretation
          position: Array.from(sphere.position),
          color: sephirahInfo.color,
          // Add additional traditional attributes if available
          divineName: sephirahInfo.divineName,
          archangel: sephirahInfo.archangel,
          angelicChoir: sephirahInfo.angelicChoir,
          spiritualExperience: sephirahInfo.spiritualExperience,
          virtue: sephirahInfo.virtue,
          vice: sephirahInfo.vice,
          world: sephirahInfo.world,
          pillar: sephirahInfo.pillar,
        };

        onSephirahClick(enhancedInfo);
      }
      return;
    }

    // Check for line intersections
    const lineIntersects = raycasterRef.current.intersectObjects(
      linesRef.current
    );
    if (lineIntersects.length > 0) {
      const line = lineIntersects[0].object as THREE.Line<
        THREE.BufferGeometry,
        THREE.Material | THREE.Material[]
      >;

      // Get path info from userData
      const pathInfo = line.userData.pathInfo;

      if (pathInfo && onPathClick) {
        // Find source and target sephiroth
        const sourceSephirah = treeRef.current.sephiroth.find(
          (s) => s.id === pathInfo.sourceId
        );
        const targetSephirah = treeRef.current.sephiroth.find(
          (s) => s.id === pathInfo.targetId
        );

        // Find traditional meaning for this path
        let traditionalDescription = "";
        if (treeRef.current) {
          const traditionalPath = treeRef.current.paths.find(
            (p) =>
              (p.sourceId === pathInfo.sourceId &&
                p.targetId === pathInfo.targetId) ||
              (p.sourceId === pathInfo.targetId &&
                p.targetId === pathInfo.sourceId)
          );
          if (traditionalPath) {
            // Store traditional data separately
            traditionalDescription = traditionalPath.description || "";
          }
        }

        // Create enhanced data object with connection context
        const enhancedInfo = {
          ...pathInfo,
          title:
            pathInfo.name || `Path ${pathInfo.sourceId}-${pathInfo.targetId}`,
          description: traditionalDescription, // Traditional description
          interpretation: pathInfo.interpretation, // Personalized interpretation
          sourceName: sourceSephirah?.name || `Sephirah ${pathInfo.sourceId}`,
          targetName: targetSephirah?.name || `Sephirah ${pathInfo.targetId}`,
          hebrewLetter: pathInfo.hebrewLetter,
          tarotCard: pathInfo.tarotCard,
          element: pathInfo.element,
          astrologicalCorrespondence: pathInfo.astrologicalCorrespondence,
          color: pathInfo.color,
        };

        onPathClick(enhancedInfo);
      }
    }
  };

  const checkHover = () => {
    if (!cameraRef.current || !sceneRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    // Increase the precision for raycasting
    raycasterRef.current.params.Line = { threshold: 0.2 };
    raycasterRef.current.params.Points = { threshold: 0.2 };

    // Reset all hover states
    spheresRef.current.forEach((sphere) => {
      // Use type assertion to access material property
      const meshSphere = sphere as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      >;
      if (meshSphere.material) {
        meshSphere.material.emissiveIntensity = 0.8; // Match the static emissive intensity
      }
      // Reset scale to normal
      sphere.scale.set(1, 1, 1);
    });

    linesRef.current.forEach((line) => {
      // Use type assertion to access material property
      const lineMesh = line as THREE.Line<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      >;
      if (lineMesh.material) {
        lineMesh.material.opacity = 0.6;
      }
    });

    // Check for sphere intersections
    const sphereIntersects = raycasterRef.current.intersectObjects(
      spheresRef.current
    );
    if (sphereIntersects.length > 0) {
      const hoveredSphere = sphereIntersects[0].object as THREE.Mesh<
        THREE.BufferGeometry,
        THREE.MeshStandardMaterial
      >;
      if (hoveredSphere.material) {
        hoveredSphere.material.emissiveIntensity = 1.5; // Higher intensity on hover
      }

      // Scale up slightly on hover
      hoveredSphere.scale.set(1.15, 1.15, 1.15);

      if (containerRef.current) {
        containerRef.current.style.cursor = "pointer";
      }
      return;
    }

    // Check for line intersections
    const lineIntersects = raycasterRef.current.intersectObjects(
      linesRef.current
    );
    if (lineIntersects.length > 0) {
      const hoveredLine = lineIntersects[0].object as THREE.Line<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      >;
      if (hoveredLine.material) {
        hoveredLine.material.opacity = 1.0; // More visible on hover
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

    // Get tree data
    const tree = treeRef.current;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      tree.visualSettings?.backgroundColor || 0x0a0a25
    );
    sceneRef.current = scene;

    // Initialize camera with adjusted settings to better fit container
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    // Adjust initial position to better fit the tree
    camera.position.z = tree.visualSettings?.cameraDistance || 25;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = tree.visualSettings?.lightIntensity || 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enabled = tree.interactiveFeatures?.allowRotation !== false;

    // Create a reusable control change handler function
    const handleControlChange = () => {
      // Update text orientation with camera position
      scene.traverse((object) => {
        if (object.type === "Sprite" && object.name.startsWith("label-")) {
          // This ensures the sprite always faces the camera
          object.lookAt(camera.position);
        }
      });
    };

    // Store the handler for later cleanup
    controlChangeHandlerRef.current = handleControlChange;

    // Add event listener to make sure text always faces camera after control interaction
    controls.addEventListener("change", handleControlChange);

    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add a second directional light from below for additional lighting
    const bottomLight = new THREE.DirectionalLight(0x7080ff, 0.6);
    bottomLight.position.set(0, -10, 5);
    scene.add(bottomLight);

    // Add event listeners for mouse interactions
    containerRef.current.addEventListener("mousemove", handleMouseMove);
    containerRef.current.addEventListener("click", handleClick);

    // Resize handler
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

    // Call updateScene to initialize visualization
    updateScene();

    // Animation loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Position sprites to the sides of spheres
      if (cameraRef.current) {
        // Get camera position and direction
        const cameraPosition = new THREE.Vector3();
        cameraRef.current.getWorldPosition(cameraPosition);

        // Update all sprites
        scene.traverse((object) => {
          if (object.type === "Sprite" && object.name.startsWith("label-")) {
            const sprite = object as THREE.Sprite;
            const sphere = sprite.userData.sphereRef as THREE.Mesh<
              THREE.BufferGeometry,
              THREE.Material | THREE.Material[]
            >;

            if (sphere) {
              // Get sphere position in world space
              const spherePos = sphere.position;

              // Determine if this is a left or right sphere based on x position
              // Place label on the outside of the tree
              const isRightSideSphere = spherePos.x > 0;

              // For central spheres (Keter, Tiferet, Yesod, Malkuth), position based on their position in the tree
              let horizontalOffset;
              if (Math.abs(spherePos.x) < 0.1) {
                // This is a central sphere - alternate left/right based on position
                // Bottom spheres (Yesod, Malkuth) labels go right
                // Top spheres (Keter, Tiferet) labels go left
                horizontalOffset = spherePos.y < 0 ? 3.5 : -3.5;
              } else {
                // For side spheres, place on the outer edge
                horizontalOffset = isRightSideSphere ? 3.5 : -3.5;
              }

              // Create base position aligned with sphere but offset horizontally
              const basePosition = new THREE.Vector3(
                sphere.position.x + horizontalOffset,
                sphere.position.y,
                sphere.position.z
              );

              // Update sprite position
              sprite.position.copy(basePosition);

              // Make sprite face camera for readability
              sprite.lookAt(cameraPosition);

              // Ensure highest render order
              sprite.renderOrder = 2000;
            }
          }
        });
      }

      // Only animate the path lines if enabled
      if (tree.interactiveFeatures?.enablePathAnimations !== false) {
        linesRef.current.forEach((line, i) => {
          const lineMesh = line as THREE.Line<
            THREE.BufferGeometry,
            THREE.LineBasicMaterial
          >;
          if (lineMesh.material) {
            const pulseTime =
              Date.now() *
                0.001 *
                (tree.visualSettings?.animationSpeed || 0.5) +
              i * 0.2;
            lineMesh.material.opacity = 0.6 + Math.sin(pulseTime) * 0.2;
          }
        });
      }

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

      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("click", handleClick);

      // Remove controls event listener with the stored handler function
      controlsRef.current?.removeEventListener(
        "change",
        controlChangeHandlerRef.current
      );

      // Dispose of all scene objects and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          // Dispose of geometries
          if (object.type === "Mesh" || object.type === "Line") {
            const mesh = object as THREE.Mesh<
              THREE.BufferGeometry,
              THREE.Material | THREE.Material[]
            >;
            if (mesh.geometry) {
              mesh.geometry.dispose();
            }

            // Dispose of materials
            if (mesh.material) {
              const material = mesh.material;
              if (Array.isArray(material)) {
                material.forEach((m) => m.dispose());
              } else {
                material.dispose();
              }
            }
          }

          // Dispose of sprite materials and textures
          if (object.type === "Sprite") {
            const sprite = object as THREE.Sprite;
            if (sprite.material) {
              const material = sprite.material as THREE.SpriteMaterial;
              if (material.map) {
                material.map.dispose();
              }
              material.dispose();
            }
          }
        });
      }

      // Clear reference arrays
      spheresRef.current = [];
      linesRef.current = [];

      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }

      // Clear references to prevent memory leaks
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [onSephirahClick, onPathClick]);

  // Expose methods that can be called by the parent component
  React.useImperativeHandle(ref, () => ({
    resetCamera,
    zoomIn,
    zoomOut,
  }));

  return <div ref={containerRef} className="absolute inset-0" />;
});

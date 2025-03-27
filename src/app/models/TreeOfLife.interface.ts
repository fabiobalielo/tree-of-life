/**
 * Static path data that doesn't change between interpretations
 */
interface PathStructure {
  /** Source Sephirah ID */
  sourceId: number;
  /** Target Sephirah ID */
  targetId: number;
  /** Hebrew letter associated with this path */
  hebrewLetter?: string;
  /** Name of the path/letter */
  name: string;
  /** Whether this path should be curved */
  curved?: boolean;
  /** Control point position for curved paths [x, y, z] */
  controlPoint?: [number, number, number];
  /** Tarot card associated with this path */
  tarotCard?: string;
  /** Element associated with this path */
  element?: string;
  /** Astrological correspondence */
  astrologicalCorrespondence?: string;
  /** Description of the path */
  description?: string;
  /** Color of the path */
  color?: string | number;
  /** Render options for the path */
  renderOptions?: {
    thickness?: number;
    opacity?: number;
    animated?: boolean;
  };
}

/**
 * Dynamic path interpretation data that comes from the agent
 */
interface PathInterpretation {
  /** Source Sephirah ID */
  sourceId: number;
  /** Target Sephirah ID */
  targetId: number;
  /** Personalized description of the path's meaning */
  description: string;
  /** Color to use for rendering this path */
  color?: string | number;
  /** Rendering properties that can be customized */
  renderOptions?: {
    /** Path thickness (0.05-0.25) */
    thickness?: number;
    /** Path opacity (0.3-1.0) */
    opacity?: number;
  };
}

/**
 * Static Sephirah data that doesn't change between interpretations
 */
interface SephirahStructure {
  /** Unique identifier for this Sephirah (1-10) */
  id: number;
  /** English name of the Sephirah */
  name: string;
  /** Hebrew name of the Sephirah */
  hebrewName: string;
  /** Display name (can be combined or formatted differently) */
  displayName?: string;
  /** Position in 3D space [x, y, z] - This should never change */
  position: [number, number, number];
  /** Number associated with this Sephirah (1-10) */
  number: number;
  /** Color to use for rendering this Sephirah */
  color?: string | number;
  /** Description of the Sephirah */
  description?: string;
  /** Divine name associated with this Sephirah */
  divineName?: string;
  /** Archangel associated with this Sephirah */
  archangel?: string;
  /** Angelic choir associated with this Sephirah */
  angelicChoir?: string;
  /** Mundane chakra associated with this Sephirah */
  mundaneChakra?: string;
  /** The world/plane this Sephirah belongs to */
  world?: "Atziluth" | "Briah" | "Yetzirah" | "Assiah";
  /** Pillar this Sephirah belongs to */
  pillar?: "Severity" | "Mercy" | "Equilibrium";
  /** Spiritual experience associated with this Sephirah */
  spiritualExperience?: string;
  /** Virtue associated with this Sephirah */
  virtue?: string;
  /** Vice associated with this Sephirah */
  vice?: string;
  /** Custom rendering options */
  renderOptions?: {
    size?: number;
    glowIntensity?: number;
    glowColor?: string | number;
    textScale?: number;
  };
}

/**
 * Dynamic Sephirah interpretation data that comes from the agent
 */
interface SephirahInterpretation {
  /** Sephirah ID to match with the structure */
  id: number;
  /** Personalized description of the Sephirah's meaning */
  description: string;
  /** Color to use for rendering this Sephirah */
  color: string | number;
  /** Custom rendering properties that can be modified */
  renderOptions?: {
    /** Glow intensity (0.3-1.5) */
    glowIntensity?: number;
    /** Glow color, defaults to sphere color if not specified */
    glowColor?: string | number;
  };
}

/**
 * Tree of Life structure that remains constant
 */
interface TreeOfLifeStructure {
  /** Layout type */
  layout: "traditional";
  /** Array of all Sephiroth structures */
  sephiroth: SephirahStructure[];
  /** Array of all path structures */
  paths: PathStructure[];
  /** Visual settings for rendering */
  visualSettings: {
    backgroundColor: number;
    lightIntensity: number;
    pathThickness: number;
    sphereSize: number;
    textLabelSize: number;
    showHebrewNames: boolean;
    showEnglishNames: boolean;
    showNumbers: boolean;
    cameraDistance?: number;
    textLabelFont?: string;
    animationSpeed?: number;
    highlightOnHover?: boolean;
    showTooltips?: boolean;
    renderQuality?: "low" | "medium" | "high";
    effectsEnabled?: boolean;
  };
  /** Name of the structure */
  name?: string;
  /** Description of the structure */
  description?: string;
  /** Interactive features configuration */
  interactiveFeatures?: {
    allowRotation?: boolean;
    allowZoom?: boolean;
    allowPan?: boolean;
    explodedViewEnabled?: boolean;
    enablePathAnimations?: boolean;
    enableSpheresAnimations?: boolean;
    clickBehavior?: string;
  };
}

/**
 * Dynamic interpretation data for the Tree of Life
 */
interface TreeOfLifeInterpretation {
  /** Name of this personalized tree */
  name: string;
  /** Overall description of this interpretation */
  description: string;
  /** Personalized Sephiroth interpretations */
  sephiroth: SephirahInterpretation[];
  /** Personalized path interpretations */
  paths: PathInterpretation[];
  /** When this interpretation was created */
  timestamp?: string;
}

/**
 * Combined Tree of Life with both structure and interpretation
 */
interface TreeOfLife {
  /** Unique identifier for this tree */
  id?: string;
  /** Name of this tree configuration */
  name: string;
  /** Description of this tree */
  description: string;
  /** Array of all Sephiroth (structure + interpretation) */
  sephiroth: (SephirahStructure & Partial<SephirahInterpretation>)[];
  /** Array of all paths (structure + interpretation) */
  paths: (PathStructure & Partial<PathInterpretation>)[];
  /** Layout type */
  layout: "traditional" | "four-worlds" | "jacob's-ladder" | "custom";
  /** Whether to include Daat */
  includeDaat?: boolean;
  /** Whether to show worlds */
  showWorlds?: boolean;
  /** Whether to show pillars */
  showPillars?: boolean;
  /** Pillar configuration */
  pillars?: {
    severity?: {
      color?: number;
      opacity?: number;
      width?: number;
    };
    mercy?: {
      color?: number;
      opacity?: number;
      width?: number;
    };
    equilibrium?: {
      color?: number;
      opacity?: number;
      width?: number;
    };
  };
  /** Color scheme name */
  colorScheme?: string;
  /** Visual settings for rendering */
  visualSettings?: {
    backgroundColor?: number;
    lightIntensity?: number;
    pathThickness?: number;
    sphereSize?: number;
    textLabelSize?: number;
    showHebrewNames?: boolean;
    showEnglishNames?: boolean;
    showNumbers?: boolean;
    cameraDistance?: number;
    textLabelFont?: string;
    animationSpeed?: number;
    highlightOnHover?: boolean;
    showTooltips?: boolean;
    renderQuality?: "low" | "medium" | "high";
    effectsEnabled?: boolean;
  };
  /** Metadata */
  metadata?: {
    lastModified?: string;
    creator?: string;
    dateCreated?: string;
    tradition?: string;
    tags?: string[];
  };
  /** Interactive features configuration */
  interactiveFeatures?: {
    allowRotation?: boolean;
    allowZoom?: boolean;
    allowPan?: boolean;
    explodedViewEnabled?: boolean;
    enablePathAnimations?: boolean;
    enableSpheresAnimations?: boolean;
    clickBehavior?: string;
  };
}

export type {
  TreeOfLife,
  TreeOfLifeStructure,
  TreeOfLifeInterpretation,
  SephirahStructure,
  SephirahInterpretation,
  PathStructure,
  PathInterpretation,
};

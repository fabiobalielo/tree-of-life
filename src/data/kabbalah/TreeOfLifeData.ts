import {
  TreeOfLife,
  SephirahStructure as Sephirah,
  PathStructure as Path,
} from "../../app/models/TreeOfLife.interface";

// Hebrew letters for paths
const HEBREW_LETTERS = [
  "א", // Aleph
  "ב", // Beth
  "ג", // Gimel
  "ד", // Daleth
  "ה", // Heh
  "ו", // Vav
  "ז", // Zayin
  "ח", // Cheth
  "ט", // Teth
  "י", // Yod
  "כ", // Kaph
  "ל", // Lamed
  "מ", // Mem
  "נ", // Nun
  "ס", // Samekh
  "ע", // Ayin
  "פ", // Peh
  "צ", // Tzaddi
  "ק", // Qoph
  "ר", // Resh
  "ש", // Shin
  "ת", // Tav
];

// Define the Sephiroth using our interface
const sephirothData: Sephirah[] = [
  {
    id: 1,
    name: "Keter",
    hebrewName: "כתר",
    displayName: "CROWN - KETHER",
    position: [0, 11, 0],
    color: 0xffffff,
    description:
      "Crown - The highest and most abstract of the Sephirot, representing divine will and the beginning of conscious thought.",
    number: 1,
    divineName: "Eheieh",
    archangel: "Metatron",
    angelicChoir: "Chayot Ha-Kodesh",
    mundaneChakra: "Primum Mobile",
    spiritualExperience: "Union with God",
    virtue: "Completion",
    vice: "None",
    pillar: "Equilibrium",
    world: "Atziluth",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0xffffff,
    },
  },
  {
    id: 2,
    name: "Chokmah",
    hebrewName: "חכמה",
    displayName: "WISDOM - CHOKMAH",
    position: [5, 8, 0],
    color: 0x9e9e9e,
    description:
      "Wisdom - The primary masculine energy, representing pure intellectuality and the beginning of conscious awareness.",
    number: 2,
    divineName: "Yah",
    archangel: "Raziel",
    angelicChoir: "Ophanim",
    mundaneChakra: "Zodiac",
    spiritualExperience: "Vision of God",
    virtue: "Devotion",
    vice: "None",
    pillar: "Mercy",
    world: "Atziluth",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0x9e9e9e,
    },
  },
  {
    id: 3,
    name: "Binah",
    hebrewName: "בינה",
    displayName: "UNDERSTANDING - BINAH",
    position: [-5, 8, 0],
    color: 0x5e5ca7,
    description:
      "Understanding - The primary feminine energy, representing contemplation, understanding, and deductive reasoning.",
    number: 3,
    divineName: "YHVH Elohim",
    archangel: "Tzaphkiel",
    angelicChoir: "Aralim",
    mundaneChakra: "Saturn",
    spiritualExperience: "Vision of Sorrow",
    virtue: "Silence",
    vice: "Avarice",
    pillar: "Severity",
    world: "Atziluth",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0x5e5ca7,
    },
  },
  {
    id: 4,
    name: "Chesed",
    hebrewName: "חסד",
    displayName: "MERCY - CHESED",
    position: [5, 3.5, 0],
    color: 0x4a90e2,
    description:
      "Mercy/Loving-kindness - Represents grace, benevolence, and the desire to emulate God by bestowing goodness.",
    number: 4,
    divineName: "El",
    archangel: "Tzadkiel",
    angelicChoir: "Chasmalim",
    mundaneChakra: "Jupiter",
    spiritualExperience: "Vision of Love",
    virtue: "Obedience",
    vice: "Bigotry",
    pillar: "Mercy",
    world: "Briah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0x4a90e2,
    },
  },
  {
    id: 5,
    name: "Geburah",
    hebrewName: "גבורה",
    displayName: "STRENGTH - GEBURAH",
    position: [-5, 3.5, 0],
    color: 0xf54242,
    description:
      "Severity/Judgment - Represents the power of judgment, limitation, and the setting of boundaries.",
    number: 5,
    divineName: "Elohim Gibor",
    archangel: "Khamael",
    angelicChoir: "Seraphim",
    mundaneChakra: "Mars",
    spiritualExperience: "Vision of Power",
    virtue: "Energy, Courage",
    vice: "Cruelty, Destruction",
    pillar: "Severity",
    world: "Briah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0xf54242,
    },
  },
  {
    id: 6,
    name: "Tiferet",
    hebrewName: "תפארת",
    displayName: "BEAUTY - TIPHARETH",
    position: [0, 2, 0],
    color: 0xfbda3c,
    description:
      "Beauty/Harmony - The central Sephirah, representing balance, harmony, and integration between mercy and judgment.",
    number: 6,
    divineName: "YHVH Eloah Va-Da'at",
    archangel: "Raphael",
    angelicChoir: "Malakim",
    mundaneChakra: "Sun",
    spiritualExperience: "Vision of Harmony",
    virtue: "Devotion to the Great Work",
    vice: "Pride",
    pillar: "Equilibrium",
    world: "Briah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0xfbda3c,
    },
  },
  {
    id: 7,
    name: "Netzach",
    hebrewName: "נצח",
    displayName: "VICTORY - NETZACH",
    position: [5, -1, 0],
    color: 0x7ed321,
    description:
      "Victory/Eternity - Represents the emotions, passion, and the driving force of feelings in human experience.",
    number: 7,
    divineName: "YHVH Tzabaoth",
    archangel: "Haniel",
    angelicChoir: "Elohim",
    mundaneChakra: "Venus",
    spiritualExperience: "Vision of Beauty",
    virtue: "Unselfishness",
    vice: "Lust",
    pillar: "Mercy",
    world: "Yetzirah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0x7ed321,
    },
  },
  {
    id: 8,
    name: "Hod",
    hebrewName: "הוד",
    displayName: "SPLENDOR - HOD",
    position: [-5, -1, 0],
    color: 0xff9a00,
    description:
      "Splendor/Glory - Represents intellect applied to emotions, the rational analysis of feelings.",
    number: 8,
    divineName: "Elohim Tzabaoth",
    archangel: "Michael",
    angelicChoir: "Beni Elohim",
    mundaneChakra: "Mercury",
    spiritualExperience: "Vision of Splendor",
    virtue: "Truthfulness",
    vice: "Falsehood",
    pillar: "Severity",
    world: "Yetzirah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0xff9a00,
    },
  },
  {
    id: 9,
    name: "Yesod",
    hebrewName: "יסוד",
    displayName: "FOUNDATION - YESOD",
    position: [0, -4.5, 0],
    color: 0x9013fe,
    description:
      "Foundation - Acts as a channel between the upper Sephirot and Malkuth, representing the unconscious and dreams.",
    number: 9,
    divineName: "Shaddai El Chai",
    archangel: "Gabriel",
    angelicChoir: "Kerubim",
    mundaneChakra: "Moon",
    spiritualExperience: "Vision of the Machinery of the Universe",
    virtue: "Independence",
    vice: "Idleness",
    pillar: "Equilibrium",
    world: "Yetzirah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0x9013fe,
    },
  },
  {
    id: 10,
    name: "Malkuth",
    hebrewName: "מלכות",
    displayName: "KINGDOM - MALKUTH",
    position: [0, -10, 0],
    color: 0xbda47c,
    description:
      "Kingdom - The final Sephirah, representing the physical world, manifestation, and divine presence in reality.",
    number: 10,
    divineName: "Adonai Melekh",
    archangel: "Sandalphon",
    angelicChoir: "Ashim",
    mundaneChakra: "Earth",
    spiritualExperience: "Vision of the Holy Guardian Angel",
    virtue: "Discrimination",
    vice: "Avarice, Inertia",
    pillar: "Equilibrium",
    world: "Assiah",
    renderOptions: {
      size: 1.2,
      glowIntensity: 0.8,
      glowColor: 0xbda47c,
    },
  },
];

// Path connections
const connectionIndices = [
  [0, 1], // Keter to Chokmah
  [0, 2], // Keter to Binah
  [0, 5], // Keter to Tiferet
  [1, 2], // Chokmah to Binah
  [1, 3], // Chokmah to Chesed
  [2, 4], // Binah to Geburah
  [2, 5], // Binah to Tiferet
  [3, 4], // Chesed to Geburah
  [3, 5], // Chesed to Tiferet
  [3, 6], // Chesed to Netzach
  [4, 5], // Geburah to Tiferet
  [4, 7], // Geburah to Hod
  [5, 6], // Tiferet to Netzach
  [5, 7], // Tiferet to Hod
  [5, 8], // Tiferet to Yesod
  [6, 7], // Netzach to Hod
  [6, 8], // Netzach to Yesod
  [7, 8], // Hod to Yesod
  [8, 9], // Yesod to Malkuth
  [1, 5], // Chokmah to Tiferet
  [6, 9], // Netzach to Malkuth
  [7, 9], // Hod to Malkuth
];

// Path colors based on their position and the connected sephiroth
const PATH_COLORS = [
  0xf6e58d, // Yellow (Aleph)
  0xbadc58, // Green (Beth)
  0xff9ff3, // Pink (Gimel)
  0xffbe76, // Orange (Daleth)
  0xff6b6b, // Red (Heh)
  0x48dbfb, // Light Blue (Vav)
  0xc7ecee, // Cyan (Zayin)
  0x7ed6df, // Turquoise (Cheth)
  0xe056fd, // Purple (Teth)
  0xfeca57, // Gold (Yod)
  0xff9f43, // Dark Orange (Kaph)
  0x1dd1a1, // Green (Lamed)
  0x00d2d3, // Teal (Mem)
  0x54a0ff, // Blue (Nun)
  0x5f27cd, // Indigo (Samekh)
  0x341f97, // Dark Purple (Ayin)
  0xee5253, // Red (Peh)
  0x01a3a4, // Dark Teal (Tzaddi)
  0xffd32a, // Yellow (Qoph)
  0x0abde3, // Light Blue (Resh)
  0xfc5c65, // Red (Shin)
  0x8854d0, // Purple (Tav)
];

// Path information
const pathInfo = [
  {
    name: "Aleph",
    description:
      "Path between Keter and Chokmah - Associated with spiritual beginnings and the element of air.",
    tarotCard: "The Fool",
    element: "Air",
    astrologicalCorrespondence: "Air",
  },
  {
    name: "Beth",
    description:
      "Path between Keter and Binah - Represents consciousness and duality.",
    tarotCard: "The Magician",
    element: "Mercury",
    astrologicalCorrespondence: "Mercury",
  },
  {
    name: "Gimel",
    description:
      "Path between Keter and Tiferet - Direct connection between the divine crown and the balanced heart of the tree.",
    tarotCard: "The High Priestess",
    element: "Moon",
    astrologicalCorrespondence: "Moon",
  },
  {
    name: "Daleth",
    description:
      "Path between Chokmah and Binah - Symbolizes the unification of opposites.",
    tarotCard: "The Empress",
    element: "Venus",
    astrologicalCorrespondence: "Venus",
  },
  {
    name: "Heh",
    description:
      "Path between Chokmah and Chesed - Represents doorways and transitions.",
    tarotCard: "The Emperor",
    element: "Aries",
    astrologicalCorrespondence: "Aries",
  },
  {
    name: "Vav",
    description:
      "Path between Binah and Geburah - Associated with vision and observation.",
    tarotCard: "The Hierophant",
    element: "Taurus",
    astrologicalCorrespondence: "Taurus",
  },
  {
    name: "Zayin",
    description:
      "Path between Binah and Tiferet - Symbolizes connection and linkage.",
    tarotCard: "The Lovers",
    element: "Gemini",
    astrologicalCorrespondence: "Gemini",
  },
  {
    name: "Cheth",
    description:
      "Path between Chesed and Geburah - Represents the sword of discrimination, a direct balance between mercy and severity.",
    tarotCard: "The Chariot",
    element: "Cancer",
    astrologicalCorrespondence: "Cancer",
  },
  {
    name: "Teth",
    description:
      "Path between Chesed and Tiferet - Symbolizes the fence or boundary.",
    tarotCard: "Strength",
    element: "Leo",
    astrologicalCorrespondence: "Leo",
  },
  {
    name: "Yod",
    description:
      "Path between Chesed and Netzach - Associated with strength and courage.",
    tarotCard: "The Hermit",
    element: "Virgo",
    astrologicalCorrespondence: "Virgo",
  },
  {
    name: "Kaph",
    description:
      "Path between Geburah and Tiferet - Represents the pointing hand or divine spark.",
    tarotCard: "Wheel of Fortune",
    element: "Jupiter",
    astrologicalCorrespondence: "Jupiter",
  },
  {
    name: "Lamed",
    description:
      "Path between Geburah and Hod - Symbolizes the grasping hand and receptivity.",
    tarotCard: "Justice",
    element: "Libra",
    astrologicalCorrespondence: "Libra",
  },
  {
    name: "Mem",
    description:
      "Path between Tiferet and Netzach - Associated with balance and equilibrium.",
    tarotCard: "The Hanged Man",
    element: "Water",
    astrologicalCorrespondence: "Water",
  },
  {
    name: "Nun",
    description:
      "Path between Tiferet and Hod - Represents water and the unconscious.",
    tarotCard: "Death",
    element: "Scorpio",
    astrologicalCorrespondence: "Scorpio",
  },
  {
    name: "Samekh",
    description:
      "Path between Tiferet and Yesod - Symbolizes transformation and death.",
    tarotCard: "Temperance",
    element: "Sagittarius",
    astrologicalCorrespondence: "Sagittarius",
  },
  {
    name: "Ayin",
    description:
      "Path between Netzach and Hod - Associated with support and foundation.",
    tarotCard: "The Devil",
    element: "Capricorn",
    astrologicalCorrespondence: "Capricorn",
  },
  {
    name: "Peh",
    description:
      "Path between Netzach and Yesod - Represents the eye and perception.",
    tarotCard: "The Tower",
    element: "Mars",
    astrologicalCorrespondence: "Mars",
  },
  {
    name: "Tzaddi",
    description:
      "Path between Hod and Yesod - Symbolizes the mouth and expression.",
    tarotCard: "The Star",
    element: "Aquarius",
    astrologicalCorrespondence: "Aquarius",
  },
  {
    name: "Qoph",
    description:
      "Path between Yesod and Malkuth - Associated with meditation and spiritual pursuits.",
    tarotCard: "The Moon",
    element: "Pisces",
    astrologicalCorrespondence: "Pisces",
  },
  {
    name: "Resh",
    description:
      "Path between Chokmah and Tiferet - Represents the head and consciousness.",
    tarotCard: "The Sun",
    element: "Sun",
    astrologicalCorrespondence: "Sun",
  },
  {
    name: "Shin",
    description:
      "Path between Netzach and Malkuth - Associated with fire and transformation.",
    tarotCard: "Judgment",
    element: "Fire",
    astrologicalCorrespondence: "Fire",
  },
  {
    name: "Tav",
    description:
      "Path between Hod and Malkuth - Represents completion and perfection.",
    tarotCard: "The World",
    element: "Saturn",
    astrologicalCorrespondence: "Saturn",
  },
];

// Define paths with our interface
const pathsData: Path[] = connectionIndices.map(
  ([sourceIdx, targetIdx], index) => {
    // Convert 0-based indices to 1-based IDs
    const sourceId = sourceIdx + 1;
    const targetId = targetIdx + 1;
    const pathColor = PATH_COLORS[index];
    const info = pathInfo[index];

    // Special case for the curved path from Chesed to Geburah
    const isCurved = sourceIdx === 3 && targetIdx === 4;
    let controlPoint: [number, number, number] | undefined;

    if (isCurved) {
      controlPoint = [0, 9, 0]; // Control point above Tiferet
    }

    return {
      sourceId,
      targetId,
      hebrewLetter: HEBREW_LETTERS[index],
      name: info.name,
      description: info.description,
      color: pathColor,
      curved: isCurved,
      controlPoint,
      tarotCard: info.tarotCard,
      element: info.element,
      astrologicalCorrespondence: info.astrologicalCorrespondence,
      renderOptions: {
        thickness: 0.12,
        opacity: 0.8,
        animated: true,
      },
    };
  }
);

// Create the Tree of Life object
export const traditionalTreeOfLife: TreeOfLife = {
  id: "traditional-tree",
  name: "Traditional Kabbalistic Tree of Life",
  description:
    "The classic representation of the Kabbalistic Tree of Life with 10 Sephiroth and 22 paths",
  sephiroth: sephirothData,
  paths: pathsData,
  layout: "traditional",
  includeDaat: false,
  showWorlds: true,
  showPillars: true,
  pillars: {
    severity: {
      color: 0xf54242, // Red
      opacity: 0.3,
      width: 0.5,
    },
    mercy: {
      color: 0x4a90e2, // Blue
      opacity: 0.3,
      width: 0.5,
    },
    equilibrium: {
      color: 0xfbda3c, // Gold
      opacity: 0.3,
      width: 0.5,
    },
  },
  visualSettings: {
    backgroundColor: 0x0a0a25,
    lightIntensity: 1.2,
    cameraDistance: 25,
    textLabelSize: 4.0,
    textLabelFont: "Arial",
    showHebrewNames: true,
    showEnglishNames: true,
    showNumbers: true,
    pathThickness: 0.12,
    sphereSize: 1.2,
    animationSpeed: 0.5,
    highlightOnHover: true,
    showTooltips: true,
    renderQuality: "high",
    effectsEnabled: true,
  },
  colorScheme: "traditional",
  metadata: {
    creator: "System",
    dateCreated: new Date().toISOString(),
    tradition: "Kabbalah",
    tags: ["Traditional", "Kabbalah", "Sephiroth", "Paths"],
  },
  interactiveFeatures: {
    allowRotation: true,
    allowZoom: true,
    allowPan: true,
    explodedViewEnabled: false,
    enablePathAnimations: true,
    enableSpheresAnimations: false,
    clickBehavior: "showDetails",
  },
};

export default traditionalTreeOfLife;

// Mock dataset and simulator engine for VisionInspect AI

export const SAMPLES = {
  pcb: {
    id: "pcb",
    name: "Industrial PCB Controller",
    description: "Multilayer electronics board from assembly line 4",
    imageUrl: "/samples/pcb.png",
    anomalies: [
      {
        tags: ["solder bridge", "short circuit", "solder blob", "bridge"],
        box: { x: 38, y: 42, width: 14, height: 16 },
        label: "Solder Bridge",
        confidence: 0.948,
        severity: "critical",
        details: "Bridged connection detected between pin 14 and pin 15 of microcontroller U3. High risk of electrical short."
      },
      {
        tags: ["missing component", "missing capacitor", "empty pad", "missing chip"],
        box: { x: 72, y: 25, width: 8, height: 12 },
        label: "Missing Capacitor",
        confidence: 0.921,
        severity: "warning",
        details: "Capacitor C18 is absent from its footprint. May cause voltage instability in long-term operations."
      },
      {
        tags: ["scratch", "board scratch", "abrasion"],
        box: { x: 15, y: 68, width: 22, height: 4 },
        label: "Surface Scratch",
        confidence: 0.875,
        severity: "info",
        details: "Minor cosmetic scratch on solder mask. No copper exposure detected. Safe for operation."
      }
    ]
  },
  turbine: {
    id: "turbine",
    name: "Gas Turbine Blade",
    description: "High-pressure alloy turbine component under inspection",
    imageUrl: "/samples/turbine.png",
    anomalies: [
      {
        tags: ["crack", "fracture", "hairline crack", "stress crack"],
        box: { x: 45, y: 35, width: 6, height: 28 },
        label: "Hairline Crack",
        confidence: 0.962,
        severity: "critical",
        details: "Vertical stress fracture detected along pressure side blade root. Structural integrity compromised. Action required."
      },
      {
        tags: ["corrosion", "rust", "oxidation", "pitting"],
        box: { x: 62, y: 18, width: 18, height: 15 },
        label: "Thermal Pit Corrosion",
        confidence: 0.894,
        severity: "warning",
        details: "Localized oxidation pits on coating surface. Monitor wear levels; blade re-coating recommended in next service cycle."
      }
    ]
  },
  solar: {
    id: "solar",
    name: "Photovoltaic Cell Array",
    description: "Monocrystalline silicon panel cell group",
    imageUrl: "/samples/solar.jpg",
    anomalies: [
      {
        tags: ["crack", "microcrack", "broken cell", "fracture"],
        box: { x: 22, y: 55, width: 16, height: 14 },
        label: "Micro-Fracture",
        confidence: 0.915,
        severity: "warning",
        details: "Internal micro-crack spanning cell boundary. Causes active efficiency drop of 4.2% on the current loop."
      },
      {
        tags: ["dust", "dirt", "soiling", "droppings", "stain"],
        box: { x: 55, y: 15, width: 25, height: 22 },
        label: "Soiling Accumulation",
        confidence: 0.957,
        severity: "info",
        details: "Heavy dust and debris concentration blocking light. Manual cleaning recommended to restore standard current output."
      }
    ]
  }
};

// Zero-Shot matching simulator
export function runZeroShotSimulation(sampleId, promptsText) {
  const sample = SAMPLES[sampleId];
  if (!sample) return { success: false, message: "Sample not found" };

  if (!promptsText || promptsText.trim() === "") {
    return {
      success: true,
      detections: [],
      message: "Please enter prompts to define target anomaly categories."
    };
  }

  // Parse prompt text (comma separated words)
  const userPrompts = promptsText
    .split(",")
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length > 0);

  const detections = [];
  
  // Search through known anomalies to see if user prompts match their tags
  sample.anomalies.forEach(anomaly => {
    // Check if any user prompt matches any tag of the anomaly
    const match = userPrompts.some(prompt => 
      anomaly.tags.some(tag => 
        tag.includes(prompt) || prompt.includes(tag)
      )
    );

    if (match) {
      detections.push({
        ...anomaly,
        // Add slight random variation to confidence to make it feel organic
        confidence: Math.min(0.999, Math.max(0.70, anomaly.confidence + (Math.random() * 0.04 - 0.02)))
      });
    }
  });

  return {
    success: true,
    detections: detections,
    message: detections.length > 0 
      ? `Successfully detected ${detections.length} zero-shot anomalies.` 
      : "No features matching specified prompts were found. Scanning complete."
  };
}

// Live Feed Stream Event Simulator
const CONVEYOR_ITEMS = [
  { name: "Cast Iron Rod", anomalyChance: 0.15, anomalies: ["rust", "microcrack"] },
  { name: "Microprocessor Module", anomalyChance: 0.25, anomalies: ["solder blob", "bent pin"] },
  { name: "Aluminium Bracket", anomalyChance: 0.18, anomalies: ["scratch", "casting hole"] },
  { name: "Ceramic Insulator", anomalyChance: 0.12, anomalies: ["surface chip", "crack"] }
];

export function generateLiveConveyorItem() {
  const itemType = CONVEYOR_ITEMS[Math.floor(Math.random() * CONVEYOR_ITEMS.length)];
  const isAnomaly = Math.random() < itemType.anomalyChance;
  
  if (isAnomaly) {
    const type = itemType.anomalies[Math.floor(Math.random() * itemType.anomalies.length)];
    return {
      name: itemType.name,
      status: "fail",
      anomalyType: type.charAt(0).toUpperCase() + type.slice(1),
      confidence: parseFloat((0.85 + Math.random() * 0.14).toFixed(3)),
      timestamp: new Date().toLocaleTimeString(),
      serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`
    };
  } else {
    return {
      name: itemType.name,
      status: "pass",
      anomalyType: null,
      confidence: parseFloat((0.96 + Math.random() * 0.038).toFixed(3)),
      timestamp: new Date().toLocaleTimeString(),
      serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`
    };
  }
}

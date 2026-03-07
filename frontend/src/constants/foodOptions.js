// ==================================================================
// --- DATA CONSTANTS ---
// ==================================================================

export const foodTypes = ['Cooked Rice', 'Milk', 'Paneer', 'Roti', 'Dal'];

// --- Rice Options ---
export const riceSmellOptions = ['Normal', 'Stale/Slightly Off', 'Sour/Fermented', 'Foul/Musty'];
export const riceAppearanceOptions = ['Normal/Glossy', 'Dull/Dry', 'Slimy/Discolored', 'Visible Mold'];
export const riceStorageOptions = ['Refrigerator', 'Room Temperature'];
export const riceCoolingOptions = ['Cooled in shallow container', 'Left to cool in deep pot', 'Not Applicable'];

// --- Milk Options ---
// Define Milk Types explicitly if needed for selection or logic later
export const milkTypes = ['Pasteurized (Pouch/Bottle)', 'UHT (Carton)', 'Raw/Loose'];

export const milkStorageOptions = [
  { label: 'Refrigerator', value: 'Refrigerator' },
  { label: 'Room Temperature', value: 'Room Temperature' },
];

export const milkBoiledOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const milkSmellOptions = [
  { label: 'Normal/Fresh', value: 'Normal/Fresh' },
  { label: 'Sour', value: 'Sour' },
  { label: 'Bitter/Unpleasant', value: 'Bitter/Unpleasant' },
  { label: 'Rancid/Soapy', value: 'Rancid/Soapy' },
];

export const milkConsistencyOptions = [
  { label: 'Normal/Smooth', value: 'Normal/Smooth' },
  { label: 'Thicker than usual', value: 'Thicker than usual' },
  { label: 'Small Lumps', value: 'Small Lumps' },
  { label: 'Thick Curds', value: 'Thick Curds' },
];
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  CalendarDays,
  Package,
  Archive,
  Droplet,
  Wind,
  Hand,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import SelectGroup from "../ui/SelectGroup";
import InputGroup from "../ui/InputGroup";

export default function PaneerForm({
  handleBack,
  setResult,
  setLoading,
  setApiError,
  loading,
}) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    is_cooked: "Cooked (in a dish)",
    days_since_purchase_or_cooked: "",
    paneer_type: "Packaged/Branded",
    storage_location: "Refrigerator",
    storage_container_raw: "Original packaging",
    observed_smell: "Normal/Sweetish",
    texture_surface: "Normal/Firm",
  });

  const [errors, setErrors] = useState({});

  // --- Derived State ---
  const isRawPaneer = useMemo(
    () => formData.is_cooked === "Raw (in a block)",
    [formData.is_cooked]
  );

  // --- Validation ---
  const validateForm = useCallback((currentData) => {
    const newErrors = {};
    const { days_since_purchase_or_cooked } = currentData;

    if (
      days_since_purchase_or_cooked === "" ||
      isNaN(days_since_purchase_or_cooked) ||
      parseFloat(days_since_purchase_or_cooked) < 0
    ) {
      newErrors.days_since_purchase_or_cooked =
        "Must be a valid number (0 or more).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  useEffect(() => {
    validateForm(formData);
  }, [formData, validateForm]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "days_since_purchase_or_cooked" && value.length > 3) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    setApiError(null);
    setResult(null);

    if (!validateForm(formData)) return;

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!isRawPaneer) payload.storage_container_raw = "Not Applicable";

      const res = await fetch("http://localhost:5000/api/predict/paneer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed.");
      setResult(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Serial Validation Logic ---
  const isCookedValid = formData.is_cooked.trim() !== "";
  const daysValid =
    formData.days_since_purchase_or_cooked.trim() !== "" &&
    !errors.days_since_purchase_or_cooked &&
    isCookedValid;
  const typeValid = formData.paneer_type.trim() !== "" && daysValid;
  const storageLocValid = formData.storage_location.trim() !== "" && typeValid;
  const rawStorageValid =
    !isRawPaneer ||
    (formData.storage_container_raw.trim() !== "" && storageLocValid);
  const smellValid = formData.observed_smell.trim() !== "" && rawStorageValid;
  const allValid = formData.texture_surface.trim() !== "" && smellValid;

  // --- Options ---
  const paneerCookedOptions = [
    { label: "Cooked (in a dish)", value: "Cooked (in a dish)" },
    { label: "Raw (in a block)", value: "Raw (in a block)" },
  ];

  const paneerTypeOptions = [
    { label: "Packaged/Branded", value: "Packaged/Branded" },
    { label: "Loose/Local", value: "Loose/Local" },
  ];

  const paneerStorageOptions = [
    { label: "Refrigerator", value: "Refrigerator" },
    { label: "Room Temperature", value: "Room Temperature" },
  ];

  const paneerRawStorageOptions = [
    { label: "Original packaging", value: "Original packaging" },
    { label: "Airtight container", value: "Airtight container" },
    { label: "Submerged in water (in fridge)", value: "Submerged in water (in fridge)" },
  ];

  const paneerSmellOptions = [
    { label: "Normal/Sweetish", value: "Normal/Sweetish" },
    { label: "Sour/Acidic", value: "Sour/Acidic" },
    { label: "Foul/Ammoniacal", value: "Foul/Ammoniacal" },
    { label: "Soapy/Rancid", value: "Soapy/Rancid" },
  ];

  const paneerTextureOptions = [
    { label: "Normal/Firm", value: "Normal/Firm" },
    { label: "Hard/Rubbery", value: "Hard/Rubbery" },
    { label: "Slimy/Sticky", value: "Slimy/Sticky" },
  ];

  return (
    <motion.div
      key="step1-paneer"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <SelectGroup
          label="Paneer State"
          name="is_cooked"
          value={formData.is_cooked}
          onChange={handleChange}
          icon={<Flame className="w-5 h-5 text-gray-400" />}
        >
          {paneerCookedOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>

        <InputGroup
          label="Days Since Purchase / Cooked"
          name="days_since_purchase_or_cooked"
          type="number"
          value={formData.days_since_purchase_or_cooked}
          onChange={handleChange}
          icon={<CalendarDays className="w-5 h-5 text-gray-400" />}
          error={errors.days_since_purchase_or_cooked}
          placeholder="e.g., 3"
          maxLength={3}
          disabled={!isCookedValid}
        />

        <SelectGroup
          label="Paneer Type"
          name="paneer_type"
          value={formData.paneer_type}
          onChange={handleChange}
          icon={<Package className="w-5 h-5 text-gray-400" />}
          disabled={!daysValid}
        >
          {paneerTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Storage Location"
          name="storage_location"
          value={formData.storage_location}
          onChange={handleChange}
          icon={<Archive className="w-5 h-5 text-gray-400" />}
          disabled={!typeValid}
        >
          {paneerStorageOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>

        {/* Conditional Section for Raw Paneer */}
        <div
          className={`transition-all duration-300 ${
            isRawPaneer ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          {isRawPaneer && (
            <SelectGroup
              label="Storage for Raw Paneer"
              name="storage_container_raw"
              value={formData.storage_container_raw}
              onChange={handleChange}
              icon={<Droplet className="w-5 h-5 text-gray-400" />}
              disabled={!storageLocValid}
              helperText="How the raw paneer block is stored."
            >
              {paneerRawStorageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectGroup>
          )}
        </div>

        <SelectGroup
          label="Observed Smell"
          name="observed_smell"
          value={formData.observed_smell}
          onChange={handleChange}
          icon={<Wind className="w-5 h-5 text-gray-400" />}
          disabled={!rawStorageValid}
        >
          {paneerSmellOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Observed Texture / Surface"
          name="texture_surface"
          value={formData.texture_surface}
          onChange={handleChange}
          icon={<Hand className="w-5 h-5 text-gray-400" />}
          disabled={!smellValid}
        >
          {paneerTextureOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={handleBack}
          className="py-3 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 font-semibold flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <button
          onClick={handlePredict}
          disabled={loading || !allValid}
          className="py-3 px-8 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
            </>
          ) : (
            "Predict"
          )}
        </button>
      </div>
    </motion.div>
  );
}

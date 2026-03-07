import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Hourglass,
  Clock,
  Wind,
  Eye,
  Archive,
  Thermometer,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import InputGroup from "../ui/InputGroup";
import SelectGroup from "../ui/SelectGroup";
import {
  riceSmellOptions,
  riceAppearanceOptions,
  riceStorageOptions,
  riceCoolingOptions,
} from "../../constants/foodOptions";
import { apiRequest } from "../../services/api.service";


export default function RiceForm({
  handleBack,
  setResult,
  setLoading,
  setApiError,
  loading,
}) {
  const [formData, setFormData] = useState({
    hoursSinceCooking: "",
    initialHoursAtRoom: "",
    observedSmell: "Normal",
    observedAppearance: "Normal/Glossy",
    storageLocation: "Refrigerator",
    coolingMethod: "Not Applicable",
  });
  const [errors, setErrors] = useState({});

  const validateForm = useCallback((data) => {
    const newErrors = {};
    const { hoursSinceCooking, initialHoursAtRoom } = data;

    if (!hoursSinceCooking || isNaN(hoursSinceCooking) || +hoursSinceCooking < 0) {
      newErrors.hoursSinceCooking = "Must be a valid number (0 or more).";
    }
    if (!initialHoursAtRoom || isNaN(initialHoursAtRoom) || +initialHoursAtRoom < 0) {
      newErrors.initialHoursAtRoom = "Must be a valid number (0 or more).";
    }
    if (
      !newErrors.hoursSinceCooking &&
      !newErrors.initialHoursAtRoom &&
      +initialHoursAtRoom > +hoursSinceCooking
    ) {
      newErrors.initialHoursAtRoom = "Room temp hours cannot exceed total hours.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  useEffect(() => validateForm(formData), [formData, validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "hoursSinceCooking" || name === "initialHoursAtRoom") && value.length > 4)
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handlePredict = async () => {
      setApiError(null);
      setResult(null);
      if (!validateForm(formData)) return;

      setLoading(true);
      try {
        const payload = {
          hours_since_cooking: +formData.hoursSinceCooking,
          initial_hours_at_room_temp: +formData.initialHoursAtRoom,
          observed_smell: formData.observedSmell,
          observed_appearance: formData.observedAppearance,
          storage_location: formData.storageLocation,
          cooling_method: formData.coolingMethod,
        };

        // Uses VITE_API_URL in production, localhost in dev
        const data = await apiRequest("/api/predict", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        
        setResult(data);
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
  };

  const hoursValid = formData.hoursSinceCooking && !errors.hoursSinceCooking;
  const roomValid =
    formData.initialHoursAtRoom && !errors.initialHoursAtRoom && hoursValid;
  const allValid = roomValid && formData.coolingMethod;

  return (
    <motion.div
      key="step1-rice"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup
          label="Hours Since Cooking"
          name="hoursSinceCooking"
          type="number"
          value={formData.hoursSinceCooking}
          onChange={handleChange}
          icon={<Hourglass className="w-5 h-5 text-gray-400" />}
          error={errors.hoursSinceCooking}
          placeholder="e.g., 12"
        />
        <InputGroup
          label="Hours at Room Temp"
          name="initialHoursAtRoom"
          type="number"
          value={formData.initialHoursAtRoom}
          onChange={handleChange}
          icon={<Clock className="w-5 h-5 text-gray-400" />}
          error={errors.initialHoursAtRoom}
          placeholder="e.g., 2"
          disabled={!hoursValid}
        />
        <SelectGroup
          label="Observed Smell"
          name="observedSmell"
          value={formData.observedSmell}
          onChange={handleChange}
          icon={<Wind className="w-5 h-5 text-gray-400" />}
        >
          {riceSmellOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectGroup>
        <SelectGroup
          label="Observed Appearance"
          name="observedAppearance"
          value={formData.observedAppearance}
          onChange={handleChange}
          icon={<Eye className="w-5 h-5 text-gray-400" />}
        >
          {riceAppearanceOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </SelectGroup>
        <SelectGroup
          label="Storage Location"
          name="storageLocation"
          value={formData.storageLocation}
          onChange={handleChange}
          icon={<Archive className="w-5 h-5 text-gray-400" />}
        >
          {riceStorageOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectGroup>
        <SelectGroup
          label="Cooling Method"
          name="coolingMethod"
          value={formData.coolingMethod}
          onChange={handleChange}
          icon={<Thermometer className="w-5 h-5 text-gray-400" />}
        >
          {riceCoolingOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectGroup>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleBack}
          className="py-3 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <button
          onClick={handlePredict}
          disabled={loading || !allValid}
          className="py-3 px-8 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
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

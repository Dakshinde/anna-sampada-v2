import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Archive,
  Wind,
  Database,
  Flame,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import InputGroup from "../ui/InputGroup";
import SelectGroup from "../ui/SelectGroup";
import { milkSmellOptions, milkConsistencyOptions } from "../../constants/foodOptions";
import { apiRequest } from "../../services/api.service";

export default function MilkForm({
  handleBack,
  setResult,
  setLoading,
  setApiError,
  foodType,
  loading,
}) {
  const [formData, setFormData] = useState({
    days_since_open_or_purchase: "",
    was_boiled: "No",
    storage_location: "Refrigerator",
    cumulative_hours_at_room_temp: "",
    observed_smell: "Normal/Fresh",
    observed_consistency: "Normal/Smooth",
  });
  const [errors, setErrors] = useState({});

  const showBoiledQuestion = useMemo(
    () =>
      foodType === "Pasteurized (Pouch/Bottle)" ||
      foodType === "Raw/Loose",
    [foodType]
  );

  const maxHours = useMemo(() => {
    const days = parseFloat(formData.days_since_open_or_purchase);
    return isNaN(days) ? null : Math.floor(days * 24);
  }, [formData.days_since_open_or_purchase]);

  const validateForm = useCallback((data, maxH) => {
    const newErrors = {};
    const { days_since_open_or_purchase, cumulative_hours_at_room_temp } = data;

    if (!days_since_open_or_purchase || isNaN(days_since_open_or_purchase) || +days_since_open_or_purchase < 0)
      newErrors.days_since_open_or_purchase = "Must be a valid number (0 or more).";

    if (!cumulative_hours_at_room_temp || isNaN(cumulative_hours_at_room_temp) || +cumulative_hours_at_room_temp < 0)
      newErrors.cumulative_hours_at_room_temp = "Must be a valid number (0 or more).";

    if (!newErrors.days_since_open_or_purchase && !newErrors.cumulative_hours_at_room_temp && maxH !== null && +cumulative_hours_at_room_temp > maxH)
      newErrors.cumulative_hours_at_room_temp = `Cannot exceed ${maxH} hours.`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  useEffect(() => validateForm(formData, maxHours), [formData, maxHours, validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    setApiError(null);
    setResult(null);
    if (!validateForm(formData, maxHours)) return;

    setLoading(true);
    try {
      const payload = {
        milk_type: foodType,
        days_since_open_or_purchase: +formData.days_since_open_or_purchase,
        was_boiled: showBoiledQuestion ? formData.was_boiled === "Yes" : false,
        storage_location: formData.storage_location,
        cumulative_hours_at_room_temp: +formData.cumulative_hours_at_room_temp,
        observed_smell: formData.observed_smell,
        observed_consistency: formData.observed_consistency,
      };

      const data = await apiRequest("/api/predict_milk",{
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      setResult(data);

    }catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const daysValid = formData.days_since_open_or_purchase && !errors.days_since_open_or_purchase;
  const allValid = daysValid && formData.observed_consistency;

  return (
    <motion.div
      key="step1-milk"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup
          label="Days Since Open / Purchase"
          name="days_since_open_or_purchase"
          type="number"
          value={formData.days_since_open_or_purchase}
          onChange={handleChange}
          icon={<Calendar className="w-5 h-5 text-gray-400" />}
          error={errors.days_since_open_or_purchase}
          placeholder="e.g., 2.5"
        />
        <div className={`transition-all ${showBoiledQuestion ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
          <AnimatePresence>
            {showBoiledQuestion && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SelectGroup
                  label="Was it Boiled?"
                  name="was_boiled"
                  value={formData.was_boiled}
                  onChange={handleChange}
                  icon={<Flame className="w-5 h-5 text-gray-400" />}
                  disabled={!daysValid}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </SelectGroup>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <SelectGroup
          label="Storage Location"
          name="storage_location"
          value={formData.storage_location}
          onChange={handleChange}
          icon={<Archive className="w-5 h-5 text-gray-400" />}
        >
          <option value="Refrigerator">Refrigerator</option>
          <option value="Room Temperature">Room Temperature</option>
        </SelectGroup>
        <InputGroup
          label="Cumulative Hours at Room Temp"
          name="cumulative_hours_at_room_temp"
          type="number"
          value={formData.cumulative_hours_at_room_temp}
          onChange={handleChange}
          icon={<Clock className="w-5 h-5 text-gray-400" />}
          error={errors.cumulative_hours_at_room_temp}
          placeholder="e.g., 4"
        />
        <SelectGroup
          label="Observed Smell"
          name="observed_smell"
          value={formData.observed_smell}
          onChange={handleChange}
          icon={<Wind className="w-5 h-5 text-gray-400" />}
        >
          {milkSmellOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>
        <SelectGroup
          label="Observed Consistency"
          name="observed_consistency"
          value={formData.observed_consistency}
          onChange={handleChange}
          icon={<Database className="w-5 h-5 text-gray-400" />}
        >
          {milkConsistencyOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectGroup>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button onClick={handleBack} className="py-3 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center">
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

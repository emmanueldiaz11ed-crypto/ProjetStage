"use client";
import { FaFilter } from "react-icons/fa";

export default function FiltreDropDown({ 
  label, 
  options, 
  selectedValue, 
  onValueChange,
  icon = <FaFilter className="text-gray-400" />,
  className = ""
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <option value="">Tous les {label.toLowerCase()}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
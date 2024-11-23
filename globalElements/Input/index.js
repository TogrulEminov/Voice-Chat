import React from "react";
const Input = ({
  type = "text",
  name,
  placeholder,
  required = true,
  value,
  onChange,
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none  focus:ring-gray-300 transition-colors duration-300"
      required={required}
      {...props}
    />
  );
};

export default Input;

import React, { useState } from 'react';

function Forms({ title = 'Sign-Up', fields, onSubmit, ...restProps }) {
  // Determine input fields list dynamically:
  // 1. From 'fields' array prop if provided
  // 2. From keys of individual props (e.g. <Forms Name Email />)
  // 3. Falling back to default list from mockup if neither is provided
  const inputFields = fields || Object.keys(restProps).filter(
    (key) => key !== 'title' && key !== 'onSubmit'
  );

  const finalFields = inputFields.length > 0
    ? inputFields
    : ['Name', 'Email', 'Password', 'Img Name For Avatar'];

  // Track state for each input field
  const [formData, setFormData] = useState(() => {
    const initial = {};
    finalFields.forEach((field) => {
      initial[field] = '';
    });
    return initial;
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Form Submitted Data:', formData);
    }
  };

  // Helper to determine type of input field
  const getInputType = (fieldName) => {
    const lower = fieldName.toLowerCase();
    if (lower.includes('password')) return 'password';
    if (lower.includes('email')) return 'email';
    if (lower.includes('number') || lower.includes('phone')) return 'tel';
    return 'text';
  };

  return (
    <div className="w-full max-w-[340px] rounded-[12px] overflow-hidden bg-[#161616] border border-neutral-900/60 shadow-2xl">
      {/* Header */}
      <div className="bg-[#0b0c0a] py-4 px-6 border-b border-neutral-900/30">
        <h2 className="text-[#66D451] font-sans text-xl font-bold tracking-tight">
          {title}
        </h2>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {finalFields.map((field, index) => (
            <input
              key={index}
              type={getInputType(field)}
              placeholder={field}
              value={formData[field] || ''}
              onChange={(e) => handleChange(field, e.target.value)}
              className="w-full bg-[#242424] text-white placeholder-neutral-500 font-sans text-sm py-3 px-4 rounded-[8px] border border-transparent focus:border-[#66D451]/40 focus:outline-none transition-all duration-200"
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-1">
          <button
            type="submit"
            className="bg-[#66D451] text-white font-sans font-medium text-sm py-[7px] px-[20px] rounded-[6px] transition-all duration-200 hover:bg-[#59bd45] active:scale-95 cursor-pointer leading-normal"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Forms;

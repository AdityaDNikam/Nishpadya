import React, { useState } from 'react';

function CreateTodoForm({
  onCreate,
  titlePlaceholder = 'Title',
  detailsPlaceholder = '• Details are what matter!!',
  buttonText = 'Create'
}) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreate) {
      onCreate({ title, details });
    } else {
      console.log('Todo Created:', { title, details });
    }
    // Clear inputs
    setTitle('');
    setDetails('');
  };

  return (
    <div className="w-full max-w-[280px] bg-[#111310] text-white rounded-[16px] p-5 flex flex-col gap-4 border border-neutral-900/60">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Title Input */}
        <input
          type="text"
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#3a3a3a] text-white placeholder-neutral-400 font-sans text-lg py-2.5 px-4 rounded-[10px] border border-transparent focus:border-[#66D451]/50 focus:outline-none transition-all duration-200"
          required
        />

        {/* Details Textarea */}
        <textarea
          placeholder={detailsPlaceholder}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          className="w-full bg-[#3a3a3a] text-white placeholder-neutral-400 font-sans text-[15px] py-3.5 px-4 rounded-[10px] border border-transparent focus:border-[#66D451]/50 focus:outline-none transition-all duration-200 resize-none leading-relaxed"
          required
        />

        {/* Create Button */}
        <div className="flex justify-end mt-1">
          <button
            type="submit"
            className="bg-[#66D451] text-white font-sans font-medium text-[15px] py-[6px] px-5 rounded-[8px] transition-all duration-200 hover:bg-[#59bd45] active:scale-95 cursor-pointer leading-normal select-none"
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTodoForm;

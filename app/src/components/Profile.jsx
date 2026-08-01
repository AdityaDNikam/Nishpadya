import React, { useState } from 'react';

function Profile({
  userName = 'User Name',
  avatarUrl,
  activities = 0,
  active = 0,
  closed = 0,
  editUrl = '#',
  deleteUrl = '#',
  onEdit,
  onDelete
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');

  const handleEdit = (e) => {
    if (onEdit) {
      e.preventDefault();
      onEdit();
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full max-w-[260px] bg-[#111310] text-white rounded-[16px] p-6 flex flex-col items-center border border-neutral-900/60 shadow-2xl min-h-[400px]">
      {/* Avatar inside white/light-grey circle */}
      <div className="w-28 h-28 rounded-full bg-[#D9D9D9] overflow-hidden mb-6 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </div>

      {/* User Name */}
      <h3 className="text-xl font-sans font-semibold tracking-tight mb-6 text-center text-neutral-100">
        {userName}
      </h3>

      {/* Stats (Dynamic) */}
      <div className="flex flex-col items-start gap-3.5 mb-8 w-fit mr-auto pl-2">
        <div className="font-sans text-[15px] text-neutral-300">
          Activities : <span className="font-semibold text-neutral-100">{activities}</span>
        </div>
        <div className="font-sans text-[15px] text-neutral-300">
          Active : <span className="font-semibold text-neutral-100">{active}</span>
        </div>
        <div className="font-sans text-[15px] text-neutral-300">
          Closed : <span className="font-semibold text-neutral-100">{closed}</span>
        </div>
      </div>

      {/* Actions (Dynamic API / URL linkable) */}
      <div className="flex items-center gap-3 mt-auto mr-auto pl-2">
        <a
          href={editUrl}
          onClick={handleEdit}
          className="bg-[#242424] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white font-sans text-xs py-1.5 px-4 rounded-[6px] transition-all duration-200 active:scale-95 text-center leading-normal cursor-pointer select-none"
        >
          Edit
        </a>
        <a
          href={deleteUrl}
          onClick={handleDelete}
          className="bg-[#242424] hover:bg-red-950/30 hover:text-red-400 text-neutral-300 font-sans text-xs py-1.5 px-4 rounded-[6px] transition-all duration-200 active:scale-95 text-center leading-normal cursor-pointer select-none"
        >
          Delete
        </a>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          {/* Modal Container */}
          <div className="bg-[#333030] text-white rounded-[12px] p-6 max-w-[480px] w-full mx-4 relative shadow-2xl flex flex-col gap-4 font-serif border border-neutral-800">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setPassword('');
              }}
              className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-[26px] font-medium text-[#8CE83F] leading-tight select-none">
              Confirm Delete
            </h2>

            {/* Content / Prompt */}
            <p className="text-[17px] text-neutral-200 font-sans tracking-wide leading-relaxed">
              Please enter Password to proceed
            </p>

            {/* Input and Confirm Button Row */}
            <div className="flex items-center gap-4 mt-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#D9D9D9] text-black font-sans text-[15px] px-3.5 py-2 rounded-[6px] flex-grow outline-none border border-transparent focus:border-neutral-500 shadow-inner"
                placeholder="Password"
                autoFocus
              />
              <button
                onClick={() => {
                  console.log(JSON.stringify({ password }));
                  if (onDelete) {
                    onDelete(password);
                  }
                  setShowDeleteModal(false);
                  setPassword('');
                }}
                className="bg-[#A91D22] hover:bg-[#921a1e] text-white font-serif text-[15px] px-5 py-2 rounded-[6px] transition-all duration-200 active:scale-95 cursor-pointer shadow-md select-none"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;

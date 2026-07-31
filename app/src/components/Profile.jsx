import React from 'react';

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
  const handleEdit = (e) => {
    if (onEdit) {
      e.preventDefault();
      onEdit();
    }
  };

  const handleDelete = (e) => {
    if (onDelete) {
      e.preventDefault();
      onDelete();
    }
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
    </div>
  );
}

export default Profile;

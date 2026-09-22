import React, { useState } from 'react';

function Activity({
    title = 'Title',
    tasks = ['Task details', 'Task details', 'Task details'],
    aiAssist = '',
    onAiAssist,
    onEdit,
    onDelete,
    completed = false
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editTasks, setEditTasks] = useState(tasks.join('\n'));
    const [editCompleted, setEditCompleted] = useState(completed);

    const handleAiAssist = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (onAiAssist) {
            onAiAssist();
        }
    };

    const handleSave = () => {
        if (!editTitle.trim()) return;
        const parsedTasks = editTasks
            .split('\n')
            .map(line => line.replace(/^•\s*/, '').trim())
            .filter(line => line.length > 0);

        if (onEdit) {
            onEdit({ title: editTitle, tasks: parsedTasks, completed: editCompleted });
        }
        setIsEditing(false);
    };

    return (
        <div className="w-full max-w-[260px] bg-[#222222] text-white rounded-[16px] p-5 flex flex-col gap-4 border border-neutral-900/60 shadow-lg min-h-[220px] relative">
            {/* Edit Icon Button */}
            {!isEditing && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setEditTitle(title);
                        setEditTasks(tasks.join('\n'));
                        setEditCompleted(completed);
                    }}
                    className="absolute top-3 right-10 text-neutral-500 hover:text-white transition-colors duration-200 cursor-pointer p-1"
                    title="Edit Activity"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}

            {/* Delete Icon Button */}
            {!isEditing && onDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-3 right-3 text-neutral-500 hover:text-red-500 transition-colors duration-200 cursor-pointer p-1"
                    title="Delete Activity"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}

            {/* Closed Status Badge */}
            {completed && (
                <span className="absolute top-3.5 right-16 bg-[#66D451] text-black text-[10px] font-bold px-2 py-0.5 rounded-full select-none shadow">
                    Closed
                </span>
            )}

            {isEditing ? (
                /* Edit Mode View */
                <div className="flex flex-col gap-3.5 w-full h-full" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#3a3a3a] text-white font-sans text-[16px] font-semibold py-1.5 px-3 rounded-[8px] border border-transparent focus:border-[#66D451]/50 focus:outline-none transition-all duration-200"
                        placeholder="Title"
                        required
                    />

                    <textarea
                        value={editTasks}
                        onChange={(e) => setEditTasks(e.target.value)}
                        rows={3}
                        className="w-full bg-[#3a3a3a] text-white font-sans text-xs py-2 px-3 rounded-[8px] border border-transparent focus:border-[#66D451]/50 focus:outline-none transition-all duration-200 resize-none leading-relaxed"
                        placeholder="Enter tasks (one per line)"
                        required
                    />

                    {/* Status Toggle Switch */}
                    <div className="flex items-center justify-between bg-[#2d2d2d] px-3 py-2 rounded-[8px] border border-neutral-700/50">
                        <span className="text-xs font-medium text-neutral-300">Status:</span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setEditCompleted(prev => !prev)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                                    editCompleted ? 'bg-[#66D451]' : 'bg-neutral-600'
                                }`}
                                title="Toggle Open/Closed status"
                            >
                                <span
                                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                                        editCompleted ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                            <span className={`text-xs font-bold ${editCompleted ? 'text-[#66D451]' : 'text-neutral-400'}`}>
                                {editCompleted ? 'Closed' : 'Open'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-auto">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-neutral-300 hover:text-white font-sans text-[11px] py-1.5 px-3.5 rounded-[6px] transition-all duration-200 cursor-pointer select-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="bg-[#66D451] hover:bg-[#59bd45] text-white font-sans font-semibold text-[11px] py-1.5 px-3.5 rounded-[6px] transition-all duration-200 active:scale-95 cursor-pointer select-none shadow-md"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                /* Normal Display View */
                <>
                    {/* Title */}
                    <h3 className={`text-xl font-sans font-semibold tracking-tight text-neutral-100 pr-16 ${completed ? 'line-through decoration-[#66D451] text-neutral-400' : ''}`}>
                        {title}
                    </h3>

                    {/* Task details list */}
                    <ul className="flex flex-col gap-2 pl-1 text-neutral-300 text-sm font-sans mb-2">
                        {tasks.map((task, index) => (
                            <li key={index} className="flex items-start gap-2 leading-snug">
                                <span className="text-neutral-500 font-bold select-none">•</span>
                                <span>{task}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Saved AI Assist Section with Purple Theme */}
                    {aiAssist && (
                        <div className="mb-2 bg-gradient-to-r from-[#1c1829] to-[#161424] border border-purple-500/40 rounded-[12px] p-3 text-purple-200 text-xs font-sans leading-relaxed shadow-[0_2px_10px_rgba(124,58,237,0.15)] flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-[11px] border-b border-purple-500/20 pb-1">
                                <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904zM19.071 4.929l-.707 3.536L14.828 9.172l3.536.707.707 3.536.707-3.536 3.536-.707-3.536-.707-.707-3.536z" />
                                </svg>
                                <span>AI Assist</span>
                            </div>
                            <div className="whitespace-pre-wrap text-[11px] text-purple-200/90">
                                {aiAssist}
                            </div>
                        </div>
                    )}

                    {/* AI Assist Button */}
                    <div className="flex justify-end mt-auto">
                        <button
                            type="button"
                            onClick={handleAiAssist}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white font-sans font-semibold text-xs py-1.5 px-3.5 rounded-[8px] transition-all duration-250 active:scale-95 shadow-[0_2px_10px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_15px_rgba(124,58,237,0.4)] cursor-pointer select-none"
                        >
                            {/* Sparkles Icon Symbol */}
                            <svg
                                className="w-3.5 h-3.5 text-purple-100"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904zM19.071 4.929l-.707 3.536L14.828 9.172l3.536.707.707 3.536.707-3.536 3.536-.707-3.536-.707-.707-3.536z"
                                />
                            </svg>
                            Ai-Help?!
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Activity;

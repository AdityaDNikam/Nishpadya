import React from 'react';

function Activity({
    title = 'Title',
    tasks = ['Task details', 'Task details', 'Task details'],
    onAiAssist,
    completed = false
}) {
    const handleAiAssist = (e) => {
        if (onAiAssist) {
            e.preventDefault();
            onAiAssist();
        }
    };

    return (
        <div className="w-full max-w-[260px] bg-[#222222] text-white rounded-[16px] p-5 flex flex-col gap-4 border border-neutral-900/60 shadow-lg min-h-[220px]">
            {/* Title */}
            <h3 className={`text-xl font-sans font-semibold tracking-tight text-neutral-100 pr-2 ${completed ? 'line-through decoration-[#66D451] text-neutral-400' : ''
                }`}>
                {title}
            </h3>

            {/* Task details list */}
            <ul className="flex flex-col gap-2 pl-1 text-neutral-300 text-sm font-sans mb-4">
                {tasks.map((task, index) => (
                    <li key={index} className="flex items-start gap-2 leading-snug">
                        <span className="text-neutral-500 font-bold select-none">•</span>
                        <span>{task}</span>
                    </li>
                ))}
            </ul>

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
        </div>
    );
}

export default Activity;

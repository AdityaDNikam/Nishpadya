import React from 'react';
import NavBar from '../components/NavBar';
import Forms from '../components/Forms';
import Profile from '../components/Profile';
import Activity from '../components/Activity';
import CreateTodoForm from '../components/CreateTodoForm';

function DemosPage() {
  const handleEdit = () => {
    alert('Edit action triggered via callback API!');
  };

  const handleDelete = () => {
    alert('Delete action triggered via callback API!');
  };

  const handleAiAssist = () => {
    alert('AI Assist suggestion: Write a backend API integration in Node.js!');
  };

  const handleCreateTodo = (data) => {
    alert(`Todo Created successfully!\nTitle: ${data.title}\nDetails: ${data.details}`);
  };

  return (
    <div className="min-h-screen bg-[#0c0f0a] text-white flex flex-col font-sans pb-12">
      <NavBar signUpText="Sign-up" logInText="Log-in" />
      
      <div className="flex-1 flex flex-col items-center gap-16 p-8">
        
        {/* Create Todo Form Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          <h2 className="text-lg font-semibold text-neutral-400 tracking-wider uppercase font-mono">Create Todo Form Demos</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Mockup Todo Form (Default)</span>
              <CreateTodoForm onCreate={handleCreateTodo} />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Dynamic Todo Form (Custom Placeholders)</span>
              <CreateTodoForm 
                onCreate={handleCreateTodo}
                titlePlaceholder="Enter Project Milestone"
                detailsPlaceholder="• Bullet out the concrete tasks..."
                buttonText="Add Milestone"
              />
            </div>
          </div>
        </div>

        {/* Activity Demos Section */}
        <div className="flex flex-col items-center gap-6 w-full border-t border-neutral-900 pt-12">
          <h2 className="text-lg font-semibold text-neutral-400 tracking-wider uppercase font-mono">Activity Component Demos</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Mockup Exact Version */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Mockup Activity (Default)</span>
              <Activity />
            </div>

            {/* Dynamic Version */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Dynamic Activity (Prop-Driven)</span>
              <Activity 
                title="Weekly Goals"
                tasks={[
                  'Configure ESLint & Oxlint rules',
                  'Optimize assets using Vite build options',
                  'Verify responsive layouts on mobile'
                ]}
                onAiAssist={handleAiAssist}
                aiAssistText="Generate Ideas"
              />
            </div>
          </div>
        </div>

        {/* Profile Demos Section */}
        <div className="flex flex-col items-center gap-6 w-full border-t border-neutral-900 pt-12">
          <h2 className="text-lg font-semibold text-neutral-400 tracking-wider uppercase font-mono">Profile Component Demos</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* Mockup Exact Version */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Mockup Profile (Default)</span>
              <Profile />
            </div>

            {/* Dynamic Version */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Dynamic Profile (Prop-Driven)</span>
              <Profile 
                userName="Alex Rivera"
                avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                activities={12}
                active={4}
                closed={8}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>

        {/* Forms Demos Section */}
        <div className="flex flex-col items-center gap-6 w-full border-t border-neutral-900 pt-12">
          <h2 className="text-lg font-semibold text-neutral-400 tracking-wider uppercase font-mono">Forms Component Demos</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Mockup Form (Default fields)</span>
              <Forms />
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Dynamic Form (2 fields)</span>
              <Forms title="Log-In" Email="" Password="" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DemosPage;

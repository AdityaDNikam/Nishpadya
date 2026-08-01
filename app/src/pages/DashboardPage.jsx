import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Profile from '../components/Profile';
import Activity from '../components/Activity';
import CreateTodoForm from '../components/CreateTodoForm';

function DashboardPage() {
  const navigate = useNavigate();

  // State for activities list
  const [activities, setActivities] = useState([]);

  // State to toggle creation form visibility
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleLogout = () => {
    alert('Logged out successfully!');
    navigate('/');
  };

  const handleUpgrade = () => {
    alert('Upgrade to Nishpadya Premium to unlock unlimited activities and AI assistant tools!');
  };

  const handleCreateActivity = (todoData) => {
    // Parse description/details into individual task lines (by bullets or newlines)
    const taskLines = todoData.details
      .split('\n')
      .map(line => line.replace(/^•\s*/, '').trim())
      .filter(line => line.length > 0);

    const newActivity = {
      id: Date.now(),
      title: todoData.title,
      tasks: taskLines.length > 0 ? taskLines : ['Task details'],
      completed: false
    };

    setActivities(prev => [...prev, newActivity]);
    setShowCreateForm(false);
  };

  // Toggle activity completion state (to dynamically drive the 'closed' and 'active' stats in Profile)
  const toggleActivityCompletion = (id) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, completed: !act.completed } : act))
    );
  };

  const handleDeleteActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  const handleEditActivity = (id, newData) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, title: newData.title, tasks: newData.tasks } : act))
    );
  };

  const activeCount = activities.filter(act => !act.completed).length;
  const closedCount = activities.filter(act => act.completed).length;

  return (
    <div className="min-h-screen bg-[#0c0f0a] text-white flex flex-col font-sans select-none pb-12">
      {/* Top Navigation Bar */}
      <NavBar
        signUpText="Upgrade"
        logInText="Logout"
        onSignUpClick={handleUpgrade}
        onLogInClick={handleLogout}
      />

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col md:flex-row gap-8 px-6 py-8 md:py-12 max-w-7xl mx-auto w-full items-stretch">

        {/* Left Side: Profile Card */}
        <div className="w-full md:w-[260px] flex-shrink-0 flex justify-center md:block">
          <Profile
            userName="User Name"
            activities={activities.length}
            active={activeCount}
            closed={closedCount}
            onEdit={() => alert('Profile editing is currently a placeholder.')}
            onDelete={(_password) => {
              alert(`User profile deleted successfully!`);
              navigate('/');
            }}
          />
        </div>

        {/* Right Side: Workspace Box */}
        <div className="flex-1 bg-[#161616] border border-neutral-900/60 rounded-[20px] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative min-h-[500px]">

          {/* Header Row inside Workspace */}
          <div className="flex items-center justify-between w-full border-b border-neutral-900/40 pb-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(prev => !prev)}
              className="bg-[#66D451] hover:bg-[#59bd45] text-white font-sans font-semibold text-sm py-2.5 px-6 rounded-[8px] transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
            >
              {showCreateForm ? 'Cancel Creation' : 'Create Activity'}
            </button>

            {activities.length > 0 && !showCreateForm && (
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono">
                Click cards to toggle active/closed state
              </span>
            )}
          </div>

          {/* Dynamic Content Block */}
          <div className="flex-1 flex items-center justify-center w-full">

            {showCreateForm ? (
              /* Create Activity Form View */
              <div className="w-full max-w-[320px] flex justify-center animate-fade-in">
                <CreateTodoForm onCreate={handleCreateActivity} />
              </div>
            ) : activities.length === 0 ? (
              /* Empty State View */
              <div className="text-center animate-pulse">
                <h2 className="text-3xl md:text-4xl font-sans font-medium text-[#66D451]/60 tracking-wide select-none">
                  Lets Get Started!
                </h2>
              </div>
            ) : (
              /* List of Activities Grid */
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start self-start">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => toggleActivityCompletion(activity.id)}
                    className={`relative cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-[16px] ${
                      activity.completed ? 'opacity-80' : ''
                    }`}
                    title={activity.completed ? "Click to mark as Active" : "Click to mark as Completed/Closed"}
                  >
                    <Activity
                      title={activity.title}
                      tasks={activity.tasks}
                      aiAssistText="Get Insights"
                      onAiAssist={() => alert(`AI insights for "${activity.title}": Focus on finishing high-priority items first.`)}
                      onEdit={(newData) => handleEditActivity(activity.id, newData)}
                      completed={activity.completed}
                    />

                    {/* Floating Delete button inside card for convenience */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActivity(activity.id);
                      }}
                      className="absolute top-3 right-3 text-neutral-500 hover:text-red-500 transition-colors duration-200 cursor-pointer p-1"
                      title="Delete Activity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    {activity.completed && (
                      <span className="absolute top-3.5 right-10 bg-[#66D451] text-black text-[10px] font-bold px-2 py-0.5 rounded-full select-none shadow">
                        Closed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;

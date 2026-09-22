import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import NavBar from '../components/NavBar';
import Profile from '../components/Profile';
import Activity from '../components/Activity';
import CreateTodoForm from '../components/CreateTodoForm';
import { axiosServer } from '../api/axiosServer';

function DashboardPage() {
  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] = useState(true);

  // Retrieve user data from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  });

  useEffect(() => {
    const verifyUserAndLoadTasks = async () => {
      try {
        const userResponse = await axiosServer.get('/api/v1/users/getCurrentUser');
        const fetchedUser = userResponse.data.data;
        if (fetchedUser) {
          localStorage.setItem('user', JSON.stringify(fetchedUser));
          setUser(fetchedUser);
        }

        // Fetch user tasks
        try {
          const taskResponse = await axiosServer.get('/api/v1/task/getTask');
          const fetchedTasks = taskResponse.data.data || [];
          const mappedActivities = fetchedTasks.map(task => ({
            id: task._id,
            title: task.title,
            tasks: task.description.split('\n').filter(line => line.trim().length > 0),
            completed: task.status === 'completed',
            aiAssist: task.aiAssist || ''
          }));
          setActivities(mappedActivities);
        } catch (taskErr) {
          console.error('Failed to load tasks:', taskErr);
          if (taskErr.response?.status === 404) {
            setActivities([]);
          }
        }
        setCheckingAuth(false);
      } catch (err) {
        console.error('Session verification failed:', err);
        localStorage.removeItem('user');
        navigate('/login', { state: { mode: 'login' } });
      }
    };
    verifyUserAndLoadTasks();
  }, [navigate]);

  // State for activities list
  const [activities, setActivities] = useState([]);

  // State to toggle creation form visibility
  const [showCreateForm, setShowCreateForm] = useState(false);

  // State for AI Response section
  const [aiTaskId, setAiTaskId] = useState(null);
  const [aiTaskTitle, setAiTaskTitle] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSpecInput, setShowSpecInput] = useState(false);
  const [userSpec, setUserSpec] = useState('');

  const handleLogout = async () => {
    try {
      await axiosServer.post('/api/v1/users/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('user');
      alert('Logged out successfully!');
      navigate('/');
    }
  };

  const handleUpgrade = () => {
    alert('Upgrade to Nishpadya Premium to unlock unlimited activities and AI assistant tools!');
  };

  const handleCreateActivity = async (todoData) => {
    const trimmedTitle = todoData.title?.trim();
    const trimmedDescription = todoData.details?.trim();

    if (!trimmedTitle || !trimmedDescription) {
      alert('Title and Description are required and cannot be empty!');
      return;
    }

    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDescription,
        status: 'pending',
        priority: 'medium'
      };
      const response = await axiosServer.post('/api/v1/task/createTask', payload);
      const createdTask = response.data.data;
      
      const newActivity = {
        id: createdTask._id,
        title: createdTask.title,
        tasks: createdTask.description.split('\n').filter(line => line.trim().length > 0),
        completed: createdTask.status === 'completed',
        aiAssist: createdTask.aiAssist || ''
      };
      
      setActivities(prev => [...prev, newActivity]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await axiosServer.delete(`/api/v1/task/deleteTask/${id}`);
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleEditActivity = async (id, newData) => {
    try {
      const description = newData.tasks.join('\n');
      const status = newData.completed ? 'completed' : 'pending';
      await axiosServer.patch(`/api/v1/task/updateTask/${id}`, {
        title: newData.title,
        description,
        status
      });
      setActivities(prev =>
        prev.map(act => (act.id === id ? {
          ...act,
          title: newData.title,
          tasks: newData.tasks,
          completed: newData.completed !== undefined ? newData.completed : act.completed
        } : act))
      );
    } catch (err) {
      console.error('Failed to edit task:', err);
      alert(err.response?.data?.message || 'Failed to edit task.');
    }
  };

  const handleAiAssist = async (id, title) => {
    setAiTaskId(id);
    setAiTaskTitle(title);
    setAiResponse(null);
    setAiLoading(true);
    setShowSpecInput(false);
    setUserSpec('');
    try {
      const response = await axiosServer.post(`/api/v1/task/assist/${id}`);
      const data = response.data.data;
      const assistMsg = typeof data === 'string' ? data : data.AiAssist;
      const remaining = typeof data === 'object' && data?.remainingCalls !== undefined ? data.remainingCalls : null;
      
      const formattedResponse = remaining !== null 
        ? `${assistMsg}\n\n(${remaining} AI calls left)`
        : assistMsg;
      setAiResponse(formattedResponse);
    } catch (err) {
      console.error('AI Assist error:', err);
      const errorMsg = err.response?.data?.message || 'Total number of free AI assists exhausted. Please upgrade to a premium plan or wait for 18 hours.';
      setAiResponse(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiAssist = async () => {
    if (!aiTaskId || !aiResponse) return;
    try {
      await axiosServer.patch(`/api/v1/task/updateTask/${aiTaskId}`, {
        aiAssist: aiResponse
      });
      setActivities(prev =>
        prev.map(act => (act.id === aiTaskId ? { ...act, aiAssist: aiResponse } : act))
      );
      // Reset AI response state so the bottom response section disappears without showing any pop-up alert
      setAiResponse(null);
      setAiLoading(false);
      setAiTaskId(null);
      setShowSpecInput(false);
      setUserSpec('');
    } catch (err) {
      console.error('Failed to save AI assist:', err);
      alert(err.response?.data?.message || 'Failed to save AI assist.');
    }
  };

  const handleSendSpecification = async () => {
    if (!userSpec.trim() || !aiTaskId) return;
    setAiLoading(true);
    const currentSpec = userSpec.trim();
    try {
      const response = await axiosServer.post(`/api/v1/task/assist/${aiTaskId}`, {
        previousAiResponse: aiResponse,
        userSpecification: currentSpec
      });
      const data = response.data.data;
      const assistMsg = typeof data === 'string' ? data : data.AiAssist;
      const remaining = typeof data === 'object' && data?.remainingCalls !== undefined ? data.remainingCalls : null;
      
      const formattedResponse = remaining !== null 
        ? `${assistMsg}\n\n(${remaining} AI calls left)`
        : assistMsg;
      setAiResponse(formattedResponse);
      setUserSpec('');
      setShowSpecInput(false);
    } catch (err) {
      console.error('AI Specification error:', err);
      const errorMsg = err.response?.data?.message || 'Total number of free AI assists exhausted. Please upgrade to a premium plan or wait for 18 hours.';
      setAiResponse(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const activeCount = activities.filter(act => !act.completed).length;
  const closedCount = activities.filter(act => act.completed).length;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0f0a] text-white flex flex-col items-center justify-center font-sans select-none">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#66D451] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 text-xs uppercase tracking-widest font-mono animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

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
            userName={user?.name || 'User Name'}
            userEmail={user?.email || ''}
            avatarUrl={user?.avatar || ''}
            activities={activities.length}
            active={activeCount}
            closed={closedCount}
            onEdit={async (updatedData) => {
              try {
                const response = await axiosServer.post('/api/v1/users/updateAccountDetails', updatedData);
                const updatedUser = response.data.data;
                if (updatedUser) {
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  alert('Profile details updated successfully!');
                }
              } catch (err) {
                console.error('Update profile error:', err);
                const errMsg = err.response?.data?.message || 'Failed to update profile details.';
                alert(errMsg);
              }
            }}
            onDelete={async (password) => {
              try {
                const response = await axiosServer.delete('/api/v1/users/deleteUser', {
                  data: { password }
                });
                localStorage.removeItem('user');
                alert(response.data.message || 'User profile deleted successfully!');
                navigate('/');
              } catch (err) {
                console.error('Delete profile error:', err);
                const errMsg = err.response?.data?.message || 'Failed to delete user profile. Please check your password.';
                alert(errMsg);
              }
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
                Edit task to toggle Open/Closed status
              </span>
            )}
          </div>

          {/* Dynamic Content Block */}
          <div className="flex-1 flex flex-col items-center justify-between w-full">

            {showCreateForm ? (
              /* Create Activity Form View */
              <div className="w-full max-w-[320px] flex justify-center animate-fade-in my-auto">
                <CreateTodoForm onCreate={handleCreateActivity} />
              </div>
            ) : activities.length === 0 ? (
              /* Empty State View */
              <div className="text-center animate-pulse my-auto">
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
                    className={`relative transition-all duration-300 rounded-[16px] ${activity.completed ? 'opacity-85' : ''
                      }`}
                  >
                    <Activity
                      title={activity.title}
                      tasks={activity.tasks}
                      aiAssist={activity.aiAssist}
                      aiAssistText="Get Insights"
                      onAiAssist={() => handleAiAssist(activity.id, activity.title)}
                      onEdit={(newData) => handleEditActivity(activity.id, newData)}
                      onDelete={() => handleDeleteActivity(activity.id)}
                      completed={activity.completed}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* AI Response Section at Bottom of Tab */}
            {(aiLoading || aiResponse) && (() => {
              const isExhausted = typeof aiResponse === 'string' && (aiResponse.includes('exhausted') || aiResponse.includes('Limit exceeded'));

              return (
                <div className={`mt-8 border-t pt-6 animate-fade-in w-full ${isExhausted ? 'border-red-900/40' : 'border-purple-900/40'}`}>
                  <div className={`border rounded-[16px] p-5 relative flex flex-col gap-4 ${
                    isExhausted
                      ? 'bg-gradient-to-r from-[#2a1215] via-[#200f12] to-[#261013] border-red-500/40 shadow-[0_4px_20px_rgba(239,68,68,0.2)]'
                      : 'bg-gradient-to-r from-[#1c1829] via-[#161424] to-[#1a162b] border-purple-500/30 shadow-[0_4px_20px_rgba(124,58,237,0.15)]'
                  }`}>
                    
                    {/* Header */}
                    <div className={`flex items-center justify-between border-b pb-3 ${isExhausted ? 'border-red-500/20' : 'border-purple-500/20'}`}>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className={`p-1.5 rounded-lg border ${
                          isExhausted ? 'bg-red-600/20 border-red-500/40 text-red-300' : 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                        }`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904zM19.071 4.929l-.707 3.536L14.828 9.172l3.536.707.707 3.536.707-3.536 3.536-.707-3.536-.707-.707-3.536z" />
                          </svg>
                        </div>
                        <span className={`font-sans font-semibold text-sm tracking-wide ${isExhausted ? 'text-red-200' : 'text-purple-200'}`}>
                          {isExhausted ? 'Limit Exhausted' : 'AI Assist Response'}
                        </span>
                        {aiTaskTitle && (
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono border ${
                            isExhausted ? 'bg-red-950/80 text-red-300 border-red-800/60' : 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                          }`}>
                            Task: {aiTaskTitle}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => { setAiResponse(null); setAiLoading(false); setAiTaskId(null); }}
                        className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                        title="Dismiss AI Response"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Body Content */}
                    {aiLoading ? (
                      <div className="flex items-center gap-3 py-4 text-purple-300/80 font-sans text-sm animate-pulse">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating intelligent insights for your task...</span>
                      </div>
                    ) : (
                      <div className={`font-sans text-sm leading-relaxed whitespace-pre-wrap pl-1 ${
                        isExhausted ? 'text-red-200 font-medium' : 'text-neutral-200'
                      }`}>
                        {aiResponse}
                      </div>
                    )}

                    {/* Action Bar (Save & Add Specification) - Hidden if limit exhausted */}
                    {!aiLoading && aiResponse && !isExhausted && (
                      <div className="flex flex-col gap-3 pt-2 border-t border-purple-500/20">
                        
                        {!showSpecInput ? (
                          /* Action Buttons Row */
                          <div className="flex items-center justify-end gap-3 flex-wrap">
                            {/* Save Button */}
                            <button
                              type="button"
                              onClick={handleSaveAiAssist}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white font-sans font-semibold text-xs py-1.5 px-4 rounded-[8px] transition-all duration-200 active:scale-95 shadow-[0_2px_10px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_15px_rgba(124,58,237,0.4)] cursor-pointer select-none"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Save
                            </button>

                            {/* Add Specification Button */}
                            <button
                              type="button"
                              onClick={() => setShowSpecInput(true)}
                              className="flex items-center gap-1.5 bg-purple-950/80 hover:bg-purple-900/90 text-purple-200 font-sans font-semibold text-xs py-1.5 px-4 rounded-[8px] border border-purple-500/40 hover:border-purple-400 transition-all duration-200 cursor-pointer select-none"
                            >
                              <svg className="w-3.5 h-3.5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Specification
                            </button>
                          </div>
                        ) : (
                          /* Specification Input Bar */
                          <div className="flex items-center gap-2 animate-fade-in w-full">
                            <input
                              type="text"
                              value={userSpec}
                              onChange={(e) => setUserSpec(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSendSpecification(); }}
                              placeholder="Enter additional specification for AI..."
                              className="flex-1 bg-[#120f1d] text-white font-sans text-xs py-2 px-3.5 rounded-[8px] border border-purple-500/50 focus:border-purple-400 focus:outline-none transition-all duration-200"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSendSpecification}
                              disabled={!userSpec.trim()}
                              className="flex items-center gap-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white font-sans font-semibold text-xs py-2 px-4 rounded-[8px] transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer select-none"
                            >
                              <span>Send</span>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowSpecInput(false); setUserSpec(''); }}
                              className="text-neutral-400 hover:text-white font-sans text-xs py-2 px-2 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                </div>
              );
            })()}

          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;

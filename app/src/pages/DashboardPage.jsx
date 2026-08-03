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
            completed: task.status === 'completed'
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
        completed: createdTask.status === 'completed'
      };
      
      setActivities(prev => [...prev, newActivity]);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  // Toggle activity completion state (to dynamically drive the 'closed' and 'active' stats in Profile)
  const toggleActivityCompletion = async (id) => {
    const activity = activities.find(act => act.id === id);
    if (!activity) return;
    const newStatus = activity.completed ? 'pending' : 'completed';
    try {
      await axiosServer.patch(`/api/v1/task/updateTask/${id}`, {
        status: newStatus
      });
      setActivities(prev =>
        prev.map(act => (act.id === id ? { ...act, completed: !act.completed } : act))
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert(err.response?.data?.message || 'Failed to update status.');
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
      await axiosServer.patch(`/api/v1/task/updateTask/${id}`, {
        title: newData.title,
        description
      });
      setActivities(prev =>
        prev.map(act => (act.id === id ? { ...act, title: newData.title, tasks: newData.tasks } : act))
      );
    } catch (err) {
      console.error('Failed to edit task:', err);
      alert(err.response?.data?.message || 'Failed to edit task.');
    }
  };

  const handleAiAssist = async (id, title) => {
    try {
      alert('Generating AI insights with Grok, please wait...');
      const response = await axiosServer.post(`/api/v1/task/assist/${id}`);
      const assistMsg = response.data.data;
      alert(`AI Insights for "${title}":\n\n${assistMsg}`);
    } catch (err) {
      console.error('AI Assist error:', err);
      alert(err.response?.data?.message || 'Failed to get AI assistance.');
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
                    className={`relative cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-[16px] ${activity.completed ? 'opacity-80' : ''
                      }`}
                    title={activity.completed ? "Click to mark as Active" : "Click to mark as Completed/Closed"}
                  >
                    <Activity
                      title={activity.title}
                      tasks={activity.tasks}
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

          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;

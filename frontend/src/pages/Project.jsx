import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../api/client';
import { 
  ArrowLeft, Plus, MoreVertical, Trash2, Edit, 
  CheckCircle2, Circle, Clock, Loader2,
  ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', icon: ChevronDown, color: 'text-gray-500', bg: 'bg-gray-100' },
  MEDIUM: { label: 'Medium', icon: Minus, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  HIGH: { label: 'High', icon: ChevronUp, color: 'text-red-500', bg: 'bg-red-100' },
};

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await projectsAPI.getById(id);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' });
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null
      };

      if (editingTask) {
        await tasksAPI.update(editingTask.id, data);
      } else {
        await tasksAPI.create(id, data);
      }
      setShowTaskModal(false);
      loadProject();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await tasksAPI.toggle(task.id);
      loadProject();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      loadProject();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await projectsAPI.delete(id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  if (!project) return null;

  // Group tasks by status
  const tasksByStatus = {
    TODO: project.tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter(t => t.status === 'DONE'),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-gray-600 mt-1 ml-7">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(tasksByStatus).map(([status, tasks]) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center space-x-2 px-1">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <h2 className="font-semibold text-gray-900">{config.label}</h2>
                  <span className="text-sm text-gray-500">({tasks.length})</span>
                </div>
                
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <Card className="text-center py-8 border-dashed">
                      <p className="text-gray-500 text-sm">No tasks</p>
                    </Card>
                  ) : (
                    tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => handleToggleStatus(task)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Task title"
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Task description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{project.name}</strong>? 
            This will also delete all {project.tasks.length} task(s) in this project.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject} loading={deleting}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  return (
    <Card className="relative group">
      <div className="flex items-start space-x-3">
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
        >
          <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {priorityConfig.label}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/client';
import { Plus, FolderOpen, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#3B82F6' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        projectsAPI.getAll(),
        projectsAPI.getStats()
      ]);
      setProjects(projectsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectsAPI.create(newProject);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', color: '#3B82F6' });
      loadData();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </Card>
            <Card className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksByStatus.TODO}</p>
              </div>
            </Card>
            <Card className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksByStatus.IN_PROGRESS}</p>
              </div>
            </Card>
            <Card className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksByStatus.DONE}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <Card className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="My Awesome Project"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Brief description of your project..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={newProject.color}
                onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                className="h-10 w-20 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">{newProject.color}</span>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

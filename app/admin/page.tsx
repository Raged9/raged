'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  ArrowLeft,
  X,
  Layers,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api, ProjectItem, removeToken } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    techStack: '',
    imageUrl: '',
    projectUrl: '',
    githubUrl: '',
    order: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check auth and load projects
  useEffect(() => {
    api.getAdminMe()
      .then((res) => {
        setAdminUser(res.user);
        loadProjects();
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push('/admin/login');
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      techStack: 'TypeScript, Next.js, TailwindCSS',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      projectUrl: 'https://github.com',
      githubUrl: 'https://github.com',
      order: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      techStack: project.techStack?.join(', ') || '',
      imageUrl: project.imageUrl || '',
      projectUrl: project.projectUrl || '',
      githubUrl: project.githubUrl || '',
      order: project.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProject(id);
      setStatusMessage({ type: 'success', text: 'Project deleted successfully!' });
      setProjects(projects.filter((p) => p.id !== id));
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete project' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const techArray = formData.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      techStack: techArray,
      imageUrl: formData.imageUrl || null,
      projectUrl: formData.projectUrl || null,
      githubUrl: formData.githubUrl || null,
      order: Number(formData.order) || 1,
    };

    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject.id, payload);
        setProjects(projects.map((p) => (p.id === editingProject.id ? updated : p)));
        setStatusMessage({ type: 'success', text: 'Project updated successfully!' });
      } else {
        const created = await api.createProject(payload);
        setProjects([...projects, created]);
        setStatusMessage({ type: 'success', text: 'Project created successfully!' });
      }
      setIsModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !adminUser) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 font-semibold text-sm">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Verifying administrator credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#181818]/90 backdrop-blur-md border-b border-neutral-800 px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> View Site
          </Link>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#A3B899] tracking-tight">EDGAR</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#3E4F36] text-[#A3B899] border border-[#2E3B27]">
              CMS LITE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-neutral-400 block">Authenticated Admin</span>
            <span className="text-xs font-mono font-bold text-white">{adminUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-600/50 text-emerald-300'
                : 'bg-red-950/80 border border-red-800/50 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Dashboard Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              Portfolio Projects Manager
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Create, update, reorder, or remove showcase items in real-time.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-bold text-sm transition-colors shadow-lg self-start sm:self-auto border border-[#A3B899]/30"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#181818] border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-neutral-700 transition-colors"
            >
              {/* Card Image Thumbnail */}
              <div>
                <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                  {proj.imageUrl ? (
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-bold">
                      No Image Provided
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                    Order #{proj.order}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-mono text-neutral-400 block mb-0.5">
                      /{proj.slug}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate">{proj.title}</h3>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack?.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700/80 text-[10px] font-semibold text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 bg-[#141414]/60 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {proj.projectUrl && (
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title="Open Live URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/50 hover:bg-red-900 text-xs font-semibold text-red-300 border border-red-800/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#181818] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#A3B899]" />
                {editingProject ? 'Edit Project Details' : 'Create New Showcase Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Apex Hypervisor"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    Slug (Unique Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. apex-hypervisor"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                  Description / Synopsis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the system architecture, business impact, and features..."
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                  Tech Stack (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. React, Go, Kafka, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white text-xs font-bold transition-colors shadow-lg disabled:opacity-50 border border-[#A3B899]/30"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving Project...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

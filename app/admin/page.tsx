'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  FileText,
  UserCheck,
  Award,
} from 'lucide-react';
import { api, ProjectItem, OffScreenPhotoItem, ProfileSettings, removeToken } from '@/lib/api-client';
import type { HanglineItem } from '@/data/hangline-items';

/**
 * Processes an uploaded image file:
 * 1. If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME & NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET are set, uploads to Cloudinary.
 * 2. Otherwise (default, zero API key needed), resizes & compresses via HTML5 Canvas into a compact
 *    WebP/JPEG Data URL so it can be stored directly inside the backend database!
 */
async function processImageFile(file: File, maxDimension = 1200, quality = 0.84): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
    }
  }

  // Fallback / Default: Compress & encode directly for database storage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Try WebP first for compact size, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'photos' | 'profile' | 'hangline'>('projects');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [photos, setPhotos] = useState<OffScreenPhotoItem[]>([]);
  const [hanglineItems, setHanglineItems] = useState<HanglineItem[]>([]);
  const [isHanglineModalOpen, setIsHanglineModalOpen] = useState(false);
  const [editingHangline, setEditingHangline] = useState<HanglineItem | null>(null);
  const [isUploadingHanglineImage, setIsUploadingHanglineImage] = useState(false);
  const [isSavingHangline, setIsSavingHangline] = useState(false);
  const [hanglineForm, setHanglineForm] = useState<{
    title: string;
    subtitle: string;
    specs: string;
    category: 'milestone' | 'certificate' | 'competition' | 'event';
    description: string;
    image: string;
    badgeText: string;
    issuer: string;
    order: number;
    useCertificateOverlay: boolean;
    overlayType: 'certificate' | 'award' | 'event';
    issuerLogoText: string;
    credentialId: string;
    date: string;
    accentColor: string;
    recipient: string;
  }>({
    title: '',
    subtitle: 'WEST JAKARTA · 2025',
    specs: 'INFORMATICS · SOFTWARE ENGINEERING',
    category: 'certificate',
    description: '',
    image: '/edgar-warm.jpg',
    badgeText: 'CERTIFIED',
    issuer: 'Christopher Edgar',
    order: 1,
    useCertificateOverlay: false,
    overlayType: 'certificate',
    issuerLogoText: 'VERIFIED CERTIFICATION',
    credentialId: 'CERT-2025',
    date: '2025',
    accentColor: '#10B981',
    recipient: 'Christopher Edgar',
  });
  const [profile, setProfile] = useState<ProfileSettings>({
    fullName: 'Christopher Edgar',
    nickname: 'Raged',
    role: 'Informatics Student & Full-Stack / AI Builder',
    bio: 'An Informatics student passionate about turning complex problems into clean, fast, and tactile digital products — from full-stack management systems and cross-platform Flutter mobile apps to NLP & AI explorations.',
    location: 'Kebon Jeruk, West Jakarta, Indonesia',
    university: 'B.Sc. in Informatics (S.Kom.)',
    gpa: '3.78/4',
    focus: 'Web · Mobile · AI/NLP',
    email: 'edgar.edmanata@gmail.com',
    availability: 'Available for internships, freelance & collaborations',
    cvUrl: '/CV-Christopher-Edgar.pdf',
    cvFileName: 'CV-Christopher-Edgar.pdf',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSavingPhotos, setIsSavingPhotos] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);
  const [storageMode, setStorageMode] = useState<string>('checking...');
  const [isLoading, setIsLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    techStack: string;
    imageUrl: string;
    images: string[];
    newImageUrl: string;
    projectUrl: string;
    githubUrl: string;
    order: number;
  }>({
    title: '',
    slug: '',
    description: '',
    techStack: '',
    imageUrl: '',
    images: [],
    newImageUrl: '',
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
        loadData();
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projData, photoData, profileData, hanglineData, healthData] = await Promise.all([
        api.getProjects().catch(() => []),
        api.getPhotos().catch(() => []),
        api.getProfile().catch(() => null),
        api.getHanglineItems().catch(() => []),
        api.checkHealth().catch(() => ({ status: 'ok', service: '', storage: 'unknown' })),
      ]);
      setProjects(projData);
      setPhotos(photoData);
      setHanglineItems(hanglineData);
      if (profileData) {
        setProfile((prev) => ({ ...prev, ...profileData }));
      }
      if (healthData?.storage) {
        setStorageMode(healthData.storage);
      }
    } catch (err) {
      console.warn('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddHangline = () => {
    setEditingHangline(null);
    setHanglineForm({
      title: '',
      subtitle: 'WEST JAKARTA · 2025',
      specs: 'INFORMATICS · SOFTWARE ENGINEERING',
      category: 'certificate',
      description: '',
      image: '/edgar-warm.jpg',
      badgeText: 'CERTIFIED',
      issuer: 'Christopher Edgar',
      order: hanglineItems.length + 1,
      useCertificateOverlay: false,
      overlayType: 'certificate',
      issuerLogoText: 'VERIFIED CERTIFICATION',
      credentialId: `CERT-${new Date().getFullYear()}`,
      date: String(new Date().getFullYear()),
      accentColor: '#10B981',
      recipient: 'Christopher Edgar',
    });
    setIsHanglineModalOpen(true);
  };

  const handleOpenEditHangline = (item: HanglineItem) => {
    setEditingHangline(item);
    const cert = item.certificateOverlay;
    setHanglineForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      specs: item.specs || '',
      category: item.category || 'certificate',
      description: item.description || '',
      image: item.image || '/edgar-warm.jpg',
      badgeText: item.badgeText || '',
      issuer: item.issuer || '',
      order: item.order ?? (parseInt(item.number, 10) || 1),
      useCertificateOverlay: Boolean(cert),
      overlayType: cert?.type || 'certificate',
      issuerLogoText: cert?.issuerLogoText || 'VERIFIED CERTIFICATION',
      credentialId: cert?.credentialId || 'CERT-2025',
      date: cert?.date || '2025',
      accentColor: cert?.accentColor || '#10B981',
      recipient: cert?.recipient || 'Christopher Edgar',
    });
    setIsHanglineModalOpen(true);
  };

  const handleHanglineImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploadingHanglineImage(true);
    try {
      const dataUrl = await processImageFile(file, 1100, 0.85);
      setHanglineForm((prev) => ({ ...prev, image: dataUrl }));
      setStatusMessage({
        type: 'success',
        text: `Gambar "${file.name}" berhasil dimuat ke form Hangline!`,
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memproses gambar' });
    } finally {
      setIsUploadingHanglineImage(false);
    }
  };

  const handleSaveHanglineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHangline(true);
    try {
      const payload: Partial<HanglineItem> = {
        title: hanglineForm.title,
        subtitle: hanglineForm.subtitle,
        specs: hanglineForm.specs,
        category: hanglineForm.category,
        description: hanglineForm.description,
        image: hanglineForm.image,
        badgeText: hanglineForm.badgeText,
        issuer: hanglineForm.issuer,
        order: Number(hanglineForm.order) || 1,
        certificateOverlay: hanglineForm.useCertificateOverlay
          ? {
              type: hanglineForm.overlayType,
              issuerLogoText: hanglineForm.issuerLogoText,
              credentialId: hanglineForm.credentialId,
              date: hanglineForm.date,
              accentColor: hanglineForm.accentColor,
              recipient: hanglineForm.recipient,
            }
          : null,
      };

      if (editingHangline) {
        await api.updateHanglineItem(editingHangline.id, payload);
        setStatusMessage({
          type: 'success',
          text: `Hangline print "${hanglineForm.title}" berhasil diperbarui!`,
        });
      } else {
        await api.createHanglineItem(payload);
        setStatusMessage({
          type: 'success',
          text: `Hangline print "${hanglineForm.title}" berhasil ditambahkan!`,
        });
      }
      const refreshed = await api.getHanglineItems();
      setHanglineItems(refreshed);
      setIsHanglineModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyimpan item Hangline',
      });
    } finally {
      setIsSavingHangline(false);
    }
  };

  const handleDeleteHanglineItem = async (item: HanglineItem) => {
    if (!window.confirm(`Hapus print "${item.title}" dari Hangline?`)) return;
    try {
      await api.deleteHanglineItem(item.id);
      const refreshed = await api.getHanglineItems();
      setHanglineItems(refreshed);
      setStatusMessage({
        type: 'success',
        text: `Print "${item.title}" berhasil dihapus.`,
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghapus item Hangline',
      });
    }
  };

  const handleCvFileUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Ukuran file CV maksimal 12MB' });
      return;
    }
    setIsUploadingCv(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Gagal membaca file CV'));
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      setProfile((prev) => ({
        ...prev,
        cvUrl: dataUrl,
        cvFileName: file.name || 'CV-Christopher-Edgar.pdf',
      }));
      setStatusMessage({
        type: 'success',
        text: `File CV "${file.name}" berhasil dimuat! Klik "Save Profile & CV" untuk menyimpan ke database.`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal membaca file CV' });
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setStatusMessage({
        type: 'success',
        text: 'Profile & CV settings berhasil disimpan ke database!',
      });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyimpan Profile & CV',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoChange = (id: string, field: keyof OffScreenPhotoItem, value: any) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handlePhotoFileUpload = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploadingPhotoId(id);
    try {
      const dataUrl = await processImageFile(file, 700, 0.85);
      handlePhotoChange(id, 'imageUrl', dataUrl);
      setStatusMessage({
        type: 'success',
        text: `Gambar "${file.name}" berhasil dimuat! Jangan lupa klik "Save All Photos" untuk menyimpan ke database.`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memproses file gambar' });
    } finally {
      setUploadingPhotoId(null);
    }
  };

  const handleProjectFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingProjectImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await processImageFile(file, 1200, 0.85);
        uploadedUrls.push(dataUrl);
      }
      setFormData((prev) => {
        const nextImages = [...prev.images, ...uploadedUrls];
        return {
          ...prev,
          images: nextImages,
          imageUrl: nextImages[0] || '',
        };
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal memproses file gambar' });
    } finally {
      setIsUploadingProjectImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = formData.newImageUrl.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const nextImages = [...prev.images, trimmed];
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextImages[0] || '',
        newImageUrl: '',
      };
    });
  };

  const handleRemoveProjectImage = (index: number) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextImages[0] || '',
      };
    });
  };

  const handleMoveProjectImage = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.images.length) return prev;
      const nextImages = [...prev.images];
      const temp = nextImages[index];
      nextImages[index] = nextImages[targetIndex];
      nextImages[targetIndex] = temp;
      return {
        ...prev,
        images: nextImages,
        imageUrl: nextImages[0] || '',
      };
    });
  };

  const handleSaveAllPhotos = async () => {
    setIsSavingPhotos(true);
    try {
      const updated = await api.updateAllPhotos(photos);
      setPhotos(updated);
      setStatusMessage({ type: 'success', text: 'All 8 Off-Screen Polaroid photos saved to database!' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update photos' });
    } finally {
      setIsSavingPhotos(false);
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
      imageUrl: '',
      images: [],
      newImageUrl: '',
      projectUrl: 'https://github.com',
      githubUrl: 'https://github.com',
      order: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProject(project);
    const existingImages =
      Array.isArray(project.images) && project.images.length > 0
        ? project.images.filter(Boolean)
        : project.imageUrl
        ? [project.imageUrl]
        : [];
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      techStack: project.techStack?.join(', ') || '',
      imageUrl: existingImages[0] || project.imageUrl || '',
      images: existingImages,
      newImageUrl: '',
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

    const normalizeUrl = (raw: string) => {
      const t = raw.trim();
      if (!t) return null;
      return /^(https?:\/\/|mailto:|tel:|\/)/i.test(t) ? t : `https://${t}`;
    };

    const finalImages = formData.images.filter(Boolean);
    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      techStack: techArray,
      images: finalImages,
      imageUrl: finalImages[0] || null,
      projectUrl: normalizeUrl(formData.projectUrl),
      githubUrl: normalizeUrl(formData.githubUrl),
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
            <span
              className={`hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                storageMode === 'postgresql'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/40'
              }`}
              title={
                storageMode === 'postgresql'
                  ? 'Data tersimpan permanen di PostgreSQL'
                  : 'Set DATABASE_URL di backend agar data tersimpan permanen di PostgreSQL'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  storageMode === 'postgresql' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {storageMode === 'postgresql' ? 'PostgreSQL Permanent' : 'Local JSON Fallback'}
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
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-[#3E4F36] text-white border border-[#A3B899]/40 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            Projects & Carousel ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'bg-[#3E4F36] text-white border border-[#A3B899]/40 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <Camera className="w-4 h-4" />
            Off-Screen Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#3E4F36] text-white border border-[#A3B899]/40 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            Profile &amp; CV (/portofolio)
          </button>
          <button
            onClick={() => setActiveTab('hangline')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hangline'
                ? 'bg-[#3E4F36] text-white border border-[#A3B899]/40 shadow-md'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            Hangline Archive ({hanglineItems.length})
          </button>
        </div>

        {activeTab === 'projects' ? (
          <>
            {/* Dashboard Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase">
                  Portfolio Projects Manager
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                  Create, update, reorder, or upload cover images directly to the database.
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
                      {(proj.images?.[0] || proj.imageUrl) ? (
                        <img
                          src={proj.images?.[0] || proj.imageUrl || ''}
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
                      {(proj.images?.length || 0) > 1 && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#3E4F36]/90 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-[#A3B899]/40">
                          {proj.images?.length} Photos
                        </span>
                      )}
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
                          href={
                            /^(https?:\/\/|\/)/i.test(proj.projectUrl.trim())
                              ? proj.projectUrl.trim()
                              : `https://${proj.projectUrl.trim()}`
                          }
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
          </>
        ) : activeTab === 'photos' ? (
          /* Off-Screen Photo Cards CMS Tab */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
                  <Camera className="w-7 h-7 text-[#A3B899]" />
                  Off-Screen Photos Manager
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                  Upload image files directly from your device (stored in the database) or paste an image URL for the 8 Polaroid cards.
                </p>
              </div>

              <button
                onClick={handleSaveAllPhotos}
                disabled={isSavingPhotos}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-bold text-sm transition-all shadow-lg self-start sm:self-auto border border-[#A3B899]/30 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingPhotos ? 'Saving Changes...' : 'Save All Photos'}
              </button>
            </div>

            {/* Photos 4-column responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {photos.map((photo, idx) => {
                const isDataUrl = Boolean(photo.imageUrl && photo.imageUrl.startsWith('data:image/'));
                const isUploadingThis = uploadingPhotoId === photo.id;

                return (
                  <div
                    key={photo.id || idx}
                    className="bg-[#181818] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between shadow-lg group hover:border-neutral-700 transition-colors"
                  >
                    {/* Mini Polaroid Preview (Clickable to Upload File) */}
                    <div className="flex justify-center py-2">
                      <label
                        className="bg-white p-2 pb-5 rounded-xs shadow-md border border-black/10 w-28 transition-transform duration-200 cursor-pointer relative group/polaroid"
                        style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                        title="Click to upload photo file"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoFileUpload(photo.id, e.target.files?.[0])}
                        />
                        <div className="w-full aspect-[4/5] bg-neutral-200 rounded-xs overflow-hidden flex items-center justify-center relative">
                          {photo.imageUrl ? (
                            <img
                              src={photo.imageUrl}
                              alt={photo.caption}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-neutral-400 p-1 text-center">
                              <Camera className="w-5 h-5 mb-1 opacity-50" />
                              <span className="text-[9px] font-mono leading-none">
                                Placeholder #{photo.order}
                              </span>
                            </div>
                          )}
                          {/* Hover Upload Overlay */}
                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/polaroid:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-mono gap-1">
                            <Upload className="w-4 h-4 text-[#A3B899]" />
                            <span>{isUploadingThis ? 'Loading...' : 'Upload File'}</span>
                          </div>
                        </div>
                        <p className="serif text-[9px] text-neutral-600 text-center mt-1 truncate">
                          {photo.caption || 'photo caption'}
                        </p>
                      </label>
                    </div>

                    {/* Edit inputs */}
                    <div className="space-y-3 mt-3 pt-3 border-t border-neutral-800">
                      <div>
                        <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                          Caption / Title
                        </label>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handlePhotoChange(photo.id, 'caption', e.target.value)}
                          placeholder="e.g. morning coffee"
                          className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-[#A3B899]"
                        />
                      </div>

                      {/* Direct File Upload + Optional URL Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-neutral-400">
                            Photo Source (File / URL)
                          </label>
                          {photo.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handlePhotoChange(photo.id, 'imageUrl', '')}
                              className="text-[10px] font-mono text-red-400 hover:underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex gap-1.5 mb-1.5">
                          <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#3E4F36]/70 hover:bg-[#3E4F36] border border-[#A3B899]/30 text-white text-xs font-semibold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-[#A3B899]" />
                            <span>{isUploadingThis ? 'Processing...' : 'Pilih File Gambar'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoFileUpload(photo.id, e.target.files?.[0])}
                            />
                          </label>
                        </div>

                        <input
                          type="text"
                          value={isDataUrl ? '' : photo.imageUrl || ''}
                          onChange={(e) => handlePhotoChange(photo.id, 'imageUrl', e.target.value)}
                          placeholder={
                            isDataUrl
                              ? '✓ File gambar tersimpan (atau paste URL baru)'
                              : 'Atau paste link URL gambar...'
                          }
                          className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-[#A3B899] placeholder:text-neutral-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                            Rotation (&deg;)
                          </label>
                          <select
                            value={photo.rotation || 0}
                            onChange={(e) =>
                              handlePhotoChange(photo.id, 'rotation', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-[#A3B899]"
                          >
                            <option value="-6">-6&deg; (Left)</option>
                            <option value="-4">-4&deg;</option>
                            <option value="-3">-3&deg;</option>
                            <option value="-1">-1&deg;</option>
                            <option value="0">0&deg; (Flat)</option>
                            <option value="1">+1&deg;</option>
                            <option value="3">+3&deg;</option>
                            <option value="5">+5&deg; (Right)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            value={photo.order}
                            onChange={(e) =>
                              handlePhotoChange(photo.id, 'order', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-[#A3B899]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          /* Profile & CV (/portofolio) CMS Tab */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
                  <UserCheck className="w-7 h-7 text-[#A3B899]" />
                  Profile, Biodata &amp; CV Manager (/portofolio)
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                  Kelola file/link Download CV dan biodata singkat yang ditampilkan di halaman <code className="text-[#A3B899]">/portofolio</code>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-bold text-sm transition-all shadow-lg self-start sm:self-auto border border-[#A3B899]/30 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSavingProfile ? 'Saving...' : 'Save Profile & CV'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: CV Upload & Link Input */}
              <div className="lg:col-span-5 bg-[#181818] border border-neutral-800 rounded-2xl p-6 space-y-5 h-fit">
                <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
                  <FileText className="w-5 h-5 text-[#A3B899]" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    Download CV / Resume File
                  </h2>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Kamu bisa langsung <strong>upload file PDF CV</strong> dari perangkatmu (otomatis disimpan di database PostgreSQL) atau menempelkan <strong>Link URL CV</strong> (misalnya Google Drive / Dropbox / URL eksternal).
                </p>

                {/* Upload PDF Button */}
                <label className="w-full py-4 px-4 rounded-xl bg-[#3E4F36]/30 hover:bg-[#3E4F36]/50 border-2 border-dashed border-[#A3B899]/50 text-[#A3B899] text-xs font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>
                    {isUploadingCv
                      ? 'Membaca file CV...'
                      : 'Klik untuk Upload File PDF CV dari Perangkat'}
                  </span>
                  <span className="text-[11px] font-normal text-neutral-400">
                    Mendukung .pdf (Maks. 12MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleCvFileUpload(e.target.files?.[0])}
                  />
                </label>

                {profile.cvUrl?.startsWith('data:') && (
                  <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-700/40 flex items-center justify-between gap-2">
                    <div className="text-xs text-emerald-300 truncate">
                      ✓ File PDF tersimpan: <strong>{profile.cvFileName || 'CV.pdf'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          cvUrl: '/CV-Christopher-Edgar.pdf',
                        }))
                      }
                      className="text-[11px] text-red-400 hover:underline shrink-0"
                    >
                      Reset ke URL
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Atau Input Link URL CV (Google Drive / Direct Link)
                  </label>
                  <input
                    type="text"
                    value={profile.cvUrl?.startsWith('data:') ? '' : profile.cvUrl}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, cvUrl: e.target.value }))
                    }
                    placeholder="https://drive.google.com/... atau /CV-Christopher-Edgar.pdf"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                    Nama File Saat Di-download
                  </label>
                  <input
                    type="text"
                    value={profile.cvFileName || ''}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, cvFileName: e.target.value }))
                    }
                    placeholder="CV-Christopher-Edgar.pdf"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
              </div>

              {/* Right Column: Biodata Fields */}
              <div className="lg:col-span-7 bg-[#181818] border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
                  <UserCheck className="w-5 h-5 text-[#A3B899]" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                    Biodata Singkat (/portofolio)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Nickname / Handle
                    </label>
                    <input
                      type="text"
                      value={profile.nickname}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, nickname: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Role / Headline
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                    Biodata Singkat
                  </label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, location: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Pendidikan / Kampus
                    </label>
                    <input
                      type="text"
                      value={profile.university}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, university: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      IPK / GPA
                    </label>
                    <input
                      type="text"
                      value={profile.gpa || ''}
                      placeholder="contoh: 3.78/4"
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, gpa: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Fokus Keahlian
                    </label>
                    <input
                      type="text"
                      value={profile.focus}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, focus: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Email Kontak
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Status Ketersediaan
                    </label>
                    <input
                      type="text"
                      value={profile.availability}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, availability: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Hangline Archive (/contact) CMS Tab */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
                  <Award className="w-7 h-7 text-[#A3B899]" />
                  Hangline Archive Manager (/portofolio)
                </h1>
                <p className="text-neutral-400 text-sm mt-1">
                  Kelola kartu sertifikat, lomba, kepanitiaan, dan milestone yang digantung pada fitur Hangline di halaman /portofolio.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddHangline}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white font-bold text-sm transition-colors shadow-lg self-start sm:self-auto border border-[#A3B899]/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Hangline Print
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hanglineItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#181818] border border-neutral-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-neutral-700 transition-colors"
                >
                  <div>
                    <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`w-full h-full object-cover ${
                            item.certificateOverlay ? 'brightness-50' : ''
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 font-bold">
                          No Image
                        </div>
                      )}

                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                        #{item.number} · {item.category.toUpperCase()}
                      </span>

                      {item.certificateOverlay && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-[#3E4F36]/90 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-[#A3B899]/40">
                          Cert Overlay
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#A3B899]">
                        {item.subtitle}
                      </p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 truncate">
                        {item.specs}
                      </p>
                      <p className="text-xs text-neutral-400 line-clamp-2 pt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[140px]">
                      {item.issuer || item.badgeText}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditHangline(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHanglineItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

              {/* Multi-Image Gallery Upload (Multiple Files or URLs) */}
              <div className="space-y-3 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs uppercase font-bold text-neutral-300">
                      Project Images / Gallery ({formData.images.length} Gambar)
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Bisa pilih banyak gambar sekaligus! Gambar #1 otomatis menjadi Cover utama.
                    </p>
                  </div>
                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, images: [], imageUrl: '' })}
                      className="text-xs font-mono text-red-400 hover:underline"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {/* Upload Multiple Files Button + Add URL Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3E4F36]/80 hover:bg-[#3E4F36] border border-[#A3B899]/40 text-white text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#A3B899]" />
                    <span>
                      {isUploadingProjectImage
                        ? 'Memproses Gambar...'
                        : '+ Upload Gambar (Bisa Pilih Lebih dari 1 File)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleProjectFilesUpload(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newImageUrl}
                    onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    placeholder="Atau paste link URL gambar (https://...) lalu klik + Tambah URL"
                    className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-[#A3B899] placeholder:text-neutral-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700 transition-colors shrink-0"
                  >
                    + Tambah URL
                  </button>
                </div>

                {/* Gallery Preview Grid */}
                {formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {formData.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-lg overflow-hidden border bg-neutral-950 ${
                          idx === 0
                            ? 'border-[#A3B899] ring-1 ring-[#A3B899]/40'
                            : 'border-neutral-700'
                        }`}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-neutral-900">
                          <img
                            src={imgSrc}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10">
                          {idx === 0 ? '★ COVER (#1)' : `#${idx + 1}`}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveProjectImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-950/90 hover:bg-red-600 text-white flex items-center justify-center transition-colors border border-red-400/30"
                          title="Hapus gambar ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Reorder Bar */}
                        {formData.images.length > 1 && (
                          <div className="flex items-center justify-between px-2 py-1 bg-neutral-900/95 border-t border-neutral-800 text-[10px] font-mono">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveProjectImage(idx, -1)}
                              className="px-1.5 py-0.5 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30"
                              title="Geser ke kiri"
                            >
                              ← Geser
                            </button>
                            <button
                              type="button"
                              disabled={idx === formData.images.length - 1}
                              onClick={() => handleMoveProjectImage(idx, 1)}
                              className="px-1.5 py-0.5 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30"
                              title="Geser ke kanan"
                            >
                              Geser →
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 rounded-lg border border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-500 text-xs font-mono gap-1.5">
                    <ImageIcon className="w-6 h-6 opacity-50" />
                    <span>Belum ada gambar untuk project ini</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1.5">
                    Live Demo URL
                  </label>
                  <input
                    type="text"
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
                    type="text"
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
                  disabled={isSubmitting || isUploadingProjectImage}
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

      {/* Create / Edit Hangline Print Modal */}
      {isHanglineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#181818] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#A3B899]" />
                {editingHangline ? 'Edit Hangline Print' : 'Add New Hangline Print'}
              </h2>
              <button
                type="button"
                onClick={() => setIsHanglineModalOpen(false)}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHanglineItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Print Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={hanglineForm.title}
                    onChange={(e) => setHanglineForm({ ...hanglineForm, title: e.target.value })}
                    placeholder="e.g. B.Sc. in Informatics (S.Kom.)"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={hanglineForm.category}
                    onChange={(e) =>
                      setHanglineForm({
                        ...hanglineForm,
                        category: e.target.value as HanglineItem['category'],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="certificate">Certificate</option>
                    <option value="competition">Competition</option>
                    <option value="event">Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Subtitle (Location / Year)
                  </label>
                  <input
                    type="text"
                    value={hanglineForm.subtitle}
                    onChange={(e) => setHanglineForm({ ...hanglineForm, subtitle: e.target.value })}
                    placeholder="e.g. WEST JAKARTA · 2025"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Specs / Technical Metadata
                  </label>
                  <input
                    type="text"
                    value={hanglineForm.specs}
                    onChange={(e) => setHanglineForm({ ...hanglineForm, specs: e.target.value })}
                    placeholder="e.g. NEXT.JS · TYPESCRIPT · POSTGRESQL"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                  Description / Story
                </label>
                <textarea
                  rows={3}
                  value={hanglineForm.description}
                  onChange={(e) =>
                    setHanglineForm({ ...hanglineForm, description: e.target.value })
                  }
                  placeholder="Describe this certificate, competition, or milestone..."
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold text-neutral-300">
                    Print Image / Certificate Photo
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingHanglineImage ? 'Processing...' : 'Upload Gambar'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleHanglineImageUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={hanglineForm.image}
                  onChange={(e) => setHanglineForm({ ...hanglineForm, image: e.target.value })}
                  placeholder="/edgar-warm.jpg atau URL gambar"
                  className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono focus:outline-none focus:border-[#A3B899]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={hanglineForm.badgeText}
                    onChange={(e) =>
                      setHanglineForm({ ...hanglineForm, badgeText: e.target.value })
                    }
                    placeholder="e.g. DEGREE MILESTONE"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Issuer / Organizer
                  </label>
                  <input
                    type="text"
                    value={hanglineForm.issuer}
                    onChange={(e) => setHanglineForm({ ...hanglineForm, issuer: e.target.value })}
                    placeholder="e.g. Informatics Engineering"
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
                    Order (#01, #02...)
                  </label>
                  <input
                    type="number"
                    value={hanglineForm.order}
                    onChange={(e) =>
                      setHanglineForm({ ...hanglineForm, order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-[#A3B899]"
                  />
                </div>
              </div>

              {/* Optional Archival Certificate Overlay Toggle */}
              <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hanglineForm.useCertificateOverlay}
                    onChange={(e) =>
                      setHanglineForm({
                        ...hanglineForm,
                        useCertificateOverlay: e.target.checked,
                      })
                    }
                    className="rounded border-neutral-600"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                    Tampilkan Bingkai Sertifikat Digital di Atas Gambar (Certificate Overlay)
                  </span>
                </label>

                {hanglineForm.useCertificateOverlay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        Issuer Header Text
                      </label>
                      <input
                        type="text"
                        value={hanglineForm.issuerLogoText}
                        onChange={(e) =>
                          setHanglineForm({ ...hanglineForm, issuerLogoText: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        Credential ID
                      </label>
                      <input
                        type="text"
                        value={hanglineForm.credentialId}
                        onChange={(e) =>
                          setHanglineForm({ ...hanglineForm, credentialId: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={hanglineForm.recipient}
                        onChange={(e) =>
                          setHanglineForm({ ...hanglineForm, recipient: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                          Year / Date
                        </label>
                        <input
                          type="text"
                          value={hanglineForm.date}
                          onChange={(e) =>
                            setHanglineForm({ ...hanglineForm, date: e.target.value })
                          }
                          className="w-full px-3 py-1.5 rounded bg-neutral-950 border border-neutral-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                          Accent Color
                        </label>
                        <input
                          type="color"
                          value={hanglineForm.accentColor}
                          onChange={(e) =>
                            setHanglineForm({ ...hanglineForm, accentColor: e.target.value })
                          }
                          className="w-full h-8 rounded bg-neutral-950 border border-neutral-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsHanglineModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingHangline || isUploadingHanglineImage}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#3E4F36] hover:bg-[#2E3B27] text-white text-xs font-bold transition-colors shadow-lg disabled:opacity-50 border border-[#A3B899]/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSavingHangline ? 'Saving...' : 'Save Hangline Print'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

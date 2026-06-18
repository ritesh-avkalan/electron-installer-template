import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { useProjects } from '../context/projects-context';
import type { Project } from '../context/projects-context';
import { 
  Grid2x2, 
  List, 
  Search, 
  ArrowDownNarrowWide, 
  Plus, 
  LogOut, 
  Sun, 
  Moon, 
  Folder, 
  Layers, 
  Settings, 
  X, 
  Calendar, 
  User as UserIcon, 
  Tag,
  Download,
  Info,
  Users,
  RefreshCw
} from 'lucide-react';

export const MyProjectsScreen: React.FC = () => {
  const { profile, logout } = useAuth();
  const { projects, selectedProject, setSelectedProject, addProject } = useProjects();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'date-new' | 'date-old'>('date-new');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Right sidebar tab state
  const [sidebarTab, setSidebarTab] = useState<'details' | 'team'>('details');
  
  // Update state variables
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then(setAppVersion);
    }

    if (window.electronAPI && window.electronAPI.onUpdateStatus) {
      const unsubscribe = window.electronAPI.onUpdateStatus((status, info) => {
        if (status === 'checking') {
          setUpdateStatus('checking');
        } else if (status === 'update-available') {
          setUpdateStatus('available');
          if (window.Notification) {
            new window.Notification('Update Available', {
              body: `Version ${info?.version || '1.0.1'} is available and downloading in the background.`
            });
          }
        } else if (status === 'update-not-available') {
          setUpdateStatus('not-available');
          setTimeout(() => {
            setUpdateStatus('idle');
          }, 3000);
        } else if (status === 'download-progress') {
          setUpdateStatus('downloading');
          setDownloadProgress(typeof info === 'number' ? Math.round(info) : 0);
        } else if (status === 'update-downloaded') {
          setUpdateStatus('downloaded');
          if (window.Notification) {
            new window.Notification('Update Ready to Install', {
              body: `Version ${info?.version || '1.0.1'} has been downloaded. Click "Ready to Install" to restart.`
            });
          }
        } else if (status === 'error') {
          console.error('Update check failed:', info);
          setUpdateStatus('error');
          setTimeout(() => {
            setUpdateStatus('idle');
          }, 4000);
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleCheckForUpdates = () => {
    if (updateStatus === 'downloaded') {
      handleInstallUpdate();
      return;
    }
    if (updateStatus === 'checking' || updateStatus === 'downloading') {
      return;
    }
    if (window.electronAPI && window.electronAPI.checkForUpdates) {
      setUpdateStatus('checking');
      window.electronAPI.checkForUpdates();
    }
  };

  const handleInstallUpdate = () => {
    if (window.electronAPI && window.electronAPI.installUpdate) {
      window.electronAPI.installUpdate();
    }
  };

  const updateButtonConfig = useMemo(() => {
    switch (updateStatus) {
      case 'checking':
        return {
          text: 'Checking...',
          className: 'btn btn-update btn-block',
          style: { gap: '10px', cursor: 'not-allowed', opacity: 0.7 } as React.CSSProperties,
          icon: <RefreshCw size={16} style={{ animation: 'rotate-orbit 1.2s linear infinite' }} />
        };
      case 'available':
        return {
          text: 'Update Available',
          className: 'btn btn-primary btn-block',
          style: { gap: '10px' } as React.CSSProperties,
          icon: <RefreshCw size={16} />
        };
      case 'downloading':
        return {
          text: `Downloading (${downloadProgress}%)`,
          className: 'btn btn-primary btn-block',
          style: { gap: '10px', cursor: 'not-allowed', opacity: 0.9 } as React.CSSProperties,
          icon: <RefreshCw size={16} style={{ animation: 'rotate-orbit 1.2s linear infinite' }} />
        };
      case 'downloaded':
        return {
          text: 'Ready to Install',
          className: 'btn btn-primary btn-block',
          style: { gap: '10px' } as React.CSSProperties,
          icon: <Download size={16} />
        };
      case 'not-available':
        return {
          text: 'Up to Date',
          className: 'btn btn-outline btn-block',
          style: { gap: '10px', borderColor: 'var(--success-color)', color: 'var(--success-color)', cursor: 'default' } as React.CSSProperties,
          icon: <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12" /></svg>
        };
      case 'error':
        return {
          text: 'Failed to fetch',
          className: 'btn btn-outline btn-block',
          style: { gap: '10px', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' } as React.CSSProperties,
          icon: <X size={16} />
        };
      case 'idle':
      default:
        return {
          text: 'Check for Updates',
          className: 'btn btn-update btn-block',
          style: { gap: '10px' } as React.CSSProperties,
          icon: <RefreshCw size={16} />
        };
    }
  }, [updateStatus, downloadProgress]);

  // Form State for new project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');
  const [newProjectCover, setNewProjectCover] = useState('');

  // Handle Theme Toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem('esd.theme') as 'light' | 'dark' | null;
    const currentTheme = savedTheme || 'dark';
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('esd.theme', nextTheme);
  };

  // Filter & Sort Projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.file_name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.file_name.localeCompare(b.file_name);
        case 'name-desc':
          return b.file_name.localeCompare(a.file_name);
        case 'date-new':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'date-old':
          return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, sortOption]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const tagsArray = newProjectTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addProject({
      file_name: newProjectName,
      description: newProjectDesc,
      tags: tagsArray.length > 0 ? tagsArray : ['CAD'],
      image_url: newProjectCover.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    });

    // Reset Form & Close Modal
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectTags('');
    setNewProjectCover('');
    setShowAddModal(false);
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(selectedProject?.id === project.id ? null : project);
  };

  return (
    <div className="app-container">
      {/* 1. Left Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-section">
            <img src="/esd.svg" style={{ width: '32px', height: '32px' }} alt="ESD Logo" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-name">ESD Desktop</span>
              {appVersion && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  v{appVersion}
                </span>
              )}
            </div>
          </div>

          <nav className="sidebar-menu">
            <div className="sidebar-menu-item active">
              <Folder size={18} />
              <span>My Projects</span>
            </div>
            <div className="sidebar-menu-item">
              <Layers size={18} />
              <span>Templates</span>
            </div>
            <div className="sidebar-menu-item">
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          {profile && (
            <div className="user-profile-widget">
              <img src={profile.avatar} alt={profile.name} className="user-avatar" />
              <div className="user-details">
                <span className="user-name">{profile.name}</span>
                <span className="user-email">{profile.email}</span>
              </div>
            </div>
          )}
          <button 
            className={updateButtonConfig.className} 
            onClick={handleCheckForUpdates} 
            style={updateButtonConfig.style}
            disabled={updateStatus === 'checking' || updateStatus === 'downloading' || updateStatus === 'not-available'}
          >
            {updateButtonConfig.icon}
            <span>{updateButtonConfig.text}</span>
          </button>
          <button className="btn btn-outline btn-block" onClick={logout} style={{ gap: '10px' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content inset */}
      <main className="main-content">
        {/* Header bar */}
        <header className="header-bar">
          <div className="header-left">
            <span className="header-title">My Projects</span>
          </div>

          <div className="header-right">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="input-field search-input"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn btn-outline btn-icon" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: '6px' }}>
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body layout */}
        <div className="dashboard-body">
          <div className="dashboard-center">
            {/* Toolbar under header */}
            <div className="dashboard-toolbar">
              <div className="view-tabs">
                <button
                  className={`view-tab ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2x2 size={16} />
                  <span>Grid</span>
                </button>
                <button
                  className={`view-tab ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                  <span>List</span>
                </button>
              </div>

              <div className="toolbar-actions">
                <div className="dropdown-container">
                  <button className="btn btn-outline" onClick={() => setShowSortDropdown(!showSortDropdown)}>
                    <ArrowDownNarrowWide size={16} />
                    <span>Sort</span>
                  </button>
                  {showSortDropdown && (
                    <div className="dropdown-menu">
                      <div
                        className={`dropdown-item ${sortOption === 'name-asc' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOption('name-asc');
                          setShowSortDropdown(false);
                        }}
                      >
                        Name (A-Z)
                      </div>
                      <div
                        className={`dropdown-item ${sortOption === 'name-desc' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOption('name-desc');
                          setShowSortDropdown(false);
                        }}
                      >
                        Name (Z-A)
                      </div>
                      <div
                        className={`dropdown-item ${sortOption === 'date-new' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOption('date-new');
                          setShowSortDropdown(false);
                        }}
                      >
                        Date (Newest First)
                      </div>
                      <div
                        className={`dropdown-item ${sortOption === 'date-old' ? 'active' : ''}`}
                        onClick={() => {
                          setSortOption('date-old');
                          setShowSortDropdown(false);
                        }}
                      >
                        Date (Oldest First)
                      </div>
                    </div>
                  )}
                </div>

                <button className="btn btn-outline" style={{ gap: '6px' }}>
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Content List/Grid */}
            {filteredProjects.length === 0 ? (
              <div className="empty-state">
                <Folder className="empty-state-icon" />
                <h3>No projects found</h3>
                <p>Try refining your search query or create a new project to get started.</p>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Create a Project
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                    onClick={() => handleCardClick(project)}
                  >
                    <div className="project-cover">
                      <img src={project.image_url} alt={project.file_name} onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';
                      }} />
                    </div>
                    <div className="project-info">
                      <h4 className="project-title">{project.file_name}</h4>
                      <p className="project-desc">{project.description}</p>
                      <div className="project-tags">
                        {project.tags.map((tag, idx) => (
                          <span key={idx} className={`badge ${idx % 2 === 0 ? 'badge-blue' : 'badge-purple'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="projects-table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}><input type="checkbox" readOnly /></th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Uploaded At</th>
                      <th>Uploader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className={selectedProject?.id === project.id ? 'selected' : ''}
                        onClick={() => handleCardClick(project)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td><input type="checkbox" checked={selectedProject?.id === project.id} readOnly /></td>
                        <td style={{ fontWeight: 600 }}>{project.file_name}</td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                          <span style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '360px' }}>
                            {project.description}
                          </span>
                        </td>
                        <td>{new Date(project.uploaded_at).toLocaleDateString()}</td>
                        <td>{project.uploaded_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Right sliding Detail Sidebar */}
          {selectedProject && (
            <aside className="detail-sidebar">
              <div className="detail-sidebar-header">
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Project Hub</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelectedProject(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="detail-sidebar-body">
                {/* Simulated 3D CAD Preview Panel */}
                <div className="mock-3d-canvas">
                  <div className="mock-3d-box" />
                  <span style={{ position: 'absolute', bottom: '10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} /> Interactive 3D Orbit View
                  </span>
                </div>

                {/* Tabs selection */}
                <div className="detail-tabs">
                  <button
                    className={`detail-tab ${sidebarTab === 'details' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('details')}
                  >
                    <Info size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Details
                  </button>
                  <button
                    className={`detail-tab ${sidebarTab === 'team' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('team')}
                  >
                    <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Team
                  </button>
                </div>

                {sidebarTab === 'details' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="detail-field">
                      <span className="detail-label">File Name</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>{selectedProject.file_name}</span>
                    </div>

                    <div className="detail-field">
                      <span className="detail-label">Description</span>
                      <span className="detail-value" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {selectedProject.description || 'No description provided.'}
                      </span>
                    </div>

                    <div className="detail-field">
                      <span className="detail-label">Start / Upload Date</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <Calendar size={14} />
                        {new Date(selectedProject.uploaded_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="detail-field">
                      <span className="detail-label">Owner / Uploader</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <UserIcon size={14} />
                        {selectedProject.uploaded_by}
                      </span>
                    </div>

                    <div className="detail-field">
                      <span className="detail-label">Structural Tags</span>
                      <div className="project-tags" style={{ marginTop: '4px' }}>
                        {selectedProject.tags.map((tag, idx) => (
                          <span key={idx} className="badge">
                            <Tag size={10} style={{ marginRight: '4px' }} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="team-list">
                    <div className="team-member">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajib" className="user-avatar" style={{ width: '32px', height: '32px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rajib Chowdhury</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>rajib.chowdhury@ce.iitr.ac.in</span>
                      </div>
                      <span className="team-role">Owner</span>
                    </div>

                    <div className="team-member">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tushar" className="user-avatar" style={{ width: '32px', height: '32px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tushar Mandal</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>tushar.mandal@iitb.ac.in</span>
                      </div>
                      <span className="team-role">Approver</span>
                    </div>

                    <div className="team-member">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bishal" className="user-avatar" style={{ width: '32px', height: '32px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bishal Naik</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>bishal.avkalan@gmail.com</span>
                      </div>
                      <span className="team-role">Consultant</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* 4. Add Project Overlay Modal Dialog */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Create New Structural Project</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                <div className="email-form-group">
                  <label htmlFor="proj-name">Project Name / File Name</label>
                  <input
                    id="proj-name"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Concrete Beam Loading Model"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="email-form-group">
                  <label htmlFor="proj-desc">Description</label>
                  <textarea
                    id="proj-desc"
                    className="input-field"
                    style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Describe the structural mechanics model and analysis conditions..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                </div>

                <div className="email-form-group">
                  <label htmlFor="proj-tags">Tags (comma-separated)</label>
                  <input
                    id="proj-tags"
                    type="text"
                    className="input-field"
                    placeholder="e.g. FEA, Concrete, VTK"
                    value={newProjectTags}
                    onChange={(e) => setNewProjectTags(e.target.value)}
                  />
                </div>

                <div className="email-form-group">
                  <label htmlFor="proj-cover">Cover Image URL (optional)</label>
                  <input
                    id="proj-cover"
                    type="text"
                    className="input-field"
                    placeholder="https://images.unsplash.com/... (or blank for default)"
                    value={newProjectCover}
                    onChange={(e) => setNewProjectCover(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

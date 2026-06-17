import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

export interface Project {
  id: string;
  file_name: string;
  description: string;
  uploaded_by: string;
  image_url: string;
  uploaded_at: string;
  tags: string[];
  folder_name?: string;
  model_name?: string;
}

interface ProjectsContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'uploaded_at' | 'uploaded_by'>) => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    file_name: 'Bridge Structure FEA',
    description: 'Finite element analysis model of a cable-stayed steel bridge layout. Pre-processed in Salome and visualised with VTK.js.',
    uploaded_by: 'Rajib Chowdhury',
    image_url: 'https://images.unsplash.com/photo-1545628224-6997084535cb?q=80&w=600&auto=format&fit=crop',
    uploaded_at: '2026-06-10T12:00:00Z',
    tags: ['FEA', 'Salome', 'VTK'],
    folder_name: 'bridge_structure',
  },
  {
    id: '2',
    file_name: 'OCCT Bracket Model',
    description: 'CAD structure of an aerospace mounting bracket designed using OpenCascade technology algorithms. Includes stress-test conditions.',
    uploaded_by: 'Tushar Mandal',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop',
    uploaded_at: '2026-06-12T14:30:00Z',
    tags: ['CAD', 'OCCT', 'Aerospace'],
    folder_name: 'occt_bracket',
  },
  {
    id: '3',
    file_name: 'Post-Processing Node Graph',
    description: 'Vtk visual post-processing node network configuration. Connects stress values to gradient color map builders.',
    uploaded_by: 'Bishal Naik',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    uploaded_at: '2026-06-15T09:15:00Z',
    tags: ['VTK', 'Node Graph', 'Visuals'],
    folder_name: 'node_graph_vtk',
  }
];

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLocalProjects = () => {
    const cached = localStorage.getItem('esd.projects');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached projects', e);
      }
    }
    setProjects(DEFAULT_PROJECTS);
    localStorage.setItem('esd.projects', JSON.stringify(DEFAULT_PROJECTS));
  };

  const refreshProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/files/");
      if (res.ok) {
        const data = await res.ok ? await res.json() : null;
        if (Array.isArray(data)) {
          setProjects(data);
          localStorage.setItem('esd.projects', JSON.stringify(data));
          setLoading(false);
          return;
        }
      }
      loadLocalProjects();
    } catch (err) {
      console.warn("Failed to load projects from server, falling back to local database:", err);
      loadLocalProjects();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [profile]);

  const addProject = (newProj: Omit<Project, 'id' | 'uploaded_at' | 'uploaded_by'>) => {
    const project: Project = {
      ...newProj,
      id: Math.random().toString(36).substring(2, 9),
      uploaded_at: new Date().toISOString(),
      uploaded_by: profile?.name || 'Guest User'
    };

    const updated = [project, ...projects];
    setProjects(updated);
    localStorage.setItem('esd.projects', JSON.stringify(updated));

    // Proactively sync to backend
    fetch("http://localhost:8000/files/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    }).catch(() => console.log("Offline mode: project added locally only"));
  };

  return (
    <ProjectsContext.Provider value={{ projects, selectedProject, setSelectedProject, addProject, refreshProjects, loading }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

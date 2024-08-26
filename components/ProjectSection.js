import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectSection = ({ projects }) => (
  <section className="cards">
    {projects.map((project, index) => (
      <ProjectCard key={index} project={project} />
    ))}
  </section>
);

export default ProjectSection;

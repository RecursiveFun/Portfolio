import React from 'react';

const ProjectCard = ({ project }) => (
  <div className="card">
    <div className="card-content">
      {project.videoUrl ? (
        <iframe
          className="thumbnail"
          width="100%"
          height="auto"
          src={project.videoUrl}
          title={project.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        ></iframe>
      ) : (
        <picture className="thumbnail">
          <img src={project.imageUrl} alt={project.title} />
        </picture>
      )}
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="github-link">
        <a target="_blank" href={project.githubUrl}>
          <img width="50px" height="auto" src="/images/github.png" alt="GitHub" />
        </a>
        <a target="_blank" href={project.githubUrl}>
          GitHub
        </a>
      </div>
    </div>
  </div>
);

export default ProjectCard;

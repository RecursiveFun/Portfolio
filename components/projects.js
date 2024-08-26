import React from 'react';
import ProjectSection from './ProjectSection';

const projectsData = [
  {
    title: "Xamarin Course Planner",
    description: "Mobile app built with Xamarin Forms and SQLite which was for my mobile application development class. The application is where I learned asynchronous programming concepts and I had to apply them to this project. NuGet Package Xam.Plugins.Notifier was also used in this project.",
    videoUrl: "https://www.youtube.com/embed/T5CiBd7XqQA",
    githubUrl: "https://github.com/RecursiveFun/Course_Planner"
  },
  {
    title: "C# WinForms Appointment Scheduler Application",
    description: "C# WinForms scheduling application with globalization, displaying the appointments in the users local time and converting it to the MYSQL servers time in 00:00 UTC automagically.",
    videoUrl: "https://www.youtube.com/embed/td2zmk2rGRk",
    githubUrl: "https://github.com/RecursiveFun/Appointment_Scheduler"
  },
  {
    title: "C# WinForms Inventory Management System",
    description: "A WinForms inventory management system written in C# with basic CRUD operations, error handling, and polymorphism.",
    imageUrl: "https://user-images.githubusercontent.com/50165092/211186383-74f52037-1953-4a6c-b4e4-11edb63c6607.png",
    githubUrl: "https://github.com/RecursiveFun/InventoryManagementSystem"
  },
  {
    title: "YelpCamp Web App",
    description: "This web app was made with Express, Mongoose, Node, and MongoDB. Users are able to register and create new campgrounds, users can also upload/delete images which get uploaded to cloundinary via the cloudinary API. The camps are dynamically displayed using the MapBox API. Users can also leave reviews on each campground.",
    imageUrl: "https://i.imgur.com/4PrHfaC.png",
    githubUrl: "https://github.com/RecursiveFun/YelpCamp"
  }
];

const Projects = () => {
  const firstSection = projectsData.slice(0, 2);
  const secondSection = projectsData.slice(2);

  return (
    <div className="centered">
      <ProjectSection projects={firstSection} />
      <ProjectSection projects={secondSection} />
    </div>
  );
};

export default Projects;
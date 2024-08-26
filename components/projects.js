import React, { Component } from 'react';

export default class Projects extends Component {
    render() {
        return(
          <div className="centered">
          <section className="cards"> 
                <div className="card">
                  <div className="card-content">
                  <iframe className="thumbnail" width="100%" height="auto" src="https://www.youtube.com/embed/T5CiBd7XqQA" title="Course Planner" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"></iframe>
                    <h3>Xamarin Course Planner</h3>
                    <p>Mobile app built with Xamarin Forms and SQLite which was for my mobile application development class. The application is where I learned asynchronous programming concepts and I had to apply them to this project. NuGet Package Xam.Plugins.Notifier was also used in this project.</p>
                    <div className="github-link">
                      <a target="_blank" href="https://github.com/RecursiveFun/Course_Planner"><img width="50px" height ="auto" src="/images/github.png"/></a>
                      <a target="_blank" href="https://github.com/RecursiveFun/Course_Planner">GitHub</a>
                    </div>
                  </div>
                </div> 
                <div className="card">
                        <div className="card-content">
                        <iframe className="thumbnail" width="100%" height="auto" src="https://www.youtube.com/embed/td2zmk2rGRk" title="Appointment Scheduler" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"></iframe>
                            <h3>C# WinForms Appointment Scheduler Application</h3>
                            <p>C# WinForms scheduling application with globalization, displaying the appointments in the users local time and converting it to the MYSQL servers time in 00:00 UTC automagically.</p>
                            <div className="github-link">
                              <a target="_blank" href="https://github.com/RecursiveFun/Appointment_Scheduler"><img width="50px" height ="auto" src="/images/github.png"/></a>
                              <a target="_blank" href="https://github.com/RecursiveFun/Appointment_Scheduler">GitHub</a>
                            </div>
                        </div>
                </div> 
          </section>
          <section className="cards"> 
                <div className="card">
                        <picture className="thumbnail">
                          <img src="https://user-images.githubusercontent.com/50165092/211186383-74f52037-1953-4a6c-b4e4-11edb63c6607.png"/>
                        </picture>
                        <div className="card-content">
                            <h3>C# WinForms Inventory Management System</h3>
                            <p style={{marginTop: 40}}>A WinForms inventory management system written in C# with basic CRUD operations, error handling, and polymorphism.</p>
                            <div className="github-link">
                              <a target="_blank" href="https://github.com/RecursiveFun/InventoryManagementSystem"><img width="50px" height ="auto" src="/images/github.png"/></a>
                              <a target="_blank" href="https://github.com/RecursiveFun/InventoryManagementSystem">GitHub</a>
                            </div>
                        </div>
                </div> 
                <div className="card">
                        <picture className="thumbnail">
                          <img src="https://i.imgur.com/4PrHfaC.png"/>
                        </picture>
                        <div className="card-content">
                            <h3>YelpCamp Web App</h3>
                            <p>This web app was made with Express, Mongoose, Node, and MongoDB. Users are able to register and create new campgrounds, users can also upload/delete images which get uploaded to cloundinary via the cloudinary API. The camps are dynamically displayed using the MapBox API. 
                            Users can also leave reviews on each campground.
                            </p>
                            <div className="github-link">
                              <a target="_blank" href="https://github.com/RecursiveFun/YelpCamp"><img width="50px" height ="auto" src="/images/github.png"/></a>
                              <a target="_blank" href="https://github.com/RecursiveFun/YelpCamp">GitHub</a>
                            </div>
                        </div>
                </div> 
          </section>
        </div>
        )
      }
}
import React, { Component } from 'react';

export default class Projects extends Component {
    render() {
        return(
          <div className="centered">
          <section className="cards"> 
                <div className="card">
                  <div className="card-content">
                  <iframe className="thumbnail" width="100%" height="auto" src="https://www.youtube.com/embed/T5CiBd7XqQA" title="Course Planner" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"></iframe>
                    <h3>Xamarin Course Planner</h3>
                    <p>Mobile app built with Xamarin Forms and SQLite which was for my mobile application development class.</p>
                    <a target="_blank" href="https://github.com/RecursiveFun/Course_Planner"><img width="50px" height ="auto" src="/images/github.png"/>GitHub</a>
                  </div>
                </div> 
                <div className="card">
                        <div className="card-content">
                        <iframe className="thumbnail" width="100%" height="auto" src="https://www.youtube.com/embed/td2zmk2rGRk" title="Appointment Scheduler" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"></iframe>
                            <h3>C# WinForms Appointment Scheduler Application</h3>
                            <p>C# WinForms scheduling application with globalization, displaying the appointments in the users local time and converting it to the MYSQL servers time in UTC 00:00 automagically.</p>
                            <a target="_blank" href="https://github.com/RecursiveFun/Appointment_Scheduler"><img width="50px" height ="auto" src="/images/github.png"/>GitHub</a>
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
                            <p>A WinForms inventory management system written in C# with basic CRUD operations, error handling, and polymorphism.</p>
                            <a target="_blank" href="https://github.com/RecursiveFun/InventoryManagementSystem"><img width="50px" height ="auto" src="/images/github.png"/>GitHub</a>
                        </div>
                </div> 
                <div className="card">
                        <picture className="thumbnail">
                          <img src="https://i.imgur.com/VDx7u18.png"/>
                        </picture>
                        <div className="card-content">
                            <h3>New Paths Inc. Company Website</h3>
                            <p>The website was designed with custom HTML, CSS, Javascipt, PHP and also used the bootstrap framework.</p>
                            <a target="_blank" href="https://github.com/RecursiveFun/NPIWebsite"><img width="50px" height ="auto" src="/images/github.png"/>GitHub</a>
                        </div>
                </div> 
          </section>
        </div>
        )
      }
}


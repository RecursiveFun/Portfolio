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
                            <p>C# WinForms scheduling application with globalization and connected to a MySQL database hosted locally.</p>
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
                          <img src="/images/photo.jpg"/>
                        </picture>
                        <div className="card-content">
                            <h3>Project 4</h3>
                            <p>Project Description</p>
                        </div>
                </div> 
          </section>
        </div>
        )
      }
}


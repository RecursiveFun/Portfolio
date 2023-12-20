import React, { Component } from 'react';

export default class Projects extends Component {

    render() {
        return(
          <div class="centered">
          <section class="cards"> 
                <div class="card">
                        <picture class="thumbnail">
                          <img src="/images/photo.jpg"/>
                        </picture>
                        <div class="card-content">
                            <h3>Project 1</h3>
                            <p>Project Description</p>
                        </div>
                </div> 
                <div class="card">
                        <picture class="thumbnail">
                          <img src="/images/photo2.jpg"/>
                        </picture>
                        <div class="card-content">
                            <h3>Project 2</h3>
                            <p>Project Description</p>
                        </div>
                </div> 
                <div class="card">
                        <picture class="thumbnail">
                          <img src="/images/photo2.jpg"/>
                        </picture>
                        <div class="card-content">
                            <h3>Project 3</h3>
                            <p>Project Description</p>
                        </div>
                </div> 
          </section>
        </div>
        )
      }
}


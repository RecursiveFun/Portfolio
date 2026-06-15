---
title: Building YelpCamp — A Full-Stack Campground App with Node and MongoDB
date: 2026/06/15
description: A deep dive into building a campground review and booking platform with Express, Mongoose, MongoDB, Cloudinary, and MapBox.
tag: web development, node.js, mongodb
author: Felix Berinde
---

# Building YelpCamp — A Full-Stack Campground App

YelpCamp is a full-stack web application I built to practice the MERN-adjacent stack: **Node.js**, **Express**, **MongoDB**, and **Mongoose** on the backend, with **EJS** templates on the frontend. The app lets users register accounts, create campground listings, upload photos, leave reviews, and explore campgrounds on an interactive map.

This post walks through the architecture, key technical decisions, and lessons learned along the way.

## Project Goals

When I started YelpCamp, my primary goals were:

1. Learn how to model relational-style data in a document database
2. Practice user authentication and authorization in Express
3. Integrate third-party APIs (Cloudinary for images, MapBox for maps)
4. Deploy a real application to a cloud host

The project is inspired by Colt Steele's web development curriculum, but I extended it with my own deployment setup and troubleshooting experience on Render's free tier.

## Architecture Overview

The application follows a classic MVC-style structure:

- **Models** — Mongoose schemas for `User`, `Campground`, and `Review`
- **Views** — EJS templates rendered server-side
- **Controllers** — Route handlers that coordinate database operations and render responses

```
User ──creates──▶ Campground ──has many──▶ Reviews
                      │
                      └── stores image URLs from Cloudinary
                      └── stores coordinates for MapBox
```

### Database Design

MongoDB stores documents rather than rows, so relationships are modeled with references:

- A **Campground** document holds title, location, description, price, images, geometry (coordinates), and an array of review ObjectIds.
- A **Review** document holds body text, a rating, and a reference to the author.
- A **User** document holds username and a hashed password.

Using Mongoose `populate()` makes it straightforward to load a campground with its reviews and each review's author in a single query chain.

## Authentication and Authorization

User registration and login use **passport-local** with **passport-local-mongoose**, which handles password hashing and salting automatically. Sessions are stored server-side so users stay logged in across requests.

Authorization middleware ensures only the campground owner can edit or delete their listing. Review authors can edit or delete their own reviews. This pattern — checking `req.user._id` against the document's `author` field — is simple but effective for a project of this scale.

## Image Uploads with Cloudinary

Campground photos are uploaded through **Multer** middleware and sent to **Cloudinary** for storage. Cloudinary returns a URL and filename, which get saved on the campground document.

This approach offloads image hosting and resizing to a specialized service rather than storing files on the application server — critical for cloud deployments where the filesystem is ephemeral.

Key steps in the upload flow:

1. Multer parses the multipart form and provides a file buffer
2. The buffer is streamed to Cloudinary via their Node SDK
3. The returned `url` and `filename` are attached to the campground before saving

## Map Integration with MapBox

Each campground stores **GeoJSON** geometry with longitude and latitude coordinates. On the index and detail pages, **MapBox GL JS** renders an interactive map with markers for every campground.

Clustering markers on the index page keeps the map readable when many campgrounds exist in the same region. Clicking a marker navigates to the campground's detail page.

Geocoding — converting a location string entered by the user into coordinates — uses MapBox's Geocoding API on the server when a new campground is created.

## Deployment on Render

I deployed YelpCamp to **Render** using their free web service tier. The app connects to a **MongoDB Atlas** cluster for the database.

Free-tier hosting comes with trade-offs:

- The server spins down after inactivity, causing a cold-start delay on the first visit
- Environment variables (database URI, Cloudinary keys, MapBox token, session secret) must be configured in the Render dashboard

Documenting these gotchas helped me understand production concerns that do not appear in local development.

## Error Handling and Validation

Server-side validation uses **Joi** schemas to validate campground and review input before it reaches the database. Express error-handling middleware catches thrown errors and renders a user-friendly error page instead of exposing stack traces.

Client-side validation on forms provides immediate feedback, but server-side validation remains the source of truth — never trust the browser.

## What I Would Improve Next

If I revisit this project, here are the upgrades on my list:

- **Migrate the frontend to React** for a more interactive experience
- **Add pagination** to the campground index for large datasets
- **Implement rate limiting** on authentication routes
- **Add unit and integration tests** for models and routes
- **Upgrade to a paid hosting tier** or add a keep-alive ping to reduce cold starts

## Conclusion

YelpCamp was one of the most educational projects in my learning journey. It tied together routing, templating, database modeling, file uploads, third-party APIs, authentication, and deployment into a single cohesive application.

The source code is available on [GitHub](https://github.com/RecursiveFun/YelpCamp). If you are learning the Node/Express ecosystem, building a project like this — with real user accounts and external integrations — accelerates your understanding far beyond tutorial exercises.

Have questions about the implementation? Reach out on the [Contact](/contact) page.

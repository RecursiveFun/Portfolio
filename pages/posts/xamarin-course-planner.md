---
title: Xamarin Forms and SQLite — Building a Mobile Course Planner
date: 2026/06/13
description: Lessons from building a Xamarin Forms mobile app with SQLite, async programming, and local notifications.
tag: mobile, xamarin, csharp
author: Felix Berinde
---

# Xamarin Forms and SQLite — Building a Mobile Course Planner

The **Course Planner** is a mobile application I built with **Xamarin Forms** and **SQLite** for a mobile application development course. It helps students track courses, assignments, and deadlines with local notifications for upcoming due dates.

This post covers the technical architecture, async patterns I had to learn, and how local data storage works on mobile.

## What the App Does

Users can:

- Add, edit, and delete courses
- Track assignments with due dates
- Receive local push notifications before deadlines
- View all data offline — no internet connection required

The app targets both Android and iOS from a single shared codebase, which is Xamarin Forms' primary value proposition.

## Project Structure

Xamarin Forms projects are organized into shared and platform-specific layers:

- **Shared project** — Views (XAML), ViewModels, Models, and Services used by both platforms
- **Android project** — Platform-specific renderers and initialization
- **iOS project** — Platform-specific renderers and initialization

The shared code handles roughly 90% of the application logic. Platform projects only contain code that must differ between Android and iOS.

## Data Layer with SQLite

Mobile apps need fast, reliable local storage. **SQLite** is the standard choice for structured data on device.

I used the **sqlite-net-pcl** NuGet package, which provides a lightweight ORM for Xamarin:

```csharp
public class Course
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }
    public string Name { get; set; }
    public string Instructor { get; set; }
    public DateTime StartDate { get; set; }
}
```

The database file lives in the app's sandboxed storage directory, accessible via `Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)`.

### CRUD Operations

All database operations run asynchronously to avoid blocking the UI thread:

```csharp
public async Task<List<Course>> GetCoursesAsync()
{
    return await _database.Table<Course>().ToListAsync();
}

public async Task<int> SaveCourseAsync(Course course)
{
    if (course.Id != 0)
        return await _database.UpdateAsync(course);
    else
        return await _database.InsertAsync(course);
}
```

Calling database methods from the UI without `async/await` causes the app to freeze — a mistake I made early on and quickly learned to avoid.

## Async Programming in Xamarin

This project was my first serious exposure to **async/await** in C#. Key patterns I used throughout:

- `async Task` return types on methods that perform I/O
- `await` before every database call and network request
- `ConfigureAwait(false)` in library code (though less critical in UI apps)

The mental model that finally clicked: `await` yields control back to the UI thread while the database operation completes in the background. When it finishes, execution resumes on the UI thread to update the interface.

## Local Notifications

The **Xam.Plugins.Notifier** NuGet package handles scheduling local notifications on both platforms. When a user sets a due date on an assignment, the app schedules a notification to fire 24 hours before the deadline.

Platform-specific configuration is required:

- **Android** — Notification channels (required on API 26+)
- **iOS** — Requesting notification permissions from the user on first launch

Handling permission denial gracefully — showing a message explaining why notifications are useful rather than silently failing — improved the user experience.

## UI with XAML

Xamarin Forms UI is defined in **XAML**, similar to WPF:

```xml
<ListView ItemsSource="{Binding Courses}">
    <ListView.ItemTemplate>
        <DataTemplate>
            <TextCell Text="{Binding Name}"
                      Detail="{Binding Instructor}" />
        </DataTemplate>
    </ListView.ItemTemplate>
</ListView>
```

Data binding connects the UI to ViewModels, keeping code-behind minimal. The **MVVM pattern** (Model-View-ViewModel) separates presentation logic from views, making the app easier to test and maintain.

## Challenges and Solutions

### Database Initialization Race Condition

On first launch, the database file does not exist. I initialized it in the app constructor before any page tried to query it. Loading a splash page while initialization completed prevented null reference errors.

### Date/Time Display

SQLite stores dates as strings or ticks depending on configuration. Consistent serialization with `DateTime.ToString("o")` (ISO 8601) avoided parsing issues across cultures.

### Testing on Physical Devices

The Android emulator is slow for notification testing. Deploying to a physical device via USB debugging gave much faster feedback on notification timing and appearance.

## What Xamarin Taught Me About Mobile Development

1. **The UI thread is sacred** — Never block it with synchronous I/O
2. **Local-first data** — Design for offline use; sync to a server only when needed
3. **Platform differences are real** — Even with Xamarin Forms, notifications, file paths, and permissions differ between Android and iOS
4. **MVVM scales** — Separating ViewModels from Views makes complex UIs manageable

## Looking Ahead

Xamarin Forms has been superseded by **.NET MAUI** for new projects. The concepts from this app — SQLite for local storage, async data access, MVVM, platform-specific services — transfer directly to MAUI development.

The source code and a [demo video](https://www.youtube.com/embed/T5CiBd7XqQA) are available on [GitHub](https://github.com/RecursiveFun/Course_Planner).

If you are starting with mobile development in the .NET ecosystem, a course planner or task manager is an excellent first project: it exercises CRUD, dates, notifications, and local storage without requiring a backend.

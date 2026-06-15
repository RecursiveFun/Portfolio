---
title: CRUD and Polymorphism in a C# WinForms Inventory System
date: 2026/06/12
description: Building a desktop inventory management app with C# WinForms, MySQL, and object-oriented design patterns.
tag: c#, desktop, winforms
author: Felix Berinde
---

# CRUD and Polymorphism in a C# WinForms Inventory System

The **Inventory Management System** is a desktop application I built with **C# WinForms** and **MySQL**. It manages parts and products in a manufacturing-style inventory workflow — tracking quantities, costs, and associations between parts and the products that use them.

This post focuses on the object-oriented design, CRUD operations, and error handling patterns that make the app maintainable.

## Domain Model

The inventory domain has two main entity types:

- **Part** — A raw component with a name, cost, and stock quantity
- **Product** — An assembly made from one or more parts, with its own price and stock

Both inherit from an abstract **InventoryItem** base class that defines shared behavior:

```csharp
public abstract class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int InStock { get; set; }
    public int Min { get; set; }
    public int Max { get; set; }

    public abstract int GetId();
}
```

### Why Polymorphism Here?

Parts and products share a similar shape — ID, name, pricing, stock levels, min/max thresholds — but they are stored in separate database tables and have different associated operations. The abstract base class lets the UI treat them uniformly in list views while each subclass implements type-specific logic.

For example, a `DataGridView` can bind to a `List<InventoryItem>` and display both parts and products without separate grids or duplicate formatting code.

## CRUD Operations

Each entity type supports full **Create, Read, Update, Delete** operations through dedicated forms:

| Operation | Part | Product |
|-----------|------|---------|
| Create | Add Part form | Add Product form (with part selection) |
| Read | Main inventory grid | Main inventory grid |
| Update | Modify Part form | Modify Product form |
| Delete | Confirmation dialog | Confirmation dialog (checks for associated parts) |

All database interactions use **parameterized queries** to prevent SQL injection:

```csharp
string query = "INSERT INTO part (name, instock, price, min, max) VALUES (@name, @instock, @price, @min, @max)";
command.Parameters.AddWithValue("@name", part.Name);
```

### Product-Part Associations

Products are composed of parts. A junction table links product IDs to part IDs with quantities. When displaying a product, the app queries this junction table and shows which parts — and how many of each — are required to build one unit.

Deleting a part that is still associated with a product is blocked with a clear error message, preventing orphaned references.

## Validation and Error Handling

Input validation happens at two levels:

1. **UI validation** — Required fields, numeric ranges, and non-negative stock values are checked before the save button triggers a database call
2. **Business rule validation** — Stock cannot go below zero; min must be less than max; product cost is calculated from component part costs

Database exceptions are caught and displayed in message boxes rather than crashing the application:

```csharp
try
{
    // database operation
}
catch (MySqlException ex)
{
    MessageBox.Show($"Database error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
}
```

This pattern is simple but teaches the importance of graceful failure — users should always know what went wrong and what to do next.

## Inventory Alerts

The app highlights items where stock has fallen below the configured minimum. This is a basic version of inventory alerting that real warehouse systems use at much larger scale.

The query filters items where `InStock < Min` and displays them in a separate view, giving the user a quick action list for reordering.

## UI Layout

The main form uses a `TabControl` to separate:

- **Parts list** — All parts with stock status
- **Products list** — All products with associated part counts
- **Reports** — Low stock alerts

WinForms `DataGridView` controls handle tabular display with sortable columns. Double-clicking a row opens the modify form for that item.

## What This Project Taught Me

1. **Inheritance reduces duplication** — Shared fields and behavior belong in a base class; type-specific logic stays in subclasses
2. **Validate early, validate often** — Catching bad input at the UI layer saves confusing database errors later
3. **Parameterized SQL is mandatory** — Even in learning projects, write safe queries from the start
4. **Desktop apps need clear error UX** — Users of business tools expect informative messages, not stack traces

## Source Code

The project is open source on [GitHub](https://github.com/RecursiveFun/InventoryManagementSystem). It pairs well with the [Appointment Scheduler write-up](/posts/appointment-scheduler-timezones) if you are exploring C# desktop development with MySQL.

For questions or feedback, visit the [Contact](/contact) page.

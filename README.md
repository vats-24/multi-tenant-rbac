# Multi-Tenant RBAC System (Fastify + Drizzle)

## 📖 Project History

This project was originally developed in 2024 as a deep-dive into multi-tenant database architectures and complex permission systems. It has been recently refactored to align with modern best practices and uploaded to GitHub to demonstrate my proficiency in Fastify, Drizzle ORM, and secure backend design.

## Project

A production-ready, highly scalable Multi-Tenant Role-Based Access Control (RBAC) system. This architecture allows you to serve multiple independent organizations (tenants) from a single API instance while maintaining strict data isolation.

## 🚀 Key Features

- **Entity Isolation:** All data (Users, Roles, Assignments) is scoped via `applicationId`.
- **Atomic Tenant Bootstrapping:** Creating an application automatically seeds required system roles.
- **Initial Admin Guard:** A unique "Initial User" logic ensures the first user of a tenant becomes the Super Admin.
- **Stateless Authorization:** Permissions are flattened into JWT "scopes," eliminating the need for database lookups on every request.
- **Type-Safe Permissions:** Centralized permission management using TypeScript `as const`.

---

## 🏗️ Technical Architecture

### 1. Data Modeling (Drizzle ORM)

The system uses **Composite Primary Keys** to ensure that while an email or role name must be unique within one application, it can be reused in another.

- **Applications Table:** The "Tenant" container.
- **Users Table:** Unique by `(email, applicationId)`.
- **Roles Table:** Unique by `(name, applicationId)`. Contains a `text[].$type<string[]>` column for permissions.
- **UsersToRoles Table:** A many-to-many join table linking Users, Roles, and Applications.

### 2. The Permission "Glue"

Permissions are defined in `src/config/permissions.ts`. This acts as the single source of truth for the entire application.

- `ALL_PERMISSIONS`: Every possible action.
- `USER_ROLE_PERMISSIONS`: The default subset for standard users.

---

## 🚦 API Workflow & Lifecycle

### Step 1: Create the Tenant (Application)

**Endpoint:** `POST /api/applications`  
**What happens:** 1. The Application record is created. 2. The `SUPER_ADMIN` role is created with all permissions. 3. The `APPLICATION_USER` role is created with basic permissions.

### Step 2: Onboard the First Admin

**Endpoint:** `POST /api/users`  
**Payload:** `{ "email": "...", "initialUser": true, "applicationId": "..." }`  
**What happens:** - The system checks if any users exist for that ID. If zero, this user is assigned the `SUPER_ADMIN` role.

### Step 3: Login & Authorization

**Endpoint:** `POST /api/users/login`  
**What happens:** - The user is authenticated.

- The system fetches all permissions from their assigned roles and injects them into the JWT as `scopes`.

### Step 4: Route Protection

Routes are guarded using `preHandler` hooks:

```typescript
{
  preHandler: [app.guard.scope(PERMISSIONS["users:roles:write"])];
}
```

---

## ⚙️ Setup & Installation

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

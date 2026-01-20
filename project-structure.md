# Project Structure Reference

## Backend Structure
- **config** - Configuration files
- **controller** - REST API controllers
- **model** - Entity/Domain models
- **dto** - Data Transfer Objects
- **mapper** - MapStruct mappers for entity-DTO conversion
- **service** - Business logic layer
- **repo** - Repository layer (Data access)

**Technology Stack:** Spring Boot with MapStruct
**Note:** Only use these layers and technologies. No other patterns or technologies should be introduced.

## Frontend Structure
- **feature** - Feature-based organization
  - **auth** - Authentication feature
    - **component** - React components
    - **hooks** - Custom React hooks
    - **pages** - Page components
    - **service** - API service calls

**Technology Stack:** React with hooks + Tailwind CSS
**Note:** Only use these patterns and technologies. No other techniques should be included.

## Guidelines
- Backend: Strictly follow the layered architecture (config → controller → service → repo)
- Frontend: Strictly follow the feature-based structure with components, hooks, pages, and services
- Use MapStruct for all entity-DTO mappings
- Use Tailwind CSS for styling (no separate CSS files)
- Keep implementations minimal and focused

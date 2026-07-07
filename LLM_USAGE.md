# LLM Usage

This project was developed by me with assistance from AI.

AI was used primarily for:

- brainstorming application architecture
- discussing React Query patterns
- suggesting folder organization
- reviewing TypeScript types
- generating initial code drafts for selected components
- reviewing error handling and retry strategies
- identifying possible improvements during refactoring

All generated code was manually reviewed, modified where necessary, tested locally, and integrated by me.

---

## Prompt Log

### Prompt 1
Purpose:
Design the project architecture.

Influenced:

- folder structure
- React Query organization
- navigation layout

Developer work:

- simplified the architecture to match the provided API
- removed unnecessary authentication
- removed unused features

---

### Prompt 2
Purpose:

Bootstrap Expo project.

Influenced:

- project configuration
- providers
- linting
- folder creation

Developer work:

- adjusted dependency versions
- fixed Expo SDK compatibility
- configured aliases manually

---

### Prompt 3

Purpose:

Design API layer.

Influenced:

- Axios client
- error normalization
- retry strategy

Developer work:

- adapted implementation to provided api.js
- verified error handling
- tested against randomly failing server

---

### Prompt 4

Purpose:

Create React Query structure.

Influenced:

- query hooks
- mutations
- cache invalidation

Developer work:

- tuned retry behavior
- verified optimistic updates
- fixed cache invalidation issues

---

### Prompt 5

Purpose:

Implement gallery, detail, upload features.

Influenced:

- screen structure
- reusable components
- forms

Developer work:

- fixed TypeScript errors
- adjusted API integration
- verified UI manually
- refined component organization

---

### Prompt 6

Purpose:

Generate testing strategy.

Influenced:

- Jest configuration
- unit tests
- integration tests

Developer work:

- corrected failing tests
- updated assertions
- fixed Jest compatibility

---

### Prompt 7

Purpose:

Production code review.

Influenced:

- performance improvements
- accessibility improvements
- code cleanup

Developer work:

- reviewed every suggested change
- applied only appropriate refactorings
- validated final application

---

## Verification

The final application was verified by:

- TypeScript compilation
- Jest test suite
- Manual device testing
- API testing against the provided server
- Manual code review

AI output was treated as a starting point rather than accepted verbatim.
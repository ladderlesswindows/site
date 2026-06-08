# AGENTS.md - Rules for Grok Build & AI Assistants

## Core Philosophy
- **Least Code Possible** – We want the smallest, cleanest implementation that works well.
- **Minimalism First** – Avoid over-engineering, scaffolding, or future-proofing until it's actually needed.
- **User-Driven Development** – The user will express the vision in conversation. Do not add features, pages, or complexity without explicit direction.

## Strict Rules When Working on This Project

1. **Minimal Changes Only**
   - Always make the smallest possible change that solves the current request.
   - Never add extra features, animations, libraries, or "nice-to-haves" unless specifically asked.

2. **No Speculative Code**
   - Do not create placeholders for future features (e.g. "coming soon" sections, extra pages, payment flows, etc.).
   - Do not add code for features we "might need later."

3. **Keep It Simple & Lightweight**
   - Prefer plain React/Next.js patterns over heavy abstractions.
   - Use existing components and styles whenever possible.
   - Avoid new dependencies unless absolutely necessary.

4. **Code Quality & Maintainability**
   - Write clean, readable, well-commented code.
   - Follow the existing code style and folder structure.
   - Modular monolith mindset: Keep related code together, but don't over-split until complexity demands it.

5. **Decision Making**
   - When in doubt, choose the simpler solution.
   - Ask clarifying questions before making big architectural changes.
   - Always show the proposed change clearly before applying it.

6. **Website-Specific Guidelines**
   - This is a marketing/landing site for Ladderless Windows (window cleaning gig service).
   - Prioritize fast loading, mobile-first design, and clear conversion (booking / contact).
   - Keep the design professional, trustworthy, and simple.

## Forbidden Patterns
- Adding unused files or folders
- Creating complex state management unless required
- Heavy animation libraries
- Overly clever code or premature optimization

---

**Current Goal Reminder:**
Build the simplest, most effective landing + provider app website possible for a small window cleaning service. Focus on clarity and conversion, not impressing with code complexity.

When you receive a request, respond with:
1. Brief confirmation of understanding
2. The minimal change needed
3. The updated code/files (if applicable)

Let's keep this project lean and powerful.

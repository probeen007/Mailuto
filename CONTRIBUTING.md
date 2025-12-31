# Contributing to Mailuto

## Development Workflow

### Branch Naming
- Feature: `feature/subscriber-import`
- Bug fix: `fix/template-validation`
- Enhancement: `enhance/ui-animations`

### Code Style

#### TypeScript
- Use TypeScript for all new files
- Define interfaces for all data structures
- Use Zod for runtime validation

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks

#### CSS/Tailwind
- Use Tailwind utility classes
- Follow mobile-first approach
- Use custom classes in globals.css for repeated patterns

### File Organization

```
New feature checklist:
1. Create Mongoose model in models/
2. Create API routes in app/api/
3. Create page in app/dashboard/
4. Create components in components/
5. Add navigation link in dashboard/nav.tsx
6. Update types if needed
```

### Testing

Before submitting:
- [ ] Test all CRUD operations
- [ ] Test on mobile viewport
- [ ] Check browser console for errors
- [ ] Test with real data
- [ ] Verify API error handling

### Commit Messages

Use conventional commits:
- `feat: add CSV import for subscribers`
- `fix: template variable validation`
- `docs: update setup instructions`
- `style: improve button animations`
- `refactor: extract email service`

### Pull Request Process

1. Create feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description
6. Wait for review

## Adding New Features

### Example: Adding CSV Import

1. **Create API endpoint**
   ```typescript
   // app/api/subscribers/import/route.ts
   export async function POST(request: NextRequest) {
     // Parse CSV
     // Validate data
     // Bulk insert
     // Return results
   }
   ```

2. **Add UI component**
   ```typescript
   // components/subscribers/import-modal.tsx
   export default function ImportModal() {
     // File upload
     // Preview
     // Confirm import
   }
   ```

3. **Update page**
   ```typescript
   // app/dashboard/subscribers/page.tsx
   // Add import button
   // Show import modal
   ```

## Code Standards

### API Routes
- Always validate input with Zod
- Check user authentication
- Verify user owns resources
- Return proper HTTP status codes
- Handle errors gracefully

### Components
- Use TypeScript interfaces for props
- Add loading states
- Add error states
- Make mobile responsive
- Add animations for better UX

### Database
- Add indexes for frequently queried fields
- Use proper data types
- Avoid N+1 queries
- Use population for references

## Performance

- Use React Server Components where possible
- Minimize client-side JavaScript
- Optimize images with Next.js Image
- Use database indexes
- Implement pagination for large lists

## Security

- Never expose API keys client-side
- Always validate user input
- Check authorization on all API routes
- Use HTTPS in production
- Keep dependencies updated

## Questions?

Open an issue for discussion before major changes.

---

Thank you for contributing to Mailuto! 🎉

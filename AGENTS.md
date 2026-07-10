<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tooling Rules (ALWAYS FOLLOW)
- Before concluding any coding task or feature addition, you MUST run `npm run lint` and `npm run typecheck` to ensure no errors are introduced.
- Ensure all newly written code is formatted properly using `npm run format`.
- Do not bypass `husky` pre-commit/pre-push hooks. Fix any errors reported by lint-staged or typecheck before committing/pushing.

# UI Components Rule
- ALL UI components MUST use Shadcn UI (e.g., Select, Table, Button, etc.). Do not use native HTML elements like `<select>` or `<button>` for standard interactive elements. If a Shadcn component is missing, run `npx shadcn@latest add <component>` to install it.

# Design Consistency Rule
- ALWAYS ensure new pages match the established design language and layout patterns of existing pages. Use reusable component patterns (e.g. for page headers, cards, and data presentation) to maintain visual consistency across the dashboard.

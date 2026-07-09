<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tooling Rules (ALWAYS FOLLOW)
- Before concluding any coding task or feature addition, you MUST run `npm run lint` and `npm run typecheck` to ensure no errors are introduced.
- Ensure all newly written code is formatted properly using `npm run format`.
- Do not bypass `husky` pre-commit/pre-push hooks. Fix any errors reported by lint-staged or typecheck before committing/pushing.

# Rules for JSDoc and Documentation

## JSDoc and TSDoc Rules

- Do not repeat TypeScript types in JSDoc tags.
- Focus on side effects, invariants, exceptions, and non-obvious business logic.
- Use TSDoc syntax like @remarks for detailed explanations and @example for usage code.
- Avoid rephrasing function or parameter names in descriptions.
- Write concise comments in English.
- Never include TypeScript types inside JSDoc tags
- Do not write tautological comments that repeat function or variable names
- Document only side effects, exceptions (@throws), mutability, and business assumptions
- Place architectural explanations inside @remarks
- Keep function descriptions under 3 lines

## Layer README Rules

- Define clear boundary of the layer responsibility
- Specify strict import rules (allowed and forbidden dependencies)
- Document public exports exposed by index.ts
- Provide concise usage example and explicit anti-patterns

# About

This is the personal website and blog of Matthias Weiß, a software developer.

## Working Style

- Prefer Astro-first, mostly static solutions.
- Use existing Tailwind patterns before adding custom CSS.
- Keep changes small and local.

## Content

All published content is written by hand. Do not draft or rewrite the author's voice unless explicitly asked.

AI assistance is limited to supporting tasks such as structure, formatting, metadata, proofreading, and implementation around the content.

<!-- rtk-instructions v2 -->

## RTK (Rust Token Killer) - Token-Optimized Commands

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:

```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

### Examples

```bash
rtk bun build           # Astro build with route metrics (87%)
rtk git status          # Compact status
rtk gh pr view <num>    # Compact PR view (87%)
rtk ls <path>           # Tree format, compact (65%)
```

<!-- /rtk-instructions -->

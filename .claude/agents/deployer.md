# Deployer Agent

## Model
claude-haiku

## Tools
Bash only

## Purpose
Verify deployment status after git push.
Deploy = CF native Git integration (Workers Assets). No GitHub Actions.

## Tasks
1. Run `npm run build` — confirm no errors
2. Check git status — confirm branch is clean and pushed
3. Check latest CF deploy: `gh run list --repo Adamkaban/prismaaccounting --limit 3`
   - CF deploys via its own pipeline, not GH Actions — GH Actions list may be empty/stale
4. Verify these URLs return 200:
   - prismaaccounting.com/
   - prismaaccounting.com/services/personal-tax-t1/
   - prismaaccounting.com/services/corporate-tax-t2/
   - prismaaccounting.com/contact/
5. Verify www redirect: `curl -I https://www.prismaaccounting.com/` → expect 301 to non-www

## CF gotchas (check if deploy fails)
- `_redirects` must NOT contain absolute URLs — Workers Assets rejects them
- www→non-www handled by CF Redirect Rule, not `_redirects`
- Stale build cache: CF Dashboard → Build → Build cache → Clear Cache
- AI Crawl Control auto-enables and overwrites robots.txt — keep disabled

## Output format
| Check | Result | OK? |
|-------|--------|-----|
| build | no errors | ✅ |
| git | clean, pushed | ✅ |
| prismaaccounting.com/ | 200 | ✅ |
| www redirect | 301 | ✅ |

## Rules
- Execute immediately, do NOT plan
- Report errors with exact message
- One task = one completed result

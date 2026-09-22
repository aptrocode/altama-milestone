# Repository workflow

Every code or asset change starts from an issue and ends with a reviewed pull request. Do not push feature work directly to the default branch.

## 1. Create and prepare the issue

Use a specific title such as `feat: add operator reconnect status` or `asset: replace center 2013 artwork`. The issue body must include:

- problem and user impact;
- proposed outcome and scope;
- explicit non-goals;
- acceptance criteria as checkboxes;
- implementation or design references;
- affected section, hardware, protocol, or asset IDs;
- risks, dependencies, and rollout notes;
- validation plan.

Set repository metadata before work begins:

- assign one accountable owner;
- select a type label such as `type:feature`, `type:bug`, `type:asset`, `type:docs`, or `type:maintenance`;
- select an area label such as `area:renderer`, `area:sensor`, `area:assets`, `area:tooling`, or `area:docs`;
- set priority using the project Priority field or one label: `priority:p0`, `priority:p1`, `priority:p2`, or `priority:p3`;
- add the delivery milestone/project when one exists;
- link blocking and related issues.

Priority meanings: P0 blocks the installation or causes data/safety loss; P1 blocks a planned release; P2 is normal scheduled work; P3 is an improvement with no current release impact.

## 2. Create the branch

Update the default branch, then create one branch per issue:

```text
feat/123-short-description
fix/123-short-description
asset/123-short-description
docs/123-short-description
chore/123-short-description
```

Keep unrelated work out of the branch. Never place secrets, local `.env` files, generated `.nuxt/`, `.output/`, `dist/`, coverage, or `node_modules/` in commits.

## 3. Commit and validate

Use focused commits with an imperative Conventional Commit subject, for example `feat(timeline): match the reference year controls`. Explain the reason in the body when the change is not obvious. Do not use vague messages such as `update`, `fix`, or `changes`.

Run the checks from `docs/testing.md`. Rebase or merge the latest default branch before final review according to repository policy, then resolve conflicts in the feature branch.

## 4. Open the pull request

Open a draft pull request while work is incomplete. Link the issue with `Closes #123` only when merge should close it. Assign the author, request at least one appropriate reviewer, copy the issue priority/project/milestone, and apply matching type and area labels.

The pull request description must contain:

```markdown
## Problem
What concrete behavior or workflow was wrong or missing?

## Result
What changes for users or operators after this pull request?

## Implementation
Key decisions, boundaries, and migration notes.

## Validation
- [ ] lint
- [ ] typecheck
- [ ] tests
- [ ] asset validation, when relevant
- [ ] build/generate, when relevant
- [ ] browser or hardware evidence, when relevant

## Risk and rollback
Known risk, monitoring signal, and exact rollback path.

Closes #123
```

For UI work, attach before/after images or video and state the tested viewport. For asset work, list milestone IDs. For protocol changes, document compatibility and deployment order. Never claim a check passed unless it ran successfully.

## 5. Review, merge, and clean up

Resolve every review thread or explain why no change is needed. Required checks must pass on the final commit. Convert the pull request from draft only when acceptance criteria are satisfied and the description matches the final implementation.

Use squash merge unless repository maintainers request preserved commits. The final title must be a clear Conventional Commit subject. After merge:

1. confirm the issue closed and acceptance criteria are complete;
2. delete the remote feature branch;
3. delete the local feature branch after switching to the updated default branch;
4. verify deployment or release status when applicable;
5. create a follow-up issue for deferred work instead of hiding it in comments.

Urgent hotfixes still require an issue and pull request. They may use an expedited reviewer and validation set only when the issue records why the standard path cannot be completed before mitigation.

---
name: ux-research
description: >-
  Plans and critiques lean UX research: research plans, user interview scripts
  with exact question wording, and usability test scripts. Use when someone wants
  to talk to users, write or review interview questions, design a usability test,
  or check questions for leading, hypothetical, or badly ordered wording. Not for
  surveys, analytics, A/B tests, or synthesizing finished interviews.
license: MIT
metadata:
  author: Califa
  version: 0.2.0
---

# UX Research

Some research is always better than none. The biggest risk is not imperfect method; it is shipping without talking to users. Aim for plans a busy product team can run this week.

## Principles

1. Start with what you want to learn, not with a method.
2. Everything you don't know for sure is an assumption, including what feels obvious.
3. Check every choice (wording, order, recruiting, moderation) for bias.
4. Go broad to specific: interviews before usability tests, open questions before directed ones.
5. Ask about real past behavior, never hypothetical future behavior.
6. Bring teammates into sessions as notetakers.

## Modes

- **Generate**: the user wants a plan, interview script, or usability test made.
- **Critique**: the user shares a plan or questions and wants them reviewed.
- "Improve this" means both: critique it, then deliver the rewritten version.

## Gather context

Use product, user, and segment context from the conversation, the repo's docs, or a `RESEARCH_CONTEXT.md` if one exists.

For a research plan you need: the project, the assumptions to test, the knowledge gaps that worry the team, the lifecycle stage, and the target users. If any are missing, ask for all of them once, in one message. If there is no answer or the user wants a draft now, write it and list your assumptions at the top.

The lifecycle stage decides the methods:

| Stage | Methods |
| --- | --- |
| Early concept | Interviews only |
| Pre-build | Interviews, then a low-fidelity usability test |
| Prototype ready | Usability test, with a few interview questions up front |
| Post-launch | Usage data to find where to look, then interviews with real users |

## Generate

1. Read the template for the artifact:
   - Research plan: `assets/templates/plan.md`
   - Interview script: `assets/templates/interview.md`
   - Usability test: `assets/templates/usability.md`
   - Notes for the notetaker: `assets/templates/notes.md` (offer one with every script; it mirrors the script's questions)
2. Read only the references the artifact needs:
   - Research plan: `references/planning.md` (question levels, matching methods)
   - Any questions: `references/question-design.md`
   - Usability test: `references/usability.md`
   - Recruiting, notetaking, moderation: `references/sessions-and-recruiting.md`
3. Write every question in the exact words the moderator will say, with one or two follow-ups. A topic bullet ("ask about their workflow") is not a question.
4. Pressure-test each question before you hand it over: does it lead, assume, or ask about the future? Fix it, and note the fix where it teaches the user something.
5. Spend most of the effort on research questions and scripts. Leave out project-management sections such as success criteria or next steps.

## Critique

Read `references/critique-checklists.md` and follow its output format. Name the problem, the principle it breaks, and give the rewrite. Never say "this is leading" without showing a better version.

## Output

- Write each artifact to `research/<slug>-<artifact>.md` (for example `research/onboarding-plan.md`), or to the path the user gives.
- With no filesystem, reply in chat using the same headings.
- Be direct. When something is wrong, say so and give the fix.

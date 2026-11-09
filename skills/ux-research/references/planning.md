# Planning research

Source: lean research practice from GitHub product work (Suggested Changes, Work-in-Progress PRs) and years of research on product teams.

## Why Research Matters

Research does two things:

1. **Prevents you from building the wrong thing.** The GitHub Suggested Changes team nearly built an expensive interactive component when a simpler markdown-based approach tested better with users. Research caught this before engineering investment.

2. **Gives you confidence to commit to the right thing.** When you know from real user feedback that your direction works, you can focus fully instead of hedging.

A third, often overlooked benefit: research can reveal that your entire premise is wrong. During the WIP PRs project, interviews revealed that unfinished PRs weren't actually a significant source of notification noise — the original problem statement was flawed. Yet users loved the prototype for entirely different reasons. Without research, the team would have marketed and optimized for a problem that didn't exist.

Don't treat shipping as the finish line. Treat it as the start of a new learning phase. Track usage, collect feedback, keep iterating.

## Research Plans

### Start With Questions, Not Methods

Every research project starts with: **What do you want to learn or validate?**

Write down every assumption, gap in knowledge, and open question. Everything you don't know for sure is an assumption — even things you feel confident about. The point of research is to fill gaps and validate or invalidate assumptions.

The research is built around what you want to learn. Methods are selected to answer those questions. Never start with "let's do some interviews" — start with "what do we need to know?"

### Categorize Questions Into Three Levels

**High-level questions** — About general behavior, workflows, and mental models. Less tied to your specific implementation. Examples:
- What are people's current workflows?
- How do teams collaborate on X?
- Is this actually a real problem for people?
- What's the current pain point landscape?

→ Best answered with **user interviews**

**Low-level questions** — About whether specific design elements, flows, or naming work. Examples:
- Does this button label make sense?
- Can users find the setting they need?
- Do people understand these status indicators?
- Is the flow from A to B intuitive?

→ Best answered with **usability tests with prototypes**

**Mid-level questions** — Touch both general workflows and specific implementation. Examples:
- Does jumping back to draft status ever make sense?
- How do people expect notifications to work at each stage?

→ Can go either way (interviews or usability tests)

### Match Methods to Questions

The two primary lean research methods:
- **User interviews** → High-level and mid-level questions
- **Usability tests** → Low-level and mid-level questions

Other methods exist (surveys, A/B tests, analytics, card sorting) but interviews and usability tests cover the vast majority of what a lean product team needs.

### Order: Broad Before Specific

Structure your plan so you start with the least specific, least biasing methods first:
1. Run interviews first (discover, understand)
2. Run usability tests second (validate, refine)

This way, you don't contaminate broad discovery with narrow implementation details.

# Lean UX Research Principles

Source: Joel Califa's internal GitHub talk on lean UX research methods. These principles are distilled from real projects (GitHub Suggested Changes, Work-in-Progress PRs) and years of practice.

---

## Table of Contents

1. [Why Research Matters](#why-research-matters)
2. [Research Plans](#research-plans)
3. [Interview Question Design](#interview-question-design)
4. [Usability Test Design](#usability-test-design)
5. [Sourcing Participants](#sourcing-participants)
6. [Running Sessions](#running-sessions)
7. [Common Mistakes](#common-mistakes)

---

## Why Research Matters

Research does two things:

1. **Prevents you from building the wrong thing.** The GitHub Suggested Changes team nearly built an expensive interactive component when a simpler markdown-based approach tested better with users. Research caught this before engineering investment.

2. **Gives you confidence to commit to the right thing.** When you know from real user feedback that your direction works, you can focus fully instead of hedging.

A third, often overlooked benefit: research can reveal that your entire premise is wrong. During the WIP PRs project, interviews revealed that unfinished PRs weren't actually a significant source of notification noise — the original problem statement was flawed. Yet users loved the prototype for entirely different reasons. Without research, the team would have marketed and optimized for a problem that didn't exist.

Don't treat shipping as the finish line. Treat it as the start of a new learning phase. Track usage, collect feedback, keep iterating.

---

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

---

## Interview Question Design

This is where most research goes wrong. The quality of your questions determines the quality of your data.

### Rule 1: Never Ask Hypothetical Questions

People are terrible at predicting their own behavior. "Would you use this feature?" gets you wishful thinking, not truth. "What would you do if...?" gets you what sounds reasonable, not what they'd actually do.

**Always ground questions in reality.** Ask about what people have actually done, experienced, or encountered. The question to ask yourself: "What is the most truthy answer I can get?"

Bad: "Would you use a tool that suggests code changes?"
Good: "Tell me about the last time someone suggested a change to your code. How did that happen?"

### Rule 2: Never Ask Leading Questions

A leading question makes one answer easier or more socially acceptable than another. It assumes the answer, uses loaded words, or frames things so the interviewee feels pressured to agree.

**Signs of a leading question:**
- Contains "don't you think..."
- Uses "how much do you like..." (assumes they like it)
- Starts with "wouldn't it be better if..."
- Contains the word "often" or "always" (implies frequency)
- Assumes a behavior exists before confirming it

Bad: "Do you often suggest single-line changes?" (assumes they suggest changes, assumes frequency, introduces "single-line" concept)
Good: "Walk me through how you do code review."

### Rule 3: Go From Least Specific to Most Specific

The order of questions is critical. The moment you mention a specific concept, the interviewee starts thinking about it and frames all subsequent answers around it.

**The funnel approach:**
1. Start with broad context questions (role, workflow, general habits)
2. Move to topic-area questions (how they handle the general domain)
3. Narrow to behavior questions (what they actually do)
4. End with specific questions (about particular features or concepts)

Example progression for studying code suggestions:
1. "Tell me about your code review process generally"
2. "When you review someone's code and see something you'd change, what do you do?"
3. "Walk me through the last time you suggested a specific change"
4. "What kinds of changes do you typically suggest? How long are they?"
5. Only now: "Have you ever wanted to suggest a multi-line change? Tell me about that."

If you'd asked about multi-line changes first, every answer after that would be filtered through that lens.

### Rule 4: Ask Enough Questions to Get Complete Data

Don't check boxes — be genuinely curious. One question can give a misleading picture.

The banana test: A parent asks their kid "Should I put a banana in your lunch?" — "Sure!" — "Will you eat it?" — "Definitely not. I don't like bananas." The first question alone would have led to a wasted banana.

**Ask the same topic from multiple angles.** For the WIP PR project, asking about "reviewing someone else's code" and "having your own code reviewed" — same topic, different perspective — produced very different and very useful answers.

### Rule 5: Let the Conversation Breathe

Don't follow the script rigidly. If someone says something interesting, follow up. Some of the best insights come from unexpected tangents. The script is a guide, not a cage.

Let silence work for you. Don't rush to fill pauses. People often share their most interesting insights after a moment of reflection.

---

## Usability Test Design

### Keep Prototypes Low-Fidelity

Don't over-invest in prototypes. They don't need to be polished — they need to be testable. A Figma prototype, a clickable mockup, or even paper sketches can work. Think about the minimum fidelity needed to test each question.

### Write a Test Script

For each step in your flow, document:
- What screen you're showing
- What you want to learn at this step
- What to ask before they interact
- What to observe as they interact

**Name steps by what the user should be doing** (e.g., "Before they write comment text") rather than technical descriptions (e.g., "Comment screen v2"). This helps you notice when someone does something unexpected.

### The Core Technique: Narrate Before You Click

This is what makes usability tests powerful. When showing a new screen:

1. Ask: "What are you looking at?"
2. Ask: "What do you think you can do here?"
3. Ask: "What would you do next?"
4. Only then: "Go ahead and do that."

You learn expectations before they interact. If they say "I'd click this to submit" and that button does something else, you've found a problem — without them experiencing confusion that might affect later tasks.

### Set the Right Tone

Before starting:
- Clarify they are not being tested — there are no wrong answers
- If something doesn't make sense, it's a problem with the product, not with them
- Communicate that harsh feedback is welcome and won't offend you

The more comfortable people feel failing and giving candid reactions, the better your data.

### Don't Help

When someone is stuck, resist the urge to guide them. That confusion IS the data. Don't explain the design. Don't point them to the right button. If they can't figure something out, that's a finding.

---

## Sourcing Participants

### Where to Find People

- **Feedback forms / surveys:** Short Google Form in relevant communities or within the product. Keep it brief — use it to collect demographics and contact info, not as the research itself.
- **Existing opt-in channels:** Beta user groups, community forums, support channels, customer advisory boards.
- **Support and feedback pipelines:** People who've already contacted you are often willing to talk more.
- **Internal dogfooding:** If your team uses the product, start there (but don't stop there — internal users have different mental models than external ones).

### Diversify Your Pool

Your feature will be used by people of all skill levels, backgrounds, and contexts. Make your participant pool reflect that. The more diverse it is, the fewer surprises after launch.

Select for a range of:
- Experience levels (beginner to expert)
- Use cases (different jobs-to-be-done)
- Company sizes / team structures
- Geographic and cultural diversity
- Technical sophistication

### Practical Recruiting Tips

- Keep recruitment surveys short (5 minutes max)
- Ask demographic questions + a few qualifying questions related to your research topic
- Collect availability and contact information
- Select a diverse subset of respondents to interview

---

## Running Sessions

### Always Have a Notetaker

Never moderate and take notes simultaneously. You'll do both badly. Instead, invite a teammate — an engineer, PM, or another designer.

The side benefit is enormous: teammates who hear users firsthand build empathy and trust in research that no written report can match. They'll refer back to what they heard for months.

### Use Templates

Use a note-taking template that mirrors your interview script. Pre-defined sections for each question. The notetaker clicks "create doc" and they're ready. This also means all session notes are in the same format, making synthesis easier.

### Interview Session Flow

**Opening (5 min):**
- Thank them
- Explain the general topic without revealing biasing details
- "There are no wrong answers"
- Ask permission to record

**During (30-40 min):**
- Follow the script as a guide, be flexible
- Start broad, narrow gradually
- Don't react strongly to answers (positive or negative) — stay neutral
- Ask "why" and "tell me more about that" frequently
- Ask for concrete examples when answers are vague
- Mirror back what they said to confirm and prompt elaboration
- Let silence work

**Close (5 min):**
- "Is there anything else you think we should know?"
- Thank them, explain next steps

### Usability Test Session Flow

**Setup:**
- Explain broadly what they'll see (a few screens, a prototype)
- Clarify: not being tested, no wrong answers, harsh feedback welcome

**Per task:**
- Show the screen
- Ask: What do you see? What can you do? What would you do?
- Let them proceed, observe silently
- Note hesitation, confusion, surprise
- Don't help, don't explain

**Debrief:**
- Open-ended reflection on the whole experience
- What stood out? What was confusing? What was easy?

### After Every Session: Debrief Immediately

While everything is fresh, discuss with your notetaker:
- What surprised you?
- What confirmed your assumptions?
- What new questions emerged?
- Any clear usability issues?

Don't wait until all sessions are done. Debrief each one.

---

## Common Mistakes

These are the patterns that most frequently undermine research quality:

1. **Asking hypothetical questions.** "Would you use...?" Always get bad data. Always rewrite grounded in past behavior.

2. **Mentioning specific concepts too early.** The moment you say "single-line changes," every answer is about single-line changes. Save specifics for the end.

3. **Helping during usability tests.** Confusion is data. If you guide them through it, you learn nothing.

4. **Not having a notetaker.** You can't moderate and capture insights simultaneously. Always bring someone.

5. **Treating shipping as the end.** Launch is a research opportunity, not the finish line.

6. **Only recruiting power users.** Your product is used by beginners too. Diversify.

7. **Confirming instead of discovering.** Research questions should reflect genuine uncertainty. If you already know the answer, you're not doing research — you're looking for validation.

8. **Rigid script following.** The best insights come from following up on unexpected things. Stay curious.

9. **Batching debriefs.** Debrief after every session, not after all of them. You'll forget the nuances.

10. **Over-investing in prototypes.** They need to be testable, not beautiful. Low-fidelity is fine.

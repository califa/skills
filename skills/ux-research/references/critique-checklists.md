# Critique checklists

Use these when reviewing someone's research plan, interview questions, or usability test. The principles behind each check are in `planning.md`, `question-design.md`, and `usability.md`.

## Research plans

- **Are the research questions real questions?** Or things the team already believes and wants confirmed? Good research questions reflect genuine uncertainty.
- **Are questions sorted by level?** High-level questions need interviews; low-level questions need usability tests. If everything is lumped together, the plan doesn't know which methods to use.
- **Is the order right?** Interviews before usability tests. Broad discovery before specific validation.
- **Do the methods fit the questions?** A usability test can't answer "how do teams collaborate?" and an interview can't tell you whether a button label makes sense.
- **Do the methods fit the lifecycle stage?** A post-launch plan that only runs prototype tests, or an early concept plan with a usability test, is mismatched.
- **Is there a recruiting bias?** Only power users, one demographic, one company size, only the happy path?

## Interview questions

Check each question for:

1. **Hypothetical framing.** "Would you use…?", "How would you feel if…?", "What would you do if…?" Rewrite around real behavior: "Tell me about the last time you…"
2. **Leading language.** Assumes the answer, uses loaded words, or makes disagreeing awkward: "Don't you think…", "How much do you like…", "often", "always". Rewrite neutrally.
3. **Premature specificity.** A concept or feature name early on frames every later answer. If "single-line code suggestions" comes up early, every answer after it is about single-line suggestions. Move it to the end, or ask broader questions first.
4. **Closed where open would work.** "Do you review code?" gets yes or no. "Walk me through your code review process" gets a story.
5. **Order problems.** Specific before general, feature before workflow. Reorder broad to specific.
6. **Missing follow-ups.** No prompt to dig past a surface answer. Add "Tell me more about that" and "Why?"
7. **Missing angles.** Only one side of an experience: reviewing others' code, but not having your own code reviewed. Suggest the complementary question.

## Usability tests

- **Tasks, not instructions.** "Submit a review" is a task. "Click the green button in the top right" is an instruction. Tasks test the design; instructions test whether people can follow directions.
- **No UI labels in the task.** If the task uses the button's own name, it hands over the answer.
- **Narrate before they click.** Without "What are you looking at? What can you do? What would you do next?" you lose their expectations, the most valuable data.
- **Tells the participant they're not being tested.** Comfort leads to honesty.
- **Ends with a debrief.** Open reflection after the last task.
- **Task order doesn't leak.** Early tasks shouldn't reveal what makes later tasks easier.

## Output format

1. One or two sentences on the overall state: what works, and the biggest risk.
2. Issues ordered by how much bias or bad data they cause, worst first. For each:
   - The original question or section, quoted
   - What's wrong, naming the check above
   - The rewrite
   - Why the rewrite is better, in one line
3. The full rewritten artifact (question list, plan, or script) in its corrected order, ready to use as is.

Skip checks that pass. Don't pad the review with praise or minor style notes.

## Common mistakes

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
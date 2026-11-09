# Interview question design

Source: lean research practice from GitHub product work (Suggested Changes, Work-in-Progress PRs) and years of research on product teams.

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

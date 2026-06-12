const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const LearningProgress = require('../models/LearningProgress');
const AIChatHistory = require('../models/AIChatHistory');

// Initialize OpenAI only if key exists
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// --------------------------------------------------------------------------
// 1. LOCAL FALLBACK CURRICULUM (No API Cost)
// --------------------------------------------------------------------------
const localCurriculums = {
    java: [
        {
            step: 1,
            title: "The Power of Java",
            content: "Java is an object-oriented language that follows the 'Write Once, Run Anywhere' principle. It's the backbone of Android apps and massive banking systems.\n\n**Real-world use:** Used by NASA for space missions and by Netflix to handle millions of viewers.\n\n**Why it matters:** It's incredibly stable and secure for large-scale projects.\n\nShould we see a small code example, or move to how it actually works?"
        },
        {
            step: 2,
            title: "Java's Magic: The JVM",
            content: "Unlike other languages, Java compiles to 'Bytecode', which runs on a Virtual Machine (JVM). This is why a Java app works on Windows, Mac, and Linux without changes.\n\n**Real-world use:** This portability is why companies like Spotify use it for their cross-platform backend.\n\nWould you like to know about Variables next, or are you curious about why JVM is so special?"
        },
        {
            step: 3,
            title: "Variables & Data Types",
            content: "In Java, you must be specific about data. `int age = 22;` or `String name = \"SkillSwap\";`. This 'Strict Typing' prevents many bugs before they happen.\n\n**Real-world use:** Essential for financial software where precision is everything.\n\nAre you a student or working professional? I can tailor the examples for you!"
        },
        {
            step: 4,
            title: "Control Flow: Loops",
            content: "Loops allow you to repeat tasks, like sending an email to a list of users. A `for` loop in Java is structured and fast.\n\n**Real-world use:** Iterating through products in an e-commerce cart.\n\nShould I match you with a Java mentor on SkillSwap to help with these logic concepts?"
        }
    ],
    python: [
        {
            step: 1,
            title: "Intro to Python",
            content: "Python is a high-level, extremely readable language. It's often called 'executable pseudocode'.\n\n**Real-world use:** The brain behind Instagram and the tool of choice for Data Scientists at Google.\n\n**Why it matters:** It lets you build complex AI and web apps in half the time of other languages.\n\nShall we look at how simple it is to write code, or jump to Data Types?"
        },
        {
            step: 2,
            title: "Dynamic Variables",
            content: "In Python, you don't need to declare types. Just write `name = 'SkillSwap'`. It's flexible and fast to write.\n\n**Real-world use:** Perfect for fast-paced startups building MVPs.\n\nWould you like to see a comparison with other languages, or move to Lists?"
        },
        {
            step: 3,
            title: "Lists & Collections",
            content: "Python Lists are power-packed. You can store anything and manipulate them easily with 'Slicing'.\n\n**Real-world use:** Handling feeds in social media apps.\n\nDo you want to practice a small exercise, or should I help you find a Python practice partner on SkillSwap?"
        }
    ],
    javascript: [
        {
            step: 1,
            title: "JavaScript: The Language of the Web",
            content: "JavaScript makes websites come alive. It runs in every browser and now on servers too via Node.js.\n\n**Real-world use:** 98% of websites, including this platform, use JavaScript.\n\n**Why it matters:** It's the only language that lets you build a full application (Frontend + Backend).\n\nAre you learning this for a specific project, or for your career?"
        },
        {
            step: 2,
            title: "Modern Variables: let & const",
            content: "Modern JS uses `let` for variables that change and `const` for those that don't. This makes code clean and predictable.\n\n**Real-world use:** Used in React and Vue.js to manage application state.\n\nShould we move to Functions next, or see some examples?"
        },
        {
            step: 3,
            title: "Modern Functions",
            content: "Arrow functions `() => {}` are the modern standard. They are concise and handle context better.\n\n**Real-world use:** Everywhere in modern web development frameworks.\n\nDo you want to continue learning, or should I help match you with a JavaScript mentor?"
        }
    ]
};

// --------------------------------------------------------------------------
// 2. LOGIC ENGINE
// --------------------------------------------------------------------------
const getHybridResponse = async (userId, message) => {
    const lowerMsg = message.toLowerCase();

    // A. GET USER STATE
    let userState = await LearningProgress.findOne({ userId });
    if (!userState) {
        userState = new LearningProgress({ userId, currentStep: 0, currentTopic: null });
    }

    let reply = "";
    let mode = "fallback";
    let shouldSave = false;

    // B. TRY OPENAI FIRST (Real AI Mode)
    if (openai) {
        try {
            const systemPrompt = `You are SkillSwap AI, a smart, friendly, and proactive learning assistant inside the SkillSwap platform.

            STRICT RULES:
            - Never repeat the same response wording again and again.
            - Never loop with generic lines like "I can help you learn Java, Python, or JavaScript".
            - Never ask the same confirmation question repeatedly.
            - Do NOT mention system terms like offline, online, API, model, or limitations.
            - Do NOT change or break the existing system architecture.

            CORE BEHAVIOR:
            - Teach with meaningful depth, not one-liners.
            - Each response must add NEW information.
            - Maintain a natural tutor-style conversation.
            - Remember what the user selected (example: Python).
            - Do not restart the topic unless the user explicitly asks.

            LEARNING FLOW:
            1. Give a clear introduction (what it is + where used).
            2. Explain concepts step-by-step with small examples (text only).
            3. After 1–2 steps, ASK a SMART question (e.g., "Do you want to see a small example?", "Should we go deeper or keep it simple?", "Are you learning this for exams, projects, or placements?").

            CONTENT DEPTH RULE:
            - Concept explanation
            - Real-world use case
            - Why it is important
            (Keep it simple but informative)

            PROFILE & PLATFORM AWARENESS:
            - At appropriate moments, naturally ask: "Are you a student or working professional?" or "Do you want a mentor or peer to practice this skill?".
            - Suggest mentor/peer matching softly (e.g., "If you'd like, I can help you find a Python mentor or practice partner on SkillSwap.").

            ENDING A RESPONSE:
            - Always end with ONE clear next option (e.g., "Shall we move to variables?", "Want a beginner-friendly example?", "Do you want to continue or explore mentors?").

            TONE: Friendly, Confident, Helpful, Human-like tutor.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                max_tokens: 150
            });

            if (completion.choices[0].message.content) {
                // If OpenAI succeeds, return its answer
                if (lowerMsg.includes("next") || lowerMsg.includes("step")) {
                    userState.currentStep += 1;
                    shouldSave = true;
                }
                if (lowerMsg.includes("java")) { userState.currentTopic = 'java'; userState.currentStep = 1; shouldSave = true; }
                if (lowerMsg.includes("python")) { userState.currentTopic = 'python'; userState.currentStep = 1; shouldSave = true; }

                if (shouldSave) await userState.save();

                return {
                    mode: "openai",
                    reply: completion.choices[0].message.content,
                    step: userState.currentStep
                };
            }
        } catch (error) {
            console.warn("OpenAI Failed (Switching to Fallback):", error.message);
        }
    }

    // C. LOCAL FALLBACK MODE
    mode = "fallback";

    // 1. Detect Topic Switch
    if (lowerMsg.includes('java') && !lowerMsg.includes('script')) {
        userState.currentTopic = 'java';
        userState.currentStep = 1;
        reply = `Awesome! Let's dive into **Java**. \n\n${localCurriculums.java[0].content}`;
        shouldSave = true;
    } else if (lowerMsg.includes('python')) {
        userState.currentTopic = 'python';
        userState.currentStep = 1;
        reply = `Great choice! **Python** is incredibly versatile. \n\n${localCurriculums.python[0].content}`;
        shouldSave = true;
    } else if (lowerMsg.includes('javascript') || lowerMsg.includes('js')) {
        userState.currentTopic = 'javascript';
        userState.currentStep = 1;
        reply = `**JavaScript** is exactly what you need for the modern web! 🌐\n\n${localCurriculums.javascript[0].content}`;
        shouldSave = true;

        // 2. Handle Progression (Next/Continue)
    } else if (lowerMsg.includes('next') || lowerMsg.includes('continue') || lowerMsg.includes('yes')) {
        if (!userState.currentTopic) {
            reply = "I'm ready to help you master a new skill! Would you like to start with Java, Python, or JavaScript?";
        } else {
            const curriculum = localCurriculums[userState.currentTopic];
            if (curriculum && userState.currentStep < curriculum.length) {
                userState.currentStep++;
                const lesson = curriculum[userState.currentStep - 1];

                // Add platform awareness naturally
                let platformPrompt = "";
                if (userState.currentStep === 2) {
                    platformPrompt = "\n\nBy the way, are you learning this for a project or for your career? Knowing this helps me guide you better!";
                } else if (userState.currentStep === 3) {
                    platformPrompt = "\n\n( SkillSwap Tip: I can match you with a mentor once you're ready for projects!)";
                }

                reply = `**Step ${lesson.step}: ${lesson.title}**\n\n${lesson.content}${platformPrompt}`;
                shouldSave = true;
            } else {
                reply = `You've done a great job mastering the basics of ${userState.currentTopic}! 🎉\n\nWould you like to practice a project, find a mentor on SkillSwap, or start a new topic?`;
            }
        }

        // 3. General Conversation
    } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
        reply = "Hi there!  I'm **SkillSwap AI**, your personal learning companion. I'm here to help you master coding step-by-step.\n\nWhich language are we starting with today: Java, Python, or JavaScript?";
    } else {
        reply = `I can definitely help with that! However, if you'd like to continue our ${userState.currentTopic || 'coding'} journey, just say **'Next'**. \n\nWhat's on your mind?`;
    }

    if (shouldSave) await userState.save();

    return { mode, reply, step: userState.currentStep };
};

// --------------------------------------------------------------------------
// 3. API ROUTES
// --------------------------------------------------------------------------
router.post('/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;
        if (!message || !userId) return res.status(400).json({ error: "Missing fields" });

        // 1. Save User Message
        // We default mode to 'fallback' for user messages as they are inputs
        await AIChatHistory.create({
            userId,
            role: 'user',
            message,
            mode: 'fallback'
        });

        // 2. Get AI Response
        const response = await getHybridResponse(userId, message);

        // 3. Save AI Response
        await AIChatHistory.create({
            userId,
            role: 'ai',
            message: response.reply,
            mode: response.mode
        });

        res.json(response);

    } catch (error) {
        console.error("Hybrid AI Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// System Check Route
router.get("/test", (req, res) => {
    res.json({
        status: "active",
        mode: openai ? "hybrid (openai + local)" : "local_only",
        message: "Send POST /api/ai/chat to interact."
    });
});

module.exports = router;

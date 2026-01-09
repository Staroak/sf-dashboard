export const motivationalQuotes = [
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.",
    author: "Zig Ziglar"
  },
  {
    quote: "Don't find customers for your products, find products for your customers.",
    author: "Seth Godin"
  },
  {
    quote: "The best salespeople are the ones who put themselves in their customer's shoes.",
    author: "Brian Tracy"
  },
  {
    quote: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  },
  {
    quote: "Your attitude, not your aptitude, will determine your altitude.",
    author: "Zig Ziglar"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "People don't buy for logical reasons. They buy for emotional reasons.",
    author: "Zig Ziglar"
  },
  {
    quote: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupery"
  },
  {
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser"
  },
  {
    quote: "The harder I work, the luckier I get.",
    author: "Gary Player"
  },
  {
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle"
  },
  {
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    quote: "Make a customer, not a sale.",
    author: "Katherine Barchetti"
  },
  {
    quote: "Act as if what you do makes a difference. It does.",
    author: "William James"
  },
  {
    quote: "Great things never come from comfort zones.",
    author: "Ben Francia"
  },
  {
    quote: "The question isn't who is going to let me; it's who is going to stop me.",
    author: "Ayn Rand"
  },
  {
    quote: "Every strike brings me closer to the next home run.",
    author: "Babe Ruth"
  },
  {
    quote: "Sales are contingent upon the attitude of the salesman, not the attitude of the prospect.",
    author: "W. Clement Stone"
  }
];

export const proTips = [
  {
    category: "Objection Handling",
    tip: "When a client says 'I need to think about it', acknowledge their need and ask: 'What specific concerns would you like to think through? I'd be happy to address them now.'",
    icon: "shield"
  },
  {
    category: "Objection Handling",
    tip: "For rate objections: 'I understand rate is important. Let me show you the total cost savings over the life of your loan, not just the monthly payment.'",
    icon: "shield"
  },
  {
    category: "Objection Handling",
    tip: "When they say 'I'm working with another broker': 'That's great! Competition helps you get the best deal. May I ask what rate they offered? I'd love the chance to earn your business.'",
    icon: "shield"
  },
  {
    category: "Objection Handling",
    tip: "For 'Bad timing' objections: 'I understand. When would be a better time to revisit this? In the meantime, let me send you some information so you're prepared.'",
    icon: "shield"
  },
  {
    category: "Sales Technique",
    tip: "Use the 'Feel, Felt, Found' method: 'I understand how you feel. Other clients have felt the same way. What they found was...'",
    icon: "lightbulb"
  },
  {
    category: "Sales Technique",
    tip: "Ask open-ended questions that start with 'What', 'How', or 'Tell me about' to keep the conversation flowing and uncover real needs.",
    icon: "lightbulb"
  },
  {
    category: "Sales Technique",
    tip: "Mirror your client's communication style. Fast talkers want efficiency; deliberate speakers want details. Adapt accordingly.",
    icon: "lightbulb"
  },
  {
    category: "Sales Technique",
    tip: "Use assumptive language: Instead of 'Would you like to proceed?', say 'When would you like to schedule the appraisal?'",
    icon: "lightbulb"
  },
  {
    category: "Sales Technique",
    tip: "Create urgency authentically: 'With rates fluctuating, locking in now protects you from potential increases. Let's secure your rate today.'",
    icon: "lightbulb"
  },
  {
    category: "Best Practice",
    tip: "Follow up within 5 minutes of receiving a lead. Response time is the #1 factor in lead conversion.",
    icon: "star"
  },
  {
    category: "Best Practice",
    tip: "After every call, send a brief summary email. This builds trust and provides documentation both parties can reference.",
    icon: "star"
  },
  {
    category: "Best Practice",
    tip: "Schedule your follow-ups immediately after each call. Don't let hot leads go cold.",
    icon: "star"
  },
  {
    category: "Best Practice",
    tip: "Keep detailed notes in your CRM. The next conversation should pick up right where you left off.",
    icon: "star"
  },
  {
    category: "Best Practice",
    tip: "Block your first hour for prospecting calls. Your energy is highest in the morning - use it to create new opportunities.",
    icon: "star"
  },
  {
    category: "Best Practice",
    tip: "End every call with a clear next step. Never hang up without a scheduled follow-up or action item.",
    icon: "star"
  },
  {
    category: "Rapport Building",
    tip: "Spend the first 2-3 minutes in genuine small talk. People buy from people they like and trust.",
    icon: "users"
  },
  {
    category: "Rapport Building",
    tip: "Use the client's name 3-4 times during the conversation. It creates connection and shows you're paying attention.",
    icon: "users"
  },
  {
    category: "Rapport Building",
    tip: "Listen more than you talk. The 80/20 rule applies: Let clients speak 80% of the time.",
    icon: "users"
  },
  {
    category: "Closing",
    tip: "Trial close throughout: 'How does that sound so far?' This helps you gauge interest and address concerns early.",
    icon: "target"
  },
  {
    category: "Closing",
    tip: "Offer choices, not decisions: 'Would you prefer the 15-year or 30-year term?' This assumes the sale and moves forward.",
    icon: "target"
  }
];

// Function to get a random quote
export function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

// Function to get a random tip
export function getRandomTip() {
  return proTips[Math.floor(Math.random() * proTips.length)];
}

// Function to get multiple tips for display
export function getRotatingTips(count: number = 3) {
  const shuffled = [...proTips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

import { Message } from "~/lib/types/message";

export const transcript: Message[] = [
  {
    role: "GUEST",
    time: 1685046000.0,
    content: "Hello, how are you?",
  },
  {
    role: "CLONE",
    time: 1685046030.0,
    content: "I am doing well, thank you for asking!",
  },
  {
    role: "GUEST",
    time: 1685046060.0,
    content: "Can you tell me a joke?",
  },
  {
    role: "CLONE",
    time: 1685046090.0,
    content: "Why did the tomato turn red? Because it saw the salad dressing!",
  },
  {
    role: "GUEST",
    time: 1685046120.0,
    content: "Haha, that was a good one!",
  },
  {
    role: "CLONE",
    time: 1685046150.0,
    content: "I'm glad you enjoyed it! Do you have any other questions for me?",
  },
  {
    role: "GUEST",
    time: 1685046180.0,
    content: "Yes, can you recommend a good book to read?",
  },
  {
    role: "CLONE",
    time: 1685046210.0,
    content:
      'Sure, I would recommend "The Alchemist" by Paulo Coelho. It\'s a classic novel about following your dreams and finding your purpose in life.',
  },
  {
    role: "GUEST",
    time: 1685046240.0,
    content:
      "That sounds interesting, I'll check it out. Thanks for the recommendation!",
  },
  {
    role: "CLONE",
    time: 1685046270.0,
    content:
      "You're welcome! Let me know if you need any other recommendations or have any other questions.",
  },
];

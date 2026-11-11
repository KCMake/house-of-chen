import type { ComboId } from './types';

export const person = {
  name: 'Kenney Chen',
  school: 'Georgia Tech',
  degree: 'B.S. Computer Engineering',
  gpa: '4.00',
  graduation: 'May 2029',
  seeking: 'Looking for a software engineering internship, Summer 2027',
  /** Lights the neon sign on the wall. */
  open: true,
  location: 'Atlanta, Georgia',
  // Split so the address isn't sitting in the HTML for scrapers. Pages assemble it in the browser.
  email: { user: 'kchen755', domain: 'gatech.edu' },
  linkedin: 'https://www.linkedin.com/in/kenneychen/',
  github: 'https://github.com/KCMake',
  repo: 'https://github.com/KCMake/house-of-chen',
  resumePdf: 'kenney-chen-resume.pdf',
  focus: 'Backend and distributed systems, AI, and embedded software',
  languages: 'English (fluent) and Chinese (conversational)',
};

export const emailAddress = `${person.email.user}@${person.email.domain}`;
export const emailSpoken = `${person.email.user} at ${person.email.domain.replace('.', ' dot ')}`;

export const combos: { id: ComboId; label: string; note: string }[] = [
  { id: 'c1', label: 'C1 Backend and AI', note: 'Circled: the dishes for backend and AI teams.' },
  { id: 'c2', label: 'C2 Embedded and hardware', note: 'Circled: the dishes for embedded and hardware teams.' },
  { id: 'c3', label: 'C3 Founder and people', note: 'Circled: the dishes for startups and anyone hiring for leadership.' },
];

/** The tear-off calendar on the wall. Zodiac characters are traditional; the family has the final say. */
export const timeline = [
  {
    year: '2016',
    animal: 'Monkey',
    zodiac: '猴',
    title: 'First shift',
    text: "Started working at my family's restaurant, Hong Kong City. Over the years I've been a cook, a cashier, and a shift manager there.",
  },
  {
    year: '2020',
    animal: 'Rat',
    zodiac: '鼠',
    title: 'Delivery',
    text: 'When delivery apps took off after COVID, I set up UberEats and DoorDash for my parents. Delivery orders grew 60% year over year.',
  },
  {
    year: '2023',
    animal: 'Rabbit',
    zodiac: '兔',
    title: 'BuildForge and a whistle',
    text: 'Founded BuildForge, a community for student engineers that grew past 5,000 members. Started coaching youth basketball, and my 5th-grade team won back-to-back championships.',
  },
  {
    year: '2024',
    animal: 'Dragon',
    zodiac: '龍',
    title: 'CAD and code',
    text: 'CAD and programming lead for VEX team 1961Z, a state qualifier and quarterfinalist.',
  },
  {
    year: '2025',
    animal: 'Snake',
    zodiac: '蛇',
    title: 'Nationals, then Tech',
    text: 'AgriNexus 2.0 placed in the top five in Georgia and went to the TSA national conference in Nashville. Started Computer Engineering at Georgia Tech, then started building AI phone ordering for Osho in December.',
  },
  {
    year: '2026',
    animal: 'Horse',
    zodiac: '馬',
    title: 'Shipping',
    text: 'Built Free Curb ATL, built Tuck solo at Cal Hacks 13.0, and co-founded Cogni.',
  },
];

export const fortunes = [
  'You will be asked to fix the printer. You will fix the printer.',
  'A table full of wires is a happy place.',
  'The dinner rush is the only load test that counts.',
  'A system that fails loudly is a system you can trust.',
  'An order is not done until it is in the bag.',
  'Good fortune comes to those who hire interns early.',
];

export const lucky = ['4', '60', '173', '250', '2035', '5000'];

export const learnChinese = { hanzi: '全棧', pinyin: 'quán zhàn', meaning: 'full stack' };

/** Mise en place: what's on the shelves in the kitchen. */
export const shelves = [
  { name: 'Languages', items: ['Python', 'C and C++', 'Java', 'JavaScript', 'TypeScript', 'Swift', 'SQL', 'Bash'] },
  { name: 'Line equipment', items: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Linux', 'Git', 'GitHub Actions', 'MCP'] },
  { name: 'Workshop', items: ['ESP32-S3', 'FreeRTOS', 'I2C and SPI', 'MOSFET drivers', 'Onshape CAD', '3D printing'] },
];

/** The one-page resume on the To go page. Same facts as the menu, in resume order. */
export const resume = {
  experience: [
    {
      title: 'AI Solutions Architect',
      org: 'Osho Sushi & Hibachi',
      where: 'Atlanta, GA',
      when: 'Dec 2025 to May 2026',
      bullets: [
        'Built and deployed an AI voice-ordering system handling inbound phone orders end to end for a live restaurant',
        'Designed a multi-agent orchestration layer converting free-form speech into structured, validated order objects',
        'Engineered the Python and FastAPI backend with PostgreSQL for order persistence and Redis for session state',
        'Owned the system in production, including error handling, latency tuning, and iteration on live calls',
      ],
    },
    {
      title: 'Co-founder',
      org: 'Cogni',
      where: 'Remote',
      when: 'Oct 2026 to now',
      bullets: ['Building an open-source long-term memory engine for AI agents'],
    },
    {
      title: 'Founder and Director',
      org: 'BuildForge, an international STEM and robotics community',
      where: 'Remote',
      when: 'Aug 2023 to now',
      bullets: [
        'Founded and lead a 5,000+ member community spanning software, embedded, and hardware projects',
        'Ran 2 virtual hackathons and a weekly 10-student mentorship program, and published 250+ student projects',
      ],
    },
    {
      title: 'Shift Manager',
      org: 'Hong Kong City, family restaurant',
      where: 'Atlanta, GA',
      when: '2016 to now',
      bullets: [
        'Run point of sale and order flow for about 200 guests per shift',
        'Led the UberEats and DoorDash integration, growing delivery volume 60% year over year after COVID',
      ],
    },
  ],
  projects: [
    { name: 'Free Curb ATL', stack: 'Python, JavaScript, Leaflet', line: 'Map of free street parking that classifies 2,035 Atlanta blocks by rule and knows the meter clock; tested in CI' },
    { name: 'AgriNexus 2.0', stack: 'C++, ESP32-S3, FreeRTOS', line: 'Predicts soil moisture ten minutes ahead on the device; 28% less water in a three-week trial; TSA national finalist' },
    { name: 'Tuck', stack: 'TypeScript, Cartesia, Claude', line: "A parent's cloned voice reads a bedtime story written for that night; built solo at Cal Hacks 13.0" },
    { name: 'ITrade', stack: 'Python, Docker, MCP, OAuth 2.0', line: 'Open-source framework for auditable AI trading agents with per-action logging, rate limits, and a sandbox' },
  ],
  skills: [
    'Languages: Python, Java, C and C++, JavaScript, TypeScript, Swift, SQL (PostgreSQL), Bash',
    'Systems: FastAPI, REST APIs, Redis, Docker, Linux, Git, CI/CD, Model Context Protocol, LLM and agent orchestration',
    'Hardware: ESP32-S3, FreeRTOS, I2C and SPI sensors, MOSFET driver circuits, CAD, 3D printing',
  ],
  honors: [
    'Santander Open Scholarship ($20K), 1 of 36 nationally; Zell Miller Scholarship',
    'TSA Achievement Awards: Bronze, Silver, and Gold, 1 of 13 of 19,773 Georgia students to earn all three',
    'VEX Robotics 1961Z: CAD and programming lead, state qualifier and quarterfinalist',
    'Head basketball coach, ACBA: 50+ youth players, back-to-back 5th-grade championships',
    'Head Coordinator, PEP Georgia: 20 volunteers, $3K+ raised, 800+ people served',
  ],
};

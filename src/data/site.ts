export const person = {
  name: 'Kenney Chen',
  school: 'Georgia Tech',
  degree: 'B.S. Computer Engineering',
  gpa: '4.00',
  graduation: 'May 2029',
  seeking: 'Looking for a software engineering internship, Summer 2027',
  location: 'Atlanta, Georgia',
  // Split so the address isn't sitting in the HTML for scrapers. Pages put it together in the browser.
  email: { user: 'kchen755', domain: 'gatech.edu' },
  linkedin: 'https://www.linkedin.com/in/kenneychen/',
  github: 'https://github.com/KCMake',
  repo: 'https://github.com/KCMake/house-of-chen',
  resumePdf: 'kenney-chen-resume.pdf',
};

export const emailAddress = `${person.email.user}@${person.email.domain}`;
export const emailSpoken = `${person.email.user} at ${person.email.domain.replace('.', ' dot ')}`;

/** The one-page resume. The same facts as the rest of the site, in resume order. */
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

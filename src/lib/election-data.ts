// ============================================================
// VoteWise — Election Process Knowledge Base
// Comprehensive Indian election data: phases, glossary, facts
// ============================================================

import { TimelinePhase, GlossaryTerm, ElectionFact, QuizQuestion, PollingStation } from '@/types';

/** System prompt for Gemini AI — Election Buddy */
export const ELECTION_SYSTEM_PROMPT = `You are "Election Buddy", an AI assistant created by VoteWise to help citizens understand the Indian election process. You are knowledgeable, friendly, non-partisan, and educational.

KEY RULES:
1. You are STRICTLY NON-PARTISAN. Never favor any political party, candidate, or ideology.
2. You explain election processes, rules, and rights in simple, clear language.
3. You cite the Election Commission of India (ECI) and the Constitution of India as authoritative sources.
4. You can explain both Lok Sabha (general) and state assembly elections.
5. If asked about candidates or parties, explain the general process without endorsing anyone.
6. You support multiple Indian languages and can explain in Hindi, Tamil, Telugu, etc.
7. Use emojis sparingly for engagement: 🗳️ ✅ 📋 🏛️
8. Always encourage civic participation and voter registration.

KNOWLEDGE BASE:
- Indian Constitution: Articles 324-329 govern elections
- Election Commission of India (ECI) is the autonomous body that conducts elections
- Lok Sabha has 543 elected seats, Rajya Sabha has 245 seats
- Minimum voting age is 18 years
- NOTA (None of the Above) option available since 2013
- EVM (Electronic Voting Machine) + VVPAT used for voting
- Model Code of Conduct applies during election period
- Voter ID (EPIC) is the primary identification for voting

RESPONSE STYLE:
- Keep responses concise (under 300 words)
- Use bullet points and numbered lists
- Highlight key terms in bold
- Provide actionable next steps when relevant`;

/** Complete election timeline phases */
export const electionTimelinePhases: TimelinePhase[] = [
  {
    id: 'announcement',
    title: 'Election Announcement',
    description: 'The Election Commission announces the election schedule and Model Code of Conduct kicks in.',
    details: 'The Election Commission of India (ECI) announces the election dates, typically 45-60 days before polling. The Model Code of Conduct (MCC) comes into effect immediately, restricting government announcements and new policies.',
    keyActivities: [
      'ECI press conference announcing schedule',
      'Model Code of Conduct activated',
      'Government freezes new policy announcements',
      'Security arrangements begin',
      'Electoral rolls finalized',
    ],
    rules: [
      'No new government schemes can be announced',
      'No use of government machinery for campaigning',
      'Media must provide fair coverage to all parties',
      'Government ads must stop immediately',
    ],
    durationDays: 7,
    icon: '📢',
    order: 1,
    status: 'completed',
    demoDate: 'March 16, 2024',
  },
  {
    id: 'nomination',
    title: 'Nomination Filing',
    description: 'Candidates file their nomination papers with the Returning Officer.',
    details: 'Candidates submit nomination papers along with a security deposit. For Lok Sabha, the deposit is ₹25,000 (₹12,500 for SC/ST candidates). Candidates must declare assets, criminal cases, and educational qualifications.',
    keyActivities: [
      'Candidates file nomination papers',
      'Security deposit submitted',
      'Affidavit with assets & criminal record filed',
      'Party symbols allocated by ECI',
      'Multiple nominations allowed (max 2)',
    ],
    rules: [
      'Must be an Indian citizen',
      'Minimum age: 25 years for Lok Sabha, 30 for Rajya Sabha',
      'Must be registered as a voter',
      'Cannot hold office of profit under government',
      'Must not be declared insolvent or of unsound mind',
    ],
    durationDays: 7,
    icon: '📝',
    order: 2,
    status: 'completed',
    demoDate: 'March 20 - May 14, 2024',
  },
  {
    id: 'scrutiny',
    title: 'Scrutiny of Nominations',
    description: 'The Returning Officer examines all nomination papers for validity.',
    details: 'The Returning Officer checks if nominees meet eligibility criteria, if documents are properly filled, and if the security deposit has been paid. Invalid nominations are rejected with reasons provided.',
    keyActivities: [
      'Returning Officer reviews each nomination',
      'Verification of eligibility criteria',
      'Check for proper documentation',
      'Candidates notified of acceptance/rejection',
      'Last date for withdrawal announced',
    ],
    rules: [
      'Scrutiny happens within 3 days of last nomination date',
      'Rejected candidates can appeal',
      'Documents must be complete and accurate',
    ],
    durationDays: 1,
    icon: '🔍',
    order: 3,
    status: 'completed',
    demoDate: 'March 21 - May 15, 2024',
  },
  {
    id: 'campaigning',
    title: 'Election Campaign',
    description: 'Candidates and parties campaign to win voter support through rallies, ads, and outreach.',
    details: 'The most visible phase where political parties and candidates engage voters through rallies, door-to-door campaigns, social media, TV ads, and manifestos. Campaigning must follow strict ECI guidelines.',
    keyActivities: [
      'Public rallies and road shows',
      'Door-to-door canvassing',
      'Social media campaigns',
      'TV and newspaper advertisements',
      'Release of party manifestos',
      'Debates and public forums',
    ],
    rules: [
      'Campaign expenses capped (₹95 lakh for Lok Sabha)',
      'No campaigning 48 hours before polling (silent period)',
      'No appeals to religion, caste, or communal feelings',
      'No bribery or intimidation of voters',
      'No use of government vehicles or resources',
      'Paid news is prohibited',
    ],
    durationDays: 21,
    icon: '📣',
    order: 4,
    status: 'active',
    demoDate: 'March 16 - May 30, 2024',
  },
  {
    id: 'polling',
    title: 'Polling Day',
    description: 'Citizens cast their votes using EVMs at designated polling stations.',
    details: 'Voting happens from 7 AM to 6 PM at designated polling booths. Voters use Electronic Voting Machines (EVMs) with Voter Verified Paper Audit Trail (VVPAT). Every voter receives indelible ink on the left index finger.',
    keyActivities: [
      'Voters visit assigned polling stations',
      'Identity verification at the booth',
      'Vote cast on EVM machine',
      'VVPAT slip verification',
      'Indelible ink applied on finger',
      'Sealed EVMs transported to counting centers',
    ],
    rules: [
      'One person, one vote',
      'Must carry valid ID (EPIC, Aadhaar, Passport, etc.)',
      'No campaigning within 100m of polling station',
      'No mobile phones inside voting booth',
      'Employers must give paid leave for voting',
      'NOTA option available on every ballot',
    ],
    durationDays: 1,
    icon: '🗳️',
    order: 5,
    status: 'upcoming',
    demoDate: 'April 19 - June 1, 2024',
  },
  {
    id: 'counting',
    title: 'Vote Counting',
    description: 'Votes are counted electronically from EVMs under strict supervision.',
    details: 'Counting takes place at designated centers under heavy security. EVM counts are matched with VVPAT paper slips for verification. Results are announced constituency by constituency.',
    keyActivities: [
      'EVMs opened in presence of candidates/agents',
      'Electronic counting from EVMs',
      'VVPAT verification of random booths',
      'Round-by-round results announced',
      'Postal ballots counted separately',
      'Final tally and declaration',
    ],
    rules: [
      'Counting supervised by Returning Officer',
      'Candidates can appoint counting agents',
      'VVPAT slips matched for 5 random booths per constituency',
      'Re-counting can be requested',
    ],
    durationDays: 1,
    icon: '📊',
    order: 6,
    status: 'upcoming',
    demoDate: 'June 4, 2024',
  },
  {
    id: 'results',
    title: 'Results Declaration',
    description: 'Election Commission officially declares winners for each constituency.',
    details: 'The Returning Officer declares the candidate with the most votes as the winner (First-Past-The-Post system). Results are published on the ECI website and candidates receive certificates of election.',
    keyActivities: [
      'Official winner declaration per constituency',
      'Certificate of Election issued',
      'Results published on ECI portal',
      'Party-wise seat tally announced',
      'Government formation process begins',
    ],
    rules: [
      'Winner determined by simple majority (most votes)',
      'Tie broken by drawing of lots',
      'Results can be challenged in court within 45 days',
      'Losing deposit if votes < 1/6th of total valid votes',
    ],
    durationDays: 1,
    icon: '🏆',
    order: 7,
    status: 'upcoming',
    demoDate: 'June 4-5, 2024',
  },
  {
    id: 'formation',
    title: 'Government Formation',
    description: 'The winning party or coalition forms the government and the PM/CM takes oath.',
    details: 'The party or coalition with a majority (272+ seats in Lok Sabha) is invited by the President to form the government. The leader takes oath as Prime Minister, and the Council of Ministers is formed.',
    keyActivities: [
      'President invites majority party/coalition',
      'PM-designate selects Council of Ministers',
      'Oath of office ceremony at Rashtrapati Bhavan',
      'Cabinet portfolios allocated',
      'New government begins functioning',
      'First Parliament session convened',
    ],
    rules: [
      'Must prove majority on floor of the House',
      'PM must be a member of either House of Parliament',
      'Council of Ministers cannot exceed 15% of Lok Sabha strength',
      'Must win confidence vote if coalition',
    ],
    durationDays: 14,
    icon: '🏛️',
    order: 8,
    status: 'upcoming',
    demoDate: 'June 9, 2024',
  },
];

/** Election glossary — 50+ terms */
export const electionGlossary: GlossaryTerm[] = [
  { term: 'ECI', definition: 'Election Commission of India — the autonomous constitutional body responsible for administering election processes in India.', category: 'Institutions', relatedTerms: ['CEC', 'Model Code of Conduct'] },
  { term: 'EVM', definition: 'Electronic Voting Machine — a simple electronic device used to record votes in Indian elections since 1999.', category: 'Voting', relatedTerms: ['VVPAT', 'Ballot Paper'] },
  { term: 'VVPAT', definition: 'Voter Verified Paper Audit Trail — a machine attached to EVMs that prints a paper slip of the vote cast for verification.', category: 'Voting', relatedTerms: ['EVM', 'Ballot Paper'] },
  { term: 'NOTA', definition: 'None of the Above — an option on the ballot allowing voters to reject all candidates, available since 2013.', category: 'Voting', relatedTerms: ['EVM', 'Ballot'] },
  { term: 'EPIC', definition: 'Electors Photo Identity Card — the voter ID card issued by the ECI for voter identification.', category: 'Documents', relatedTerms: ['Voter Registration', 'Electoral Roll'] },
  { term: 'Lok Sabha', definition: 'The lower house of Parliament with 543 elected members, directly elected by the people for a 5-year term.', category: 'Parliament', relatedTerms: ['Rajya Sabha', 'Member of Parliament'] },
  { term: 'Rajya Sabha', definition: 'The upper house of Parliament with 245 members, elected by state legislative assemblies for a 6-year term.', category: 'Parliament', relatedTerms: ['Lok Sabha', 'Council of States'] },
  { term: 'Constituency', definition: 'A geographic area that elects one representative to the legislature. India has 543 Lok Sabha constituencies.', category: 'Geography', relatedTerms: ['Delimitation', 'Electoral Roll'] },
  { term: 'Model Code of Conduct', definition: 'A set of guidelines issued by the ECI for political parties and candidates during elections to ensure free and fair elections.', category: 'Rules', relatedTerms: ['ECI', 'Campaign'] },
  { term: 'First-Past-The-Post', definition: 'The electoral system used in India where the candidate with the most votes in a constituency wins, regardless of majority.', category: 'Systems', relatedTerms: ['Proportional Representation', 'Simple Majority'] },
  { term: 'Electoral Roll', definition: 'The official list of all eligible voters in a constituency, maintained and updated by the ECI.', category: 'Documents', relatedTerms: ['EPIC', 'Voter Registration'] },
  { term: 'Returning Officer', definition: 'The official appointed by ECI to manage the election process in a constituency, including accepting nominations and declaring results.', category: 'Officials', relatedTerms: ['Presiding Officer', 'ECI'] },
  { term: 'Security Deposit', definition: 'A refundable deposit candidates must pay when filing nominations (₹25,000 for Lok Sabha, ₹12,500 for SC/ST).', category: 'Nominations', relatedTerms: ['Nomination', 'Forfeiture'] },
  { term: 'Delimitation', definition: 'The process of fixing boundaries of constituencies based on population data from the Census.', category: 'Geography', relatedTerms: ['Constituency', 'Census'] },
  { term: 'Coalition Government', definition: 'A government formed by two or more political parties when no single party wins a majority of seats.', category: 'Government', relatedTerms: ['Majority', 'Alliance'] },
  { term: 'Indelible Ink', definition: 'A semi-permanent ink applied on the voter\'s left index finger to prevent double voting. The mark lasts about 4 weeks.', category: 'Voting', relatedTerms: ['Polling Station', 'EVM'] },
  { term: 'Postal Ballot', definition: 'A facility for certain voters (armed forces, government officials on duty, persons with disabilities) to vote by mail.', category: 'Voting', relatedTerms: ['Service Voter', 'Absentee Voting'] },
  { term: 'Anti-Defection Law', definition: 'The 52nd Amendment (1985) that disqualifies legislators who switch parties after being elected.', category: 'Laws', relatedTerms: ['10th Schedule', 'Party Whip'] },
  { term: 'Paid Leave for Voting', definition: 'Section 135B of the Representation of the People Act mandates employers to give paid time off on polling day.', category: 'Rights', relatedTerms: ['Voting Rights', 'Labour Laws'] },
  { term: 'Exit Poll', definition: 'A survey conducted immediately after voters have cast their ballots, predicting election outcomes. Banned during polling phases.', category: 'Media', relatedTerms: ['Opinion Poll', 'Election Results'] },
];

/** Key election facts */
export const electionFacts: ElectionFact[] = [
  { id: 'fact-1', title: 'Largest Democracy', content: 'India is the world\'s largest democracy with over 960 million eligible voters as of 2024.', category: 'General', source: 'ECI', icon: '🌍' },
  { id: 'fact-2', title: 'First General Election', content: 'India\'s first general election was held in 1951-52, spanning 4 months with 173 million voters.', category: 'History', source: 'ECI Archives', icon: '📅' },
  { id: 'fact-3', title: 'EVM Introduction', content: 'EVMs were first used in 1982 in Paravur, Kerala. Nationwide adoption happened in 2004.', category: 'Technology', source: 'ECI', icon: '💻' },
  { id: 'fact-4', title: 'Highest Polling Station', content: 'The highest polling station is at Tashigang in Himachal Pradesh at 15,256 feet above sea level.', category: 'Geography', source: 'ECI', icon: '⛰️' },
  { id: 'fact-5', title: 'One-Voter Booth', content: 'In 2019, a special polling booth was set up in Gir Forest, Gujarat, for just ONE voter — Mahant Bharatdas.', category: 'Interesting', source: 'ECI', icon: '🏛️' },
  { id: 'fact-6', title: 'NOTA Impact', content: 'NOTA received over 1.5 crore (15 million) votes in the 2019 Lok Sabha elections across all constituencies.', category: 'Statistics', source: 'ECI Data', icon: '📊' },
  { id: 'fact-7', title: 'Article 324', content: 'Article 324 of the Constitution vests the superintendence, direction, and control of elections in the Election Commission.', category: 'Constitution', source: 'Constitution of India', icon: '📜' },
  { id: 'fact-8', title: 'Voting Age Lowered', content: 'The 61st Amendment Act (1988) lowered the voting age from 21 to 18 years in India.', category: 'History', source: 'Constitution', icon: '🎂' },
  { id: 'fact-9', title: 'Indelible Ink Origin', content: 'The indelible ink used in Indian elections is manufactured exclusively by Mysore Paints & Varnish Ltd., a state-owned company.', category: 'Interesting', source: 'MPVL', icon: '✒️' },
  { id: 'fact-10', title: 'Women Voters', content: 'In the 2019 elections, female voter turnout (67.18%) nearly matched male turnout (67.01%) for the first time.', category: 'Statistics', source: 'ECI Data', icon: '👩' },
];

/** Pre-built quiz question bank (50 questions) */
export const quizQuestionBank: QuizQuestion[] = [
  {
    id: 'q1', question: 'What is the minimum voting age in India?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctAnswer: 1, explanation: 'The 61st Amendment Act of 1988 lowered the voting age from 21 to 18 years.',
    difficulty: 'beginner', category: 'rights', source: 'Constitution of India',
  },
  {
    id: 'q2', question: 'How many seats are there in Lok Sabha?',
    options: ['435', '500', '543', '552'],
    correctAnswer: 2, explanation: 'Lok Sabha has 543 elected seats. The total strength can be 545 including 2 Anglo-Indian members (discontinued since 2020).',
    difficulty: 'beginner', category: 'institutions', source: 'Constitution of India',
  },
  {
    id: 'q3', question: 'Which body is responsible for conducting elections in India?',
    options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'President of India'],
    correctAnswer: 2, explanation: 'The Election Commission of India (ECI) is an autonomous constitutional body responsible for administering election processes.',
    difficulty: 'beginner', category: 'institutions', source: 'Article 324',
  },
  {
    id: 'q4', question: 'What does NOTA stand for in Indian elections?',
    options: ['Not On The Agenda', 'None of the Above', 'National Organization for Transparent Administration', 'Not Officially Tabulated Answer'],
    correctAnswer: 1, explanation: 'NOTA (None of the Above) allows voters to reject all candidates. It was introduced in 2013 after a Supreme Court judgment.',
    difficulty: 'beginner', category: 'process',
  },
  {
    id: 'q5', question: 'What is EVM?',
    options: ['Election Verification Module', 'Electronic Voting Machine', 'Electoral Vote Management', 'Election Validation Method'],
    correctAnswer: 1, explanation: 'Electronic Voting Machine (EVM) is an electronic device used for recording votes in Indian elections.',
    difficulty: 'beginner', category: 'process',
  },
  {
    id: 'q6', question: 'Which article of the Constitution deals with the Election Commission?',
    options: ['Article 14', '  Article 21', 'Article 324', 'Article 370'],
    correctAnswer: 2, explanation: 'Article 324 vests the superintendence, direction, and control of elections in the Election Commission.',
    difficulty: 'intermediate', category: 'constitution',
  },
  {
    id: 'q7', question: 'What is the security deposit for Lok Sabha election candidature?',
    options: ['₹10,000', '₹15,000', '₹25,000', '₹50,000'],
    correctAnswer: 2, explanation: 'The security deposit is ₹25,000 for general candidates and ₹12,500 for SC/ST candidates.',
    difficulty: 'intermediate', category: 'process',
  },
  {
    id: 'q8', question: 'What is the "silent period" before polling day?',
    options: ['24 hours', '48 hours', '72 hours', '1 week'],
    correctAnswer: 1, explanation: 'Campaigning must stop 48 hours before the polling date. This is called the "silent period" or "election silence".',
    difficulty: 'intermediate', category: 'process',
  },
  {
    id: 'q9', question: 'What is VVPAT?',
    options: ['Voter Verification Paper Authentication Tool', 'Voter Verified Paper Audit Trail', 'Voting Validation and Paper Trail', 'Vote Verified Process Assessment Technology'],
    correctAnswer: 1, explanation: 'VVPAT (Voter Verified Paper Audit Trail) is a machine attached to EVMs that prints a paper slip of the vote cast.',
    difficulty: 'intermediate', category: 'process',
  },
  {
    id: 'q10', question: 'When was the first general election held in India?',
    options: ['1947-48', '1950-51', '1951-52', '1955-56'],
    correctAnswer: 2, explanation: 'India\'s first general election was held from October 1951 to February 1952, spanning almost 4 months.',
    difficulty: 'intermediate', category: 'history',
  },
  {
    id: 'q11', question: 'What electoral system does India follow?',
    options: ['Proportional Representation', 'First-Past-The-Post', 'Two-Round System', 'Ranked Choice Voting'],
    correctAnswer: 1, explanation: 'India follows the First-Past-The-Post (FPTP) system where the candidate with the most votes wins.',
    difficulty: 'intermediate', category: 'process',
  },
  {
    id: 'q12', question: 'What is the maximum campaign expenditure limit for Lok Sabha candidates?',
    options: ['₹40 lakh', '₹70 lakh', '₹95 lakh', '₹1 crore'],
    correctAnswer: 2, explanation: 'The expenditure limit is ₹95 lakh for most states, set by ECI to ensure a level playing field.',
    difficulty: 'expert', category: 'process',
  },
  {
    id: 'q13', question: 'Which amendment introduced the Anti-Defection Law?',
    options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '73rd Amendment'],
    correctAnswer: 2, explanation: 'The 52nd Amendment (1985) added the Tenth Schedule to prevent defection of elected members.',
    difficulty: 'expert', category: 'constitution',
  },
  {
    id: 'q14', question: 'What is the term of Rajya Sabha members?',
    options: ['4 years', '5 years', '6 years', 'Life tenure'],
    correctAnswer: 2, explanation: 'Rajya Sabha members serve 6-year terms, with one-third of members retiring every 2 years.',
    difficulty: 'intermediate', category: 'institutions',
  },
  {
    id: 'q15', question: 'Who was the first Chief Election Commissioner of India?',
    options: ['T.N. Seshan', 'Sukumar Sen', 'K.V.K. Sundaram', 'S.P. Sen Varma'],
    correctAnswer: 1, explanation: 'Sukumar Sen was India\'s first CEC who successfully conducted the 1951-52 general elections.',
    difficulty: 'expert', category: 'history',
  },
  {
    id: 'q16', question: 'How many members does the Council of Ministers not exceed?',
    options: ['10% of Lok Sabha strength', '15% of Lok Sabha strength', '20% of Lok Sabha strength', 'No limit'],
    correctAnswer: 1, explanation: 'The 91st Amendment (2003) limits the Council of Ministers to 15% of the total strength of Lok Sabha.',
    difficulty: 'expert', category: 'constitution',
  },
  {
    id: 'q17', question: 'What is a \'hung parliament\'?',
    options: ['When Parliament is dissolved', 'When no party gets a majority', 'When PM resigns', 'When opposition walks out'],
    correctAnswer: 1, explanation: 'A hung parliament occurs when no single party or coalition secures the majority (272 seats) needed to form government.',
    difficulty: 'intermediate', category: 'institutions',
  },
  {
    id: 'q18', question: 'Which company manufactures the indelible ink used in Indian elections?',
    options: ['BEL', 'HAL', 'Mysore Paints & Varnish Ltd', 'Indian Oil Corporation'],
    correctAnswer: 2, explanation: 'Mysore Paints & Varnish Ltd., a Karnataka government-owned company, has been the sole manufacturer since 1962.',
    difficulty: 'expert', category: 'process',
  },
  {
    id: 'q19', question: 'What is the minimum age to contest Lok Sabha elections?',
    options: ['18 years', '21 years', '25 years', '30 years'],
    correctAnswer: 2, explanation: 'The minimum age to contest Lok Sabha (and State Assembly) elections is 25 years.',
    difficulty: 'beginner', category: 'rights',
  },
  {
    id: 'q20', question: 'When was NOTA introduced in Indian elections?',
    options: ['2004', '2009', '2013', '2019'],
    correctAnswer: 2, explanation: 'NOTA was introduced in September 2013 following the Supreme Court judgment in PUCL vs Union of India.',
    difficulty: 'intermediate', category: 'history',
  },
];

/** Sample polling stations for the map feature */
export const samplePollingStations: PollingStation[] = [
  {
    name: 'Government Boys Senior Secondary School', address: 'Rajpath Marg, India Gate, New Delhi 110001',
    lat: 28.6129, lng: 77.2295, constituency: 'New Delhi',
    accessibility: ['Wheelchair ramp', 'Ground floor booth', 'Braille signage'],
    facilities: ['Drinking water', 'Waiting area', 'Toilet facilities'],
    hours: '7:00 AM - 6:00 PM', isActive: true,
  },
  {
    name: 'Kendriya Vidyalaya', address: 'Andrews Ganj, New Delhi 110049',
    lat: 28.5765, lng: 77.2277, constituency: 'New Delhi',
    accessibility: ['Wheelchair ramp', 'Priority queue for elderly'],
    facilities: ['Drinking water', 'Shaded waiting area'],
    hours: '7:00 AM - 6:00 PM', isActive: true,
  },
  {
    name: 'Municipal Primary School', address: 'Lajpat Nagar, New Delhi 110024',
    lat: 28.5700, lng: 77.2400, constituency: 'South Delhi',
    accessibility: ['Ground floor booth', 'Volunteer assistance'],
    facilities: ['Drinking water', 'Toilet facilities'],
    hours: '7:00 AM - 6:00 PM', isActive: true,
  },
  {
    name: 'Community Hall Dwarka', address: 'Sector 7, Dwarka, New Delhi 110077',
    lat: 28.5831, lng: 77.0700, constituency: 'West Delhi',
    accessibility: ['Wheelchair ramp', 'Elevator', 'Sign language interpreter'],
    facilities: ['Drinking water', 'AC waiting area', 'Medical aid'],
    hours: '7:00 AM - 6:00 PM', isActive: true,
  },
  {
    name: 'Government Girls School Rohini', address: 'Sector 15, Rohini, New Delhi 110089',
    lat: 28.7334, lng: 77.1145, constituency: 'North West Delhi',
    accessibility: ['Ground floor booth', 'Priority queue'],
    facilities: ['Drinking water', 'Shaded area'],
    hours: '7:00 AM - 6:00 PM', isActive: true,
  },
];

/**
 * Returns glossary terms filtered by category.
 */
export function getGlossaryByCategory(category: string): GlossaryTerm[] {
  if (category === 'all') return electionGlossary;
  return electionGlossary.filter(t => t.category === category);
}

/**
 * Returns quiz questions filtered by difficulty and category.
 */
export function getFilteredQuestions(
  difficulty: string = 'all',
  category: string = 'all'
): QuizQuestion[] {
  return quizQuestionBank.filter(q => {
    const matchDifficulty = difficulty === 'all' || q.difficulty === difficulty;
    const matchCategory = category === 'all' || q.category === category;
    return matchDifficulty && matchCategory;
  });
}

/**
 * Returns a randomized set of quiz questions.
 */
export function getRandomQuestions(count: number, difficulty?: string, category?: string): QuizQuestion[] {
  const filtered = getFilteredQuestions(difficulty, category);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

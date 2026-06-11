// Fill Jobs (ASSET-P Position Interpreter) — static data extracted verbatim from
// the v1.24L embedded HTML tool (decoded FILL_JOBS_HTML_B64). Numbers must not drift.

// Default ASSET-P job profile (Sales Executive — Data & Research, Americas).
export const DEFAULT_ASSET = {
  scores: [4.4, 4.2, 4.0, 6.6, 6.8, 6.4, 6.6, 6.2, 5.8],
  bands:  [1.8, 1.8, 1.8, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
};

export const DEFAULT_JOB_META = {
  title: 'Sales Executive — Data & Research (Americas)',
  company: 'S&P Global Market Intelligence',
  loc: 'New York, NY',
  grade: 'Grade Level 12',
  jobId: 'Job ID 326355',
  posted: 'Posted March 14, 2026',
};

// Stable candidate color assignment (legacy CCOLS, by array index)
export const CANDIDATE_COLORS = ['#e74c3c','#8e44ad','#16a085','#d35400','#2c3e50','#c0392b','#1abc9c','#7f8c8d',
  '#e91e8c','#ff9800','#00bcd4','#9c27b0','#3498db','#e67e22','#2ecc71',
  '#e84393','#1a9e7a','#f39c12','#6c3483','#27ae60','#c0392b','#2980b9'];

export const CANDIDATES = [
  {id:0,  name:'Marcus Chen',      loc:'New York, NY',      scores:[7.0,7.0,6.5,5.0,4.5,5.4,6.2,4.8,3.5]},
  {id:1,  name:'Sarah Okafor',     loc:'Boston, MA',        scores:[6.6,6.8,6.4,4.8,4.4,5.4,6.0,4.8,3.4]},
  {id:2,  name:'Daniel Reyes',     loc:'Chicago, IL',       scores:[7.0,6.6,6.2,5.4,5.0,5.8,5.6,5.0,4.0]},
  {id:3,  name:'Priya Sharma',     loc:'San Francisco, CA', scores:[6.4,6.2,5.8,4.8,5.0,6.4,7.0,6.0,5.4]},
  {id:4,  name:'James Whitfield',  loc:'Dallas, TX',        scores:[3.0,3.0,3.0,6.0,6.4,7.0,7.0,6.8,5.6]},
  {id:5,  name:'Lena Hoffmann',    loc:'New York, NY',      scores:[2.4,3.0,2.8,6.4,6.0,6.6,5.8,5.0,4.8]},
  {id:6,  name:'Omar Khalid',      loc:'Miami, FL',         scores:[6.8,7.0,6.0,5.6,5.4,5.6,6.4,5.4,4.2]},
  {id:7,  name:'Rachel Kim',       loc:'Toronto, ON',       scores:[2.0,2.8,2.6,7.0,7.0,6.6,6.4,6.0,5.4]},
  {id:8,  name:'Andre Moreau',     loc:'New York, NY',      scores:[6.4,6.6,5.8,5.4,5.8,6.6,6.8,6.4,5.0]},
  {id:9,  name:'Yuki Tanaka',      loc:'Los Angeles, CA',   scores:[7.0,7.0,6.6,6.0,5.2,5.2,6.4,5.6,4.0]},
  {id:10, name:'Fatima Al-Rashid', loc:'Houston, TX',       scores:[6.0,7.0,6.4,6.6,6.8,5.0,5.4,4.8,3.4]},
  {id:11, name:'Tyler Brooks',     loc:'Atlanta, GA',       scores:[7.0,5.8,5.6,5.2,5.8,6.6,7.0,6.6,5.2]},
  {id:12, name:'Simone Duval',     loc:'New York, NY',      scores:[2.8,2.4,2.4,6.8,6.6,6.4,5.6,4.6,3.8]},
  {id:13, name:'Kevin Ostrowski',  loc:'Philadelphia, PA',  scores:[7.0,7.0,6.4,5.2,4.6,5.4,6.2,5.0,3.8]},
  {id:14, name:'Aisha Mensah',     loc:'Washington, DC',    scores:[6.4,7.0,7.0,6.2,4.8,4.0,4.4,4.0,3.0]},
  {id:15, name:'Marco Valenti',    loc:'Chicago, IL',       scores:[6.8,6.6,5.8,6.4,6.0,6.4,6.8,6.2,4.4]},
  {id:16, name:'Sophie Tremblay',  loc:'Montreal, QC',      scores:[6.8,6.8,6.4,4.8,4.4,6.0,6.6,5.4,4.0]},
  {id:17, name:'Ethan Nakamura',   loc:'Seattle, WA',       scores:[6.8,6.8,6.0,6.6,6.4,5.6,6.4,5.8,4.8]},
  {id:18, name:'Claudia Ruiz',     loc:'Miami, FL',         scores:[1.6,1.8,2.0,6.6,6.8,6.4,6.2,5.6,4.4]},
  {id:19, name:'Patrick Nwosu',    loc:'New York, NY',      scores:[6.6,6.8,6.8,6.6,5.4,4.2,4.8,4.2,3.4]},
  {id:20, name:'Ingrid Sorensen',  loc:'Minneapolis, MN',   scores:[6.8,6.8,6.6,5.4,5.0,5.6,6.0,5.2,4.0]},
  {id:21, name:'David Okonkwo',    loc:'New York, NY',      scores:[7.0,7.0,7.0,6.0,5.2,4.8,5.5,4.5,3.2]},
];

// Keyword → style scoring table used by the job-description interpreter.
export const KEYWORDS = {
  intrinsic:     {hi:['expertise','specialist','deep knowledge','analytical','technical','mastery','precision','accuracy','complex','research','analytical capabilities','financial modeling','valuation','credit risk','CFA','MBA','certifications','self-directed','autonomy','subject matter'],lo:['team-led','group consensus','support role']},
  competitive:   {hi:['exceed','outperform','quota','targets','win','beat','top performer','rank','competitive landscape','market share','aggressive','exceed targets','surpass','drive revenue','acquisition','outpace','#1'],lo:['collaborate','support others']},
  power:         {hi:['manage','control','lead','direct','command','authority','decisive','close','negotiate','own','accountable','drive','execute','pipeline','CRM','forecasting','territory','strategic','close deals','contract terms','pricing'],lo:['delegate fully','step back']},
  personal:      {hi:['charisma','influence','persuade','present','compelling','senior executives','C-level','workshops','demonstrations','engage','charm','build rapport','client engagement','conferences','networking','thought leadership','visibility'],lo:['behind the scenes','data entry']},
  social:        {hi:['network','relationships','partnerships','strategic partnerships','contacts','referrals','leverage relationships','established network','expand market','market presence','community','associations'],lo:['independent','solo','self-reliant']},
  entrusting:    {hi:['cross-functional','delegate','empower','trust','hand off','product specialists','account management','client services','coordinate','orchestrate','partner with'],lo:['micromanage','control all','do it yourself']},
  collaborative: {hi:['collaborate','team','partnership','joint','together','shared','collective','alignment','consensus','deliver together','cross-functional teams'],lo:['individual','independent contributor']},
  contributory:  {hi:['support','assist','help','contribute','enable','client success','customer outcomes','serve clients','client requirements','exceptional experiences','client-centric'],lo:['take credit']},
  vicarious:     {hi:['mentor','coach','develop','growth','team success','others succeed','succession','inspire','role model','legacy'],lo:['no direct reports','quota carrying only']}
};

// Channel tolerance key (band legend)
export const BAND_KEY = [
  { range: '±0.5 – 0.6', color: '#4a8c2a', desc: 'Tight — essential styles (rank 1–2)' },
  { range: '±0.8 – 1.0', color: '#2980b9', desc: 'Moderate — important styles (rank 3–4)' },
  { range: '±1.2 – 1.6', color: '#e67e22', desc: 'Wider — useful styles (rank 5–7)' },
  { range: '±1.8 – 2.2', color: '#888888', desc: 'Broad — least required (rank 8–9)' },
];

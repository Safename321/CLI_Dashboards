// Org roster for the "Assign CLI Instruments" dashboard
// (ported from legacy App.jsx EMPLOYEE_DATA, lines ~163-265).
// Shape: { [sectionKey]: { title, icon, count, subgroups: [{ seniority, employees: [{ name, designation, background }] }] } }

export const ASI_ROSTER = {
  foundersKeyPeople: {
    title: 'Founders & Key People',
    icon: '👥',
    count: 26,
    subgroups: [
      {
        seniority: 'Executive & Director Level',
        employees: [
          { name: 'Colin Chiu', designation: 'Director - Ratings Online Education', background: "Cx3 Global, ex-Hearst, ex-Jpmorgan Chase, St. John's University, 2004" },
          { name: 'Colin Ungaro', designation: 'VP, Associate Publisher, Editor-in-chief', background: 'Ungaro And Associates, ex-Fw Publications, ex-Reed Business Information, William' },
          { name: 'Edward Leybovich', designation: 'Director of Sales', background: 'Nextavest, ex-Estrella Management, ex-Trust Equity Partners, New York University' },
          { name: 'Jack Power', designation: 'MD Sales - Americas & Europe - GIA Division', background: 'S And P Global, ex-Ihs Markit, ex-Noctua London, The London Oratory School, 1998' },
          { name: 'Miko Somborac Pmp', designation: 'Director, Structured Finance Cash Flow and Data Operation', background: 'Finra, ex-Digital Infuzion, ex-Paypal, University of Maryland College Park, 1994' },
          { name: 'Paul Maddocks', designation: 'Executive Director, SRE', background: 'S And P Global, ex-Sorted, ex-Door Ventures, Liverpool John Moores University, 2008' },
          { name: 'Tom Itoh', designation: 'Senior Director, Senior Product Manager/Business Analyst', background: 'Barclays, ex-Treliant, ex-Mufg Union Bank, Sophia University, 1998' },
          { name: 'Yang Lin', designation: 'Associate Director | Product Management | Risk & Regulatory', background: 'Citi, ex-Accenture, ex-Bank of America, City University of Hong Kong, 2009' },
        ],
      },
      {
        seniority: 'Manager & Senior Manager Level',
        employees: [
          { name: 'David Chen', designation: 'Senior Manager, Analytics', background: 'McKinsey & Company, ex-BCG, Harvard Business School, 2012' },
          { name: 'Jennifer Smith', designation: 'Manager, Product Development', background: 'Google, ex-Microsoft, Stanford University, 2015' },
          { name: 'Robert Johnson', designation: 'Senior Manager, Operations', background: 'Amazon, ex-Apple, MIT, 2010' },
        ],
      },
      {
        seniority: 'Specialist & Coordinator Level',
        employees: [
          { name: 'Maria Garcia', designation: 'Senior Specialist, Research', background: 'Bloomberg, ex-Reuters, Columbia University, 2018' },
          { name: 'James Wilson', designation: 'Coordinator, Project Management', background: 'Deloitte, ex-PwC, NYU, 2020' },
        ],
      },
    ],
  },
  seniorManagement: {
    title: 'Senior Management',
    icon: '💼',
    count: 85,
    subgroups: [
      {
        seniority: 'C-Suite & EVP',
        employees: [
          { name: 'Martina Cheung', designation: 'CEO', background: 'Previous CEO of Major Corp, MBA Harvard, 1995' },
          { name: 'Eric Aboaf', designation: 'CFO', background: 'Ex-Goldman Sachs, Wharton MBA, 1998' },
          { name: 'Douglas Peterson', designation: 'President', background: 'Ex-COO Global Finance, Yale, 1990' },
        ],
      },
      {
        seniority: 'Senior Vice President',
        employees: [
          { name: 'Apoorva Kapoor Cspo', designation: 'Application Developer', background: 'M And T Bank, ex-Dotdash Meredith, ex-New Era Cap, University at Buffalo, 2017' },
          { name: 'Susan Lee', designation: 'SVP, Technology', background: 'IBM, ex-Oracle, Carnegie Mellon, 2005' },
          { name: 'Michael Brown', designation: 'SVP, Marketing', background: 'Procter & Gamble, ex-Unilever, Northwestern, 2008' },
        ],
      },
      {
        seniority: 'Vice President',
        employees: [
          { name: 'Lisa Anderson', designation: 'VP, Human Resources', background: 'PepsiCo, ex-Coca-Cola, Cornell, 2010' },
          { name: 'Thomas Martinez', designation: 'VP, Sales', background: 'Salesforce, ex-Oracle, UC Berkeley, 2012' },
        ],
      },
      {
        seniority: 'Director Level',
        employees: [
          { name: 'Patricia Taylor', designation: 'Director, Analytics', background: 'Meta, ex-Google, MIT, 2015' },
          { name: 'Daniel Harris', designation: 'Director, Operations', background: 'Amazon, ex-Walmart, Michigan, 2013' },
        ],
      },
      {
        seniority: 'Senior Manager',
        employees: [
          { name: 'Karen White', designation: 'Senior Manager, Finance', background: 'JPMorgan, ex-Citigroup, NYU Stern, 2016' },
          { name: 'Christopher Clark', designation: 'Senior Manager, IT', background: 'Microsoft, ex-Adobe, Georgia Tech, 2014' },
        ],
      },
    ],
  },
  boardMembers: {
    title: 'Board Members',
    icon: '🎯',
    count: 28,
    subgroups: [
      {
        seniority: 'Independent Directors',
        employees: [
          { name: 'William Gates', designation: 'Independent Director', background: 'Former CEO Tech Corp, Harvard, 1975' },
          { name: 'Mary Barra', designation: 'Independent Director', background: 'CEO Automotive Leader, Stanford MBA, 1990' },
          { name: 'Jamie Dimon', designation: 'Independent Director', background: 'Banking Executive, Harvard Business School, 1982' },
        ],
      },
      {
        seniority: 'Committee Chairs',
        employees: [
          { name: 'Sarah Johnson', designation: 'Audit Committee Chair', background: 'Former CFO Fortune 500, Wharton, 1988' },
          { name: 'Richard Miller', designation: 'Compensation Committee Chair', background: 'HR Executive, Columbia, 1992' },
        ],
      },
    ],
  },
};

// Employee IDs ("sectionKey-subgroupIdx-employeeIdx") for the top 50 leaders in
// seniority order — used by mentor deep-links (group: 'top50').
export function getTop50Leaders() {
  const ids = [];
  Object.entries(ASI_ROSTER).forEach(([sectionKey, section]) => {
    (section.subgroups || []).forEach((sg, subIdx) => {
      (sg.employees || []).forEach((emp, empIdx) => {
        if (ids.length < 50) ids.push(`${sectionKey}-${subIdx}-${empIdx}`);
      });
    });
  });
  return ids;
}

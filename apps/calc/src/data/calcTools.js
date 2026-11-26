// Calculator registry for the 3toOne Calc category.
// Every entry here becomes a prerendered route and a card on the home page.
export const calcTools = [
  {
    id: 1,
    slug: 'emi-calculator',
    title: 'EMI Calculator',
    tagline: 'Your EMI, and whether you can really afford it.',
    description:
      'Work out your monthly EMI, check it against your income, test a rate change, and see the true cost of a loan.',
    category: 'loans',
    tags: ['Loans', 'EMI'],
    icon: 'Calculator',
    keywords: ['emi calculator', 'loan emi calculator', 'home loan emi', 'car loan emi', 'emi affordability'],
    steps: [
      'Pick your loan type. Home, car, personal and education loans start with sensible amount, rate and period values.',
      'Move a slider or type a number. The EMI, total interest and debt-free date update as you go — there is no Calculate button.',
      'Check the safety verdict, then share a link or download a plain PDF of the plan.'
    ],
    faqs: [
      {
        q: 'Is the EMI calculator free?',
        a: 'Yes. Every calculation, every deep-dive panel and the PDF report are free, with no sign-up.'
      },
      {
        q: 'How is the EMI calculated?',
        a: 'It uses the standard reducing-balance formula that banks use: EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where r is the monthly rate and n is the number of months.'
      },
      {
        q: 'What does the safety check mean?',
        a: 'It compares this EMI plus your other EMIs with your take-home income. Up to 35% is Comfortable, up to 50% is Careful, and above that is Risky. Many lenders look at 40–50%.'
      },
      {
        q: 'Is my income sent anywhere?',
        a: 'No. All maths runs in your browser. Income and other EMIs stay on your device, and share links never include them.'
      },
      {
        q: 'Why is the “true cost” rate higher than the offer rate?',
        a: 'Processing fees and GST on them reduce the money you actually receive, so the effective cost of borrowing is higher than the quoted rate.'
      },
      {
        q: 'Does the EMI figure include processing fees?',
        a: 'No. The EMI is principal plus interest only. Processing fees, GST on them and any insurance are one-time costs, and the true-cost panel folds them into an effective rate so you can compare offers fairly.'
      },
      {
        q: 'What happens if I prepay part of the loan?',
        a: 'The schedule tab shows the effect of an extra payment each month: interest saved, months cut and the new debt-free date. Lenders may charge a prepayment fee on fixed-rate loans, so check your sanction letter.'
      },
      {
        q: 'Why is my bank’s EMI slightly different?',
        a: 'Banks round the EMI, add insurance or processing charges to the loan, and start charging from the disbursal date rather than the first of the month. A difference of a few rupees is normal.'
      },
      {
        q: 'Can I calculate a car or personal loan too?',
        a: 'Yes. Switch the loan type to load typical values, then change amount, rate and tenure to match the offer you have. Nothing about the maths is home-loan specific.'
      },
      {
        q: 'Are these results financial advice?',
        a: 'No. Results are estimates for planning. Check the final numbers with your lender or a qualified professional before deciding.'
      }
    ],
    highlights: {
      eyebrow: 'Why this one is different',
      title: 'More than an EMI number',
      lead: 'Six things a plain EMI calculator will not tell you.',
      cards: [
        {
          icon: 'Check',
          tone: 'green',
          title: 'Safety check',
          body: 'See your EMI as a share of your income, with a clear Comfortable, Careful or Risky label.'
        },
        {
          icon: 'Clock',
          tone: 'amber',
          title: 'Rate-change test',
          body: 'See your new EMI, or the extra months, if your floating rate goes up or down.'
        },
        {
          icon: 'Percent',
          tone: 'indigo',
          title: 'True cost',
          body: 'Fees and GST push the real rate above the one you were told. We show the real one.'
        },
        {
          icon: 'Rupee',
          tone: 'violet',
          title: 'Tax saving',
          body: 'An estimate of the home loan tax benefit under the old regime, using your slab.'
        },
        {
          icon: 'Calendar',
          tone: 'teal',
          title: 'Debt-free date',
          body: 'Not just years. A real month and year you can put in your calendar.'
        },
        {
          icon: 'Compare',
          tone: 'rose',
          title: 'Compare two offers',
          body: 'Two lenders, one verdict: which one costs less in total, fees included.'
        }
      ]
    }
  },
  {
    id: 2,
    slug: 'sip-calculator',
    title: 'SIP Calculator',
    tagline: 'What your monthly investment could grow into.',
    description:
      'Project a monthly SIP, add a yearly step-up, work out the SIP needed for a goal, and see the corpus after inflation.',
    category: 'investing',
    tags: ['Investing', 'SIP'],
    icon: 'TrendUp',
    keywords: ['sip calculator', 'mutual fund sip', 'step up sip', 'sip goal calculator', 'investment calculator'],
    steps: [
      'Enter what you invest each month, the return you expect, and how long you will stay invested.',
      'Add a starting amount or a yearly step-up if you have one. Every panel updates as you move the sliders.',
      'Check the value in today’s money, then use the goal tab to see the SIP you actually need.'
    ],
    faqs: [
      {
        q: 'Is the SIP calculator free?',
        a: 'Yes. Every projection, every panel and the summary are free, with no sign-up.'
      },
      {
        q: 'How is the SIP value calculated?',
        a: 'Contributions are compounded monthly at the expected annual return, with each SIP assumed at the start of the month. A step-up raises the contribution once a year.'
      },
      {
        q: 'Is the return guaranteed?',
        a: 'No. Mutual fund returns vary and can be negative. The calculator assumes one steady return every year, which is a simplification for planning.'
      },
      {
        q: 'What is a step-up SIP?',
        a: 'A step-up SIP increases your monthly contribution by a fixed percentage each year, usually as your salary grows. It can add a surprising amount over long periods.'
      },
      {
        q: 'Should I use inflation-adjusted values?',
        a: 'Yes, for goals far away. A corpus that sounds large today buys less in 20 years, so the inflation tab shows the same value in today’s prices.'
      },
      {
        q: 'What return should I assume?',
        a: 'For a long equity SIP, 10–12% is a common planning assumption. Use a lower number if you want a conservative plan, and remember that the actual return will not be steady.'
      },
      {
        q: 'Can I use this for a lump sum instead of a SIP?',
        a: 'Yes. Put the amount in the starting amount field and keep the monthly SIP at zero. It compounds the same way, so you can see what a one-time investment grows into.'
      },
      {
        q: 'Does it account for expense ratio or exit load?',
        a: 'No. Enter the return you expect after fees. A 1% expense ratio can quietly cost a few percent of the final corpus over long periods.'
      },
      {
        q: 'How does the goal tab work?',
        a: 'It solves the formula in reverse: given a target corpus, a return and a number of years, it shows the monthly SIP required. That is the number to compare with what you can actually set aside.'
      }
    ],
    highlights: {
      eyebrow: 'Why this one is different',
      title: 'More than a final corpus',
      lead: 'Four things a plain SIP calculator leaves out.',
      cards: [
        {
          icon: 'TrendUp',
          tone: 'green',
          title: 'Step-up test',
          body: 'See what raising your SIP 10% a year does, next to a flat SIP of the same starting amount.'
        },
        {
          icon: 'Percent',
          tone: 'indigo',
          title: 'Real return',
          body: 'The corpus in today’s money, so a 20-year number does not look bigger than it is.'
        },
        {
          icon: 'Calendar',
          tone: 'teal',
          title: 'Year by year',
          body: 'Invested, gained and total value for every year, not just the final figure.'
        },
        {
          icon: 'Rupee',
          tone: 'violet',
          title: 'Goal maths',
          body: 'Name a target and a date, and see the monthly SIP it actually needs.'
        }
      ]
    }
  },
  {
    id: 3,
    slug: 'fd-calculator',
    title: 'FD Calculator',
    tagline: 'Exactly what your fixed deposit will pay.',
    description:
      'Work out FD maturity with quarterly compounding, compare payout and cumulative options, and see the interest after tax.',
    category: 'investing',
    tags: ['Deposits', 'FD'],
    icon: 'Bank',
    keywords: ['fd calculator', 'fixed deposit calculator', 'fd maturity', 'fd interest calculator', 'tds on fd'],
    steps: [
      'Enter the deposit amount, the bank’s rate and the tenure.',
      'Pick your tax slab. The maturity value, interest and after-tax figure update live.',
      'Use the deep-dive tabs to compare a payout FD, nearby rates and the TDS impact.'
    ],
    faqs: [
      {
        q: 'Is the FD calculator free?',
        a: 'Yes. All calculations and panels are free, with no sign-up.'
      },
      {
        q: 'How is FD maturity calculated?',
        a: 'It uses quarterly compounding, the standard for cumulative bank FDs: A = P × (1 + r/4)^(4t), where r is the annual rate and t is the tenure in years.'
      },
      {
        q: 'What is the difference between cumulative and payout FDs?',
        a: 'A cumulative FD reinvests the interest, so it grows faster. A payout FD pays the interest to you regularly and returns the principal at maturity.'
      },
      {
        q: 'Is FD interest taxable?',
        a: 'Yes, at your slab rate. Banks also deduct 10% TDS when yearly interest crosses ₹40,000 (₹50,000 for senior citizens). TDS is a prepayment, not an extra tax.'
      },
      {
        q: 'Do senior citizens get a better rate?',
        a: 'Usually yes, often 0.25–0.5% higher. Enter the rate your bank offers you to see the exact maturity value.'
      },
      {
        q: 'Is interest reinvested in this calculation?',
        a: 'Yes, the main result assumes a cumulative FD where interest is compounded quarterly and paid at maturity. The payout tab shows the other option, where interest is paid out and the principal stays fixed.'
      },
      {
        q: 'Does this work for a 5-year tax-saving FD?',
        a: 'Yes, the maturity maths is the same. The 80C deduction only helps under the old regime, and the calculator does not model that saving.'
      },
      {
        q: 'What if I break the FD early?',
        a: 'Banks usually pay 0.5–1% less than the contracted rate and may charge a penalty. That reduced rate is not modelled here, so treat early-withdrawal figures as a maximum.'
      },
      {
        q: 'How is TDS different from the tax shown?',
        a: 'TDS is only the amount the bank withholds in advance, at 10% above the interest threshold. Your actual tax is at your slab rate, so the after-tax figure uses your slab and the TDS toggle just shows how much is withheld.'
      }
    ],
    highlights: {
      eyebrow: 'Why this one is different',
      title: 'More than a maturity value',
      lead: 'What a plain FD calculator does not show you.',
      cards: [
        {
          icon: 'Rupee',
          tone: 'violet',
          title: 'After-tax value',
          body: 'Interest is taxed at your slab. See what actually reaches your account.'
        },
        {
          icon: 'Percent',
          tone: 'indigo',
          title: 'Effective yield',
          body: 'Quarterly compounding means the real annual return is a little above the quoted rate.'
        },
        {
          icon: 'Compare',
          tone: 'rose',
          title: 'Payout vs cumulative',
          body: 'Same deposit, two options: interest in hand every quarter or a bigger lump sum at maturity.'
        },
        {
          icon: 'TrendUp',
          tone: 'green',
          title: 'Nearby-rate ladder',
          body: 'See how much a 0.25% better rate is worth before you lock your money in.'
        }
      ]
    }
  },
  {
    id: 4,
    slug: 'income-tax-calculator',
    title: 'Income Tax Calculator',
    tagline: 'Old regime or new? See which one costs less.',
    description:
      'Compare income tax under the old and new regimes for FY 2025-26, with deductions, rebate and cess in one place.',
    category: 'tax',
    tags: ['Tax', 'FY 2025-26'],
    icon: 'Receipt',
    keywords: ['income tax calculator', 'old vs new tax regime', 'tax calculator india', 'fy 2025-26 tax', '80c tax saving'],
    steps: [
      'Enter your annual gross income and say whether you are salaried.',
      'Add the deductions you claim — 80C, 80D, home loan interest, NPS — in the deductions tab.',
      'The result shows the cheaper regime, the saving, and a slab-by-slab breakdown of both.'
    ],
    faqs: [
      {
        q: 'Which financial year does this use?',
        a: 'FY 2025-26 (assessment year 2026-27), resident individuals below 60, using the slabs announced in Budget 2025.'
      },
      {
        q: 'How does the new regime rebate work?',
        a: 'Taxable income up to ₹12,00,000 gets a rebate that makes tax nil. Just above that, marginal relief caps tax at the income earned above ₹12 lakh. The calculator applies both.'
      },
      {
        q: 'Are all deductions allowed in the new regime?',
        a: 'No. The new regime allows the standard deduction and a few employer contributions, but not 80C, 80D, home loan interest or NPS. That is why the comparison matters.'
      },
      {
        q: 'Is surcharge included?',
        a: 'No. Surcharge applies above ₹50 lakh of income and is not modelled here. For very high incomes, treat the result as a close estimate.'
      },
      {
        q: 'Why is the tax deducted by my employer different?',
        a: 'Employers spread TDS over the remaining months of the year, include perquisites and bonuses, and may not know all your declarations yet. Use this as a check on the yearly figure.'
      },
      {
        q: 'What is marginal relief?',
        a: 'Just above ₹12 lakh of taxable income, the rebate stops. Without relief, earning a rupee more could cost thousands. Relief caps the tax at the income earned above ₹12 lakh, and the calculator applies it automatically.'
      },
      {
        q: 'Does the new regime allow HRA or LTA?',
        a: 'No. HRA, LTA and most other exemptions are not allowed in the new regime. Only the standard deduction and a few employer contributions are, which is why the old regime can still win for people with large deductions.'
      },
      {
        q: 'Why does the deduction amount stop increasing?',
        a: 'Each deduction has a legal cap: ₹1.5 lakh for 80C, ₹25,000 for 80D (₹50,000 for senior citizens), ₹2 lakh for home loan interest and ₹50,000 for NPS. The calculator caps your input at those limits.'
      },
      {
        q: 'Is this tax advice?',
        a: 'No. It is a planning estimate. Salary structure, exemptions, capital gains and surcharge can change your final liability.'
      }
    ],
    highlights: {
      eyebrow: 'Why this one is different',
      title: 'More than one tax number',
      lead: 'The things a single-regime calculator never shows you.',
      cards: [
        {
          icon: 'Compare',
          tone: 'rose',
          title: 'Side by side',
          body: 'Old and new regime for the same income, with the cheaper one named and the saving in rupees.'
        },
        {
          icon: 'Receipt',
          tone: 'green',
          title: 'Slab by slab',
          body: 'Every slab, the rate and the rupees charged, so the total is never a black box.'
        },
        {
          icon: 'Percent',
          tone: 'indigo',
          title: 'Rebate and relief',
          body: 'The ₹12 lakh rebate and marginal relief are applied, not just the slabs.'
        },
        {
          icon: 'Rupee',
          tone: 'violet',
          title: 'Deduction caps',
          body: '80C, 80D, home loan and NPS inputs are capped at their legal limits as you type.'
        },
        {
          icon: 'Check',
          tone: 'amber',
          title: 'Honest limits',
          body: 'Surcharge and capital gains are not modelled, and the page says so instead of guessing.'
        }
      ]
    }
  },
  {
    id: 5,
    slug: 'inhand-salary-calculator',
    title: 'In-hand Salary Calculator',
    tagline: 'What your CTC actually pays you each month.',
    description:
      'Turn CTC into monthly take-home after PF, gratuity, professional tax and income tax, and see the full salary breakup.',
    category: 'tax',
    tags: ['Tax', 'Take-home'],
    icon: 'Wallet',
    keywords: ['in hand salary calculator', 'ctc to take home', 'salary calculator india', 'monthly salary after tax'],
    steps: [
      'Enter your annual CTC and set how much of it is basic salary.',
      'Adjust HRA and metro status to match your offer letter.',
      'The result shows monthly take-home, with a full CTC-to-bank-account breakup below.'
    ],
    faqs: [
      {
        q: 'How is take-home calculated?',
        a: 'CTC minus employer PF and gratuity gives gross salary. From that we subtract employee PF, professional tax and income tax under the new regime to get annual take-home, then divide by 12.'
      },
      {
        q: 'Why is take-home lower than CTC divided by 12?',
        a: 'CTC includes employer PF and gratuity, which are not paid to you monthly, plus your own PF, professional tax and TDS.'
      },
      {
        q: 'Which tax regime is used?',
        a: 'The new regime, since it is the default for salaried employees. The tax tab shows the slab-by-slab calculation for FY 2025-26.'
      },
      {
        q: 'Can I change the basic salary share?',
        a: 'Yes. Most companies keep basic between 35% and 50% of CTC. A higher basic means more PF and gratuity but less cash in hand.'
      },
      {
        q: 'Why does my payslip differ?',
        a: 'Employers structure allowances differently, and variable pay, joining bonuses and declarations all change the numbers. Treat this as a close estimate.'
      },
      {
        q: 'Does it include HRA exemption?',
        a: 'Not in take-home. HRA is a tax exemption under the old regime only, and this calculator uses the new regime. HRA is still part of your gross salary and is shown in the structure tab.'
      },
      {
        q: 'Is gratuity part of my CTC?',
        a: 'In most Indian offer letters, yes — around 4.81% of basic is included in CTC but paid only after five years of service. This calculator treats it that way and keeps it out of monthly take-home.'
      },
      {
        q: 'Can I compare two offers?',
        a: 'Run each CTC through the calculator with the same basic share and metro setting. The lower CTC can still pay more in hand if its structure has less PF and gratuity.'
      },
      {
        q: 'What about professional tax?',
        a: 'It is a small state levy, typically ₹200 a month, capped at ₹2,500 a year. This calculator assumes ₹2,400 a year for a full year of employment.'
      }
    ],
    highlights: {
      eyebrow: 'Why this one is different',
      title: 'More than a monthly figure',
      lead: 'What a plain CTC-to-salary tool skips.',
      cards: [
        {
          icon: 'Wallet',
          tone: 'green',
          title: 'CTC to bank account',
          body: 'Every step from CTC to the number that actually arrives, with nothing hidden in between.'
        },
        {
          icon: 'Bank',
          tone: 'indigo',
          title: 'PF and gratuity',
          body: 'Both sides of PF and the gratuity tucked inside CTC are shown, not silently included.'
        },
        {
          icon: 'Receipt',
          tone: 'violet',
          title: 'Tax on your slab',
          body: 'Monthly TDS is derived from the new-regime slab calculation, not a flat guess.'
        },
        {
          icon: 'Percent',
          tone: 'amber',
          title: 'Structure test',
          body: 'Change the basic share and metro status to see how the same CTC changes your take-home.'
        },
        {
          icon: 'Check',
          tone: 'teal',
          title: 'Stated assumptions',
          body: '12% PF, 4.81% gratuity and ₹2,400 professional tax are written on the page, not buried.'
        }
      ]
    }
  },
  {
    id: 6,
    slug: 'loan-calculator',
    title: 'Loan Calculator',
    tagline: 'Home, car, personal and education loans in one place.',
    description: 'Compare loan amounts, rates and tenures across home, car, personal and education loans.',
    category: 'loans',
    tags: ['Loans'],
    icon: 'Bank',
    keywords: ['loan calculator', 'home loan', 'car loan', 'personal loan'],
    steps: ['Choose the loan type to load sensible defaults.', 'Enter amount, rate and tenure.', 'See EMI, total interest and a full amortization table.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 7,
    slug: 'rent-vs-buy-calculator',
    title: 'Rent vs Buy Calculator',
    tagline: 'Find the break-even year for buying vs renting.',
    description: 'Compare renting against buying a home and find the break-even year.',
    category: 'loans',
    tags: ['Loans', 'Housing'],
    icon: 'Compare',
    keywords: ['rent vs buy', 'buy vs rent calculator'],
    steps: ['Enter rent, property price and expected appreciation.', 'Set your investment return and loan rate.', 'See the break-even year and lifetime cost.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 8,
    slug: 'hra-exemption-calculator',
    title: 'HRA Exemption Calculator',
    tagline: 'City-wise HRA exemption rules.',
    description: 'Calculate your HRA exemption under the old regime with city-wise rules.',
    category: 'tax',
    tags: ['Tax', 'Salary'],
    icon: 'Receipt',
    keywords: ['hra exemption', 'hra calculator'],
    steps: ['Enter basic salary, HRA received and rent paid.', 'Select metro or non-metro.', 'See the exempt amount and taxable HRA.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 9,
    slug: 'gratuity-calculator',
    title: 'Gratuity Calculator',
    tagline: 'Check eligibility and amount.',
    description: 'Calculate gratuity based on salary and years of service.',
    category: 'tax',
    tags: ['Tax', 'Salary'],
    icon: 'Wallet',
    keywords: ['gratuity calculator', 'gratuity amount'],
    steps: ['Enter last drawn salary and years of service.', 'See the gratuity amount and eligibility.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 10,
    slug: 'pf-calculator',
    title: 'PF Calculator',
    tagline: 'Employee and employer share.',
    description: 'Calculate employee and employer PF contributions and projected corpus.',
    category: 'tax',
    tags: ['Tax', 'PF'],
    icon: 'Bank',
    keywords: ['pf calculator', 'provident fund'],
    steps: ['Enter basic salary and contribution rate.', 'See monthly and yearly PF and projected corpus.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 11,
    slug: 'gst-calculator',
    title: 'GST Calculator',
    tagline: 'CGST, SGST and IGST split.',
    description: 'Add or remove GST and split it into CGST, SGST and IGST.',
    category: 'tax',
    tags: ['Tax', 'GST'],
    icon: 'Receipt',
    keywords: ['gst calculator', 'cgst sgst igst'],
    steps: ['Enter amount and GST rate.', 'Choose add or remove GST.', 'See the split into CGST, SGST and IGST.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 12,
    slug: 'step-up-sip-calculator',
    title: 'Step-up SIP Calculator',
    tagline: 'Yearly increase scenarios.',
    description: 'Project a SIP with a yearly step-up and see the corpus.',
    category: 'investing',
    tags: ['Investing', 'SIP'],
    icon: 'TrendUp',
    keywords: ['step up sip', 'sip calculator'],
    steps: ['Enter monthly SIP, step-up percent and tenure.', 'See the projected corpus and year-by-year growth.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 13,
    slug: 'lumpsum-calculator',
    title: 'Lumpsum Calculator',
    tagline: 'Growth chart over time.',
    description: 'Project the growth of a one-time lumpsum investment.',
    category: 'investing',
    tags: ['Investing'],
    icon: 'TrendUp',
    keywords: ['lumpsum calculator', 'investment growth'],
    steps: ['Enter principal, return and tenure.', 'See the maturity value and growth chart.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 14,
    slug: 'rd-calculator',
    title: 'RD Calculator',
    tagline: 'Monthly deposit growth.',
    description: 'Calculate recurring deposit maturity with monthly deposits.',
    category: 'investing',
    tags: ['Deposits', 'RD'],
    icon: 'Bank',
    keywords: ['rd calculator', 'recurring deposit'],
    steps: ['Enter monthly deposit, rate and tenure.', 'See maturity value and total interest.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 15,
    slug: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    tagline: 'Choose the compounding frequency.',
    description: 'Calculate compound interest with a chosen compounding frequency.',
    category: 'investing',
    tags: ['Deposits'],
    icon: 'Percent',
    keywords: ['compound interest calculator'],
    steps: ['Enter principal, rate, tenure and compounding frequency.', 'See maturity value and interest.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 16,
    slug: 'simple-interest-calculator',
    title: 'Simple Interest Calculator',
    tagline: 'Quick formula view.',
    description: 'Calculate simple interest quickly.',
    category: 'investing',
    tags: ['Deposits'],
    icon: 'Percent',
    keywords: ['simple interest calculator'],
    steps: ['Enter principal, rate and tenure.', 'See interest and total amount.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 17,
    slug: 'age-calculator',
    title: 'Age Calculator',
    tagline: 'Your age on the exam cutoff date.',
    description: 'Calculate your age on a given date, useful for exam cutoffs.',
    category: 'exams',
    tags: ['Exams', 'Age'],
    icon: 'Calendar',
    keywords: ['age calculator', 'exam age'],
    steps: ['Enter date of birth and cutoff date.', 'See age in years, months and days.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 18,
    slug: 'cgpa-to-percentage-calculator',
    title: 'CGPA to Percentage',
    tagline: 'University-wise formulas.',
    description: 'Convert CGPA to percentage using university-wise formulas.',
    category: 'exams',
    tags: ['Exams', 'CGPA'],
    icon: 'Calculator',
    keywords: ['cgpa to percentage'],
    steps: ['Enter CGPA and pick university formula.', 'See the percentage.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 19,
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    tagline: 'Marks, change and percentile.',
    description: 'Calculate percentages, percentage change and percentile.',
    category: 'exams',
    tags: ['Exams', 'Percentage'],
    icon: 'Percent',
    keywords: ['percentage calculator'],
    steps: ['Enter values to compute percentage, change or percentile.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 20,
    slug: 'bmi-calculator',
    title: 'BMI Calculator',
    tagline: 'Asian cutoffs explained simply.',
    description: 'Calculate BMI with Asian cutoffs explained.',
    category: 'everyday',
    tags: ['Everyday', 'Health'],
    icon: 'Calculator',
    keywords: ['bmi calculator', 'asian bmi'],
    steps: ['Enter height and weight.', 'See BMI and category.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 21,
    slug: 'time-calculator',
    title: 'Time Calculator',
    tagline: 'Add and subtract hours.',
    description: 'Add or subtract hours, minutes and seconds.',
    category: 'everyday',
    tags: ['Everyday', 'Time'],
    icon: 'Clock',
    keywords: ['time calculator', 'add hours'],
    steps: ['Enter two times.', 'See the result of addition or subtraction.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 22,
    slug: 'date-difference-calculator',
    title: 'Date Difference',
    tagline: 'Days, months and years between dates.',
    description: 'Calculate days, months and years between two dates.',
    category: 'everyday',
    tags: ['Everyday', 'Date'],
    icon: 'Calendar',
    keywords: ['date difference', 'days between dates'],
    steps: ['Enter start and end dates.', 'See the difference in days, months and years.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 23,
    slug: 'working-days-calculator',
    title: 'Working Days Calculator',
    tagline: 'Counts Indian holidays.',
    description: 'Count working days between two dates, excluding Indian holidays.',
    category: 'everyday',
    tags: ['Everyday', 'Date'],
    icon: 'Calendar',
    keywords: ['working days calculator', 'indian holidays'],
    steps: ['Enter start and end dates.', 'See working days excluding weekends and holidays.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 24,
    slug: 'unit-converter',
    title: 'Unit Converter',
    tagline: 'Land, length, weight and more.',
    description: 'Convert units of land, length, weight and more.',
    category: 'everyday',
    tags: ['Everyday', 'Converter'],
    icon: 'Calculator',
    keywords: ['unit converter'],
    steps: ['Pick a category and units.', 'Enter value to convert.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 25,
    slug: 'currency-converter',
    title: 'Currency Converter',
    tagline: 'Live exchange rates.',
    description: 'Convert currencies using live exchange rates.',
    category: 'everyday',
    tags: ['Everyday', 'Currency'],
    icon: 'Rupee',
    keywords: ['currency converter', 'exchange rate'],
    steps: ['Pick currencies and enter amount.', 'See the converted value.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 26,
    slug: 'number-to-words',
    title: 'Number to Words',
    tagline: 'Lakh and crore for cheques.',
    description: 'Convert numbers to words in lakh and crore for cheques.',
    category: 'everyday',
    tags: ['Everyday'],
    icon: 'Receipt',
    keywords: ['number to words', 'lakh crore'],
    steps: ['Enter a number.', 'See it in words.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 27,
    slug: 'electricity-bill-calculator',
    title: 'Electricity Bill Calculator',
    tagline: 'Slab-based estimate.',
    description: 'Estimate a domestic electricity bill from unit slabs, fixed charges and tax.',
    category: 'everyday',
    tags: ['Everyday', 'Utility'],
    icon: 'Receipt',
    keywords: ['electricity bill calculator', 'state slabs'],
    steps: ['Enter the units consumed.', 'See the energy, fixed-charge and tax breakdown.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 28,
    slug: 'discount-calculator',
    title: 'Discount Calculator',
    tagline: 'Double discounts and coupons.',
    description: 'Calculate discounts and double discounts with coupons.',
    category: 'everyday',
    tags: ['Everyday', 'Shopping'],
    icon: 'Percent',
    keywords: ['discount calculator', 'coupon'],
    steps: ['Enter price and discount.', 'See final price after discount.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 29,
    slug: 'trip-fuel-cost-calculator',
    title: 'Trip and Fuel Cost',
    tagline: 'Mileage and tolls.',
    description: 'Calculate trip cost including fuel and tolls.',
    category: 'everyday',
    tags: ['Everyday', 'Travel'],
    icon: 'Calculator',
    keywords: ['trip cost', 'fuel cost', 'toll'],
    steps: ['Enter distance, mileage and fuel price.', 'Add tolls.', 'See total trip cost.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 30,
    slug: 'gst-invoice-generator',
    title: 'GST Invoice Generator',
    tagline: 'GST invoice PDF in seconds.',
    description: 'Create a GST invoice with seller, buyer, item, tax and total, then download it as a PDF.',
    category: 'business',
    tags: ['Business', 'GST'],
    icon: 'Receipt',
    keywords: ['gst invoice', 'invoice generator'],
    steps: ['Enter seller, buyer and item details.', 'Set quantity and the GST rate.', 'Download the invoice PDF.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  },
  {
    id: 31,
    slug: 'quotation-receipt-maker',
    title: 'Quotation and Receipt Maker',
    tagline: 'Shareable PDF templates.',
    description: 'Create quotations and receipts as shareable PDFs.',
    category: 'business',
    tags: ['Business'],
    icon: 'Receipt',
    keywords: ['quotation', 'receipt maker'],
    steps: ['Enter details and line items.', 'Pick a template.', 'Share or download the PDF.'],
    faqs: [{ q: 'Is this free?', a: 'Yes, with no sign-up.' }]
  }
];

export const calcToolsBySlug = Object.fromEntries(calcTools.map((t) => [t.slug, t]));

export const calcCategories = [
  { key: 'all', label: 'All', count: calcTools.length },
  { key: 'loans', label: 'Loans', count: 3 },
  { key: 'tax', label: 'Tax and salary', count: 6 },
  { key: 'investing', label: 'Savings', count: 7 },
  { key: 'exams', label: 'Exams', count: 3 },
  { key: 'everyday', label: 'Everyday', count: 10 },
  { key: 'business', label: 'Business', count: 2 }
];

export const CALC_SITE = {
  name: '3toOne Calc',
  tagline: 'Free money calculators that run entirely in your browser',
  url: import.meta.env.VITE_SITE_URL || ''
};

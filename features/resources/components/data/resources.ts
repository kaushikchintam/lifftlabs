export interface Resource {
  slug: string;
  title: string;
  sourceLabel: string;
  url?: string;
  description: string;
  icon: string; // lucide-react name
}

export interface ResourceShelfData {
  title: string;
  subtitle: string;
  resources: Resource[];
}

export const RESOURCE_SHELVES: { pragmatic: ResourceShelfData; inspiration: ResourceShelfData } = {
  pragmatic: {
    title: "The pragmatic shelf",
    subtitle: "Official guidance, tools and free prep — the application, done properly",
    resources: [
      {
        slug: "medical-schools-council",
        title: "Medical Schools Council",
        sourceLabel: "medschools.ac.uk",
        url: "https://www.medschools.ac.uk",
        description: "The official body for all UK medical schools — entry requirements, core values, personal statement and interview info sheets.",
        icon: "Globe",
      },
      {
        slug: "nhs-health-careers",
        title: "NHS Health Careers",
        sourceLabel: "healthcareers.nhs.uk",
        url: "https://www.healthcareers.nhs.uk",
        description: "Training pathway to doctor laid out end-to-end, plus every adjacent NHS career — useful for pressure-testing the decision.",
        icon: "Globe",
      },
      {
        slug: "gmc-becoming-a-doctor",
        title: "GMC — Becoming a doctor",
        sourceLabel: "gmc-uk.org",
        url: "https://www.gmc-uk.org",
        description: "What the regulator expects of medical students and doctors. Ground truth on standards and fitness to practise.",
        icon: "Globe",
      },
      {
        slug: "bma-studying-medicine",
        title: "BMA — Studying medicine",
        sourceLabel: "bma.org.uk",
        url: "https://www.bma.org.uk",
        description: "Applying, work experience and — most useful for career changers — the financial support available for studying medicine.",
        icon: "Globe",
      },
      {
        slug: "medmentor-superhub",
        title: "MedMentor SuperHub",
        sourceLabel: "medmentor.co.uk/superhub",
        url: "https://www.medmentor.co.uk/superhub",
        description: "Free, student-run: application tracker, NHS hot topics, events. No paywall.",
        icon: "Wrench",
      },
      {
        slug: "medic-portal-medify",
        title: "The Medic Portal & Medify free guides",
        sourceLabel: "themedicportal.com · medify.co.uk",
        description: "Uni-by-uni UCAT cutoffs, statement examples, interview question banks. Use the free tiers — you don't need the courses.",
        icon: "Wrench",
      },
      {
        slug: "observe-gp",
        title: "Observe GP",
        sourceLabel: "rcgp.org.uk",
        url: "https://www.rcgp.org.uk",
        description: "RCGP virtual work experience — primary care teams in action, ~2 hours. Counts as insight you can reflect on.",
        icon: "Monitor",
      },
      {
        slug: "bsms-virtual-work-experience",
        title: "BSMS virtual work experience",
        sourceLabel: "bsmsoutreach.thinkific.com",
        description: "Free online course across six specialties. Pairs well with your verified hours in the Experience log.",
        icon: "Monitor",
      },
      {
        slug: "ucat-official-question-banks",
        title: "UCAT official question banks",
        sourceLabel: "ucat.ac.uk",
        url: "https://www.ucat.ac.uk",
        description: "Practise on the real interface, under timed conditions. Bursary scheme covers the test fee if eligible.",
        icon: "Globe",
      },
    ],
  },
  inspiration: {
    title: "The inspiration shelf",
    subtitle: "Books, podcasts and films that keep the 'why' alive",
    resources: [
      {
        slug: "also-human",
        title: "Also Human",
        sourceLabel: "Caroline Elton",
        description: "A vocational psychologist on why people go into — and leave — medicine. The single best book for someone switching careers into it.",
        icon: "BookOpen",
      },
      {
        slug: "language-of-kindness",
        title: "The Language of Kindness",
        sourceLabel: "Christie Watson",
        description: "Written by a nurse of twenty years. If you're leaving nursing for medicine, this is the book that honours what you're leaving.",
        icon: "BookOpen",
      },
      {
        slug: "being-mortal",
        title: "Being Mortal",
        sourceLabel: "Atul Gawande",
        description: "What medicine is actually for when cure runs out. Reliably reignites the 'why'.",
        icon: "BookOpen",
      },
      {
        slug: "do-no-harm",
        title: "Do No Harm",
        sourceLabel: "Henry Marsh",
        description: "Brutally honest neurosurgery memoir — the weight of clinical judgement, told without gloss.",
        icon: "BookOpen",
      },
      {
        slug: "this-is-going-to-hurt",
        title: "This Is Going to Hurt",
        sourceLabel: "Adam Kay",
        description: "Funny and bleak in equal measure. Read it as a stress test: if it puts you off, that's data too.",
        icon: "BookOpen",
      },
      {
        slug: "sharp-scratch",
        title: "Sharp Scratch",
        sourceLabel: "The BMJ",
        description: "Med students and junior doctors on the hidden curriculum — the stuff nobody teaches. Good interview fodder.",
        icon: "Headphones",
      },
      {
        slug: "bbc-inside-health",
        title: "BBC Inside Health",
        sourceLabel: "Radio 4",
        description: "Weekly evidence-based look at health claims and NHS stories. Painless way to stay current for interviews.",
        icon: "Headphones",
      },
      {
        slug: "you-are-not-a-frog",
        title: "You Are Not a Frog",
        sourceLabel: "Dr Rachel Morris",
        description: "Made for NHS professionals under pressure — boundaries, burnout, sustainable careers. Relevant on both sides of the transition.",
        icon: "Headphones",
      },
      {
        slug: "surgeons-at-the-edge-of-life",
        title: "Surgeons: At the Edge of Life",
        sourceLabel: "BBC Two",
        description: "Theatre-level reality without the drama edit. Watch with your reflective journal open.",
        icon: "Film",
      },
    ],
  },
};

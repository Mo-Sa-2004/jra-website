export type NavChild = {
  labelKey: string;
  href: string;
};

export type NavCategory = {
  labelKey: string;
  /** Omitted when the category has no landing page of its own — the label
   *  then only opens the dropdown, per the client's navigation-rules spec
   *  ("the primary label may link to a section landing page if implemented"
   *  — Directory & Industry implements none). */
  href?: string;
  children: NavChild[];
};

/**
 * Final navigation, per JRA's October 2026 handover doc ("FINAL SITEMAP &
 * HOME PAGE WIREFRAME"). Eight primary items, each a single-level dropdown.
 * Detail pages (a restaurant, a news article) are deliberately absent here —
 * the doc is explicit that those are reached from their listing page, not
 * from a dropdown.
 *
 * Every child links somewhere real today. Where the doc names a concept with
 * no dedicated page yet (Governance, Partnerships, Start Your Business), it
 * points at a small page that says so rather than a fabricated one — see
 * ComingSoon. Where real data already exists but had no public page
 * (Events, Media Gallery, both already modelled in the schema), this pass
 * adds one.
 */
export const primaryNav: NavCategory[] = [
  { labelKey: "nav2.home", href: "/", children: [] },
  {
    labelKey: "nav2.about.label",
    href: "/about",
    children: [
      { labelKey: "nav2.about.whoWeAre", href: "/about" },
      { labelKey: "nav2.about.visionMission", href: "/about" },
      { labelKey: "nav2.about.board", href: "/about#board" },
      { labelKey: "nav2.about.team", href: "/about#team" },
      { labelKey: "nav2.about.governance", href: "/about/governance" },
      { labelKey: "nav2.about.partnerships", href: "/about/partnerships" },
      { labelKey: "nav2.about.whatWeDo", href: "/about" },
      { labelKey: "nav2.about.reports", href: "/about#reports" },
    ],
  },
  {
    labelKey: "nav2.membership.label",
    href: "/membership",
    children: [
      { labelKey: "nav2.membership.whyJoin", href: "/membership" },
      { labelKey: "nav2.membership.benefits", href: "/membership" },
      { labelKey: "nav2.membership.services", href: "/membership" },
      { labelKey: "nav2.membership.eligibility", href: "/membership" },
      { labelKey: "nav2.membership.procedures", href: "/membership" },
      { labelKey: "nav2.membership.fees", href: "/membership" },
      { labelKey: "nav2.membership.faq", href: "/membership" },
    ],
  },
  {
    labelKey: "nav2.classification.label",
    href: "/classification",
    children: [
      { labelKey: "nav2.classification.selfAssessment", href: "/classification#choose-type" },
      { labelKey: "nav2.classification.standards", href: "/classification" },
      { labelKey: "nav2.classification.firstTime", href: "/classification" },
      { labelKey: "nav2.classification.renewal", href: "/classification" },
      { labelKey: "nav2.classification.reclassification", href: "/classification" },
      { labelKey: "nav2.classification.requirements", href: "/classification" },
      { labelKey: "nav2.classification.forms", href: "/classification" },
    ],
  },
  {
    labelKey: "nav2.directory.label",
    children: [
      { labelKey: "nav2.directory.restaurants", href: "/restaurants" },
      { labelKey: "nav2.directory.suppliers", href: "/suppliers" },
      { labelKey: "nav2.directory.marketplace", href: "/marketplace" },
      { labelKey: "nav2.directory.startBusiness", href: "/start-a-business" },
      { labelKey: "nav2.directory.investment", href: "/opportunities" },
      { labelKey: "nav2.directory.industryNumbers", href: "/industry-in-numbers" },
    ],
  },
  {
    labelKey: "nav2.training.label",
    href: "/training",
    children: [
      { labelKey: "nav2.training.upcoming", href: "/training" },
      { labelKey: "nav2.training.calendar", href: "/training" },
      { labelKey: "nav2.training.resources", href: "/training" },
      { labelKey: "nav2.training.noss", href: "/training" },
      { labelKey: "nav2.training.hrManuals", href: "/knowledge" },
    ],
  },
  {
    labelKey: "nav2.knowledge.label",
    href: "/knowledge",
    children: [
      { labelKey: "nav2.knowledge.research", href: "/knowledge" },
      { labelKey: "nav2.knowledge.reports", href: "/knowledge" },
      { labelKey: "nav2.knowledge.guides", href: "/knowledge" },
      { labelKey: "nav2.knowledge.legislation", href: "/legal" },
      { labelKey: "nav2.knowledge.circulars", href: "/knowledge" },
    ],
  },
  {
    labelKey: "nav2.newsEvents.label",
    href: "/news",
    children: [
      { labelKey: "nav2.newsEvents.news", href: "/news" },
      { labelKey: "nav2.newsEvents.events", href: "/events" },
      { labelKey: "nav2.newsEvents.newsletter", href: "/magazine" },
      { labelKey: "nav2.newsEvents.gallery", href: "/gallery" },
    ],
  },
];

function findCategory(labelKey: string): NavCategory {
  const cat = primaryNav.find((c) => c.labelKey === labelKey);
  if (!cat) throw new Error(`nav category not found: ${labelKey}`);
  return cat;
}

/**
 * The three audience-gate headers (`/discover`, `/for-members`, `/jobs`)
 * each show only the slice of the site's eight categories that belongs to
 * that audience — per the client's November 2026 request, the full nav
 * should not repeat identically across all three gates. Seekers has no
 * on-site content of its own (SiyahaJobs is an external hand-off), so it
 * gets no nav list here at all.
 */
export const foodieNav: NavCategory[] = [
  { labelKey: "nav2.directory.restaurants", href: "/restaurants", children: [] },
  { labelKey: "nav2.newsEvents.events", href: "/events", children: [] },
  { labelKey: "nav2.newsEvents.news", href: "/news", children: [] },
];

export const businessNav: NavCategory[] = [
  findCategory("nav2.about.label"),
  findCategory("nav2.membership.label"),
  findCategory("nav2.classification.label"),
  {
    labelKey: "nav2.directory.label",
    children: findCategory("nav2.directory.label").children.filter(
      (c) => c.labelKey !== "nav2.directory.restaurants",
    ),
  },
  findCategory("nav2.training.label"),
  findCategory("nav2.knowledge.label"),
];

/** Flat, de-duplicated-by-href list for the footer/sitemap page, which has
 *  no use for the dropdown grouping and would otherwise repeat a landing
 *  page once per child that shares it (e.g. /membership seven times over). */
export const footerSitemap: NavChild[] = (() => {
  const seen = new Set<string>();
  const all: NavChild[] = [
    { labelKey: "nav2.home", href: "/" },
    ...primaryNav.flatMap((cat) => [
      ...(cat.href ? [{ labelKey: cat.labelKey, href: cat.href }] : []),
      ...cat.children,
    ]),
  ];
  return all.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
})();

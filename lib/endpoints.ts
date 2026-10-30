export const API_BASE =
  process.env.NEXT_PUBLIC_NARUTO_API_BASE ?? "https://naruto-api-server-2jng.vercel.app";

export type ResponseKind = "shinobi-list" | "kages" | "clans";

export type EndpointStatus = "live" | "unstable" | "sealed";

export interface PathParam {
  name: string;
  description: string;
  example: string;
  suggestions: string[];
}

export interface Endpoint {
  id: string;
  name: string;
  category: "Shinobi" | "Crews" | "Clans";
  method: "GET";
  path: string;
  summary: string;
  description: string;
  params: PathParam[];
  kind: ResponseKind;
  status: EndpointStatus;
  statusNote?: string;
  sfx: string;
}

const shinobiSchema = `[
  {
    "id": number,
    "name": string,
    "underscoredName": string,
    "description": string,
    "imagePro": string (image url)
  }
]`;

export const SCHEMAS: Record<ResponseKind, string> = {
  "shinobi-list": shinobiSchema,
  kages: `{
  "hokages": [ Shinobi, ... ]
}`,
  clans: `[
  {
    "clan": string,
    "description": string,
    "img": string (image url),
    "members": Shinobi[]
  }
]`,
};

export const ENDPOINTS: Endpoint[] = [
  {
    id: "one-shinobi",
    name: "One Shinobi",
    category: "Shinobi",
    method: "GET",
    path: "/one_sinobi/{name}",
    summary: "Fetch a single shinobi by exact underscored name.",
    description:
      "Looks up one shinobi by their underscored name. The match is exact and case-sensitive: use Naruto_Uzumaki, not naruto uzumaki. An unknown name returns an empty array.",
    params: [
      {
        name: "name",
        description: "Underscored, case-sensitive name",
        example: "Naruto_Uzumaki",
        suggestions: ["Naruto_Uzumaki", "Sasuke_Uchiha", "Kakashi_Hatake", "Itachi_Uchiha", "Gaara", "Sakura_Haruno", "Jiraiya"],
      },
    ],
    kind: "shinobi-list",
    status: "live",
    sfx: "SHUNSHIN!",
  },
  {
    id: "random-shinobis",
    name: "Random Shinobis",
    category: "Shinobi",
    method: "GET",
    path: "/randomShinobis",
    summary: "A fresh random squad of shinobi on every call.",
    description:
      "Summons a random batch of shinobi from the full roster. Every request returns a different set, which makes it handy for feeds, placeholders and quizzes.",
    params: [],
    kind: "shinobi-list",
    status: "live",
    sfx: "KUCHIYOSE!",
  },
  {
    id: "search-shinobis",
    name: "Search Shinobis",
    category: "Shinobi",
    method: "GET",
    path: "/shinobis_search/{query}",
    summary: "Partial-match search across shinobi names.",
    description:
      "Returns every shinobi whose name contains the query. Good for autocomplete. Try a clan name like Uchiha to pull the whole family.",
    params: [
      {
        name: "query",
        description: "Part of a shinobi name",
        example: "naruto",
        suggestions: ["naruto", "Uchiha", "Hyūga", "Sarutobi", "Senju", "Kaguya"],
      },
    ],
    kind: "shinobi-list",
    status: "live",
    sfx: "BYAKUGAN!",
  },
  {
    id: "rough-shinobis",
    name: "Rough Shinobis",
    category: "Shinobi",
    method: "GET",
    path: "/Rough_shinobies",
    summary: "Rogue ninja roster.",
    description: "Listed in the original docs, but the server does not serve this route yet.",
    params: [],
    kind: "shinobi-list",
    status: "sealed",
    statusNote: "Server answers 404 Not Found.",
    sfx: "FUIN!",
  },
  {
    id: "popular-shinobis",
    name: "Popular Shinobis",
    category: "Shinobi",
    method: "GET",
    path: "/Popular_shinobies",
    summary: "Fan-favourite shinobi.",
    description: "Listed in the original docs, but the server does not serve this route yet.",
    params: [],
    kind: "shinobi-list",
    status: "sealed",
    statusNote: "Server answers 404 Not Found.",
    sfx: "FUIN!",
  },
  {
    id: "akatsuki",
    name: "Akatsuki",
    category: "Crews",
    method: "GET",
    path: "/Akatsuki",
    summary: "Members of the Akatsuki organisation.",
    description: "Returns the Akatsuki roster: the S-rank rogue ninja in red-clouded cloaks.",
    params: [],
    kind: "shinobi-list",
    status: "live",
    sfx: "AMATERASU!",
  },
  {
    id: "taka",
    name: "Taka",
    category: "Crews",
    method: "GET",
    path: "/taka",
    summary: "Sasuke's team Taka (formerly Hebi).",
    description: "Returns the members of Team Taka.",
    params: [],
    kind: "shinobi-list",
    status: "unstable",
    statusNote: "The server often times out (504) on this route.",
    sfx: "CHIDORI!",
  },
  {
    id: "jinchuriki",
    name: "Jinchūriki",
    category: "Crews",
    method: "GET",
    path: "/Jinchuriki",
    summary: "Hosts of the tailed beasts.",
    description: "Returns the human hosts of the tailed beasts, from Shukaku to Kurama.",
    params: [],
    kind: "shinobi-list",
    status: "live",
    sfx: "BIJUDAMA!",
  },
  {
    id: "kages",
    name: "Kages",
    category: "Crews",
    method: "GET",
    path: "/Kages",
    summary: "Village leaders, grouped by title.",
    description:
      "Returns an object keyed by kage title. The server currently ships the hokages list; the other villages were in the original plan.",
    params: [],
    kind: "kages",
    status: "live",
    sfx: "HOKAGE!",
  },
  {
    id: "clans",
    name: "Clans",
    category: "Clans",
    method: "GET",
    path: "/Clans",
    summary: "Every clan, with description, crest and members.",
    description: "Returns all clans with their description, an image and the full member list.",
    params: [],
    kind: "clans",
    status: "live",
    sfx: "KEKKEI GENKAI!",
  },
  {
    id: "clan-members",
    name: "Clan Members",
    category: "Clans",
    method: "GET",
    path: "/Clan_members/{clan}",
    summary: "Members of one clan.",
    description:
      "Returns the shinobi in one clan. The clan name is exact and case-sensitive and matches the clan field from /Clans (for example Uchiha, Hyūga, Uzumaki).",
    params: [
      {
        name: "clan",
        description: "Exact clan name from /Clans",
        example: "Uchiha",
        suggestions: ["Uchiha", "Uzumaki", "Hyūga", "Hatake", "Akimichi", "Aburame", "Yamanaka", "Inuzuka", "Ōtsutsuki"],
      },
    ],
    kind: "shinobi-list",
    status: "live",
    sfx: "SHARINGAN!",
  },
];

export const CATEGORIES = ["Shinobi", "Crews", "Clans"] as const;

export function getEndpoint(id: string | null | undefined) {
  return ENDPOINTS.find((e) => e.id === id);
}

export function buildPath(endpoint: Endpoint, values: Record<string, string>) {
  return endpoint.path.replace(/\{(\w+)\}/g, (_, key: string) =>
    encodeURIComponent((values[key] ?? "").trim()),
  );
}

export function defaultParams(endpoint: Endpoint) {
  return Object.fromEntries(endpoint.params.map((p) => [p.name, p.example]));
}

import type { Project } from '../types';

const COMMIT = 'https://github.com/KCMake/atl-free-parking/blob/4cf37d66405e933a62626c983440de31d191da3b';

const project: Project = {
  slug: 'free-curb-atl',
  name: 'Free Curb ATL',
  line: 'A map of which Atlanta curbs are free at any day and hour, worked out block by block.',
  result: '2,035 blocks',
  group: 'projects',
  order: 20,
  tags: ['Web'],
  demo: 'curb',
  when: '2026',
  stack: ['Python', 'JavaScript', 'Leaflet', 'GitHub Actions'],
  links: [
    { label: 'Open the map', url: 'https://kcmake.github.io/atl-free-parking/' },
    { label: 'Code on GitHub', url: 'https://github.com/KCMake/atl-free-parking' },
  ],
  writeup: {
    problem: [
      "Finding free street parking around Georgia Tech and Midtown is a lottery. Atlanta doesn't publish where its parking meters are, so free parking can't be looked up. It has to be inferred.",
    ],
    firstTry: [
      { what: 'Every street minus the paid ones', why: 'It marks interstates, park drives, and permit-only streets as free.' },
    ],
    broke: [
      {
        what: 'Free parking on the interstate. Subtracting paid streets from all streets left highways, ramps, and park drives marked free.',
        fix: 'They are excluded before any other rule runs, and a test checks that no such block is ever free.',
      },
      {
        what: 'Free blocks shown as paid. Parkopedia files every on-street listing under a /meter/ URL, free ones included, so reading the URL as evidence marked 8 blocks paid that were not.',
        fix: "Each listing's actual rule is recorded now, and a test pins 983 to 1051 Hemphill Ave as time-limited.",
      },
      {
        what: "Silently missing streets. The city's server truncated offset-paged results, 993 of 1,762 segments, without an error.",
        fix: "The fetcher pages by object ID and fails loudly if the counts don't match.",
      },
      {
        what: "Addresses that didn't match. Some city segments carry an address range on one side only, so a listing could fall just outside it.",
        fix: 'Listings match the nearest range within 40 house numbers. 62 of 63 match.',
      },
    ],
    shipped: [
      "I started over from the city's own street centerlines and worked through the evidence for each of 2,035 blocks. Every block on the map says which evidence its color comes from.",
      'The page also knows the meter clock. City meters run Monday to Saturday, 7 AM to 10 PM, and are off on Sundays and nine city holidays, so you can pick any day and time and see which curbs are free right then.',
    ],
    steps: [
      { name: 'City GIS and OpenStreetMap', detail: 'Street centerlines with address ranges, neighborhoods, parking tags, parks, and the campus outline.' },
      { name: 'scripts/fetch_data.py', detail: 'Downloads it all, paging the city server by object ID.' },
      { name: 'scripts/build.py', detail: 'Splits streets into blocks and gives each the first rule that applies. Exclusions run first, so no evidence can make a highway free.' },
      { name: '63 hand-checked listings', detail: 'Block-level evidence wins over district-level inference.' },
      { name: 'web/hours.js', detail: 'Meter hours as pure functions of Atlanta wall-clock time, tested apart from the page.' },
      { name: 'One static HTML page', detail: 'A Leaflet canvas with its own basemap. No server, no API keys, no tracking.' },
    ],
    excerpts: [
      {
        file: 'scripts/fetch_data.py',
        lang: 'python',
        url: `${COMMIT}/scripts/fetch_data.py#L44-L69`,
        startLine: 44,
        note: "Offset paging dropped 769 street segments without an error. Paging by object ID, then refusing to continue when the counts disagree, means a short download can't quietly turn into a wrong map.",
        code: `def arcgis_geojson(layer_url: str, fields: list[str] | str) -> dict:
    """Fetch every feature intersecting BBOX, paging by object id (offset paging
    silently truncates on this server)."""
    s, w, n, e = BBOX
    out_fields = fields if isinstance(fields, str) else ",".join(fields)
    spatial = {
        "where": "1=1",
        "geometry": f"{w},{s},{e},{n}",
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
    }
    ids = http_json(f"{layer_url}/query?" + urllib.parse.urlencode(
        {**spatial, "returnIdsOnly": "true", "f": "json"}))["objectIds"] or []
    ids.sort()
    feats: list = []
    for i in range(0, len(ids), 200):
        chunk = ",".join(str(x) for x in ids[i:i + 200])
        body = urllib.parse.urlencode({
            "objectIds": chunk, "outFields": out_fields, "outSR": "4326", "f": "geojson",
        }).encode()
        feats.extend(http_json(f"{layer_url}/query", data=body).get("features", []))
        time.sleep(0.3)
    if len(feats) != len(ids):
        raise RuntimeError(f"{layer_url}: expected {len(ids)} features, got {len(feats)}")
    return {"type": "FeatureCollection", "features": feats}`,
      },
      {
        file: 'tests/test_classification.py',
        lang: 'python',
        url: `${COMMIT}/tests/test_classification.py#L37-L40`,
        startLine: 37,
        note: 'Every mistake the map made became a test. This one makes sure no highway or ramp is ever shown as parking.',
        code: `    def test_highways_and_ramps_show_no_parking(self):
        for b in self.blocks:
            if b["class"] in build.HIGHWAY_CLASSES or build.norm(b["name"]).startswith(build.HIGHWAY_PREFIXES):
                self.assertEqual(b["status"], "none", b)`,
      },
    ],
    stats: [
      { value: '2,035', label: 'blocks classified' },
      { value: '285 km', label: 'of curb colored by rule' },
      { value: '63', label: 'listings checked by hand' },
      { value: '120 km', label: 'free on a weekday at 2 PM' },
      { value: '171 km', label: 'free on a Sunday' },
    ],
  },
};

export default project;

/**
 * One small drawing per project, each showing what the thing does. All of them are drawn by hand
 * as SVG on the same 96 by 64 grid, with the same line weight and the same few colors:
 *
 *   (no class)  a line in the text color      .g  green line    .r  red line    .o  grey line
 *   .f  filled with the text color            .fg filled green  .fy filled yellow
 *
 * To add one, add an entry under the project's slug. A project without one gets the plain mark.
 */
export const art: Record<string, string> = {
  // Street grid, some curbs free, one stretch paid.
  'free-curb-atl': `
    <path class="o" d="M6 14h84M6 32h84M6 50h84M22 6v52M48 6v52M74 6v52"/>
    <path class="g" d="M6 14h42M22 32v26M48 50h42M74 6v26"/>
    <path class="r" d="M48 6v26h26"/>`,

  // A voice on the left becomes a checked order on the right.
  'ai-phone-ordering': `
    <path d="M8 32v0M14 26v12M20 18v28M26 24v16M32 12v40M38 26v12"/>
    <path class="o" d="M45 32h8m-3-3 3 3-3 3"/>
    <rect x="60" y="12" width="28" height="40" rx="2"/>
    <path d="M66 22h16M66 30h16M66 38h8"/>
    <path class="g" d="m76 42 3 3 6-7"/>`,

  // Memories: one strong, one steady, two fading.
  cogni: `
    <path class="o" d="M30 34 58 20M30 34l34 14M30 34 14 16M58 20l6 28"/>
    <circle class="f" cx="30" cy="34" r="9"/>
    <circle cx="58" cy="20" r="6"/>
    <circle class="fy" cx="64" cy="48" r="5"/>
    <circle class="o" cx="14" cy="16" r="4" stroke-dasharray="2 3"/>
    <circle class="o" cx="84" cy="30" r="3" stroke-dasharray="2 3"/>`,

  // A moon and a voice.
  tuck: `
    <path class="fy" d="M34 12a20 20 0 1 0 14 34A17 17 0 0 1 34 12z"/>
    <path d="M58 32v0M64 26v12M70 20v24M76 27v10M82 30v4"/>`,

  // Soil moisture falling, the forecast, and watering before the line is crossed.
  agrinexus: `
    <path class="o" d="M6 46h84" stroke-dasharray="2 4"/>
    <path d="M6 14c14 2 24 8 36 20"/>
    <path class="r" d="M42 34c6 6 10 10 14 14" stroke-dasharray="3 3"/>
    <path class="g" d="M42 34c8-12 22-16 48-18"/>
    <path class="fg" d="M42 20c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z"/>`,

  // Residents as dots. Some walk in.
  'opening-day': `
    <rect class="fy" x="40" y="24" width="16" height="16" rx="2"/>
    <g class="f"><circle cx="12" cy="14" r="2"/><circle cx="24" cy="50" r="2"/><circle cx="82" cy="12" r="2"/><circle cx="86" cy="46" r="2"/><circle cx="66" cy="56" r="2"/><circle cx="30" cy="8" r="2"/></g>
    <g class="fg"><circle cx="30" cy="30" r="2.5"/><circle cx="64" cy="22" r="2.5"/><circle cx="60" cy="44" r="2.5"/><circle cx="46" cy="52" r="2.5"/></g>
    <path class="g" d="M33 30h5M62 24l-5 3M58 43l-3-3M46 49v-7" stroke-dasharray="1 3"/>`,

  // A trackpad with handwriting on it.
  quill: `
    <rect x="10" y="8" width="76" height="48" rx="6"/>
    <path class="g" d="M22 40c4-14 8-14 9-4s6 8 9-4 8-10 9 0 5 8 9 0 8-8 10 0"/>
    <circle class="f" cx="77" cy="32" r="2.5"/>`,

  // A full section, one seat opens, and the ping.
  coursesniper: `
    <g class="f"><rect x="8" y="34" width="10" height="10" rx="1.5"/><rect x="22" y="34" width="10" height="10" rx="1.5"/><rect x="36" y="34" width="10" height="10" rx="1.5"/><rect x="64" y="34" width="10" height="10" rx="1.5"/><rect x="78" y="34" width="10" height="10" rx="1.5"/><rect x="8" y="48" width="10" height="10" rx="1.5"/><rect x="22" y="48" width="10" height="10" rx="1.5"/><rect x="36" y="48" width="10" height="10" rx="1.5"/><rect x="50" y="48" width="10" height="10" rx="1.5"/><rect x="64" y="48" width="10" height="10" rx="1.5"/><rect x="78" y="48" width="10" height="10" rx="1.5"/></g>
    <rect class="g" x="50" y="34" width="10" height="10" rx="1.5"/>
    <path class="g" d="M49 26a8 8 0 0 1 12 0M44 20a15 15 0 0 1 22 0M39 14a22 22 0 0 1 32 0"/>`,

  // Every action logged, inside a sandbox.
  itrade: `
    <rect class="o" x="6" y="6" width="84" height="52" rx="3" stroke-dasharray="4 4"/>
    <path d="M26 18h50M26 28h38M26 38h46M26 48h30"/>
    <path class="g" d="m14 18 2 2 4-4M14 28l2 2 4-4M14 38l2 2 4-4"/>
    <path class="r" d="m14 46 5 5m0-5-5 5"/>`,

  // A newsletter in, rows out.
  portify: `
    <rect x="6" y="18" width="30" height="24" rx="2"/>
    <path d="m6 20 15 12 15-12"/>
    <path class="o" d="M42 32h8m-3-3 3 3-3 3"/>
    <rect x="56" y="10" width="34" height="44" rx="2"/>
    <path d="M56 21h34M56 32h34M56 43h34M68 10v44"/>
    <rect class="fy" x="57" y="22" width="10" height="9"/>`,

  // A robot from above.
  'vex-1961z': `
    <rect x="26" y="14" width="44" height="36" rx="2"/>
    <g class="f"><rect x="16" y="14" width="7" height="14" rx="1.5"/><rect x="16" y="36" width="7" height="14" rx="1.5"/><rect x="73" y="14" width="7" height="14" rx="1.5"/><rect x="73" y="36" width="7" height="14" rx="1.5"/></g>
    <circle class="g" cx="48" cy="32" r="8"/>
    <path class="g" d="M48 20v4M48 40v4M36 32h4M56 32h4M39.5 23.5l3 3M53.5 37.5l3 3M56.5 23.5l-3 3M42.5 37.5l-3 3"/>
    <circle class="fg" cx="48" cy="32" r="2.5"/>`,

  // A community: a lot of people around one table.
  buildforge: `
    <circle class="fy" cx="48" cy="32" r="7"/>
    <g class="f"><circle cx="48" cy="12" r="2.5"/><circle cx="62" cy="18" r="2.5"/><circle cx="68" cy="32" r="2.5"/><circle cx="62" cy="46" r="2.5"/><circle cx="48" cy="52" r="2.5"/><circle cx="34" cy="46" r="2.5"/><circle cx="28" cy="32" r="2.5"/><circle cx="34" cy="18" r="2.5"/></g>
    <g class="o"><circle cx="48" cy="32" r="30" stroke-dasharray="1 5"/><circle cx="48" cy="32" r="40" stroke-dasharray="1 7"/></g>`,

  // A bowl, chopsticks, steam.
  'hong-kong-city': `
    <path d="M22 34h52a26 22 0 0 1-52 0z"/>
    <path d="M40 56h16"/>
    <path class="r" d="M56 30 84 10M62 30l26-14"/>
    <path class="o" d="M36 26c-3-4 3-6 0-10M46 26c-3-4 3-6 0-10"/>`,

  // Half a court.
  basketball: `
    <rect x="8" y="8" width="80" height="48" rx="2"/>
    <path d="M8 22h26v20H8M34 24a8 8 0 0 1 0 16"/>
    <path class="o" d="M8 12h14a34 20 0 0 1 0 40H8"/>
    <circle class="r" cx="15" cy="32" r="3.5"/>
    <circle class="fy" cx="64" cy="26" r="5"/>`,

  // Volunteers, hand to hand.
  'pep-georgia': `
    <g><circle cx="22" cy="24" r="6"/><path d="M10 50a12 12 0 0 1 24 0"/></g>
    <g class="g"><circle cx="48" cy="20" r="7"/><path d="M34 50a14 14 0 0 1 28 0"/></g>
    <g><circle cx="74" cy="24" r="6"/><path d="M62 50a12 12 0 0 1 24 0"/></g>`,

  // A brick.
  'basement-robotics': `
    <rect x="12" y="24" width="72" height="30" rx="2"/>
    <g class="fy"><rect x="18" y="16" width="12" height="8" rx="1.5"/><rect x="34" y="16" width="12" height="8" rx="1.5"/><rect x="50" y="16" width="12" height="8" rx="1.5"/><rect x="66" y="16" width="12" height="8" rx="1.5"/></g>
    <g><rect x="18" y="16" width="12" height="8" rx="1.5"/><rect x="34" y="16" width="12" height="8" rx="1.5"/><rect x="50" y="16" width="12" height="8" rx="1.5"/><rect x="66" y="16" width="12" height="8" rx="1.5"/></g>
    <circle class="o" cx="32" cy="39" r="5"/><circle class="o" cx="64" cy="39" r="5"/>`,

  // A page with a map on it and a clock to drag.
  'this-site': `
    <rect x="8" y="6" width="80" height="52" rx="3"/>
    <path class="f" d="M16 14h22v4H16z"/>
    <path class="o" d="M16 24h20M16 30h14"/>
    <path class="g" d="M50 14h30M58 14v22M50 28h30"/>
    <path class="r" d="M70 14v22"/>
    <path d="M16 46h64"/>
    <circle class="fy" cx="56" cy="46" r="4"/><circle cx="56" cy="46" r="4"/>`,
};

/** Shown for a project that has no drawing yet. */
export const plainMark = `<rect class="o" x="30" y="14" width="36" height="36" rx="3"/><path class="o" d="M40 32h16M48 24v16"/>`;

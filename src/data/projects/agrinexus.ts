import type { Project } from '../types';

const IMG = 'work/agrinexus';

const project: Project = {
  slug: 'agrinexus',
  name: 'AgriNexus 2.0',
  line: 'A tabletop nitrogen manager. An ESP32 predicts soil moisture ten minutes ahead and waters before the soil dries out.',
  result: '28% less water',
  group: 'projects',
  order: 50,
  tags: ['Hardware'],
  role: 'Team project, TSA Engineering Design',
  when: '2025',
  stack: ['C++', 'Python', 'ESP32-S3', 'FreeRTOS', 'scikit-learn', 'EloquentTinyML'],
  writeup: {
    hero: {
      src: `${IMG}/unit.webp`,
      alt: 'AgriNexus 2.0 on a workbench: a tilted aluminum tray of plants, two clear reservoir boxes with pumps above it, two red driver boards at the tray edge, and a wooden crate of wiring in front.',
      caption: 'AgriNexus 2.0. Two reservoirs and their pumps sit above the tilted tray, the driver boards are at its edge, and the controller lives in the crate.',
      width: 1050,
      height: 1400,
    },
    problem: [
      'Farmers lose a lot of the nitrogen they apply. Global use efficiency is only about 55%, so roughly 45% leaches into waterways or escapes as gas. The existing fixes were industrial-scale or too manual for small growers.',
      'We wanted something for the small end, like a greenhouse bench or a vertical-farm tray: dose nitrogen in measured amounts, catch and measure what runs off, and do all of it on battery power.',
    ],
    firstTry: [
      { what: 'A small-scale Haber-Bosch reactor', why: 'Too much energy and infrastructure for a local farm. Making ammonia needs 400 to 500 °C and high pressure. It got as far as CAD and a printed model.' },
      { what: 'AgriNexus 1.0: an Arduino, a relay, and a sealed printed box', why: 'It placed fifth at the state conference, but nitrogen was hard-coded, the only live reading was soil moisture, and the closed enclosure hid the runoff the project was about.' },
      { what: 'A fixed moisture threshold', why: 'Too rigid in a cool room. The forecast replaced it.' },
    ],
    broke: [
      {
        what: 'Over-watering in a cool room. In a four-hour soak test at 18 °C, the fixed moisture threshold kept pumping after the soil was already wet.',
        fix: 'We logged moisture, temperature, time of day, and dosing history, trained a model to predict the next ten minutes, and now water only on a forecast drop. Redundant watering fell 40% in repeated cool-room tests.',
      },
      {
        what: 'The model would not run on the board. Python exported a .pkl file the ESP32 could not read, and the inputs had to be normalized exactly the same way on the device.',
        fix: 'We pulled the weights out by hand into a C++ header stored in flash and matched the normalization on both sides. Both halves are quoted further down.',
      },
      {
        what: 'The touchscreen froze whenever the pumps and the sensor readouts overlapped.',
        fix: 'The display moved to its own FreeRTOS task. No freezes since.',
      },
      {
        what: 'Pumps that sometimes did not fire. In the first version a relay switched the pump, and it occasionally missed its cue.',
        fix: 'A debounce in the code first. In 2.0, IRF520 MOSFET boards replaced the relays, with a 1000 µF capacitor across the supply so a pump starting does not disturb the logic.',
      },
      {
        what: 'The 3D-printed PETG wedge warped after a day of mild heat and tilted the tray off its axis. A straightedge and feeler gauges showed a gap of several millimeters.',
        fix: 'Two hardwood shims cut on a miter saw. Large structural parts moved to pine and plywood, which also removed more than 23 hours of printing. The printer only makes the small parts that need it.',
        figure: {
          src: `${IMG}/warped-wedge.webp`,
          alt: 'A black 3D-printed wedge on a table, its base bowed so the edges lift off the surface.',
          caption: 'The printed wedge after a day of mild heat. The base has lifted at the edges.',
          width: 1400,
          height: 1050,
        },
      },
      {
        what: 'A 12-hour soak test found slow drips at every push-fit barb. By morning the reservoir was empty.',
        fix: 'Silicone grommets over each barb, locked with miniature zip ties. The repeat test left the bench dry.',
      },
      {
        what: 'Wiring nobody could trace. Reviewers called the first harness spaghetti, and a loose lead was a real risk next to water.',
        fix: 'A full rewiring pass. Every lead was routed, bundled in spiral wrap, and anchored away from water and moving parts.',
        figure: {
          src: `${IMG}/wiring.webp`,
          alt: 'Electronics spread on a black table: a display and controller board, a breadboard, two red MOSFET driver boards, a soil moisture probe, and two white pumps joined by many jumper wires.',
          caption: 'The electronics on the bench: display and ESP32 at left, two IRF520 driver boards in red, the moisture probe at top, and both pumps.',
          width: 1500,
          height: 1125,
        },
      },
    ],
    shipped: [
      'AgriNexus 2.0 is a sensor-guided growing tray. An ESP32-S3 reads a capacitive moisture probe and a BME280 climate sensor, drives MOSFET-switched micro-pumps for low- and high-nitrogen solution, and runs on three AA batteries.',
      'The key software change replaced a fixed moisture threshold with a small linear model that predicts the next ten minutes, so the tray waters before the soil dries out instead of after.',
      'The frame is open on purpose. The tray sits at a 3° incline, and twelve drain holes along its low edge feed a collector, so the nitrogen that leaches out is caught and measured. When the air reaches 30 °C a fog disc fires for two seconds, to show the nitrogen that would escape as gas.',
    ],
    diagram: {
      caption: 'One pass through the control loop. Sensing, the forecast, and the pump decision all happen on the board.',
      columns: [
        {
          title: 'Sense',
          blocks: [
            { name: 'Capacitive moisture probe', detail: 'Volumetric water content, read on an analog pin every 15 s.' },
            { name: 'BME280', detail: 'Temperature, humidity, and pressure over I2C at 2 Hz.' },
            { name: 'Nitrogen estimate', detail: 'Simulated for now. An RS-485 header is wired for a real NPK probe.' },
          ],
        },
        {
          title: 'Decide, on the ESP32-S3',
          blocks: [
            { name: 'Feature vector', detail: 'Moisture, temperature / 50 °C, sine and cosine of the time of day, and a dosed-in-the-last-10-minutes flag.' },
            { name: 'Linear model', detail: 'Forecasts the change in moisture over the next 10 minutes. About 820 µs.' },
            { name: 'Rule engine', detail: 'A FreeRTOS task at 1 Hz. Doses on a forecast drop, then locks out for 2 minutes.' },
            { name: 'Dashboard', detail: 'Its own task at 2 Hz, so drawing never delays a pump.' },
          ],
        },
        {
          title: 'Act',
          blocks: [
            { name: 'Low-nitrogen pump', detail: 'GPIO 4 through an IRF520. 3 s at full PWM.' },
            { name: 'High-nitrogen pump', detail: 'GPIO 15 through an IRF520. 3 s, about 30 mL.' },
            { name: 'Fog disc', detail: 'A third IRF520. 2 s when the air is 30 °C or warmer.' },
            { name: 'LED bar', detail: '30 WS2812B pixels, dimmed when the batteries sag.' },
          ],
        },
      ],
    },
    steps: [
      { name: 'Sensors', detail: 'Soil moisture every 15 seconds. Temperature, humidity, and pressure from the BME280 at 2 Hz. Each row carries a millisecond counter and goes into a ring buffer in PSRAM, with an optional microSD copy as CSV.' },
      { name: 'Four features', detail: 'Soil moisture, air temperature scaled by 50 °C, time of day as a sine and cosine so midnight is not a jump, and whether a pump ran in the last ten minutes.' },
      { name: 'Linear model', detail: 'Predicts the change in soil moisture over the next ten minutes. Trained on about 40,000 logged rows. One prediction takes about 820 µs on the 240 MHz core.' },
      { name: 'Rule engine', detail: 'A forecast drop of 5 points or more runs the low-nitrogen pump for 3 seconds. Nitrogen under 100 mg/kg runs the high-nitrogen pump. A 2-minute lockout stops oscillation.' },
      { name: 'Two FreeRTOS tasks', detail: 'Control runs at 1 Hz. The TFT dashboard redraws at 2 Hz on its own task, so drawing never delays a pump.' },
      { name: 'Watchdog', detail: 'Resets the board if neither task checks in within 5 seconds, so a stuck I2C call cannot freeze watering.' },
      { name: 'Retraining', detail: 'Logged CSVs go to a laptop, a scikit-learn notebook retrains the model, and a script writes the new weights as a C header.' },
    ],
    specs: [
      {
        title: 'Control rules',
        rows: [
          ['Forecast drop of 5 points in 10 min', 'Low-nitrogen pump, 3 s'],
          ['Nitrogen under 100 mg/kg', 'High-nitrogen pump, 3 s, about 30 mL'],
          ['After any dose', '2-minute lockout'],
          ['Three high-nitrogen doses in 30 min', 'High-nitrogen dosing locks'],
          ['Air at 30 °C or warmer', 'Fog disc, 2 s'],
          ['Battery sag', 'LED duty cycle halves'],
          ['No task check-in for 5 s', 'Watchdog reset'],
          ['Target soil moisture', '45 to 55%'],
        ],
      },
      {
        title: 'Electronics',
        rows: [
          ['Controller', 'ESP32-S3-DevKitC-1 (N8R8), 240 MHz'],
          ['Power', 'Three AA alkaline cells, 4.5 V, regulated to 3.3 V for logic'],
          ['Supply capacitor', '1000 µF'],
          ['Moisture', 'Capacitive probe, analog'],
          ['Climate', 'BME280 over I2C'],
          ['Drivers', 'Three IRF520 MOSFET boards'],
          ['Display', '3.5-inch ST7796U TFT'],
          ['Light', '30-pixel WS2812B strip, fixed at RGB (255, 0, 128)'],
          ['Expansion', 'RS-485 header, spare UART and I2C'],
        ],
      },
      {
        title: 'Mechanical',
        rows: [
          ['Base', 'Plywood, 11 by 13 inches'],
          ['Tray', 'Disposable aluminum pan at a 3° incline on hardwood shims'],
          ['Drainage', 'Twelve 3 mm holes along the low edge'],
          ['Reservoirs', 'Two open cups, high and low nitrogen, on 3 mm silicone lines'],
          ['Collector', '3D-printed, slides out for inspection'],
        ],
      },
      {
        title: 'Bill of materials, $254',
        folded: true,
        rows: [
          ['Taidacent RS-485 soil NPK and pH probe', '$60'],
          ['Wood and plastic', '$40'],
          ['3.5-inch display', '$17'],
          ['ESP32-S3-DevKitC-1-N8R8', '$15'],
          ['PETG filament', '$15'],
          ['LED light strip', '$14'],
          ['BME280 environmental sensor', '$13'],
          ['Silicone tubing', '$12'],
          ['Artificial plants for the display unit', '$12'],
          ['Mini float switch', '$10'],
          ['Raw nitrogen', '$10'],
          ['Two automatic irrigation sets', '$9'],
          ['Submersible mini water pump', '$7'],
          ['MOSFET boards', '$7'],
          ['Jumper wires', '$7'],
          ['Breadboard', '$5'],
          ['Aluminum tray', '$1'],
        ],
      },
    ],
    figures: {
      firstTry: [
        {
          src: `${IMG}/haber-bosch-assembly.webp`,
          alt: 'An engineering drawing sheet titled Full Assembly, with top, side, and isometric views of a small Haber-Bosch plant on a base board.',
          caption: 'The first idea, in CAD: a tabletop Haber-Bosch plant with reactor, compressor, condenser, and heat exchanger on one board.',
          width: 1500,
          height: 1182,
          paper: true,
        },
        {
          src: `${IMG}/haber-bosch-reactor.webp`,
          alt: 'An engineering drawing sheet titled Reactor, with three views of the reactor vessel at 1:8 scale.',
          caption: 'Its reactor. Every part had to shrink to fit the board, and none of it could reach real reaction conditions.',
          width: 1500,
          height: 1150,
          paper: true,
        },
      ],
      shipped: [
        {
          src: `${IMG}/frame.webp`,
          alt: 'A plywood base with black-painted wooden uprights and a shelf, on its side on a table next to a tray of plants.',
          caption: 'The pine and plywood frame that replaced the printed structure.',
          width: 1400,
          height: 1050,
        },
        {
          src: `${IMG}/dashboard.webp`,
          alt: 'A dark web dashboard titled AgriNexus Dashboard listing soil moisture 44.5%, temperature 32.9 °C, humidity 75.2%, pressure 1013.7 hPa, overflow no, and soil health good.',
          caption: 'The companion web app, a mock-up that mirrors the readings on the device.',
          width: 1000,
          height: 991,
        },
      ],
      tested: [
        {
          src: `${IMG}/height-chart.webp`,
          alt: 'A scatter chart of average plant height in centimeters over 21 days. The two series track each other until about day 15, then the AgriNexus series ends near 19 cm and the control near 17 cm.',
          caption: 'Average plant height over the three-week trial. Red is AgriNexus and blue is the control tray.',
          width: 1190,
          height: 738,
          paper: true,
        },
      ],
    },
    listings: [
      {
        file: 'Training and export, in Python',
        lang: 'python',
        note: 'Four features make five numbers, because time of day is stored as a sine and a cosine. The script writes the trained weights straight into a C header. This is the simplified version from our design documentation.',
        code: `from sklearn.linear_model import LinearRegression
import numpy as np

# Feature vector: [moisture, temp, sin(time), cos(time), last_dose]
X = np.load("features.npy")
y = np.load("targets.npy")

model = LinearRegression().fit(X, y)
weights = model.coef_
bias = model.intercept_

with open("model_weights.h", "w") as f:
    f.write("#define INPUT_SIZE 5\\n")
    f.write("const float weights[INPUT_SIZE] = {" + ", ".join(f"{w:.6f}" for w in weights) + "};\\n")
    f.write(f"const float bias = {bias:.6f};\\n")`,
      },
      {
        file: 'Inference on the ESP32, in C++',
        lang: 'cpp',
        note: 'The whole model on the device is a dot product and a bias, which is why one prediction takes under a millisecond.',
        code: `#include "model_weights.h"

float predict_moisture_delta(float input[INPUT_SIZE]) {
  float result = bias;
  for (int i = 0; i < INPUT_SIZE; i++) {
    result += input[i] * weights[i];
  }
  return result;
}`,
      },
    ],
    tested: [
      'Bench cycles. We ran four ten-minute cycles with the light on, pumps live, and the fog disc armed. Every pump pulse and fog burst was logged, and each one matched the trigger that should have caused it.',
      "Runoff. The collector caught an average of 12 mL per cycle. The dashboard's logged volume agreed with measuring by hand to within 1 mL.",
      'Battery. On three AA cells the full system ran 38 minutes before the supply fell below 4.0 V. The firmware then dimmed the LEDs, which stretched the run to 51 minutes.',
      'Grow trial. Over three weeks we grew the same plants in AgriNexus and in a control tray. The AgriNexus plants ended about 2 cm taller, on 28% less water and 18% less fertilizer.',
    ],
    stats: [
      { value: '28%', label: 'less water than the control tray, over three weeks' },
      { value: '18%', label: 'less fertilizer' },
      { value: '~2 cm', label: 'taller plants on average' },
      { value: '820 µs', label: 'per prediction' },
      { value: '51 min', label: 'of full operation on three AA batteries' },
      { value: '$254', label: 'in parts' },
    ],
    credit: 'Built with my TSA Engineering Design team. It placed in the top five in Georgia and went to the national conference in Nashville.',
  },
};

export default project;

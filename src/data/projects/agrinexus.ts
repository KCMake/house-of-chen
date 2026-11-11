import type { Project } from '../types';

const project: Project = {
  slug: 'agrinexus',
  name: 'AgriNexus 2.0',
  line: 'A tabletop nitrogen manager. An ESP32 predicts soil moisture ten minutes ahead and waters before the soil dries out.',
  result: '28% less water',
  role: 'Team project, TSA Engineering Design',
  when: '2025',
  stack: ['C++', 'Python', 'ESP32-S3', 'FreeRTOS', 'scikit-learn'],
  writeup: {
    problem: [
      'Farmers lose a lot of the nitrogen they apply. Global use efficiency is only about 55%, so roughly 45% leaches into waterways or escapes as gas. The existing fixes were industrial-scale or too manual for small growers.',
    ],
    firstTry: [
      { what: 'A small-scale Haber-Bosch reactor', why: 'Too much energy and infrastructure for a local farm. It got as far as CAD.' },
      { what: 'A fixed moisture threshold', why: 'Too rigid in a cool room. The forecast replaced it.' },
    ],
    broke: [
      {
        what: 'Over-watering in a cool room. In a four-hour soak test at 18 °C, the fixed moisture threshold kept pumping after the soil was already wet.',
        fix: 'We logged moisture, temperature, time of day, and dosing history, trained a model to predict the next ten minutes, and now water only on a forecast drop. Redundant watering fell 40% in repeated cool-room tests.',
      },
      {
        what: 'The model would not run on the board. Python exported a .pkl file the ESP32 could not read, and the inputs had to be normalized exactly the same way on the device.',
        fix: 'We pulled the weights out by hand into a C++ header stored in flash and matched the normalization on both sides.',
      },
      {
        what: 'The touchscreen froze whenever the pumps and the sensor readouts overlapped.',
        fix: 'The display moved to its own FreeRTOS task. No freezes since.',
      },
      {
        what: 'The 3D-printed PETG wedge warped after a day of mild heat and tilted the tray off its axis.',
        fix: 'Two hardwood shims cut on a miter saw. Large structural parts moved to pine and plywood, and the printer only makes the small parts that need it.',
      },
      {
        what: 'A 12-hour soak test found slow drips at every push-fit barb. By morning the reservoir was empty.',
        fix: 'Silicone grommets over each barb, locked with miniature zip ties. The repeat test left the bench dry.',
      },
    ],
    shipped: [
      'AgriNexus 2.0 is a sensor-guided growing tray. An ESP32-S3 reads a capacitive moisture probe and a BME280 climate sensor, drives MOSFET-switched micro-pumps for low- and high-nitrogen solution, and runs on three AA batteries.',
      'The key software change replaced a fixed moisture threshold with a small linear model that predicts the next ten minutes, so the tray waters before the soil dries out instead of after.',
    ],
    steps: [
      { name: 'Sensors', detail: 'Soil moisture every 15 seconds. Temperature, humidity, and pressure from the BME280 at 2 Hz. Logged to a ring buffer in PSRAM.' },
      { name: 'Four features', detail: 'Soil moisture, air temperature scaled by 50 °C, time of day as a sine and cosine, and whether a pump ran in the last ten minutes.' },
      { name: 'Linear model', detail: 'Predicts the change in soil moisture over the next ten minutes. Trained on about 40,000 logged rows. One prediction takes about 820 µs on the 240 MHz core.' },
      { name: 'Rule engine', detail: 'A forecast drop of 5 points or more runs the low-nitrogen pump for 3 seconds. Low nitrogen runs the high-nitrogen pump. A 2-minute lockout stops oscillation.' },
      { name: 'Two FreeRTOS tasks', detail: 'Control runs at 1 Hz. The TFT dashboard redraws at 2 Hz on its own task, so drawing never delays a pump.' },
      { name: 'Watchdog', detail: 'Resets the board if neither task checks in within 5 seconds, so a stuck I2C call cannot freeze watering.' },
    ],
    stats: [
      { value: '28%', label: 'less water than the control tray, over three weeks' },
      { value: '18%', label: 'less fertilizer' },
      { value: '~2 cm', label: 'taller plants on average' },
      { value: '820 µs', label: 'per prediction' },
      { value: '51 min', label: 'of full operation on three AA batteries' },
    ],
    credit: 'Built with my TSA Engineering Design team. It placed in the top five in Georgia and went to the national conference in Nashville.',
  },
};

export default project;

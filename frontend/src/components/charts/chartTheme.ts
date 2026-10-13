/**
 * Chart tokens and shared axis configuration.
 *
 * Charts are drawn as part of the report, so they use the same restrained
 * palette as the typography: navy for the measured quantity, crimson only for
 * the flagged or decisive series, hairlines for structure. No chart carries a
 * border radius, a drop shadow, or a saturated palette of its own.
 */

export const CHART = {
  navy: "#101D2C",
  navySoft: "#3A4C63",
  crimson: "#C83B43",
  line: "#D6D3CB",
  lineStrong: "#B9B5AA",
  muted: "#63665F",
  paper: "#F5F2EB",
  paperDeep: "#EDE9DF",
  white: "#FFFFFF",
} as const;

/** The mono stack, resolved for SVG text. */
export const CHART_FONT = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

const tickStyle = {
  fontFamily: CHART_FONT,
  fontSize: 10,
  letterSpacing: "0.04em",
  fill: CHART.muted,
};

/** Faint horizontal rules only — vertical gridlines are noise on a time axis. */
export const gridProps = {
  vertical: false,
  stroke: CHART.line,
  strokeDasharray: "3 4",
  strokeWidth: 1,
};

export const xAxisProps = {
  axisLine: { stroke: CHART.lineStrong, strokeWidth: 1 },
  tickLine: false,
  tick: tickStyle,
  tickMargin: 10,
  minTickGap: 18,
};

export const yAxisProps = {
  axisLine: false,
  tickLine: false,
  tick: tickStyle,
  tickMargin: 8,
  width: 62,
};

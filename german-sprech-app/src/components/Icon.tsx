import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

interface IconDef {
  paths?: string[];
  circles?: [number, number, number][];
  rects?: [number, number, number, number, number][];
  polygon?: string;
}

const ICONS = {
  practice: { paths: ['M12 20h9', 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'] },
  book: { paths: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'] },
  chat: { paths: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'] },
  settings: { paths: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'] },
  sun: {
    circles: [[12, 12, 5]],
    paths: ['M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'M18.36 18.36l1.42 1.42', 'M1 12h2', 'M21 12h2', 'M4.22 19.78l1.42-1.42', 'M18.36 5.64l1.42-1.42'],
  },
  moon: { paths: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'] },
  monitor: { rects: [[2, 3, 20, 14, 2]], paths: ['M8 21h8', 'M12 17v4'] },
  volume: { paths: ['M11 5 6 9H2v6h4l5 4V5z', 'M15.54 8.46a5 5 0 0 1 0 7.07'] },
  star: { polygon: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' },
  trash: { paths: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'] },
  plus: { paths: ['M12 5v14', 'M5 12h14'] },
  close: { paths: ['M18 6 6 18', 'M6 6l12 12'] },
  check: { paths: ['M20 6 9 17l-5-5'] },
  chevronRight: { paths: ['M9 18l6-6-6-6'] },
  chevronLeft: { paths: ['M15 18l-6-6 6-6'] },
  chevronDown: { paths: ['M6 9l6 6 6-6'] },
  chevronUp: { paths: ['M18 15l-6-6-6 6'] },
  search: { circles: [[11, 11, 8]], paths: ['M21 21l-4.35-4.35'] },
  info: { circles: [[12, 12, 10]], paths: ['M12 16v-4', 'M12 8h.01'] },
  alert: { circles: [[12, 12, 10]], paths: ['M12 8v4', 'M12 16h.01'] },
  checkCircle: { paths: ['M22 11.08V12a10 10 0 1 1-5.93-9.14', 'M22 4 12 14.01l-3-3'] },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
}

export const Icon: React.FC<Props> = ({ name, size = 22, color, filled = false, strokeWidth = 2 }) => {
  const def: IconDef = ICONS[name];
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: filled ? color : 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {def.rects?.map(([x, y, w, h, r], i) => <Rect key={`r${i}`} x={x} y={y} width={w} height={h} rx={r} {...common} />)}
      {def.circles?.map(([cx, cy, r], i) => <Circle key={`c${i}`} cx={cx} cy={cy} r={r} {...common} />)}
      {def.polygon ? <Polygon points={def.polygon} {...common} /> : null}
      {def.paths?.map((d, i) => <Path key={`p${i}`} d={d} {...common} />)}
    </Svg>
  );
};

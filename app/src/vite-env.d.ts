/// <reference types="vite/client" />

// @svgr/rollup (vite.config.ts): every .svg also exports its React component.
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
}

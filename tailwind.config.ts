import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'cozy-green-dark': '#385338',
        'cozy-green-light': '#516f4f',
        'cozy-bg': '#ebd9c6',
        'cozy-card': '#f7eee3',
        'cozy-card-border': '#d8c2aa',
        'cozy-brown': '#7a5230',
        'cozy-brown-light': '#a17855',
      },
    },
  },
  plugins: [],
};

export default config;
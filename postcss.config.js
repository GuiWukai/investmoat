module.exports = {
  plugins: {
    // Tailwind v4 ships its PostCSS integration as a separate package, and no
    // longer needs autoprefixer — vendor prefixing is built in.
    '@tailwindcss/postcss': {},
  },
}

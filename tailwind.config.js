/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{tsx,ts}"],
    theme: {
        extend: {},
        fontFamily: {
            sans: ['Fira Sans', 'sans-serif'],
            mono: ['Fira Code', 'monospace']
        },
    },

    plugins: [require("daisyui")],
    daisyui: {
        themes: "synthwave"
    }
}


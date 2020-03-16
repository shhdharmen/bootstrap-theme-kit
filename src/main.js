const LOCAL_STORAGE_KEY = "bootstrap-theme-kit";
const meta = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
// file path is same as what we've set in src\assets\rev-manifest.json
const DARK_THEME_PATH = "css/style-dark-00bee02303.css";

let isDark = meta && meta.isDark;
let darkStyleLink = document.getElementById("dark-theme-style");
let themeToggle = document.getElementById("theme-toggle");

// eslint-disable-next-line no-unused-vars
function toggleDark() {
  isDark = !isDark;
  if (isDark) {
    showDarkTheme();
  } else {
    hideDarkTheme();
  }
  let meta = { isDark };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meta));
}

function showDarkTheme() {
  darkStyleLink.setAttribute("href", DARK_THEME_PATH);
  themeToggle.innerHTML = "🌙 Dark";
}
function hideDarkTheme() {
  darkStyleLink.setAttribute("href", "");
  themeToggle.innerHTML = "🌞 Light";
}

// check on doc load
if (isDark) {
  showDarkTheme();
} else {
  hideDarkTheme();
}

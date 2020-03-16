const LOCAL_STORAGE_KEY = "bootstrap-theme-kit";
const meta = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

let DARK_THEME_PATH;
let isDark = meta && meta.isDark;
let darkStyleLink = document.getElementById("dark-theme-style");
let themeToggle = document.getElementById("theme-toggle");
let jsonFetched = false;

fetch("./assets/rev-manifest.json")
  .then(response => {
    return response.json();
  })
  .then(data => {
    jsonFetched = true;
    // file path is same as what we've set in src\assets\rev-manifest.json
    DARK_THEME_PATH = data["css/style-dark.css"];
    // check on doc load
    if (isDark) {
      showDarkTheme();
    } else {
      hideDarkTheme();
    }
  });
// eslint-disable-next-line no-unused-vars
function toggleDark() {
  if (jsonFetched) {
    isDark = !isDark;
    if (isDark) {
      showDarkTheme();
    } else {
      hideDarkTheme();
    }
    let meta = { isDark };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meta));
  }
}

function showDarkTheme() {
  darkStyleLink.setAttribute("href", DARK_THEME_PATH);
  themeToggle.innerHTML = "🌙 Dark";
}
function hideDarkTheme() {
  darkStyleLink.setAttribute("href", "");
  themeToggle.innerHTML = "🌞 Light";
}

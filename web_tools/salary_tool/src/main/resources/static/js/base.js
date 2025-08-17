// Base constants for the Salary Tool frontend
// These pages are served under the Spring Boot context-path
(function () {
  const BASE = '/web_tools/salary_tool';
  const API = BASE + '/api';

  if (!window.App) window.App = {};
  window.App.BASE = BASE;
  window.App.API = API;
})();





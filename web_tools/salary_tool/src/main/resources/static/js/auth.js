(function () {
  function saveJwt(token) {
    localStorage.setItem('jwt', token || '');
  }
  function getJwt() {
    return localStorage.getItem('jwt') || '';
  }
  function clearJwt() {
    localStorage.removeItem('jwt');
  }

  async function requireAuth() {
    const jwt = getJwt();
    if (!jwt) {
      location.href = App.BASE + '/auth/login.html';
    }
  }

  window.Auth = { saveJwt, getJwt, clearJwt, requireAuth };
})();





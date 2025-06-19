module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/users/me/theme',
      handler: 'user.getTheme',
      config: {
        policies: [],
        auth: true,
      },
    },
    {
      method: 'PUT',
      path: '/users/me/theme',
      handler: 'user.setTheme',
      config: {
        policies: [],
        auth: true,
      },
    },
  ],
};

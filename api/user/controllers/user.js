'use strict';

module.exports = {
  async getTheme(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }
    return { theme: user.theme };
  },

  async setTheme(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized();
    }
    const { theme } = ctx.request.body;
    await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: { theme },
    });
    return { theme };
  },
};

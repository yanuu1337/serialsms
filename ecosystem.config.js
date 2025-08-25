module.exports = {
  apps: [
    {
      namespace: 'serialsms',
      name: 'modem-worker',
      script: 'pnpm start',
      cwd: './apps/modem-worker',
      watch: ".",
    }, {
      namespace: 'serialsms',
      name: 'web-panel',
      script: 'pnpm start',
      cwd: './apps/panel',
      watch: ".",


    }
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

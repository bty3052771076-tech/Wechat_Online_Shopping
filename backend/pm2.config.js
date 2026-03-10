module.exports = {
  apps: [
    {
      name: 'wechat-shop',
      script: './src/app.js',
      instances: 'max', // Or specify a number like 2 or 4
      exec_mode: 'cluster',

      // Auto restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      // Environment configuration
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },

      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },

      // Logging configuration
      error_file: './logs/error.log',
      out_file: './logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Advanced options
      listen_timeout: 10000,
      kill_timeout: 1600,
      wait_ready: true,
      shutdown_with_message: true,

      // Instance variables
      instance_var: 'INSTANCE_ID',

      // Source map support for better error tracking
      source_map_support: true,

      // Disable instrumentation for better performance
      disable_trace: true,

      // Log rotation (requires pm2-logrotate module)
      // Install with: pm2 install pm2-logrotate
      log_file_pattern: './logs/<app_name>-<date>.log',
      log_rotate: true,
      rotate_interval: '0 0 * * *' // Daily rotation at midnight
    }
  ],

  deployments: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/home/deploy/backend',
      'post-deploy': 'npm ci --only=production && pm2 reload pm2.config.js --env production',
      'pre-setup': 'apt-get install git && cd /home/deploy && mkdir -p backend'
    }
  }
};

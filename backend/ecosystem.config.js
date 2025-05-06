module.exports = {
  apps: [
    {
      name: "sathyabhama-silks",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        PWD: process.cwd(),
      },
    },
  ],
};

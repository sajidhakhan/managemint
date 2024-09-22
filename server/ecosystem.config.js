module.exports = {
    apps: [
      {
        name: "managemint",
        script: "npm",
        args: "run dev",
        env: {
          NODE_ENV: "development",
        },
      },
    ],
  };
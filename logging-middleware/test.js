const Log = require("./src/logger");

async function run() {
  await Log(
    "backend",
    "info",
    "handler",
    "logger working successfully"
  );

  console.log("Log API called successfully");
}

run();
const commandName = process.argv[2] ?? "status";

const messages: Record<string, string> = {
  prepare: "Script-only lab is ready. No dependency or infrastructure preparation is required.",
  up: "No external infrastructure to start. Run experiments directly with npm run lab:run.",
  status: "Script-only lab status: ready. State is generated per experiment run.",
  down: "No external infrastructure to stop.",
  destroy: "No external infrastructure or persistent state to destroy.",
};

console.log(messages[commandName] ?? `No script-only lifecycle action is defined for ${commandName}.`);

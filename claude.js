// claude.js - Placez ce fichier à la racine de votre projet
const https = require("https");

const CLAUDE_API_KEY =
  process.env.ANTHROPIC_API_KEY ||
  "XXEiSnYHt6jDVpGxTBMi16n6gxmfHxvEG8729TkkHt9wFIzP#cS9BMdOPEh99JQ3odc9jTcmpkkmNCx795_wBIyLNgWw";

function askClaude(question) {
  const data = JSON.stringify({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(body);
          resolve(response.content[0].text);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Utilisation depuis la ligne de commande
const question = process.argv.slice(2).join(" ");

if (!question) {
  console.log('Usage: node claude.js "votre question"');
  process.exit(1);
}

console.log("Question:", question);
console.log("Réponse en cours...\n");

askClaude(question)
  .then((response) => {
    console.log("Claude:", response);
  })
  .catch((error) => {
    console.error("Erreur:", error.message);
  });

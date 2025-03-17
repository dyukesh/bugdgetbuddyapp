require("dotenv").config({ path: ".env.local" });
const https = require("https");

async function testTranslation() {
  // Using the API key directly for testing
  const apiKey = "AIzaSyDLici7UdQ2Wbol2flzXmWruqluQ0H9Zmk";
  const text = encodeURIComponent("Hello, world!");
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${text}&target=es&source=en`;

  return new Promise((resolve, reject) => {
    console.log("\nMaking request to Google Translate API...");
    console.log("API Key being used:", apiKey);

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("Response Status:", res.statusCode);
          try {
            const response = JSON.parse(data);
            console.log("Response:", JSON.stringify(response, null, 2));
            resolve(response);
          } catch (error) {
            console.error("Error parsing response:", data);
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        console.error("Request failed:", error);
        reject(error);
      });
  });
}

testTranslation().catch(console.error);

/*
 *
 * Minimalist URL Shortener
 * Author: Necmettin Efe Kızılkaya
 * 
*/

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

let urlDatabase = {};


/**
 * Serves the main homepage with the HTML form.
 */

app.get('/', (req, res) => {
    res.send(`
    <html>
        <head>
            <title>URL Shorter</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 3em; line-height: 1.6; }
                h1 { color: #333; }
                form { margin-top: 1.5em; }
                label { font-weight: bold; display: block; margin-bottom: 0.5em; }
                input[type="url"] { width: 400px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                input[type="submit"] { padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                input[type="submit"]:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <h1>Minimal URL Shortener</h1>
            <p>Welcome! Paste your long, complicated URL below to create a short, easy-to-share link.</p>
            
            <form action="/short" method="POST">
                <label for="longUrlInput">Your long URL:</label>
                <input type="url" id="longUrlInput" name="longUrl" placeholder="https://example.com/very/long/path/to/something" required>
                <input type="submit" value="Shorten">
            </form>
        </body>
    </html>
    `);
});

/**
 * Creates a new short URL.
 * It receives a longUrl from the form, generates a unique shortCode,
 * stores it, and returns a success page with the new link.
 */

app.post('/short', (req, res) => {
    const longUrl = req.body.longUrl;
    let shortCode;

    // Collision Check: Ensure the generated code is unique
    while (true) {
        shortCode = generateShortCode();
        if (urlDatabase[shortCode] === undefined) {

            urlDatabase[shortCode] = longUrl;
            break;
        }
    }

    // Send a success page with the new clickable link
    res.send(`
    <html>
        <head>
            <title>Your Link is Ready!</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 3em; line-height: 1.6; }
                h1 { color: #2a8a48; } /* Green color for success */
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
                code { 
                    background: #f4f4f4; 
                    padding: 4px 8px; 
                    border: 1px solid #ddd;
                    border-radius: 4px; 
                    font-size: 1.1em;
                }
            </style>
        </head>
        <body>
            <h1>Great! Your short link is ready.</h1>
            <p>You can now copy the link below or click it to test your redirect.</p>
            
            <p>
                <code>
                    <a href="/${shortCode}" target="_blank">
                        localhost:${PORT}/${shortCode}
                    </a>
                </code>
            </p>

            <br><br>
            <a href="/">Shorten another link</a>
        </body>
    </html>
    `);
});

/**
 * Redirects a shortCode to its original long URL.
 * If the code is not found, it returns a 404 error.
 */

app.get("/:shortCode", (req, res) => {
    const shortCode = req.params.shortCode;
    const longUrl = urlDatabase[shortCode];

    if (longUrl) {
        // Code found, redirect the user
        res.redirect(longUrl);
    } else {
        // Code not found, send a 404 error
        res.status(404).send("This link was not found.");
    }
});


/**
 * Generates a random 6-character alphanumeric string.
 */
function generateShortCode() {
    const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const CODE_LENGTH = 6;
    let codeArray = [];

    for (let i = 0; i < CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
        codeArray.push(CHARACTERS[randomIndex]);
    }

    return codeArray.join('');
}

// --- Server Start ---

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
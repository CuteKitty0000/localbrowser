const express = require('express');
const Unblocker = require('unblocker');

const app = express();
const port = 8080;

// Initialize Unblocker which rewrites URLs so they remain on localhost:8080
const unblocker = new Unblocker({ prefix: '/proxy/' });

app.use(unblocker);

// Simple HTML page simulating a browser
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Local DuckDuckGo Browser</title>
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; display: flex; flex-direction: column; height: 100vh; background-color: #f0f0f0; }
                #header { background: #222; padding: 10px; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                #header form { display: flex; flex-grow: 1; max-width: 800px; margin: 0 auto; gap: 8px; }
                #header input[type="text"] { flex-grow: 1; padding: 8px 12px; font-size: 16px; border: none; border-radius: 4px; outline: none; }
                #header button { padding: 8px 16px; font-size: 16px; cursor: pointer; border: none; border-radius: 4px; background-color: #007bff; color: white; transition: background-color 0.2s; }
                #header button:hover { background-color: #0056b3; }
                #header .home-btn { background-color: #444; margin-right: 10px; }
                #header .home-btn:hover { background-color: #555; }
                #iframe-container { flex-grow: 1; width: 100%; position: relative; }
                iframe { width: 100%; height: 100%; border: none; position: absolute; top: 0; left: 0; background: white; }
            </style>
        </head>
        <body>
            <div id="header">
                <button class="home-btn" onclick="goHome()">Home</button>
                <form id="browser-form">
                    <input type="text" id="url" placeholder="Search DuckDuckGo or enter a URL" autocomplete="off" autofocus>
                    <button type="submit">Go</button>
                </form>
            </div>
            <div id="iframe-container">
                <iframe id="browser-frame" src="/proxy/https://html.duckduckgo.com/html/"></iframe>
            </div>

            <script>
                function goHome() {
                    document.getElementById('url').value = '';
                    document.getElementById('browser-frame').src = '/proxy/https://html.duckduckgo.com/html/';
                }

                document.getElementById('browser-form').onsubmit = function(e) {
                    e.preventDefault();
                    let val = document.getElementById('url').value.trim();
                    if (!val) return;
                    
                    let targetUrl;
                    if (val.match(/^[a-zA-Z]+:\\/\\//)) {
                        targetUrl = val;
                    } else if (val.includes('.') && !val.includes(' ')) {
                        targetUrl = 'https://' + val;
                    } else {
                        targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(val);
                    }
                    
                    document.getElementById('browser-frame').src = '/proxy/' + targetUrl;
                };

                // Try to update address bar if possible (due to cross-origin it might fail, but unblocker proxying makes it same-origin!)
                document.getElementById('browser-frame').addEventListener('load', function() {
                    try {
                        let currentSrc = this.contentWindow.location.pathname + this.contentWindow.location.search;
                        if (currentSrc.startsWith('/proxy/')) {
                            let originalUrl = currentSrc.substring(7); // remove /proxy/
                            if (originalUrl !== 'https://html.duckduckgo.com/html/') {
                                document.getElementById('url').value = decodeURIComponent(originalUrl);
                            }
                        }
                    } catch (e) {
                        // ignore cross-origin errors if any
                    }
                });
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log('Local browser running on http://localhost:' + port + '/');
});

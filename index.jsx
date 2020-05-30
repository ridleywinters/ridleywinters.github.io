import React from "https://cdn.pika.dev/@pika/react@v16.13.1";
import ReactDOMServer from "https://dev.jspm.io/react-dom@16.13.1/server.js";
import { writeFileStrSync } from "https://deno.land/std/fs/mod.ts";
import * as base from './src/base/mod.js';
import { StyleSheet } from './src/base/ui/mod.jsx'

function GlobalStyles() {
    return (
        <style type="text/css" dangerouslySetInnerHTML={{
            __html: `
body, input, button {
    font-family : Catamaran;
}

a {
    color : rgb(31, 136, 180);
}
a:visited {
    color : rgb(31, 136, 180);
}

body {
    font-family: Catamaran;
}

.t-sans {
    font-family: Catamaran;
}
.t-serif {
    font-family: Faustina;
}
.t-mono {
    font-family: 'Courier Prime';
}
        `}} />

    )
}


const s = ReactDOMServer.renderToString(
    <html>
        <head>
            <meta charset="utf-8" />
            <title>My Homepage</title>
            <link rel="icon" href="favicon.ico" type="image/x-icon" />
            <StyleSheet href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" />
            <StyleSheet href="https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900&display=swap&subset=latin-ext" />
            <StyleSheet href="https://fonts.googleapis.com/css?family=Faustina&display=swap" />
            <StyleSheet href="https://fonts.googleapis.com/css?family=Courier+Prime&display=swap" />
            <GlobalStyles />
        </head>
        <body>
            <div id="root" />
            <script src="dist/client.js"></script>
        </body>
    </html>
);

writeFileStrSync("index.html", `<!DOCTYPE html>\n${s}`);


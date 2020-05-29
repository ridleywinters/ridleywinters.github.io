import React from "https://cdn.pika.dev/@pika/react@v16.13.1";

export function StyleSheet({ href }) {
    return (
        <link type="text/css" rel="stylesheet" href={href} />
    );
}
import React from 'react';
import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react';

export default function Markdown({
    text
}) {
    text = text.replace(/^(\s*\n)+/, '').replace(/\s+$/, '');
    return (
        <div>
            {
                unified()
                    .use(parse)
                    .use(remark2react)
                    .processSync(text).result
            }
        </div>
    );
}
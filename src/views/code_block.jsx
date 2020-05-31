import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import theme from 'react-syntax-highlighter/dist/esm/styles/prism/vs';

export default function CodeBlock({
    language,
    children
}) {
    if (typeof children === 'string') {
        children = children.replace(/^(\s*\n)+/, '').replace(/\s+$/, '');
    }

    return (
        <SyntaxHighlighter language={language} style={theme}>
            {children}
        </SyntaxHighlighter>
    );
}
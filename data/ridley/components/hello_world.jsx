import React from 'react';

export default function HelloWorld({ name = 'World'}) {
    return (
        <strong>Hello, {name}</strong>
    );
}

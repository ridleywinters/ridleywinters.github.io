import React from 'react';

export default function({ 
    name = "World"
}) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
        </div> 
    )
}
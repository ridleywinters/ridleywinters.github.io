import React from 'react';

export default function({ 
    style, 
    content,
    renderComponents,
}) {
    return (
        <div style={style}>
            {renderComponents(null, content)}
        </div> 
    )
}
import React from 'react';

export default function({ 
    style, 
    content,
    Sea,
}) {
    return (
        <div style={style}>
            <Sea tree={content}/>
        </div> 
    )
}
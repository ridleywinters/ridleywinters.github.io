import React from 'react';

export default function MDXUserStory({ 
    story, 
    acceptance_criteria 
}) {
    return (
        <div
            style={{
                width: '32rem',
                padding: '0.5rem',
                border: 'solid 1px #CCC',
            }}
        >
            <div
                style={{
                    marginBottom: '12px',
                    borderBottom: 'dotted 1px #DDD',
                }}
            >
                <strong>User story</strong>
            </div>
            <div>{story}</div>
            <ul>{acceptance_criteria.map((ac, i) => (
                <li key={i}>{ac}</li>
            ))}</ul>
        </div>
    )
}

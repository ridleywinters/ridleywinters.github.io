import React from 'react';


export default function ({ 
    database, 
    title, 
    content,
}) {

    const [expanded, setExpanded] = React.useState(false);
    const handleClick = (evt) => {
        evt.preventDefault();
        setExpanded(!expanded);
    };

    return (
        <div>
            <h4
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: '1rem 0 .25rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={handleClick}
            >
                <div style={{ 
                    display : 'inline-block',
                    width : '1.2rem',
                    paddingRight: '8px' 
                    }}>{expanded ? '	▼' : '▸'}</div>
                <Sea tree={title} />
            </h4>
            <div style={{
                display: expanded ? 'block' : 'none',
                padding: '12px 0px 12px 8px',
                marginLeft: '0px',
                borderTop: '1px dotted #CCC',
                borderLeft: '5px solid #CCC',
                borderBottom: '1px dotted #CCC',
                
            }}>
                <Sea tree={content} />
            </div>
        </div>
    )
}
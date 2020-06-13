import _ from 'lodash';

function addStylesheets(stylesheets) {
    _.each(stylesheets, (href) => {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    });
}

function addStyleNode(style) {
    const lines = [];
    for (let selector in style) {
        const props = style[selector];
        lines.push(`${selector} {`);
        for (let javascriptName in props) {
            const cssName = javascriptName.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
            lines.push(`    ${cssName}: ${props[javascriptName]};`);
        }
        lines.push(`}`);
    }

    const el = document.createElement('style');
    el.type = 'text/css';
    el.appendChild(document.createTextNode(lines.join('\n')));
    document.head.appendChild(el);
}

let runCount = 0;

export default function SiteLayout({ children }) {

    if (runCount === 0) {
        runCount++;

        addStylesheets([
            "https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900&display=swap&subset=latin-ext",
            "https://fonts.googleapis.com/css?family=Faustina&display=swap",
            "https://fonts.googleapis.com/css?family=Courier+Prime&display=swap",
        ]);

        addStyleNode({
            "body, input, button": {
                fontFamily: 'Catamaran',
            },
            "a, a:visited, a code": {
                color: 'rgb(31, 136, 180)',
            },
            "code" : {
                color : '#052',
                fontSize: '0.85rem',
            },
            "body": {
                fontFamily: 'Catamaran',
            },
            ".t-sans": {
                fontFamily: 'Catamaran',
            },
            ".t-serif": {
                fontFamily: 'Faustina'
            },
            ".t-mono": {
                fontFamily: 'Courier Prime',
            }
        })
    }

    return children;
}


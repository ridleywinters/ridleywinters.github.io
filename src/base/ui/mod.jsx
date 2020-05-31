
/**
 * Sets up global properites in the HTML file. Avoids hard-coding specifics into the
 * HTML template itself, which makes it easier to use variables.
 * 
 * The trade-offs to this function:
 * - It puts an arguably unnecessary level of abstraction in front of standard APIs
 * - It adds additional processing on page load for common elements browsers are
 *   optimized to look for.
 */
export function setHTMLProperties({
    title,
    stylesheets,
    style,
}) {

    if (title) {
        document.title = title;
    }

    if (stylesheets) {
        stylesheets.forEach((href) => {
            const link = document.createElement('link');
            link.type = 'text/css';
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        });
    }

    if (style) {
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
}
import React from "react";
import ReactDOM from "react-dom";
import * as base from './base/ui/mod.jsx';
import Application from './views/application.jsx';



base.setHTMLProperties({
    title: "Ridley Winter's Homepage",
    stylesheets: [
        "https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900&display=swap&subset=latin-ext",
        "https://fonts.googleapis.com/css?family=Faustina&display=swap",
        "https://fonts.googleapis.com/css?family=Courier+Prime&display=swap",
    ],
    style: {
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
    }
});

ReactDOM.render(<Application />, document.getElementById("root"));

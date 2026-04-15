import{a as r,j as e,K as u}from"./vendor_react-BVfe_iIP-1776253370887.js";function x({src:a,alt:o,className:i="",wrapperClassName:l="",...n}){const[s,c]=r.useState(!1),[t,d]=r.useState(!1);return e.jsxs("div",{className:`relative overflow-hidden bg-gray-100 ${l}`,children:[(!s||t)&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse",children:e.jsx(u,{className:"text-gray-300 w-1/3 h-1/3"})}),!t&&a&&e.jsx("img",{src:a,alt:o,loading:"lazy",onLoad:()=>c(!0),onError:()=>d(!0),className:`
            w-full h-full object-cover transition-opacity duration-500
            ${s?"opacity-100":"opacity-0"}
            ${i}
          `,...n})]})}export{x as L};

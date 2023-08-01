// content.js
const elementImage = document.querySelectorAll('h1');
console.log("chek element todo-ext", elementImage);

console.log("=========== from todo-ext extension")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    if (message.from === "popup" && message.subject === "getSelection") {
      const selection = window.getSelection().toString();
      sendResponse(selection);
    }
  })
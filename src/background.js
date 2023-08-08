//listens for the event and fires a event to execute content.js
import uniqid from "uniqid";
console.log("====BACKGROUND======= Hello from todo-ext extension");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "myContextTodo",
    title: "Add to my Todo",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let todoList;
  if (info.menuItemId === "myContextTodo") {
    chrome.storage.sync.get(["todo-data"]).then((result) => {
      todoList = result["todo-data"].columns;
      if (todoList.length != 0) {
        todoList.map((arg) => {
          if (arg.name == "Today") {
            arg.List.push({
              id: uniqid(),
              decsription: info.selectionText,
              state: false,
            });
          }
        });
        setTodo(todoList);
        console.log("*************after new dAta", todoList);
      }
    });

    // chrome.tabs.create({
    //   url: `https://www.google.com/search?q=${info.selectionText}`,
    // });
  }
});

function getTodo() {
  return chrome.storage.sync.get(["todo-data"]).then((result) => {
    return result["todo-data"].columns;
  });
}

function setTodo(arg) {
  chrome.storage.sync.set({ "todo-data": { columns: arg } }).then(() => {
    console.log("new v alue from BACKGROUND is set", arg);
  });
}

// chrome.action.onClicked.addListener(printText);
// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"],
//   });
// });
// function printText() {
//   console.log("clicked");
// }

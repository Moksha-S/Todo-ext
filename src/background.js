console.log("hello world background todo something in extension background~");
//listens for the event and fires a event to execute content.js
import uniqid from "uniqid";

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
    console.log("+++++++++++++", info.selectionText);
    chrome.storage.sync.get(["todo-data"]).then((result) => {
      todoList = result["todo-data"].columns;
      console.log("check column",result["todo-data"])
      // console.log(
      //   "+++++++++++++ GETTING VALUE IN BACKGROUND JS",
      //   result["todo-data"].columns,
      //   typeof result["todo-data"].columns
      // );
      console.log(todoList.length, "hghbkg check lengthS");
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
        setTodo(todoList)
        console.log("*************after new dAta", todoList);
      }
    });

    // chrome.tabs.create({
    //   url: `https://www.google.com/search?q=${info.selectionText}`,
    // });
  }
})

function setTodo(arg){
  chrome.storage.sync.set({ "todo-data": {"columns":arg} }).then(() => {
    console.log("new v alue from BACKGROUND is set", arg);
  })
}

console.log("welcom to extension script from  basic EXTENSION");
chrome.action.onClicked.addListener(printText);

function printText() {
  console.log("clicked");
}

// console.log(
//   "+++++++++++++ GEtting data form local storage in Background",
//   chrome.storage.local.get(["todo-data"])
// );
// chrome.storage.sync.set({ "new-data": info.selectionText }).then(() => {
//   console.log("+++++++++++++ new value is==== is set", info.selectionText);
// });

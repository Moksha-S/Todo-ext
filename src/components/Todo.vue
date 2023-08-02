<script setup>
import { reactive, ref, watch, toRaw, onMounted } from "vue";
import draggable from "vuedraggable";
import uniqid from "uniqid";

const day = ref("");
const dragging = ref(false);
const defaultData = {
  columns: [
    {
      name: "Today",
      List: [
        {
          id: "1",
          decsription: "vue composition API",
          state: false,
          editing: false,
        },
        {
          id: "2",
          decsription: "Vue router documentation",
          state: false,
          editing: false,
        },
      ],
    },
    {
      name: "Tommorrow",
      List: [
        { id: "1", decsription: "Pinia documantation", state: false },
        { id: "2", decsription: "storage mangment in vue", state: false },
      ],
    },
    {
      name: "Later",
      List: [
        { id: "1", decsription: "Nuxt js", state: false },
        { id: "2", decsription: "work managment", state: false },
      ],
    },
  ],
};
const getDayOfWeek = () => {
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekDays[new Date().getDay()];
};
const data = reactive(defaultData);

if (chrome.storage) {
  chrome.storage.sync.get(["todo-data"]).then((result) => {
    const storedData = result["todo-data"];
    if (storedData) {
      data.columns = storedData.columns;
    }
    console.log("Value currentl y is ", result["todo-data"]);
  });
} else {
  console.log("hello");
  const localStorageString = localStorage.getItem("todo-data");
  if (localStorageString) {
    data.columns = JSON.parse(localStorageString).columns;
  }
}

watch(data, (newData) => {
  if (chrome.storage) {
    console.log("check store", chrome.storage);
    chrome.storage.sync.set({ "todo-data": toRaw(data) }).then(() => {
      console.log("Value is set", data);
    });
  } else {
    localStorage.setItem("todo-data", JSON.stringify(newData));
  }
});

onMounted(() => {
  day.value = getDayOfWeek();
});

function addItem(event, column) {
  const form = event.target;
  const formData = new FormData(form);
  const description = formData.get("description");

  data.columns.map((arg) => {
    if (arg.name == column.name) {
      arg.List.push({
        // id: Math.random().toString(36),
        id: uniqid(),
        decsription: description,
        state: false,
      });
    }
  });
  console.log(data.columns);

  form.reset();
  // column.List.push({
  //   id: "5522",
  //   description:description,
  //   state: "new",
  // });
}
function removeData() {
  chrome.storage.sync.clear(() => {
    console.log("Everything was removed");
  });
}
function deleteTodo(column, listIndex) {
  data.columns.map((arg) => {
    if (arg.name == column.name) {
      arg.List.splice(listIndex, 1);
    }
  });
}
function editTodo(event, column, index) {
  const form = event.target;
  const formData = new FormData(form);
  const description = formData.get("description");
  data.columns.map((arg) => {
    if (arg.name == column.name) {
      arg.List[index].decsription = description;
      arg.List[index].editing = false;
    }
  });
}

function googleSearch(searchText) {
  window.open(`https://www.google.com/search?q=${searchText}`, "_blank");
}
</script>

<template>
  <div>
    <div class="todo-header-container">
      <h1 class="title-todo">Your Todo List</h1>
      <div class="todo-sub-title">Have a great {{ day }}! One step at a time, one task at a time!</div>
      <!-- <button @click="removeData()">Clear</button> -->
    </div>
    <div class="main-todo">
      <div
        v-for="column of data.columns"
        :key="column.name"
        class="todo-container"
      >
        <div class="todo-container-title">{{ column.name }}</div>
        <draggable
          v-model="column.List"
          @start="dragging = true"
          @end="dragging = false"
          group="items"
          ghost-class="ghost"
          item-key="id"
        >
          <template #item="{ element, index }">
            <div>
              <div class="todo-item" v-if="element.editing">
                <form @submit.prevent="editTodo($event, column, index)">
                  <input
                    type="text"
                    class="todo-input"
                    :value="element.decsription"
                    name="description"
                    autocomplete="off"
                  />
                  <button class="button" @click="element.editing = false">
                    cancle
                  </button>

                  <button class="button">Edit</button>
                </form>
              </div>
              <div class="todo-item" v-else>
                <div class="todo-text">
                  <input type="checkbox" v-model="element.state" />
                  <span :class="{ completed: element.state }">
                    {{ element.decsription }}
                  </span>
                </div>
                <div style="display: flex; justify-content: flex-end">
                  <span>
                    <i
                      class="material-icons action-icon"
                      @click="element.editing = true"
                    >
                      edit
                    </i>
                  </span>
                  <span>
                    <i
                      class="material-icons action-icon"
                      @click="deleteTodo(column, index)"
                    >
                      delete
                    </i>
                  </span>
                  <span>
                    <i
                      class="material-icons action-icon"
                      @click="googleSearch(element.decsription)"
                    >
                      search
                    </i>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <div class="add-todo-container">
          <form @submit.prevent="addItem($event, column)">
            <div>
              <input
                type="text"
                class="todo-input"
                placeholder="Add Your Todo"
                name="description"
                autocomplete="off"
              />
            </div>
            <!-- Add item on click -->
            <div class="add-btn-container">
              <button class="button add-btn">Add Todo</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="bottom-tagline">
      <div>Use appropriate task in OnTime!</div>
    </div>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #aa4f04;
}
.add-btn {
  border: 2px solid #195190ff;
  margin: 2% 0;
}
.add-btn-container {
  display: flex;
  justify-content: flex-end;
}
.add-todo-container {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
}
.bottom-tagline {
  display: flex;
  justify-content: center;
  font-size: 20px;
  padding: 2% 0;
}
.completed {
  text-decoration: line-through;
}
.action-icon {
  font-size: 18px;
  border: 1px solid white;
  padding: 1%;
  margin-left: 4px;
  border-radius: 15px;
}
.main-todo {
  display: flex;
  justify-content: space-around;
}
.todo-header-container {
  text-align: center;
}
.title-todo {
  text-decoration: underline;
}
.todo-container {
  width: 30%;
  border: 1px solid lightgray;
  padding: 10px;
  background-color: #a2a2a1ff;
  /* background-color: #efc8b1; */
}
.todo-sub-title{
  font-size: 20px;
    text-transform: capitalize;
    font-style: italic;
    padding: 2% 0;
}
.todo-text {
  font-size: 18px;
  word-wrap: break-word;
}
.todo-container-title {
  display: flex;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
  padding: 2% 0 4% 0;
  /* color: #5b0e2d; */
  color: #195190ff;
}
.todo-input {
  border: 2px solid #195190ff;
}
.todo-item {
  padding: 5px;
  border-bottom: 1px solid lightgray;
  cursor: pointer;
  /* background-color: #5b0e2dad; */
  background-color: #195190e0;
  /* justify-content: space-between; */
  display: flex;
  /* flex-wrap: wrap; */
  flex-direction: column;
  color: white;
  margin-bottom: 4%;
  /* align-items: center; */
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

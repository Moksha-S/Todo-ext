<script setup>
import { reactive, ref, watch, toRaw } from "vue";
import draggable from "vuedraggable";
import uniqid from "uniqid";

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

const data = reactive(defaultData);

if (chrome.storage) {
  chrome.storage.sync.get(["todo-data"]).then((result) => {
    const storedData = result["todo-data"];
    if (storedData) {
      data.columns = storedData.columns;
    }
    console.log("Value currentl y is " , result["todo-data"].columns);
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
    chrome.storage.sync.set({ "todo-data": toRaw(JSON.parse(localStorageString)) }).then(() => {
      console.log("Value is set", data);
    });
  } else {
    localStorage.setItem("todo-data", JSON.stringify(newData));
  }
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
    <div class="title-todo">
      <h1>Your Todo List</h1>
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
                    class="task-input"
                    :value="element.decsription"
                    name="description"
                    autocomplete="off"
                  />
                  <button
                    class="button btn-add"
                    @click="element.editing = false"
                  >
                    cancle
                  </button>

                  <button class="button btn-add">Edit</button>
                </form>
              </div>
              <div class="todo-item" v-else>
                <div>
                  <input type="checkbox" v-model="element.state" />
                  <span :class="{ completed: element.state }">
                    {{ element.decsription }}
                  </span>
                </div>
                <div>
                  <span>
                    <button @click="element.editing = true" style="padding: 0">
                      <i class="material-icons">edit</i>
                    </button>
                  </span>
                  <span>
                    <button
                      @click="deleteTodo(column, index)"
                      style="padding: 0"
                    >
                      <i class="material-icons">delete</i>
                    </button>
                  </span>
                  <span>
                    <button
                      @click="googleSearch(element.decsription)"
                      style="padding: 0"
                    >
                      <i class="material-icons">search</i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <div class="add-todo">
          <form @submit.prevent="addItem($event, column)">
            <input
              type="text"
              class="task-input"
              placeholder="Add task"
              name="description"
              autocomplete="off"
            />
            <!-- Add item on click -->
            <button class="button btn-add">Add</button>
          </form>
        </div>
      </div>
    </div>

    <div class="bottom-tagline">
      <div>Use appropriate task in OnTime! </div>
    </div>
  </div>
</template>

<style scoped>
.title-todo {
  display: flex;
  justify-content: center;
  text-decoration: underline;
}
.ghost {
  opacity: 0.5;
  background: #aa4f04;
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
.add-todo {
  padding: 10px;
}

.main-todo {
  display: flex;
  justify-content: space-around;
}
.todo-container-title {
  display: flex;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  padding: 2% 0 4% 0;
}
.todo-container {
  width: 30%;
  border: 1px solid lightgray;
  padding: 10px;
  background-color: thistle;
}
.todo-item {
  padding: 5px;
  border-bottom: 1px solid lightgray;
  cursor: pointer;
  background-color: #42b883aa;
  justify-content: space-between;
  display: flex;
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

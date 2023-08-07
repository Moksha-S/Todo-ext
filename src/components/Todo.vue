<script setup>
import { reactive, ref, watch, toRaw, onMounted } from "vue";
import draggable from "vuedraggable";
import uniqid from "uniqid";
const addTodo = ref("");
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
  form.reset();
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
  console.log("hekko", event);
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
      <!-- <div> -->
      <div class="title-todo">
        <div>
          <img alt="todo" src="../assets/todo-icon.jpg" class="header-img" />
        </div>
        <div>Your Todo List</div>
      </div>
      <!-- </div> -->
      <div class="todo-sub-title">
        Have a great {{ day }}! One step at a time, one task at a time!
      </div>
      <!-- <button @click="removeData()">Clear</button> -->
    </div>
    <div class="main-todo">
      <div
        v-for="column of data.columns"
        :key="column.name"
        class="todo-container elevation-25"
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
                  <!-- ref="form" -->
                  <!-- @submit.prevent="editTodo($event, column, index)" -->
                  <!-- <v-text-field
``                  v-model="element.decsription"
                    name="description"
                    variant="outlined"
                  ></v-text-field> -->

                  <input
                    type="text"
                    class="edit-input"
                    :value="element.decsription"
                    name="description"
                    autocomplete="off"
                  />

                  <div style="margin: 5px 0; text-align: end">
                    <button
                      @click="element.editing = false"
                      class="edditing-btn"
                    >
                      Cancle
                    </button>
                    <button class="edditing-btn">Edit</button>
                  </div>
                  <!-- <v-btn @click="cancleEdit(column,index)">
                    Cancle
                  </v-btn> -->

                </form>
              </div>
              <div class="todo-item" v-else>
                <div class="todo-text">
                  <v-checkbox class="check-todo" v-model="element.state">
                    <!-- :class="{ completed: element.state }"
                    :label="` ${element.decsription}`" -->
                    <template v-slot:label>
                      <span
                        id="checkboxlabel"
                        :class="{ completed: element.state }"
                      >
                        {{ element.decsription }}
                      </span>
                    </template>
                  </v-checkbox>
                  <!-- <span>
                    {{ element.decsription }}
                  </span> -->
                  <!-- color="white" -->
                </div>
                <div
                  style="
                    display: flex;
                    justify-content: flex-end;
                    color: #018288 !important;
                  "
                >
                  <span>
                    <v-icon
                      @click="element.editing = true"
                      class="action-icon"
                      icon="mdi-pencil"
                    ></v-icon>
                  </span>
                  <span>
                    <v-icon
                      @click="deleteTodo(column, index)"
                      class="action-icon"
                      icon="mdi-delete"
                    ></v-icon>
                  </span>
                  <span>
                    <v-icon
                      @click="googleSearch(element.decsription)"
                      class="action-icon"
                      icon="mdi-google"
                    ></v-icon>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <div class="add-todo-container">
          <v-form ref="form" @submit.prevent="addItem($event, column)">
            <v-text-field
              class="todo-input"
              placeholder="Add Your Todo"
              name="description"
              variant="outlined"
              autocomplete="off"
            ></v-text-field>

            <!-- Add item on click -->
            <div class="add-btn-container">
              <v-btn type="submit" class="add-btn"> Add Todo </v-btn>
            </div>
            <!-- <button class="button add-btn">Add Todo</button> -->
          </v-form>
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
  opacity: 0.5 !important;
  background: #01828830 !important;
}
#checkboxlabel {
  color: #f50202;
  font-size: 18px;
  font-weight: 500;
}
/* .check-todo .v-checkbox .v-selection-control {
  min-height: 25px !important;
} */
.noneT {
  display: n;
}
.edditing-btn {
  border: 2px solid #018288;
  color: #018288;
  margin-right: 5px;
  padding: 1% 3%;
  border-radius: 5px;
}
.add-btn {
  /* border: 2px solid #195190ff;
  margin: 2% 0; */
  background: #018288;
  color: white;
  font-size: 16px;
}
.add-btn-container {
  display: flex;
  justify-content: flex-end;
}
.add-todo-container {
  /* padding: 10px;
  display: flex;
  justify-content: flex-end; */
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
  /* font-size: 18px; */
  /* border: 1px solid white; */
  padding: 1%;
  margin-left: 4px;
  /* border-radius: 15px; */
}
.edit-input {
  border: 2px solid #018288;
  margin: 10px 7px;
  padding: 5px 2px;
}
.header-img {
  width: 50px;
  margin-right: 20px;
  margin-left: 5px;
  border-radius: 100%;
}
.main-todo {
  display: flex;
  justify-content: space-around;
}
.check-todo {
  color: #f50202 !important;
  font-size: 18px !important;
}
.todo-header-container {
  text-align: center;
}
.title-todo {
  text-decoration: underline;
  background: #018288;
  color: white;
  font-size: 34px;
  font-weight: bolder;
  padding: 1% 0;
  display: flex;
  width: 100%;
    position: fixed;
    top: 0;
}
.todo-container {
  width: 30%;
  border: 2px solid #018288;
  padding: 10px;
  /* box-shadow: 5px 5px 0px 0px #01828836; */

  /* background-color: #a2a2a1ff; */
  /* background-color: #efc8b1; */
}
.todo-sub-title {
  font-size: 20px;
  text-transform: capitalize;
  font-style: italic;
  padding: 13% 0 2% 0;
}
.todo-text {
  /* font-size: 18px; */
  word-wrap: break-word;
}
.todo-container-title {
  display: flex;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
  padding: 2% 0 4% 0;
  /* color: #5b0e2d; */
  color: #018288;
}
.todo-input {
  color: #018288;
}
.todo-item {
  border: 2px solid #018288;
  padding: 5px;
  box-shadow: 3px 2px #018288ad;

  /* border-bottom: 1px solid lightgray; */
  cursor: pointer;
  /* background-color: #5b0e2dad; */
  /* background-color: #195190e0; */
  /* justify-content: space-between; */
  display: flex;
  /* flex-wrap: wrap; */
  flex-direction: column;
  /* color: white; */
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

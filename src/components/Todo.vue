<script setup>
import { reactive, ref, watch, toRaw, onMounted } from "vue";
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
const day = ref("");
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
  const localStorageString = localStorage.getItem("todo-data");
  if (localStorageString) {
    data.columns = JSON.parse(localStorageString).columns;
  }
}

watch(data, (newData) => {
  if (chrome.storage) {
    chrome.storage.sync.set({ "todo-data": toRaw(data) }).then(() => {});
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
      <div class="todo-title">
        <div>
          <img alt="todo" src="../assets/todo-icon.jpg" class="header-img" />
        </div>
        <div>Your Todo List</div>
      </div>
      <div class="todo-sub-title">
        Have a great {{ day }}! One step at a time, one task at a time!
      </div>
    </div>
    <div class="todo-main-container">
      <div
        v-for="column of data.columns"
        :key="column.name"
        class="todo-list-container"
      >
        <div class="todo-list-title">{{ column.name }}</div>
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
              <div class="todo-item-card" v-if="element.editing">
                <form @submit.prevent="editTodo($event, column, index)">
                  <input
                    type="text"
                    class="edit-input"
                    :value="element.decsription"
                    name="description"
                    autocomplete="off"
                  />

                  <div class="edit-btn-container">
                    <button
                      @click="element.editing = false"
                      class="editing-btn"
                    >
                      Cancle
                    </button>
                    <button class="editing-btn">Edit</button>
                  </div>
                </form>
              </div>
              <div class="todo-item-card" v-else>
                <div class="todo-text">
                  <v-checkbox class="check-todo" v-model="element.state">
                    <template v-slot:label>
                      <span
                        id="checkboxlabel"
                        :class="{ completed: element.state }"
                      >
                        {{ element.decsription }}
                      </span>
                    </template>
                  </v-checkbox>
                </div>
                <div class="icon-container">
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

        <div>
          <v-form ref="form" @submit.prevent="addItem($event, column)">
            <v-text-field
              class="todo-add-input"
              placeholder="Add Your Todo"
              name="description"
              variant="outlined"
              autocomplete="off"
            ></v-text-field>

            <!-- Add item on click -->
            <div class="add-btn-container">
              <v-btn type="submit" class="add-btn"> Add Todo </v-btn>
            </div>
          </v-form>
        </div>
      </div>
    </div>
    <div class="todo-bottom">
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
.add-btn {
  background: #018288;
  color: white;
  font-size: 16px;
}
.add-btn-container {
  display: flex;
  justify-content: flex-end;
}
.action-icon {
  padding: 1%;
  margin-left: 4px;
}
.check-todo {
  color: #f50202 !important;
  font-size: 18px !important;
}
.completed {
  text-decoration: line-through;
}
.editing-btn {
  border: 2px solid #018288;
  color: #018288;
  margin-right: 5px;
  padding: 1% 3%;
  border-radius: 5px;
}
.edit-btn-container {
  margin: 5px 0;
  text-align: end;
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
.icon-container {
  display: flex;
  justify-content: flex-end;
  color: #018288 !important;
}
.todo-add-input {
  color: #018288;
}
.todo-bottom {
  display: flex;
  justify-content: center;
  font-size: 20px;
  padding: 2% 0;
}
.todo-header-container {
  text-align: center;
}
.todo-item-card {
  border: 2px solid #018288;
  padding: 5px;
  box-shadow: 3px 2px #018288ad;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  margin-bottom: 4%;
}
.todo-list-container {
  width: 30%;
  border: 2px solid #018288;
  padding: 10px;

}
.todo-list-title {
  display: flex;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
  padding: 2% 0 4% 0;
  color: #018288;
}
.todo-main-container {
  display: flex;
  justify-content: space-around;
}
.todo-title {
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
  z-index: 3;
}
.todo-text {
  word-wrap: break-word;
}
.todo-sub-title {
  font-size: 20px;
  text-transform: capitalize;
  font-style: italic;
  padding: 13% 0 2% 0;
}
</style>

<script setup>
import { reactive, ref, watch } from "vue";
import draggable from "vuedraggable";
import uniqid from "uniqid";

const dragging = ref(false);
const defaultData = {
  columns: [
    {
      name: "now",
      List: [
        { id: "1", decsription: "this is iten", state: true, editing: false },
        {
          id: "2",
          decsription: "this is iten 2",
          state: false,
          editing: false,
        },
      ],
    },
    {
      name: "next",
      List: [
        { id: "1", decsription: "this is iten", state: false },
        { id: "2", decsription: "this is iten 2", state: true },
      ],
    },
    {
      name: "later",
      List: [
        { id: "1", decsription: "this is iten", state: true },
        { id: "2", decsription: "this is iten 2", state: false },
      ],
    },
  ],
};
const localStorageString = localStorage.getItem("todo-data");
const localStorageData = localStorageString
  ? JSON.parse(localStorageString)
  : defaultData;

const data = reactive(localStorageData);

watch(data, (newData) => {
  localStorage.setItem("todo-data", JSON.stringify(newData));
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
</script>

<template>
  <div>
    <div class="main-todo">
      <div
        v-for="column of data.columns"
        :key="column.name"
        class="todo-container"
      >
        <div>{{ column.name }}</div>
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
                    <button @click="element.editing = true">E</button>
                  </span>
                  <span>
                    <button @click="deleteTodo(column, index)">D</button>
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
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #aa4f04;
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

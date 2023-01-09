<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex';

import { authentication, tutors_collection, admins_collection, add_tutor, del_tutor, add_admin } from '../firebase'
import { createUserWithEmailAndPassword } from '@firebase/auth'
import { useCollection } from 'vuefire'

const store = useStore()

const tutors = useCollection(tutors_collection)
const admins = useCollection(admins_collection)

const admin_email = ref('')
const admin_password = ref('')

const tutor_name = ref('')

const colors = ['#b9fbc0', '#98f5e1', '#8eecf5', '#90dbf4', '#a3c4f3', '#cfbaf0', '#f1c0e8', '#ffcfd2', '#fde4cf', '#fbf8cc']
const selected_color = ref('#b9fbc0')

const onColorSelected = color => selected_color.value = color

const onCreateTutor = () => {
  if (tutor_name.value != '' && selected_color.value != '') {
    let is_present = false
    tutors.value.forEach(tutor => { if (tutor.username == tutor_name.value) is_present=true })

    if (!is_present) {
      add_tutor({
        username: tutor_name.value,
        theme: selected_color.value
      })
    } else { store.commit('open_popup', { message: `${tutor_name.value} is already a tutor`, alert: 'info' }) }
  } else { store.commit('open_popup', { message: 'form is incomplete', alert: 'warning' }) }
}

const onDeleteTutor = tutor => { 
  del_tutor(tutor.id)
  store.commit('open_popup', { message: `tutor ${tutor.username} has been removed`, alert: 'info' })
}

const onCreateAdmin = async () => {
  if (admin_email.value != '' && admin_password.value != '') {
    try {
      add_admin({ email: admin_email.value })
      await createUserWithEmailAndPassword(authentication, admin_email.value, admin_password.value)
      store.commit('open_popup', { message: `you are now signed in as ${admin_email.value}`, alert: 'info' })
    } catch (error) { store.commit('open_popup', { message: `${error}`, alert: 'error' }) }
  } else store.commit('open_popup', { message: 'form is not complete', alert: 'warning' })
}
</script>

<template>
  <div>
    <div class="tutors-container container d-flex flex-wrap justify-content-center my-5">
      <div class="card flex-grow-1 bg-dark text-light rounded-start">
        <div class="card-body">
          <h5 class="card-title">Add a new tutor</h5>
          <form>
            <label for="inputTutor" class="form-label">Tutor Name</label>
            <input v-model="tutor_name" type="text" id="inputTutor" class="form-control" aria-describedby="tutorHelp">
            <div id="tutorHelp" class="form-text mb-3">
              The tutor's name <b>MUST</b> be the tutor's school email <b>without the domain.</b> <br>
              Example: <br>
              email: doe.john@itismeucci.com <br>
              name: doe.john
            </div>

            <label class="form-label">Tutor Theme</label>
            <div class="d-flex flex-wrap mb-2" aria-describedby="tutorHelp">
              <div @click="onColorSelected(color)" v-for="color in colors" :key="color" role="button" 
                class="color-container rounded p-4 me-2 mb-2" :class="selected_color === color? 'selected':''" 
                :style="`background:${color}`"></div>
            </div>
            <div id="colorHelp" class="form-text mb-3">
              The tutor's color theme
            </div>

            <button @click.prevent="onCreateTutor" type="submit" class="btn btn-success">Submit</button>
          </form>
        </div>
      </div>
      <div class="tutors-list flex-grow-1 bg-dark rounded-end">
        <ul class="list-group rounded-end">
          <li v-for="tutor in tutors" :key="tutor.id" class="list-group-item d-flex align-items-center bg-dark text-light" >
            <div class="rounded p-3 me-2" :style="`background:${tutor.theme}`"></div>
            <span class="me-3">{{ tutor.username }}</span>
            <button @click="onDeleteTutor(tutor)" type="button" class="btn-close btn-close-white ms-auto" aria-label="Close"></button>
          </li>
        </ul>
      </div>
    </div>

    <div class="admins-container container d-flex flex-wrap justify-content-center mb-5">
      <div class="card flex-grow-1 bg-dark text-light rounded-start">
        <div class="card-body">
          <h5 class="card-title">Add a new admin</h5>
          <form>
            <label for="inputAdminName" class="form-label">Admin Name</label>
            <input v-model="admin_email" type="text" id="inputAdminName" class="form-control" aria-describedby="adminHelp">
            <div id="adminHelp" class="form-text mb-3">
              The admins's name <b>MUST</b> be the admins's email. <br>
              It is recommended <b>not to use</b> the school's email to register as admin.
            </div>

            <label for="inputAdminPassword" class="form-label">Admin Password</label>
            <input v-model="admin_password" type="password" id="inputAdminPassword" class="form-control mb-3">

            <button @click.prevent="onCreateAdmin" type="submit" class="btn btn-success">Submit</button>
          </form>
        </div>
      </div>
      <div class="admins-list flex-grow-1 bg-dark rounded-end">
        <ul class="list-group rounded-end">
          <li v-for="admin in admins" :key="admin.id" 
            class="list-group-item d-flex align-items-center bg-dark text-light" >{{ admin.email }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.color-container { 
  transition: all .3s ease; 

  &.selected { transform: scale(.90); }
}

.card {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.tutors-container, .admins-container {
  height: min-content;

  & .tutors-list, .admins-list {
    overflow: auto;
    max-height: 60vh;

    & .list-group {
      &:first-child { border-radius: 0; }
      &:last-child { border-radius: 0; }
    }

    &::-webkit-scrollbar { width: 20px; }
    &::-webkit-scrollbar-track { background-color: transparent; }
    &::-webkit-scrollbar-thumb {
      background-color: #d6dee1;
      border-radius: 20px;
      border: 6px solid transparent;
      background-clip: content-box;
    }
    &::-webkit-scrollbar-thumb:hover { background-color: #a8bbbf; }
  }
}
</style>

<script setup>
import MainTimetable from '../components/MainTimetable.vue'
import MainPanel from '../components/MainPanel.vue'

import { computed } from 'vue'
import { useStore } from 'vuex'
import { useCollection, useCurrentUser } from 'vuefire'
import { tutors_collection } from '../firebase'

const store = useStore()

const tutors = useCollection(tutors_collection)

const user = useCurrentUser()
const username = user.value.email.split('@')[0]

const is_tutor = computed(() => {
  let res = false
  tutors.value.forEach(tutor => { if (tutor.username === username) res = true })
  return res
})

const onAddCourse = () => store.commit('open_panel', {
  id: '',
  name: '',
  description: '',
  date: null,
  time: 16,
  exists: false
})
</script>

<template>
  <div class="course-form-container d-grid position-fixed" 
    :class="store.state.main_panel.open ? 'show-form' : 'hide-form'">
    <main-panel class="course-form" />
  </div>
  
  <div class="timetable-container">
    <main-timetable />
  </div>

  <div class="course-button-container d-grid position-sticky bottom-0 px-5">
    <button @click="onAddCourse" v-if="is_tutor" type="button" 
      class="course-button btn btn-success color-success">add a course</button>
  </div>
</template>

<style scoped lang="scss" src="">
.timetable-container {
  overflow: auto;

  &::-webkit-scrollbar { height: 10px; }
  &::-webkit-scrollbar-track { display: none; }
}

.course-form-container {
  z-index: 1;
  top: 56px;

  width: 100%;
  height: 100vh;

  align-items: center;
  justify-content: center;

  transition: transform .4s ease-out, opacity .25s, background-color 1s ease-in;

  background-color: #000000aa;
  &.hide-form { 
    transform: translateY(-100vh); 
    opacity: 0;
    background-color: #00000000;
  }

  overflow-y: scroll;

  &::-webkit-scrollbar { height: 10px; }
  &::-webkit-scrollbar-track { display: none; }

  & .course-form {
    width: 90vw;
    height: fit-content;
  }
}
.course-button-container {
  justify-content: center;

  transform: translateY(-15px);

  & .course-button {
    width: calc(150px + 15vw);
  }
}
</style>

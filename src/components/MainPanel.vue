<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { Timestamp } from '@firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
import { courses_collection, tutors_collection, add_course, set_course, del_course, 
  analytics_add_course_event, analytics_edit_course_event } from '../firebase'

import '@vuepic/vue-datepicker/dist/main.css'
import Datepicker from '@vuepic/vue-datepicker'

const user = useCurrentUser()
const username = user.value.email.split('@')[0]

const store = useStore()
const main_panel = store.state.main_panel

const current_date = new Date()
const tomorrow_date = new Date()
const week_date = new Date()
tomorrow_date.setDate(current_date.getDate() + 1)
week_date.setDate(current_date.getDate() + 7)

const courses = useCollection(courses_collection)
const tutors = useCollection(tutors_collection)

// determines if specified timestamp is already occupied by another lesson
const is_unavailable = computed(() => {
  for (let i=0; i<courses.value.length; i++) {
    const course = courses.value[i]
    const course_date = new Date(course.timestamp.seconds*1000).toLocaleString().split(',')[0]
    const course_time = new Date(course.timestamp.seconds*1000).getHours()

    const selected_date = main_panel.data.date?.toLocaleString().split(',')[0]
    const selected_time = main_panel.data.time
      
    if (course_date === selected_date 
      && course_time == selected_time
      && courses.value[i].id != main_panel.id) return true
  } return false
})

// adds markers to calendar
const markers = ref([])
watch( () => courses.value,
  () => {
    const map = new Map()
    courses.value
      .filter(course => new Date(course.timestamp.seconds*1000)>current_date? true:false)
      .forEach(course => {
        const text = `${new Date(course.timestamp.seconds*1000).getHours()}:00 - ${course.name}`
        const date = new Date(course.timestamp.seconds * 1000)
        const color = course.tutor.theme

        if (!map.get(date.getDay())) { // if empty
          map.set(date.getDay(), {
            tooltips: [{ text: text, color: color }],
            date: date
          })
        } else { map.get(date.getDay()).tooltips.push({ text: text, color: color }) }
    })

    map.forEach((value, key) => markers.value.push({
      date: value.date,
      type: 'line',
      tooltip: value.tooltips,
      color: value.tooltips[0].color
    }))
})

// determines the right date
const panel_date = computed(() => {
  const time = main_panel.data.date?.getTime()
  const hours = main_panel.data.date?.getHours()*60*60*1000
  const minutes = main_panel.data.date?.getMinutes()*60*1000

  const offset = main_panel.data.time * 60 * 60 * 1000

  return new Date(time - hours - minutes + offset)
})

const onClosePanel = () => store.commit('close_panel')

function modifyCourse() {
  let course = null
  courses.value.forEach(el => { if (el.id == main_panel.id) { course = el } })
  
  if (course) {
    course.name = main_panel.data.name
    course.description = main_panel.data.description
    course.timestamp = Timestamp.fromDate(panel_date.value)
    
    set_course(course, main_panel.id)
    analytics_edit_course_event(user.value, course)
    store.commit('open_popup', { alert: 'success', message: 'course modified successfully' })
  } else { store.commit('open_popup', { alert: 'error', message: 'something went wrong: could not modify course' }) }
}
function addCourse() {
  let tutor = null
  tutors.value.forEach(el => { if (el.username === username) tutor = el })
  const course = {
    tutor: tutor,
    name: main_panel.data.name,
    description: main_panel.data.description,
    timestamp: Timestamp.fromDate(panel_date.value),
    students: []
  }
  add_course(course)
  analytics_add_course_event(user.value, course)
  store.commit('open_popup', { alert: 'success', message: 'course added successfully' })
}
const onSubmit = () => {
  if (
    main_panel.data.name != '' &&
    main_panel.data.description != '' &&
    main_panel.data.date != null &&
    !is_unavailable.value) { 
    
    if (main_panel.exists) modifyCourse()
    else addCourse()
    store.commit('close_panel') 
  } else { store.commit('open_popup', { alert: 'warning', message: 'form is not complete' }) }
}

const onDeleteCourse = () => {
  let course = null
  courses.value.forEach(el => { if (el.id == main_panel.id) { course = el } })

  if (course) {
    del_course(course.id)
  } else { store.commit('open_popup', { alert: 'error', message: 'something went wrong: could not delete course' }) }
  store.commit('close_panel')
}
</script>

<template>
  <div class="card main-panel bg-dark text-light">
    <div class="card-body">
      <h5 class="card-title">{{ main_panel.exists ? `Modify ${main_panel.data.name}` : 'Create new course' }}</h5>
      <button type="button" @click="onClosePanel"
        class="btn-close btn-close-white position-absolute top-0 end-0 p-4" aria-label="Close"></button>

      <form>
        <div class="mb-3">
          <label for="courseNameInput" class="form-label">course name</label>
          <input v-model="main_panel.data.name" type="text" class="form-control" 
            id="courseNameInput" required="true" :maxlength="64">
        </div>
        <div class="mb-3">
          <label for="courseDescriptionInput" class="form-label">short description</label>
          <input v-model="main_panel.data.description" type="text" class="form-control" id="courseDescriptionInput"
            aria-describedby="courseDescriptionHelp" required="true" :maxlength="255">
          <div id="courseDescriptionHelp" class="form-text">{{ 255 - main_panel.data.description.length }} characters left.</div>
        </div>
        <div class="mb-3">
          <label for="courseDescriptionInput" class="form-label">select a date</label>
          <Datepicker v-model="main_panel.data.date" name="date-picker" placeholder="select date" required
            :min-date="tomorrow_date" :max-date="week_date" :enable-time-picker="false" prevent-min-max-navigation
            disable-month-year-select :markers="markers" timezone="Europe/Brussels" />
        </div>
        <div class="mb-3">
          <label for="time-range" class="form-label">select a time</label>
          <input v-model="main_panel.data.time" type="range" class="form-range" min="14" max="19" id="courseTime"
            aria-describedby="courseTimeHelp">
          <div id="courseTimeHelp" class="form-text">
            <span :class="is_unavailable? 'text-danger':''">{{ is_unavailable? 'unavailable' : `${main_panel.data.time}:00` }}</span>
          </div>
        </div>
      </form>

      <div class="d-flex">
        <button @click.prevent="onSubmit" type="submit" class="btn btn-success me-4" 
          :class="is_unavailable? 'disabled':''">submit</button>
        <button @click="onClosePanel" type="button" class="btn btn-warning me-4">cancel</button>
        <button @click="onDeleteCourse" v-if="main_panel.exists" type="button" class="btn btn-danger ms-auto">delete</button> 
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main-panel {
  transform-origin: center;

  &.hide-panel {
    transform: translateX(-100vw);
  }

  transition: all .5s ease;
}
</style>

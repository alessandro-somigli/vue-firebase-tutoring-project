<script setup>
import { Popover } from 'bootstrap'

import cloneDeep from 'lodash/cloneDeep'

import { TIMETABLE_HOUR_DELAY } from '../global'

import { computed, watchEffect, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { useCollection, useCurrentUser } from 'vuefire'
import { tutors_collection, courses_collection, set_course, 
  analytics_subscribe_event, analytics_unsubscribe_event } from '../firebase'

const store = useStore()

const tutors = useCollection(tutors_collection)
const courses = useCollection(courses_collection)

const user = useCurrentUser()
const username = user.value.email.split('@')[0]

// determines if the user is a tutor
const is_tutor = computed(() => {
  let res = false
  tutors.value.forEach(tutor => { if (tutor.username === username) res = true })
  return res
})

const today_full_date = new Date()
const current_date = today_full_date.getDay()

const empty_timetable = [
  { key: 'Sun', value: [null, null, null, null, null, null] },
  { key: 'Mon', value: [null, null, null, null, null, null] },
  { key: 'Tue', value: [null, null, null, null, null, null] },
  { key: 'Wed', value: [null, null, null, null, null, null] },
  { key: 'Thu', value: [null, null, null, null, null, null] },
  { key: 'Fri', value: [null, null, null, null, null, null] },
  { key: 'Sat', value: [null, null, null, null, null, null] }]
const timetable = ref(cloneDeep(empty_timetable))

// updates the data when the table changes
watchEffect(() => { 
  timetable.value = cloneDeep(empty_timetable)
  courses.value
    .filter(course => new Date(course.timestamp.seconds*1000)>today_full_date? true:false)
    .forEach(course => {
      const timestamp = new Date(course.timestamp.seconds*1000)
      const day_index = timestamp.getDay()
      const hour_index = timestamp.getHours() - TIMETABLE_HOUR_DELAY
      timetable.value[day_index].value[hour_index] = course
  })
})

// when data is injected into the page adds popper.js for bootstrap support
watch(() => timetable.value,
  () => {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl))
  })

const onEditCourse = course => {
  store.commit('open_panel', {
    id: course.id,
    name: course.name,
    description: course.description,
    date: new Date(course.timestamp.seconds * 1000),
    time: new Date(course.timestamp.seconds * 1000).getHours(),
    exists: true
  })
}

const onSubscribeCourse = course => { 
  if (!course.students.includes(username)) {
    course.students.push(username)
    set_course(course, course.id)
    analytics_subscribe_event(user.value, course)
    store.commit('open_popup', { alert: 'success', message: 'subscribed successfully' })
  } else { store.commit('open_popup', { alert: 'info', message: 'you are already subscribed' }) }
}
const onUnsubscribeCourse = course => {
  const index = course.students.indexOf(username)
  if (index > -1) { 
    course.students.splice(index, 1) 
    set_course(course, course.id)
    analytics_unsubscribe_event(user.value, course)
    store.commit('open_popup', { alert: 'info', message: 'you have unsubscribed' })
  } else { store.commit('open_popup', { alert: 'info', message: 'you are already not subscribed' }) }
}
</script>


<template>
  <table class="timetable container mb-5 h-100">
    <tr>
      <th></th>
      <th v-for="day, index in timetable" :key="day.key" class="text-center">
        <span class="badge bg-color-mute fs-4 fw-normal" :class="index < current_date ? 'text-white text-opacity-25' :
        index == current_date ? 'fw-bold' : ''">{{ day.key }}</span>
      </th>
    </tr>
    <tr v-for="(day, i) in timetable[0].value" :key="i" class="align-items-center">
      <td>
        <span class="badge bg-color-mute fs-5 fw-normal">{{ i + TIMETABLE_HOUR_DELAY }}:00</span>
      </td>
      <td v-for="day in timetable" :key="day.value[i]?.id" class="bg-color-soft rounded">
        <div v-if="day.value[i]" class="timetable-card card h-100 text-white"
          :style="`background: ${day.value[i].tutor.theme};`">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ day.value[i].name }}</h5>
            <h6 class="card-subtitle mb-4 text-muted">tutor: {{ day.value[i].tutor.username }}</h6>

            <div class="d-flex mt-auto">
              <button @click="onEditCourse(day.value[i])" v-if="is_tutor && day.value[i].tutor.username == username"
                type="button" class="btn bg-color-light me-2">edit</button> <!-- is the tutor of the course -->
              <button @click="onSubscribeCourse(day.value[i])" v-else-if="!is_tutor && !day.value[i].students.includes(username)" 
                type="button" class="btn bg-color-light me-2">subscribe</button> <!-- is not tutor and not subscribed -->
              <button @click="onUnsubscribeCourse(day.value[i])" v-else-if="!is_tutor" 
                type="button" class="btn bg-color-light me-2">unsubscribe</button> <!-- is not tutor and is subscribed -->

              <div class="dropdown">
                <button class="btn bg-color-light dropdown-toggle me-2" :class="day.value[i].students.length > 0? '':'disabled'" 
                  type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false"> students </button>
                <ul class="dropdown-menu ps-3 bg-color-mute text-white" aria-labelledby="dropdownMenuButton1">
                  <li v-for="student in day.value[i].students" :key="student">{{ student }}</li>
                </ul>
              </div>

              <a type="button" class="btn bg-color-light ms-auto" container="body" data-bs-toggle="popover"
                data-bs-trigger="focus" tabindex="0" title="Description:"
                :data-bs-content="day.value[i].description">info</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
.btn {
  &:hover {
    border: 1px solid #ffffff;
  }
}

.timetable {
  border-spacing: .8rem;
  border-collapse: separate;

}
.timetable-card {
  border: none;
}
</style>
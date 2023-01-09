import { SCHOOL_EMAIL_DOMAIN, uuidv4 } from '../global'

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics, logEvent } from "firebase/analytics"

const firebaseConfig = {
    apiKey: "AIzaSyBga_Y8D0PHR5JTFAKj2EJ314DNy7gKg40",
    authDomain: "school-tutoring-d6665.firebaseapp.com",
    projectId: "school-tutoring-d6665",
    storageBucket: "school-tutoring-d6665.appspot.com",
    messagingSenderId: "568565957536",
    appId: "1:568565957536:web:5229020bbfe65aa8251ac5",
    measurementId: "G-KXC47FNZBD"
}

const firebaseApp = initializeApp(firebaseConfig)
const database = getFirestore(firebaseApp)
const analytics = getAnalytics(firebaseApp)

const authentication = getAuth()
const provider = new GoogleAuthProvider()
provider.setCustomParameters({
    'hd' : SCHOOL_EMAIL_DOMAIN
})

const tutors_collection = collection(database, 'tutors')
const courses_collection = collection(database, 'courses')
const admins_collection = collection(database, 'admins')

// functions 
const add_admin = async admin => await setDoc(doc(database, 'admins', admin.email), admin)

const add_course = async course => await setDoc(doc(database, 'courses', uuidv4()), course)
const set_course = async (course, id) => await setDoc(doc(database, 'courses', id), course)
const del_course = async id => await deleteDoc(doc(database, 'courses', id))

const add_tutor = async tutor => await setDoc(doc(database, 'tutors', tutor.username), tutor)
// const set_tutor = async (tutor, id) => await setDoc(doc(database, 'tutors', id), tutor) feature to add
const del_tutor = async id => await deleteDoc(doc(database, 'tutors', id))

// analytics
// login/logout analytics
let login_timeout = null
let login_time = 0
const analytics_login_event = user => {
    login_timeout = setTimeout(() => login_time++, 1000)
    logEvent(analytics, 'login', { username: user.email })
}
const analytics_logout_event = user => {
    clearTimeout(login_timeout)
    logEvent(analytics, 'logout', { username: user.email, time: login_time })
}

// subscribe/unsubscribe analytics
const analytics_subscribe_event = (user, course) => logEvent(analytics, 'subscribe_course', {
    user: user.email,
    course: course.name })
const analytics_unsubscribe_event = (user, course) => logEvent(analytics, 'unsubscribe_event', {
    user: user.email,
    course: course.name })

// edit/add course analytics
const analytics_add_course_event = (user, course) => logEvent(analytics, 'add_course', {
    tutor: user.email,
    course: course.name })
const analytics_edit_course_event = (user, course) => logEvent(analytics, 'edit_course', { 
    tutor: user.email, 
    course: course.name })

// uses pwa/website
const analytics_distribution_event = (user, distribution) => logEvent(analytics, 'use_distribution', { 
    user: user.email, 
    distribution: distribution })

// installed/rejected pwa
const analytics_install_pwa_event = user => logEvent(analytics, 'install_pwa', { user: user.email })
const analytics_reject_pwa_event = user => logEvent(analytics, 'reject_pwa', { user: user.email })

// export functions
export { add_course, set_course, del_course }
export { add_tutor, del_tutor }
export { add_admin }

export { analytics_login_event, analytics_logout_event }
export { analytics_subscribe_event, analytics_unsubscribe_event }
export { analytics_add_course_event, analytics_edit_course_event }

export { analytics_distribution_event, analytics_install_pwa_event, analytics_reject_pwa_event }

// export google auth
export { authentication, provider }

// export collections
export { tutors_collection, courses_collection, admins_collection }

// export firebase app
export default firebaseApp

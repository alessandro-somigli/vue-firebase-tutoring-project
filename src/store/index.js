import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      popup_label: {
        open: false,
        message: '',
        alert: 'error' // info, success, warning, error
      },
      main_panel: {
        open: false,
        id: '',
        data: {
          name: '',
          description: '',
          date: null,
          time: 16
        },
        exists: false
      }
    }
  },
  mutations: {
    open_popup (state, payload) {
      state.popup_label.open = true
      state.popup_label.alert = payload.alert
      state.popup_label.message = payload.message
    },
    close_popup (state) { 
      state.popup_label.open = false 
    },

    open_panel (state, payload) {
      state.main_panel.open = true
      
      state.main_panel.id = payload.id
      state.main_panel.data.name = payload.name
      state.main_panel.data.description = payload.description
      state.main_panel.data.date = payload.date
      state.main_panel.data.time = payload.time

      state.main_panel.exists = payload.exists
    },
    close_panel (state) {
      state.main_panel.open = false
    }
}})

export default store

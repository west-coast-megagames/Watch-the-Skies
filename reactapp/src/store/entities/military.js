import { createSlice } from "@reduxjs/toolkit"; // Import from reactjs toolkit
import { apiCallBegan } from "../api"; // Import Redux API call
import { Alert } from "rsuite";

// Create entity slice of the store
const slice = createSlice({
  name: "military",
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
    newmilitary: 0
  },
  // Reducers - Events
  reducers: {
    militaryRequested: (military, action) => {
      console.log(`${action.type} Dispatched...`)
      military.loading = true;
    },
    militaryReceived: (military, action) => {
      console.log(`${action.type} Dispatched...`);
      Alert.info('Military State Loaded!', 3000);
      military.list = action.payload;
      military.loading = false;
      military.lastFetch = Date.now();
    },
    militaryRequestFailed: (military, action) => {
      console.log(`${action.type} Dispatched`)
      Alert.error(`${action.type}: ${action.payload}`, 4000);
      military.loading = false;
    },
    militaryAdded: (military, action) => {
      console.log(`${action.type} Dispatched`)
      military.list.push(action.payload);
    }
  }
});

// Action Export
export const {
  militaryAdded,
  militaryReceived,
  militaryRequested,
  militaryRequestFailed
} = slice.actions;

export default slice.reducer; // Reducer Export

// Action Creators (Commands)
const url = "api/military";

// military Loader into state
export const loadmilitary = () => (dispatch, getState) => {
  return dispatch(
    apiCallBegan({
      url,
      method: 'get',
      onStart:militaryRequested.type,
      onSuccess:militaryReceived.type,
      onError:militaryRequestFailed.type
    })
  );
};

// Add a military to the list of military
export const addmilitary = military =>
  apiCallBegan({
    url,
    method: "post",
    data: military,
    onSuccess: militaryAdded.type
  });
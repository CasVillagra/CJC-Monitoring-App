// src/api.js
import axios from 'axios';

const CLIENT_ID = 'cjc_api';
const CLIENT_SECRET = 'AxfDplDY8dnvWs9ymut84IyZhXdEB6IN';
const TOKEN_URL = 'https://cors-anywhere.herokuapp.com/https://auth.smaapis.de/oauth2/token';


export const getAccessToken = () => {
  return axios
    .post(TOKEN_URL, {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })
    .then((response) => response.data.access_token)
    .catch((err) => {
      console.error('Error fetching access token', err);
    });
};

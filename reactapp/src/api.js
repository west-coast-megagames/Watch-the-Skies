import openSocket from 'socket.io-client';
import { gameServer } from './config';

// Socket Routes
const socket = openSocket(gameServer);
const clockSocket = openSocket(`${gameServer}clock`);
const updateSocket = openSocket(`${gameServer}update`);

// Clock Socket Events and Event Listners
function subscribeToClock (cb) {
    clockSocket.on('gameClock', clock => cb(null, clock));
};

function pauseGame () {
    socket.emit('pauseGame');
};

function startGame () {
    socket.emit('startGame');
};

function resetClock () {
    socket.emit('resetClock');
};

function skipPhase () {
    socket.emit('skipPhase');
};

let gameClock = { subscribeToClock, pauseGame, startGame, resetClock, skipPhase };


// Banking Socket Events and Event Listners
function bankingTransfer (transfer) {
    socket.emit('bankingTransfer', transfer);
};

function autoTransfer (transfer) {
    socket.emit('autoTransfer', transfer);
};

let banking = { bankingTransfer, autoTransfer };

function updateAircrafts (cb) {
    console.log('Listning for current aircrafts...')
    updateSocket.on('currentAircrafts', data => cb(null, data));
};

function updateAccounts (cb) {
    updateSocket.on('updateAccounts', data => cb(null, data));
}

function updateResearch (cb) {
    updateSocket.on('updateResearch', data => cb(null, data)); 
}

function updateTeam (cb) {
    updateSocket.on('teamUpdate', data => cb(null, data));
};

function updateFacilities (cb) {
    updateSocket.on('updateFacilities', data => cb(null, data));
}

function updateMilitary (cb) {
    updateSocket.on('updateMilitary', data => cb(null, data));
}

function updateLogs(cb) {
    updateSocket.on('updateLogs', data => cb(null, data));
}

function addNews (cb) {
    updateSocket.on('newsAlert', data => cb(null, data));
}

function updateUsers (cb) {
    updateSocket.on('updateUsers', data => cb(null, data));
}

function login (cb) {
    updateSocket.on('login', data => cb(null, data));
};

let updateEvents = { login, updateUsers, updateMilitary, updateTeam, updateAircrafts, updateAccounts, updateResearch, updateFacilities, addNews, updateLogs };

export { gameClock, banking, updateEvents, socket, clockSocket, updateSocket };
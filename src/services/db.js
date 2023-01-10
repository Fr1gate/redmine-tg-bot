const fs = require("fs");

const DB_PATH = "../../db.json";

function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: {},
      calendars: {},
    }))
  }
}

function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH).toString());
  } catch {
    initDB();
    return JSON.parse(fs.readFileSync(DB_PATH).toString());
  }
}

function getUser(id) {
  // getDB().users.find()
}

function setUser() {

}

function getCalendar() {

}

function setCalendar() {

}

/*
  {
    users: {
      [key]: {
        name,
        redmine_api_key,
      }
    },
    calendars: {
      [year]: {}
    }
  }
 */

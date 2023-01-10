const fs = require("fs");

const DB_PATH = "./db.json";

const DBService = {
  initDB: function() {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({
        users: {},
        calendars: {},
      }))
    }
  },
  
  getDB: function() {
    try {
      return JSON.parse(fs.readFileSync(DB_PATH).toString());
    } catch {
      DBService.initDB();
      return JSON.parse(fs.readFileSync(DB_PATH).toString());
    }
  },
  
  setDB: function(newDB) {
    fs.writeFileSync(DB_PATH, JSON.stringify(newDB));
  },
  
  getUser: function(telegramUserID) {
    return DBService.getDB().users[telegramUserID];
  },
  
  setUser: function(ID, user) {
    const newDB = DBService.getDB();
    newDB.users[ID] = user;
    DBService.setDB(newDB);
  },
  
  getCalendar: function(year) {
    return DBService.getDB().calendars[year];
  },
  
  setCalendar: function(year, calendar) {
    const newDB = DBService.getDB();
    newDB.calendars[year] = calendar;
    DBService.setDB(newDB);
  }
}



module.exports = {
  DBService,
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

const axios = require("axios");
const dayjs = require("dayjs");

// const REDMINE_API_KEY = "c544f661de3143b5119c8bb2d38f5072513a5a5d";

const getRequest = (token) => axios.create({
  baseURL: "https://redmine.brainstorm-lab.com",
  headers: {
    "X-Redmine-API-Key": token,
  }
})

const RedmineAPI = {
  getUser: async function getUser(token) {
    return getRequest(token).get("/my/account.json").then(({data}) => data.user);
  },
  
  getMyID: async function getMyID(token) {
    return await getRequest()
      .get("/my/account.json")
      .then(({data}) => data.user.id);
  },
  
  getTimeEntries: async function getTimeEntries(token, from, to) {
    const user_id = await RedmineAPI.getMyID();
    
    console.log(user_id);
  
    // TODO: add pagination support, as 100 is max limit
    return getRequest()
      .get("/time_entries.json", {
        params: {
          from: dayjs(from).format("YYYY-MM-DD"),
          to: dayjs(to).format("YYYY-MM-DD"),
          user_id,
          limit: 100,
        },
      })
      .then(({data}) => {
        return data.time_entries
      });
  },
  
  getIssue: async function getIssue(token, id) {
    return getRequest().get(`/issues/${id}.json`).then(({data}) => data.issue)
  },
}

module.exports = {
  RedmineAPI
}
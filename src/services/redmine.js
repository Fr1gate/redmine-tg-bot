const axios = require("axios");
const dayjs = require("dayjs");

const REDMINE_API_KEY = "c544f661de3143b5119c8bb2d38f5072513a5a5d";

const request = axios.create({
  baseURL: "https://redmine.brainstorm-lab.com",
  headers: {
    "X-Redmine-API-Key": REDMINE_API_KEY,
  }
});

async function getMyID() {
  return await request
    .get("/my/account.json")
    .then(({data}) => data.user.id);
}

async function getTimeEntries(from, to) {
  const user_id = await getMyID();
  
  console.log(user_id);

  // TODO: add pagination support, as 100 is max limit
  return request
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
}

async function getIssue(id) {
  return request.get(`/issues/${id}.json`).then(({data}) => data.issue)
}

// getTimeEntries(dayjs("2023-01-10"), dayjs("2023-01-10"))
//   .then(res => console.log("time entries: ", res));

module.exports = {
  getTimeEntries,
  getIssue,
}
import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import { DateLike } from "../globals";

const getRequest = (redmineToken: string): AxiosInstance =>
  axios.create({
    baseURL: "https://redmine.brainstorm-lab.com",
    headers: {
      "X-Redmine-API-Key": redmineToken,
    },
  });

export const RedmineAPI = {
  getUser: async function getUser(redmineToken: string) {
    return await getRequest(redmineToken)
      .get("/my/account.json")
      .then(({ data }) => data.user);
  },

  getMyID: async function getMyID(redmineToken: string): Promise<string> {
    return await getRequest(redmineToken)
      .get("/my/account.json")
      .then(({ data }) => String(data.user.id));
  },

  getTimeEntries: async function getTimeEntries(
    redmineToken: string,
    from: DateLike,
    to: DateLike
  ) {
    const userId = await RedmineAPI.getMyID(redmineToken);

    // TODO: add pagination support, as 100 is max limit
    return await getRequest(redmineToken)
      .get("/time_entries.json", {
        params: {
          from: dayjs(from).format("YYYY-MM-DD"),
          to: dayjs(to).format("YYYY-MM-DD"),
          userId,
          limit: 100,
        },
      })
      .then(({ data }) => {
        return data.time_entries;
      });
  },

  getIssue: async function getIssue(redmineToken: string, id: string) {
    return await getRequest(redmineToken)
      .get(`/issues/${id}.json`)
      .then(({ data }) => data.issue);
  },
};

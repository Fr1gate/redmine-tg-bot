import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import { DateLike } from "../globals.types";
import { RedmineAPITypes } from "./redmine.types";

const getRequest = (redmineToken: string): AxiosInstance =>
  axios.create({
    baseURL: "https://redmine.brainstorm-lab.com",
    headers: {
      "X-Redmine-API-Key": redmineToken,
    },
  });

export const RedmineAPI = {
  getUser: async (redmineToken: string) => {
    return await getRequest(redmineToken)
      .get("/my/account.json")
      .then(({ data }) => data.user);
  },

  getMyID: async (redmineToken: string): Promise<string> => {
    return await getRequest(redmineToken)
      .get("/my/account.json")
      .then(({ data }) => String(data.user.id));
  },

  getTimeEntries: async (
    redmineToken: string,
    from: DateLike,
    to: DateLike
  ): Promise<RedmineAPITypes.TimeEntriesResponse["time_entries"]> => {
    const userId = await RedmineAPI.getMyID(redmineToken);

    // TODO: add pagination support, as 100 is max limit
    return await getRequest(redmineToken)
      .get("/time_entries.json?include=issues", {
        params: {
          from: dayjs(from).format("YYYY-MM-DD"),
          to: dayjs(to).format("YYYY-MM-DD"),
          user_id: userId,
          limit: 100,
        },
      })
      .then(({ data }) => {
        return data.time_entries;
      });
  },

  getIssue: async (
    redmineToken: string,
    id: string
  ): Promise<RedmineAPITypes.Issue> => {
    return await getRequest(redmineToken)
      .get(`/issues/${id}.json`)
      .then(({ data }) => data.issue);
  },
};

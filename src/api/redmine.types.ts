export namespace RedmineAPITypes {
  export interface IssuesResponse {
    issues: Issue[];
  }

  export interface Issue {
    id: number;
    project: {
      id: number;
      name: string;
    };
    tracker: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    priority: {
      id: number;
      name: string;
    };
    author: {
      id: number;
      name: string;
    };
    assigned_to: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
    fixed_version: {
      id: number;
      name: string;
    };
    parent: {
      id: number;
    };
    subject: string;
    description: string;
    start_date: string;
    due_date: null | string;
    done_ratio: number;
    is_private: boolean;
    estimated_hours: null | number;
    created_on: string;
    updated_on: string;
    closed_on: null | string;
  }

  export interface TimeEntriesResponse {
    time_entries: TimeEntry[];
  }

  export interface TimeEntry {
    id: number;
    project: {
      id: number;
      name: string;
    };
    issue: {
      id: number;
      name: string | undefined;
    };
    user: {
      id: number;
      name: string;
    };
    activity: {
      id: number;
      name: string;
    };
    hours: number;
    comments: string;
    spent_on: string;
    created_on: string;
    updated_on: string;
  }
}

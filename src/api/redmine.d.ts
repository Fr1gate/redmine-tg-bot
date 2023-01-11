import {DateLike} from "../globals";

declare namespace RedmineAPI {
    export interface IssuesResponse {
        issues: Issue[]
    }

    export interface Issue {
        "id": number,
        "project": {
            "id": number,
            "name": string
        },
        "tracker": {
            "id": number,
            "name": string
        },
        "status": {
            "id": number,
            "name": string
        },
        "priority": {
            "id": number,
            "name": string
        },
        "author": {
            "id": number,
            "name": string
        },
        "assigned_to": {
            "id": number,
            "name": string
        },
        "category": {
            "id": number,
            "name": string
        },
        "fixed_version": {
            "id": number,
            "name": string
        },
        "parent": {
            "id": number
        },
        "subject": string,
        "description": string,
        "start_date": string,
        "due_date": null | string,
        "done_ratio": number,
        "is_private": boolean,
        "estimated_hours": null | number,
        "created_on": string,
        "updated_on": string,
        "closed_on": null | string
    }
}
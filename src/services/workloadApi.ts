import axios from 'axios';
import { taskApi } from './api';
import { groupApi } from './userApi';

const API_BASE_URL = 'http://127.0.0.1:8006';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workloadApi = {
  getLeastLoadedMember: async (teamId: string) => {
    // 1. Get team members
    const teamResponse = await groupApi.getById(teamId);
    const members = teamResponse.data.data.members;

    if (!members || members.length === 0) throw new Error("Team has no members");

    // 2. Get all tasks to calculate workload
    const tasksResponse = await taskApi.getAll();
    const allTasks = tasksResponse.data.data || [];

    // 3. Calculate workload for each member of this specific team
    const workload: { [key: string]: number } = {};
    members.forEach((m: any) => workload[m.user] = 0);

    allTasks.forEach((task: any) => {
      if (task.assignee && workload[task.assignee] !== undefined) {
        workload[task.assignee]++;
      }
    });
    
    // 4. Find the member with the minimum workload
    let leastLoadedMemberId = members[0].user;
    let minTasks = workload[leastLoadedMemberId];

    for (const memberId in workload) {
      if (workload[memberId] < minTasks) {
        minTasks = workload[memberId];
        leastLoadedMemberId = memberId;
      }
    }

    return { id: leastLoadedMemberId };
  }
}; 
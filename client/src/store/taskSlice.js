import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (customParams, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const params = {
        ...state.tasks.filters,
        ...(customParams || {})
      };
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data.stats;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load dashboard statistics';
      return rejectWithValue(message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Task not found');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

const initialState = {
  tasks: [],
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    priorities: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    }
  },
  selectedTask: null,
  filters: {
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 8
  },
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 8,
    hasMore: false
  },
  isLoading: false,
  error: null
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page !== undefined ? action.payload.page : 1
      };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        status: 'all',
        priority: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 8
      };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
    optimisticStatusUpdate: (state, action) => {
      const { id, newStatus } = action.payload;
      const target = state.tasks.find((t) => t._id === id);
      if (target) {
        target.status = newStatus;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.stats.total += 1;
        if (action.payload.status === 'pending') state.stats.pending += 1;
        if (action.payload.status === 'in-progress') state.stats.inProgress += 1;
        if (action.payload.status === 'completed') state.stats.completed += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask && state.selectedTask._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.selectedTask && state.selectedTask._id === action.payload) {
          state.selectedTask = null;
        }
        state.stats.total = Math.max(0, state.stats.total - 1);
      });
  }
});

export const {
  setFilters,
  resetFilters,
  setPage,
  setSelectedTask,
  clearTaskError,
  optimisticStatusUpdate
} = taskSlice.actions;

export default taskSlice.reducer;

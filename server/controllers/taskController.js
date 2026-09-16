import Task from '../models/Task.js';
import User from '../models/User.js';

export const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      assignedUser,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (req.user.role !== 'admin') {
      query.assignedUser = req.user._id;
    } else if (assignedUser && assignedUser !== 'all') {
      query.assignedUser = assignedUser;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skipCount = (pageNumber - 1) * pageSize;

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedUser', 'name email role')
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skipCount)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      tasks,
      pagination: {
        total: totalTasks,
        page: pageNumber,
        pages: Math.ceil(totalTasks / pageSize),
        limit: pageSize,
        hasMore: pageNumber * pageSize < totalTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req, res, next) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { assignedUser: req.user._id };

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      lowPriority,
      mediumPriority,
      highPriority,
      urgentPriority
    ] = await Promise.all([
      Task.countDocuments(baseQuery),
      Task.countDocuments({ ...baseQuery, status: 'pending' }),
      Task.countDocuments({ ...baseQuery, status: 'in-progress' }),
      Task.countDocuments({ ...baseQuery, status: 'completed' }),
      Task.countDocuments({ ...baseQuery, priority: 'low' }),
      Task.countDocuments({ ...baseQuery, priority: 'medium' }),
      Task.countDocuments({ ...baseQuery, priority: 'high' }),
      Task.countDocuments({ ...baseQuery, priority: 'urgent' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        priorities: {
          low: lowPriority,
          medium: mediumPriority,
          high: highPriority,
          urgent: urgentPriority
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedUser', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role !== 'admin' && (!task.assignedUser || task.assignedUser._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view tasks assigned to you'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, assignedUser } = req.body;

    if (!title || !dueDate || !assignedUser) {
      return res.status(400).json({
        success: false,
        message: 'Title, due date, and assigned user are required fields'
      });
    }

    const assignedUserExists = await User.findById(assignedUser);
    if (!assignedUserExists) {
      return res.status(400).json({
        success: false,
        message: 'Selected assigned user does not exist'
      });
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate,
      assignedUser,
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedUser', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, assignedUser } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedUser && task.assignedUser.toString() === req.user._id.toString();
    const isStatusOnlyUpdate = status !== undefined &&
      title === undefined &&
      description === undefined &&
      priority === undefined &&
      dueDate === undefined &&
      assignedUser === undefined;

    if (!isAdmin) {
      if (isStatusOnlyUpdate && isAssignee) {
        task.status = status;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only administrators can edit task details'
        });
      }
    } else {
      if (assignedUser) {
        const assignedUserExists = await User.findById(assignedUser);
        if (!assignedUserExists) {
          return res.status(400).json({
            success: false,
            message: 'Selected assigned user does not exist'
          });
        }
        task.assignedUser = assignedUser;
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status !== undefined) task.status = status;
    }

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assignedUser', 'name email role')
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can delete tasks'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

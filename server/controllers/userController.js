import User from '../models/User.js';
import Task from '../models/Task.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt').sort({ name: 1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWorkload = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt');

    const workloadList = await Promise.all(
      users.map(async (user) => {
        const [total, pending, inProgress, completed] = await Promise.all([
          Task.countDocuments({ assignedUser: user._id }),
          Task.countDocuments({ assignedUser: user._id, status: 'pending' }),
          Task.countDocuments({ assignedUser: user._id, status: 'in-progress' }),
          Task.countDocuments({ assignedUser: user._id, status: 'completed' })
        ]);

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          tasks: {
            total,
            pending,
            inProgress,
            completed
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      workload: workloadList
    });
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'admin' ? 'admin' : 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either user or admin'
      });
    }

    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke your own administrator privileges'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('name email role createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Task.deleteMany({ assignedUser: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Team member and their assigned tasks removed successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

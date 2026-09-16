export const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(String(email).trim());
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must contain at least 6 characters'
    };
  }
  return { isValid: true, message: '' };
};

export const validateRegistration = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    errors.password = passwordCheck.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTaskForm = ({ title, dueDate, assignedUser }) => {
  const errors = {};

  if (!title || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!dueDate) {
    errors.dueDate = 'Due date is required';
  }

  if (!assignedUser) {
    errors.assignedUser = 'Please select a team member to assign';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

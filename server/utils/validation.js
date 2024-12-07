export const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validateName = (name) => {
    return name && name.trim().length > 0;
  };
  
  export const validateChild = (child) => {
    if (!child.name || child.name.trim() === '') {
      throw new Error('Child name is required');
    }
    if (!child.age || isNaN(parseInt(child.age)) || parseInt(child.age) < 0 || parseInt(child.age) > 18) {
      throw new Error('Valid age between 0-18 is required');
    }
    if (!child.gender || !['Male', 'Female'].includes(child.gender)) {
      throw new Error('Gender must be selected');
    }
  };
  
  export const validateAttendee = (attendee) => {
    if (!validateName(attendee.firstName)) {
      throw new Error('First name is required');
    }
    if (!validateName(attendee.lastName)) {
      throw new Error('Last name is required');
    }
    if (attendee.email && !validateEmail(attendee.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate children if present
    if (attendee.children?.length > 0) {
      attendee.children.forEach(validateChild);
    }
  };
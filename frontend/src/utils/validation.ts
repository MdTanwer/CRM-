import { VALIDATION_RULES } from "../constants";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form data type
export interface FormData {
  [key: string]: string | number | boolean | File | undefined;
}

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  type?: "email" | "phone" | "password" | "number" | "date";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  custom?: (
    value: string | number | boolean,
    data: FormData
  ) => { isValid: boolean; message?: string };
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.PHONE_REGEX.test(phone);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string | number | boolean): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate string length
 */
export const validateLength = (
  value: string,
  min?: number,
  max?: number
): { isValid: boolean; message?: string } => {
  const length = value.trim().length;

  if (min !== undefined && length < min) {
    return {
      isValid: false,
      message: `Must be at least ${min} characters long`,
    };
  }

  if (max !== undefined && length > max) {
    return {
      isValid: false,
      message: `Must be no more than ${max} characters long`,
    };
  }

  return { isValid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number
): { isValid: boolean; message?: string } => {
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      message: `Must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      message: `Must be no more than ${max}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate date range
 */
export const validateDateRange = (
  date: string,
  minDate?: string,
  maxDate?: string
): { isValid: boolean; message?: string } => {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      message: "Invalid date format",
    };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return {
      isValid: false,
      message: `Date must be after ${minDate}`,
    };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return {
      isValid: false,
      message: `Date must be before ${maxDate}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { isValid: boolean; message?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type ${
        file.type
      } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSize: number
): { isValid: boolean; message?: string } => {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      message: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

/**
 * Validate form data against schema
 */
export const validateForm = (
  data: FormData,
  schema: ValidationSchema
): ValidationResult => {
  const errors: ValidationError[] = [];

  Object.keys(schema).forEach((field) => {
    const value = data[field];
    const rules = schema[field];

    // Required validation
    if (
      rules.required &&
      !validateRequired(value as string | number | boolean)
    ) {
      errors.push({
        field,
        message: `${field} is required`,
      });
      return;
    }

    // Skip other validations if field is empty and not required
    if (
      !validateRequired(value as string | number | boolean) &&
      !rules.required
    ) {
      return;
    }

    // Email validation
    if (rules.type === "email" && !validateEmail(value as string)) {
      errors.push({
        field,
        message: "Invalid email format",
      });
    }

    // Phone validation
    if (rules.type === "phone" && !validatePhone(value as string)) {
      errors.push({
        field,
        message: "Invalid phone number format",
      });
    }

    // Password validation
    if (rules.type === "password") {
      const passwordValidation = validatePassword(value as string);
      if (!passwordValidation.isValid) {
        errors.push({
          field,
          message: passwordValidation.message!,
        });
      }
    }

    // Length validation
    if (rules.minLength || rules.maxLength) {
      const lengthValidation = validateLength(
        value as string,
        rules.minLength,
        rules.maxLength
      );
      if (!lengthValidation.isValid) {
        errors.push({
          field,
          message: lengthValidation.message!,
        });
      }
    }

    // Number range validation
    if (
      rules.type === "number" &&
      (rules.min !== undefined || rules.max !== undefined)
    ) {
      const numberValidation = validateNumberRange(
        value as number,
        rules.min,
        rules.max
      );
      if (!numberValidation.isValid) {
        errors.push({
          field,
          message: numberValidation.message!,
        });
      }
    }

    // Date range validation
    if (rules.type === "date" && (rules.minDate || rules.maxDate)) {
      const dateValidation = validateDateRange(
        value as string,
        rules.minDate,
        rules.maxDate
      );
      if (!dateValidation.isValid) {
        errors.push({
          field,
          message: dateValidation.message!,
        });
      }
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === "function") {
      const customValidation = rules.custom(
        value as string | number | boolean,
        data
      );
      if (!customValidation.isValid) {
        errors.push({
          field,
          message: customValidation.message!,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Common validation schemas
 */
export const validationSchemas: Record<string, ValidationSchema> = {
  login: {
    email: {
      required: true,
      type: "email",
    },
    password: {
      required: true,
      type: "password",
    },
  },

  register: {
    firstName: {
      required: true,
      minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
    },
    lastName: {
      required: true,
      minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
    },
    email: {
      required: true,
      type: "email",
    },
    password: {
      required: true,
      type: "password",
    },
    confirmPassword: {
      required: true,
      custom: (value: string | number | boolean, data: FormData) => {
        if (value !== data.password) {
          return {
            isValid: false,
            message: "Passwords do not match",
          };
        }
        return { isValid: true };
      },
    },
  },

  lead: {
    contactName: {
      required: true,
      minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
    },
    email: {
      required: true,
      type: "email",
    },
    phone: {
      required: false,
      type: "phone",
    },
    type: {
      required: true,
    },
  },

  employee: {
    firstName: {
      required: true,
      minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
    },
    lastName: {
      required: true,
      minLength: VALIDATION_RULES.NAME_MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME_MAX_LENGTH,
    },
    email: {
      required: true,
      type: "email",
    },
  },

  call: {
    leadId: {
      required: true,
    },
    scheduledDate: {
      required: true,
      type: "date",
      minDate: new Date().toISOString().split("T")[0], // Today or later
    },
    callType: {
      required: true,
    },
  },
};

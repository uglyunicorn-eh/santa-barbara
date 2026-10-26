// Validation messages in the words the forms have always used (Yup's defaults, with each field's label).

export const required = (label: string) => `${label} is a required field`;
export const maxLen = (label: string, max: number) => `${label} must be at most ${max} characters`;
export const validEmail = (label: string) => `${label} must be a valid email`;

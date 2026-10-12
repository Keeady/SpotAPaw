import isEmail from "validator/es/lib/isEmail";

export function isValidEmail(email: string) {
    return isEmail(email);
}
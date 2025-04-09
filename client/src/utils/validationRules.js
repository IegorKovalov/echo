export const validationRules = {
	validateEmail: (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			return "Email is required";
		} else if (!emailRegex.test(email)) {
			return "Please enter a valid email address";
		}
		return "";
	},
	validatePassword: (password) => {
		if (!password) {
			return "Password is required";
		} else if (password.length < 8) {
			return "Password must be at least 8 characters";
		}
		return "";
	},
	validatePasswordConfirm: (password, passwordConfirm) => {
		if (!passwordConfirm) {
			return "Please confirm your password";
		} else if (password !== passwordConfirm) {
			return "Passwords do not match";
		}
		return "";
	},
	validateUsername: (username) => {
		if (!username) {
			return "Username is required";
		} else if (username.length < 3) {
			return "Username must be at least 3 characters";
		}
		return "";
	},
	validateFullName: (fullName) => {
		if (!fullName) {
			return "Full name is required";
		}
		return "";
	},
};

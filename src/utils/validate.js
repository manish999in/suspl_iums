const validate = (values) => {
    let errors = {};

     // Check if fields are empty and add error messages
     if (!values.roleName) {
        errors.roleName = 'Role Name is required';
    }

    if (!values.mappedAlias) {
        errors.mappedAlias = 'Mapped Alias is required';
    }

    if (!values.roleLevel) {
        errors.roleLevel = 'Role Level is required';
    }

    if (values.remark && values.remark.length < 10) {
        errors.remark = 'Remarks must be at least 10 characters';
    }
    

    if (!values.username) {
        errors.username = 'Username is required';
    }

    if (!values.firstName) { // Corrected to match initial values
        errors.firstName = 'First name is required'; // Updated key
    }

    if (!values.lastName) { // Corrected to match initial values
        errors.lastName = 'Last name is required'; // Updated key
    }

    if (!values.email) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email address is invalid';
    }

    if (!values.password) {
        errors.password = 'Password is required';
    } else if (values.password.length < 6) {
        errors.password = 'Password needs to be 6 characters or more';
    }

    return errors;
};

export default validate;

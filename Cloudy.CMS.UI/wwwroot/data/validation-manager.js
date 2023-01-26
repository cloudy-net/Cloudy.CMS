
const ValidationManager = {
  getValidationResults: (validators, path, validationResults, value) => {

    validators && Object.keys(validators).map(validatorName => {

      const validator = validators[validatorName];

      let inValid = false;
      if (validatorName == 'required' && !value) inValid = true;
      if (validatorName == 'maxLength' && !!value && value.length > validator.maxLength) inValid = true;

      //remove any existing VR for this path and validator
      validationResults = validationResults.filter(vr => vr.path != path || vr.validatorName != validatorName);

      //add a new VR
      validationResults.push({ path, validatorName, isValid: !inValid });
    });

    return validationResults;
  },
  isInvalidForPath: (validationResults, path) => {
    return validationResults.some(vr => !vr.isValid && vr.path == path);
  },
  isInvalidForPathAndValidator: (validationResults, path, validatorName) => {
    return validationResults.some(vr => !vr.isValid && vr.path == path && vr.validatorName == validatorName);
  },
  anyIsInvalid: (validationResults) => validationResults.some(vr => !vr.isValid),
  getValidationClass: (validators, validationResults, path) => {

    if (!validators || !Object.keys(validators)) return '';
    if (!validationResults.some(vr => vr.path == path)) return '';

    return validationResults.some(vr => !vr.isValid && vr.path == path)
      ? 'is-invalid'
      : 'is-valid';
  }
}

export default ValidationManager;
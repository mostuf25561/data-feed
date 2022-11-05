module.exports = {
  lastNotationString: (object_notation) => {
    return object_notation.split(".").pop();
  },
};

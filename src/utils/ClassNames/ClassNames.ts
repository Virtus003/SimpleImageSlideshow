function ClassNames(...classess: Array<string | boolean | undefined>) {
  const filteredClasses = classess.filter((value) => typeof value === 'string');
  return filteredClasses.join(" ");
}

export default ClassNames;
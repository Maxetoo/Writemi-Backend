const generateNums = () => {
  let numbers = ''
  while (numbers.length < 6) {
    numbers += Math.floor(Math.random() * 10)
  }
  return numbers
}

module.exports = {
  generateNums,
}

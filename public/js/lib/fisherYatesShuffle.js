/**
 * Fisher-Yates shuffle algorithm
 * @return {Array} shuffled array
 */
Array.prototype.shuffle = function() {
  var array = this.slice();
  var current = this.length;
  var temp;
  var random;

  while(current !== 0) {
    //pick random element
    random = Math.floor(Math.random() * current);
    current -= 1;

    //swap random element with current element
    temp = array[current];
    array[current] = array[random];
    array[random] = temp;
  }
  return array;
}

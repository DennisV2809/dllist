import DLL, { Node } from './index';
import { strictEqual } from 'assert';
console.time('Test successful');

// We can create a new DDL from an iterable
const x = DLL.from(['Jackson', 'Liam', 'Noah', 'Aiden', 'Sophia', 'Olivia']);
// We can create an array with the values
strictEqual(x.toJSON().join(', '), 'Jackson, Liam, Noah, Aiden, Sophia, Olivia');

// We can push/set/remove elements
x.push('John');
x.set(2, 'Peter');
x.push('Oliver');
x.remove(0);

// We can stringify the object
strictEqual(x.toString(), 'DLL { Liam, Peter, Aiden, Sophia, Olivia, John, Oliver }')

// We can calculate the index of some value
strictEqual(x.indexOf('Olivia'), 4);
strictEqual(x.indexOf(14), -1);

// We can check if the list includes some value
strictEqual(x.includes('Peter'), true);
strictEqual(x.includes(1), false);

// We can use array.some and array.every directly on the list
strictEqual(x.some(n => n.startsWith('A')), true);
strictEqual(x.every(n => n.startsWith('A')), false);
strictEqual(x.some(n => n.startsWith('Z')), false);
strictEqual(x.every(n => n.length > 3), true);

// We can get values
strictEqual(x.get(0), 'Liam');
strictEqual(x.get(2), 'Aiden');

// We can shift a value
strictEqual(x.length, 7)
strictEqual(x.shift(), 'Liam');
strictEqual(x.length, 6)

// Or pop a value
strictEqual(x.length, 6)
strictEqual(x.pop(), 'Oliver');
strictEqual(x.length, 5)

// We can easily loop multiple ways
const arr = x.array();
let i = 0;
for(const name of x) strictEqual(name, arr[i++]);

x.forEach((name, i) => strictEqual(name, arr[i]));

for(const n of x.nodes()) strictEqual(n.root && n.value !== 'Peter', false);

// Reducing and mapping the list is also just like arrays
strictEqual(x.reduce((acc, val) => acc + val, '').length, x.map(name => name.length).reduce((acc, val) => acc + val, 0));

console.timeEnd('Test successful');

console.time('Creating a list of 100000 entries');
const y = DLL.from(Array.from({ length: 100000 }, () => Math.random() * 500));
console.timeEnd('Creating a list of 100000 entries');

const toRemove = Array.from({ length: 5000 }, () => Math.floor(Math.random() * 100000));

console.time('Removing 5000 random entries');
toRemove.forEach(i => y.remove(i));
console.timeEnd('Removing 5000 random entries');

strictEqual(y.length, 100000 - 5000);

console.time('Creating an array of 100000 elements');
const z = Array.from({ length: 100000 }, () => Math.random() * 500);
console.timeEnd('Creating an array of 100000 elements');

console.time('Removing 5000 random elements');
toRemove.forEach(i => z.splice(i, 1));
console.timeEnd('Removing 5000 random elements');

console.log('__________\nGetting values at a certain index is slower.');
console.log('However there are cases where it\'s much faster, like this example from https://adventofcode.com/2018/day/9\n__________');

const PLAYERS = 500;
const MARBLES = 125000;
const ANSWER = 1032233;
console.time('List approach')
const score = Array.from({ length: PLAYERS }, () => 0);
const lst = DLL.from([0]);
let current = lst.root;

for(let m = 1; m <= MARBLES; m++) {
  if(m % 23 === 0) {
    const player = (m - 1) % PLAYERS;
    score[player] += m;
    current = current.move(-7);
    score[player] += current.value;
    current = current.remove();
  } else {
    current = current.move(1);
    current = current.insertAfter(new Node(m));
  }
}

console.timeEnd('List approach');
strictEqual(score.reduce((acc, val) => acc > val ? acc : val, 0), ANSWER);

console.time('Array approach')
const score2 = Array.from({ length: PLAYERS }, () => 0);
const table = [0];
let curr = 0;

function move(amount) {
  curr += amount;
  if(curr < 0) curr = table.length + curr;
  curr %= table.length;
}

for(let m = 1; m <= MARBLES; m++) {
  if(m % 23 === 0) {
    const player = (m - 1) % PLAYERS;
    score2[player] += m;
    move(-7);
    score2[player] += table.splice(curr, 1)[0];
    move(0);
  } else {
    move(2);
    table.splice(curr, 0, m);
  }
}

console.timeEnd('Array approach');
strictEqual(score2.reduce((acc, val) => acc > val ? acc : val, 0), ANSWER);

console.log('\n__________\nDone');

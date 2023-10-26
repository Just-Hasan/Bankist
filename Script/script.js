"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2023-09-01T13:15:33.035Z",
    "2023-09-21T09:48:16.867Z",
    "2023-09-25T06:04:23.907Z",
    "2023-09-27T14:18:46.235Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

const formatMovementsDate = function (date, locale) {
  const calcDayPassed = (date1, date2) => {
    return Math.abs(Math.round((date2 - date1) / (1000 * 60 * 60 * 24)));
  };

  const dayPassed = calcDayPassed(new Date(), date);

  if (dayPassed === 0) {
    return `Today`;
  } else if (dayPassed === 1) {
    return `Yesterday`;
  } else if (dayPassed <= 7) {
    return `${dayPassed} days ago`;
  } else {
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    return new Intl.DateTimeFormat(locale, options).format(date);
  }
};

const formatNumber = function (locale, number, currencyType) {
  const options = {
    style: "currency",
    currency: currencyType,
  };
  return Intl.NumberFormat(locale, options).format(number);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatNumber(
          acc.locale,
          mov,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatNumber(
    acc.locale,
    acc.balance,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatNumber(acc.locale, incomes, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatNumber(acc.locale, out, acc.currency);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatNumber(
    acc.locale,
    interest,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  //Setting the time to 5 minutes
  let minutesTime = 10;
  let wholeTime = minutesTime * 60;
  const decreaseTime = function () {
    const minutes = `${Math.trunc(wholeTime / 60)}`.padStart(2, 0);
    const seconds = `${wholeTime % 60}`.padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;

    if (minutes === "00" && seconds === "00") {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }

    wholeTime--;
  };
  // call the timer every second
  decreaseTime();
  const timer = setInterval(decreaseTime, 1000);
  // In each call, print the remaining the time to the UI
  // When 0 seconds, stop timer and logout user
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  const specificDate = new Date();
  const options = {
    minute: "numeric",
    hour: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(specificDate);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Current date
    const date = new Date();
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    const displayDate = `${day}/${month}/${year}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);

    // Decreasing time
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  setTimeout(() => {
    if (
      amount > 0 &&
      currentAccount.movements.some((mov) => mov >= amount * 0.1)
    ) {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset the timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }
    inputLoanAmount.value = "";
  }, 3000);
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
Converting and checking numbers

// Base 10 = 0 to 9
// Binary base = 0 and 1
// Bruh moment in JS
console.log(23 === 23.0);
console.log(0.1 + 0.2);

// Conversion in JavaScript at its finest
console.log(Number("77")); //Old ways
console.log(+"77"); //New ways

// Parsing in JavaScript, since the Number is an object, and object have methods
// Number also has methods
console.log(Number.parseInt("30px", 10));
console.log(Number.parseInt("e23", 10));

console.log(Number.parseInt("2.5rem"));
console.log(Number.parseFloat("2.5rem"));

// Check if value is not a number
console.log(Number.isNaN(20));
console.log(Number.isNaN(+"20"));
console.log(Number.isNaN(+"20X"));
console.log(Number.isNaN(+"s2d"));
console.log(Number.isNaN(+"Hasan"));

// Cheking if value is a number or float
console.log(Number.isFinite(2.0));
console.log(Number.isFinite("20"));
*/

/*
Converting and checking numbers

console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(27 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, "23", 11, 2));

const max = Math.max(
  ...["12px", "10px", "21px", "100px"].map((value) => Number.parseFloat(value))
);

const min = Math.min(
  ...["12px", "10px", "21px", "100px"].map((value) => Number.parseFloat(value))
);
console.log(min);

console.log(Math.PI * Number.parseFloat("10px") ** 2);

console.log(Math.trunc(Math.random() * 6) + 1) + min;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.round(1.4));
console.log(Math.round(1.6));

console.log(Math.ceil(1.4));
console.log(Math.ceil(1.6));

console.log(Math.floor(1.4));
console.log(Math.floor(1.6));

// Difference between Math.floor and Math.trunc it will be visible if we're handling negative value
// trunc will simply remove the decimal while floor will round it to lower value,
console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24

// Rounding decimals
console.log(+Math.PI.toFixed(2));
console.log(+(2.7).toFixed(3));
*/

/*
The remainder operator

console.log(5 % 2);

console.log(8 % 3);

console.log(14 % 3);

console.log(16 % 3);

console.log(6 % 2);

const isEven = (n) => (n % 2 === 0 ? console.log("Even") : console.log("Odd"));
isEven(20);

labelBalance.addEventListener("click", () => {
  [...document.querySelectorAll(".movements__row")].forEach((elem, i) => {
    if (i % 2 === 0) {
      elem.style.backgroundColor = "orange";
    }

    if (i % 3 === 0) {
      elem.style.backgroundColor = "blue";
    }
  });
});
*/

/*
BigInt

// Using regular int to handle big numbers like this is suicide
console.log(2 ** 53);
console.log(2 ** 53 + 1);
console.log(2 ** 53 - 1);

console.log(2983742934872340972093742934872093477203498n);
console.log(BigInt(2983742934872340972093742934872093477203498));

// Operations
console.log(10000n + 10000n);
console.log(29384729734982734927477234n * 10000000000000000n);
const huge = 2349729347239472394723974n;
const num = 23;
console.log(huge * BigInt(num));
// console.log(Math.sqrt(16n));

// Exception
console.log(10239810238n > 12);
console.log(20n === 20);
console.log(typeof 20n);
console.log(20n == 20);

// String concatenation still work with BigInt
console.log(huge + "Is really big");

// Division
console.log(19 / 3n);
console.log(10 / 3);

// // Dates & Times

// const now = new Date();
// console.log(now);

// console.log(new Date("Aug 02 2020 18:12:21"));
// console.log(new Date("December 24, 15"));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2003, 11, 16, 7, 7, 7));
// console.log(new Date(2003, 10, 33));

// console.log(new Date(4 * 24 * 60 * 60 * 1000));

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "Novemeber",
  "Desember",
];
const future = new Date();
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(1695741410998));

console.log(Date.now());

future.setFullYear(2023);
console.log(future.getFullYear());

const ageCalc = function (date1, date2) {
  const ageYears = Math.round(
    (date2 - date1) / (1000 * 60 * 60 * 24 * 30 * 12)
  );

  return ageYears;
};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentDate = new Date().getDate();

console.log(
  ageCalc(
    new Date(2003, 10, 16),
    new Date(currentYear, currentMonth, currentDate)
  )
);

console.log(
  new Intl.DateTimeFormat("id-ID", {
    minute: "numeric",
    hour: "numeric",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekdays: "long",
  }).format(new Date())
);

// setTimeout() method
const ingridients = ["Spinach", "Pepperonni"];
const timer = setTimeout(
  (ing1, ing2) => {
    console.log(`Here's your pizza with ${ing1} and ${ing2}`);
  },
  3000,
  ...ingridients
);

ingridients.includes("Spinach") ? clearTimeout(timer) : false;

console.log("Wating...");

// setInterval() method

const interval = setInterval(() => {
  const time = new Date();
  const hour = `${time.getHours()}`.padStart(2, 0);
  const minute = `${time.getMinutes()}`.padStart(2, 0);
  const seconds = `${time.getSeconds()}`.padStart(2, 0);
  console.log(`${hour}:${minute}:${seconds}`);
}, 10);
*/

/*
const startLogoutTimer = function () {
  //Setting the time to 5 minutes
  let minutesTime = 10;
  let wholeTime = minutesTime * 60;
  const decreaseTime = function () {
    const minutes = `${Math.trunc(wholeTime / 60)}`.padStart(2, 0);
    const seconds = `${wholeTime % 60}`.padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;

    if (minutes === "00" && seconds === "00") {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }

    wholeTime--;
  };
  // call the timer every second
  decreaseTime();
  const timer = setInterval(decreaseTime, 1000);
  // In each call, print the remaining the time to the UI
  // When 0 seconds, stop timer and logout user
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  const specificDate = new Date();
  const options = {
    minute: "numeric",
    hour: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(specificDate);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Current date
    const date = new Date();
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    const displayDate = `${day}/${month}/${year}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);

    // Decreasing time
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

In that code the startLogoutTimer is basically a function that decreases time and change the UI,
and returns the current time by returning the timer function which is the setInterval. In the
global scope, there's currentAccount and timer variable, these two variable are global scope variable.
Now, when we login, it also checks whether the timer global scope variable has value, if it does
clearInterval of that timer, it doesn't then just fill the timer global scope variable with the 
startLogoutFunction which will basically reset the time and implement the decreasing time,
and since we do the same thing in the transfer and the loan button, it will basically reset the time
when we do a loan or a transfer which is great for our application. And if there's another user login
and we include the same thing, the current timer (global scope variable) who has the timer of one's account
will clearInterval and the timer global scope variable will reassign the startLogoutTimer() which will set
the time back to 10, is this explanation correct?

*/

// This is the JavaScript entry file - your code begins here
// Do not delete or rename this file ********

// An example of how you import jQuery into a JS file if you use jQuery in that file
import $ from 'jquery';
export * from './fetchApi';
export * from './promiseApi';

import User from './User';
import UserRepository from './UserRepository';
import ActivityRepository from './ActivityRepository';
import HydrationRepository from './HydrationRepository';
import SleepRepository from './SleepRepository';

var userData = 
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/users/userData')
  .then(response => response.json())
  .then(data => data.userData)
  .catch(err => console.log(err));
var sleepData = 
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/sleep/sleepData')
  .then(response => response.json())
  .then(data => data.sleepData)
  .catch(err => console.log(err));
var hydrationData = 
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/hydration/hydrationData')
  .then(response => response.json())
  .then(data => data.hydrationData)
  .catch(err => console.log(err));
var activityData = 
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/activity/activityData')
  .then(response => response.json())
  .then(data => data.activityData)
  .catch(err => console.log(err));
// import activityData from './data/activity';

// An example of how you tell webpack to use a CSS (SCSS) file
import './css/base.scss';
import './css/normalize.scss';

// An example of how you tell webpack to use an image (also need to link to it in the index.html)
import './images/AllSteps.png'
import './images/crown-icon.png'
import './images/exercise.icon.png'
import './images/globe-icon.png'
import './images/images.png'
import './images/little-man-icon.svg'
import './images/LowSteps.png'
import './images/Provided-Comp.png'
import './images/sleep-icon.png'
import './images/step-icon.png'
import './images/trend-icon.png'
import './images/water-icon.png'


console.log('This is the JavaScript entry file - your code begins here.');

var randomId;
var userRepository;
var hydrationRepository;
var sleepRepository;
var activityRepository;
var user;

Promise.all([userData, sleepData, hydrationData, activityData]).then(element => {
  userData = element[0];
  sleepData = element[1];
  hydrationData = element[2];
  activityData = element[3];
  randomId = Math.floor(Math.random() * (50 - 1) + 1);
  userRepository = new UserRepository(userData, randomId);
  sleepRepository = new SleepRepository(sleepData, [], [], [],randomId);
  hydrationRepository = new HydrationRepository(hydrationData, randomId, [], [], hydrationData);
  activityRepository = new ActivityRepository(randomId, activityData);
  user = new User(userRepository.getUserData());
}).then(() => {
  displayAllData();
})

function displayAllData() {
  updateUserDataDOM(userRepository.getUserData());
  compareStepGoal(userRepository.getUserData());
  displayDailyOz();
  displayWeeklyOz();
  displayBestSleepers();
  displayCurrentDate(getCurrentDate());
  displaySleep();
  displayActivity();
  displayAverageWeeklyActivity();
  displayWeeklyActivity();
  friendActivityData(getCurrentDate());
  displayTrends();
  displaySleepChart();
}

$('#activity-submit').click(postNewActivityData);
$('.hydration-button').click(postNewHydrationData);
$('.sleep-button').click(postNewSleepData);

function postNewActivityData(e) {
  e.preventDefault();
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/activity/activityData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userID: randomId,
      date: getCurrentDate(),
      numSteps: parseInt($('#todays-steps').val()),
      minutesActive: parseInt($('#todays-minutes').val()),
      flightsOfStairs: parseInt($('#todays-flights').val())
      })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));
  $('#todays-steps').val('');
  $('#todays-minutes').val('');
  $('#todays-flights').val('');
}

function postNewHydrationData(e) {
  e.preventDefault();
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/hydration/hydrationData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userID: randomId,
      date: getCurrentDate(),
      numOunces: parseInt($('#todays-ounces').val())
      })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));
  $('#todays-ounces').val('');
}

function postNewSleepData(e) {
  e.preventDefault();
  fetch('https://fe-apps.herokuapp.com/api/v1/fitlit/1908/sleep/sleepData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userID: randomId,
      date: getCurrentDate(),
      hoursSlept: parseInt($('#todays-sleep-hours').val()),
      sleepQuality: parseInt($('#todays-sleep-quality').val())
      })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.log(err));
  $('#todays-sleep-hours').val('');
  $('#todays-sleep-quality').val('');
}

function updateUserDataDOM(userInfo) {
  $(`<p>Welcome,</p><h1>${user.getFirstName()}</h1>`).prependTo($('#name'));
  $('#address').text(userInfo.address);
  $('#email').text(userInfo.email);
  $('#strideLength').text(userInfo.strideLength);
  $('#stepGoal').text(userInfo.dailyStepGoal.toLocaleString());
  $('#step-compare').text(userRepository.getFriendsName().join(', '));
}

function compareStepGoal(userInfo) {
  const stepCompare = $('#step-compare');
  const avgStep = userRepository.getAvgStep();
  const dailyStepGoal = userInfo.dailyStepGoal;
  const stepsToday = activityRepository.getDailyStats(getCurrentDate(), 'numSteps');
  const numSteps = Math.abs(dailyStepGoal - stepsToday);
  stepsToday <= dailyStepGoal
    ? stepCompare.append(`<h5>${numSteps.toLocaleString()} steps until you reach your goal!</h5>`)
    : stepCompare.append(`<h5>You've reached your daily goal!<h5>`)

  new Chart($('#step-goal-chart'), {
    type: 'doughnut',
    data: {
      labels: ['YOUR GOAL', 'GLOBAL GOAL'],
      datasets: [{
        label: 'Your weekly steps',
        backgroundColor: ['#f7be16', '#e6e6e6'],
        borderWidth: 3,
        borderColor: 'white',
        hoverBorderColor: 'white',
        data: [dailyStepGoal, avgStep]
      }]
    },
  });
}

function displayDailyOz() {
  const waterDrank = hydrationRepository.totalOzDay(randomId, getCurrentDate(), "hydrationData");
  $(`<h5>You have drank <span>${waterDrank}</span> oz today!</h5>`).appendTo($('#daily-oz'));
}

function displayWeeklyOz() {
  let ozs = [];
  let dates = [];
  const users = hydrationRepository.getWeeksData(randomId, getCurrentDate(), "hydrationData");
  users.forEach(log => {
    dates.push(new Date(log.date).toString().slice(0, 3));
    ozs.push(log.numOunces);
  });

  new Chart($('#weekly-oz-graph'), {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Oz water drank',
        backgroundColor: '#015492',
        borderColor: '#015492',
        data: ozs
      }]
    },
  });
}

function displaySleep() {
  const userLogsHours = sleepRepository.getAllTimeAvg();
  const userLogsQuality = sleepRepository.getQualitySleepAvg();
  const lastNightSleep = sleepRepository.getDailySleepHours(getCurrentDate());
  const avgWeeklySleep = sleepRepository.weeklyAvgHours(getCurrentDate());
  const allTimeSleep = $('#all-time-sleep');

  $(`<h5>You slept <span>${lastNightSleep}</span> hours last night!</h5>`).appendTo($('#yesterday-sleep'));
  $(`<h5>You slept an average of <span>${avgWeeklySleep}</span> hours a night this week!</h5>`).appendTo($('#yesterday-sleep'));
  $(`<h5>Avg. Hours Slept : <span>${userLogsHours}</span></h5>`).appendTo(allTimeSleep);
  $(`<h5>Avg. Sleep Quality : <span>${userLogsQuality}</span></h5>`).appendTo(allTimeSleep);
  $(`<h5><span>${displayBestSleepers()}</span> great sleepers this week!</h5>`).appendTo(allTimeSleep);
}

function displaySleepChart() {
  let dates = [];
  let hoursSlept = [];
  let sleepQualities = [];
  const weeklyData = sleepRepository.weeklySleepData(getCurrentDate());
  weeklyData.forEach(day => {
    dates.push(new Date(day.date).toString().slice(0, 3));
    hoursSlept.push(day.hoursSlept);
    sleepQualities.push(day.sleepQuality);
  });

  new Chart($('#weekly-sleep'), {
    type: 'line',
    data: {
      datasets: [{
        label: 'Quality Level',
        data: sleepQualities,
        backgroundColor: '#00818a',
        borderColor: '#02646b',
      }, {
        label: 'Hours Slept',
        data: hoursSlept,
        backgroundColor: '#0153928c',
        borderColor: '#0153923c',
        type: 'line'
      }],
      labels: dates
    },
  });
}

function displayBestSleepers() {
  return sleepRepository.getBestSleepers('2019/08/29').length;
}

function displayActivity() {
  const avgStepsDay = activityRepository.getDailyStats(getCurrentDate(), 'numSteps');
  const avgMinsDay = activityRepository.getMinutesActive(getCurrentDate());
  const milesWalked = activityRepository.getMilesWalked(getCurrentDate(), userRepository.getUserData());
  const kmWalked = activityRepository.getKilometersWalked(getCurrentDate(), userRepository.getUserData());
  const dailyActivity = $('#daily-activity');

  $(`<h5>•<span>${avgStepsDay.toLocaleString()}</span> STEPS</h5>`).appendTo(dailyActivity);
  $(`<h5>•ACTIVE <span>${avgMinsDay}</span> MINS</h5>`).appendTo(dailyActivity);
  $(`<h5>•WALKED <span>${milesWalked}</span> MILES / <span>${kmWalked}</span> KM</h5>`).appendTo(dailyActivity);
}

function displayAverageWeeklyActivity() {
  const averageStairsDay = activityRepository.getAverages(getCurrentDate(), 'flightsOfStairs');
  const averageStepsDay = activityRepository.getAverages(getCurrentDate(), 'numSteps');
  const averageMinutesDay = activityRepository.getAverages(getCurrentDate(), 'minutesActive');
  const getDailyFlights = activityRepository.getDailyStats(getCurrentDate(), 'flightsOfStairs');
  const getDailySteps = activityRepository.getDailyStats(getCurrentDate(), 'numSteps');
  const getDailyMinutes = activityRepository.getDailyStats(getCurrentDate(), 'minutesActive');
  const compareActivity = $('#compare-activity');
  const status = (personal, avg) => personal > avg ? 'over' : 'under';

  $(`<h5>•<span>${Math.abs(averageStepsDay - getDailySteps).toLocaleString()}</span> steps ${status(averageStepsDay, getDailySteps)} the avg</h5>`).appendTo(compareActivity);
  $(`<h5>•<span>${Math.abs(averageMinutesDay - getDailyMinutes)}</span> mins ${status(averageMinutesDay, getDailyMinutes)} the avg</h5>`).appendTo(compareActivity);
  $(`<h5>•<span>${Math.abs(averageStairsDay - getDailyFlights)}</span> stair flights ${status(averageStairsDay, getDailyFlights)} the avg</h5>`).appendTo(compareActivity);
}

function displayWeeklyActivity() {
  let stepLogs = [];
  let dateLogs = [];
  let minuteLogs = [];
  let flightLogs = [];
  activityRepository.getWeeklyStats(getCurrentDate()).map(day => {
    stepLogs.push(day.numSteps);
    dateLogs.push(new Date(day.date).toString().slice(0, 3));
    minuteLogs.push(day.minutesActive);
    flightLogs.push(day.flightsOfStairs);
  });

  let activityChart = (location, color, elements) => {
    new Chart(location, {
      type: 'bar',
      data: {
        labels: dateLogs,
        datasets: [{
          label: 'Your weekly steps',
          backgroundColor: color,
          borderColor: color,
          data: elements
        }]
      },
    });
  }

  activityChart($('#weekly-steps-chart'), '#f7be16', stepLogs);
  activityChart($('#weekly-minutes-chart'), '#00818a', minuteLogs);
  activityChart($('#weekly-flights-chart'), '#293462', flightLogs);
}

function friendActivityData(date) {
  let friends = [];
  let findFriends = userRepository.getFriends();
  findFriends.forEach(friend => {
    let friendData = activityRepository.getUserLogs(friend, "activityData");
    let friendName = userRepository.getUserData(friend).name;
    let indexDay = friendData.findIndex(user => user.date === date);
    let friendWeeks = friendData.slice(indexDay - 6, indexDay + 1);
    displayFriendsActivity(friendWeeks, friendName, friends);
  });
  displayFriendSteps(friends);
}

function displayFriendsActivity(friendWeeks, friendName, friends) {
  let friendWeekSteps = friendWeeks.reduce((steps, day) => {
    return steps + day.numSteps;
  }, 0);
  friends.push({ name: friendName, weeklySteps: friendWeekSteps });
}

function displayFriendSteps(array) {
  let counter = 0;
  array.sort((a, b) => b.weeklySteps - a.weeklySteps);
  array.forEach(friend => {
    counter++
    $(`<li class="friend-${counter}">${counter}. <span>${friend.name}</span> <br> --- ${friend.weeklySteps.toLocaleString()} steps.</li>`).appendTo($('#friend-weekly-steps'));
  })
}

function displayTrends() {
  const stepTrends = $('#step-trends');
  let positiveTrend = activityRepository.getStepTrends(true).length;
  let negativeTrend = activityRepository.getStepTrends(false).length;
  $(`<p>Since joining you've had:</p> <p><span>${positiveTrend}</span> positive trends</p>`).appendTo(stepTrends);
  $(`<p><span>${negativeTrend}</span> negative trends</p>`).appendTo(stepTrends);
}

function getCurrentDate() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }

  today = `${yyyy}/${mm}/${dd}`;
  return today;
}

function displayCurrentDate(day) {
  $('#date').text(`${new Date(day).toString().slice(0, 10)}`);
}
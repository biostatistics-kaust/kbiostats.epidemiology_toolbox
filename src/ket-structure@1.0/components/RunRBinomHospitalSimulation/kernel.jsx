import { jStat } from "jstat";
import * as math from "mathjs";

//http://www.nrbook.com/devroye/
//Non-Uniform Random Variate Generation
//Luc Devroye
const rnbinom_single_approx = (r, p) => {
  // @Author: SpecialSauce
  // @url: https://stackoverflow.com/a/40776137
  // assume p and r are the parameters to the neg. binomial dist.
  // r = number of failures (you'll set to one for your purpose)
  // p = probability of a "failures"
  // @Note: It was modified to return an approximation of the sampling value.
  // @Note: It was changed to math with rnbinom definition
  p = 1 - p; // Keep it this way in order to later calculate (1 - p) only once
  let factor = 1;
  const MAX_R = 1000;
  if (r > MAX_R) {
    factor = r / MAX_R;
    r = MAX_R;
  }
  let rnd = Math.random(); // [0.0, 1.0)
  let k = 0; // represents the // of successes that occur before 1st failure
  let lastPmf = (1 - p) ** r;
  let cdf = lastPmf;
  while (cdf < rnd) {
    lastPmf *= (p * (k + r) / (k + 1));
    cdf += lastPmf;
    k++;
    if (k > MAX_R * 20) break;
  }
  //return k * factor;
  return Math.round(k * factor);
// or return (k+1) to also count the trial on which the failure occurred
}

//http://www.nrbook.com/devroye/
//Non-Uniform Random Variate Generation
//Luc Devroye
const rnbinom_single = (r, p) => {
  r = Math.max(1, Number.isFinite(r) ? r : 1);
  p = Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0.5));
  let lambda_ = jStat.gamma.sample(r, (1 - p) / p);
  // MAX ALLOWED: 1e7
  const s = Math.min(1e7, Math.max(0, jStat.poisson.sample(lambda_)));
  return Number.isFinite(s) ? s : 0;
}

const rnbinom = (n, r, p) => [...Array(n).keys()].map(v => rnbinom_single(r, p))

console.time("rbinom1")
console.warn("TESTING approx-rnbinom",
  "Expected:",
  13110002 * (1 - 0.123) / 0.123,
  "Obtained:",
  jStat.mean(rnbinom(1000, 13110002, 0.123)),
)
console.timeEnd("rbinom1")


//////////////////////////////////////////////////////
////// Auxiliary functions //////
//////////////////////////////////////////////////////

////// days_until_hospitalization //////

// Once infected, number of days until the need of hospitalization. 
// Note: We have to choose a better distribution.
// in rnbinom: rnbinom(1, mu=4, size=Inf)
// prob = size/(size+mu). The variance is mu + mu^2/size in this parametrizatio
const days_until_hospitalization = ({mean_days_at_hospital = 4, max_hospitalized_days =365 * 3} = {}) => rnbinom_single(max_hospitalized_days, (max_hospitalized_days) / (max_hospitalized_days + 4));
////// hospitalized_arrivals //////

// Given a vector of new hospitalizations per day, allocate their arrivals based on the distribution in
// days_until_hospitalization().
const get_hospitalized_arrivals = (hospitalized, parameters = {}) => {

  // Input:
  // hospitalized: a vector with the number of new hospitalzations required per day.

  // Output:
  // hospitalized_arrivals: a vector with the number of arrivals for hospitalization per day.

  const arrivals_vector = hospitalized.map(hospitalized_case => [...Array(hospitalized_case).keys()].map(i => i + days_until_hospitalization(parameters))).flat();
  const arrivals_df = arrivals_vector.reduce((names, name) => {
    const count = names[name] || 0;
    names[name] = count + 1;
    return names;
  }, {});
  let arrivals = [...Array(Math.max(...Object.keys(arrivals_df)))].map(p => 0);
  Object.keys(arrivals_df).forEach(k => {
    arrivals[k] = arrivals_df[k];
  });
  return arrivals;
}


//////  length_of_hospitalization //////

// Given a vector of arrivals for hospitalization per day, 
// computes the duration of the hospitalization per arrival, in days.
const length_of_hospitalization = (arrivals_vector, u_hosp, disp_hosp) => {

  // Input:
  // arrivals_vector: a vector with the number of arrivals for hospitalization per day.
  // u_hosp: the average length of hospitalization for arrivals, in days.
  // Obs.: mean of a Negative Binomial distribution.
  // disp_hosp: disersion parameter for the Negative Binomial distribution with mean u_hosp.

  // Output:
  // length_of_hospitalization: a data frame with the day of arrival and the length of stay.
  // Each row is a patient.

  //[].concat(...[1, 2, 0, 3].filter(x => x>0).map(x=>[[x, 1], [x, 1]]))
  return {
    day_of_arrival: [].concat(...arrivals_vector.filter(arrival => arrival > 0).map((arrival, i) => [...Array(arrival).keys()].map(j => i + 1))),
    length_of_stay: [].concat(...arrivals_vector.filter(arrival => arrival > 0).map(arrival => [...Array(arrival).keys()].map(j => rnbinom_single(disp_hosp, (disp_hosp) / (disp_hosp + u_hosp))))),
  }
}

////// total_hospitalization_per_day //////

// Summarises the total number of patients hospitalized per day
const total_hospitalization_per_day = (df_stay, last_discharge) => {

  // Input:
  // df_stay: a data frame containing one column for with the day of arrival and 
  // another column with the lenght of hospitalization.
  // last_discharge: day with the last day of discharge.

  // Output:
  // hosp_per_day: a data frame with the total number of patients hospitalized per day.
  let df_stay_days = [...Array(df_stay.length_of_stay.length).keys()]
  let days = [...Array(last_discharge).keys()].map(d0 => d0 + 1)
  let count = days.map(day0 => df_stay_days.filter(d => day0 >= df_stay.day_of_arrival[d] && day0 < df_stay.length_of_stay[d] + df_stay.day_of_arrival[d]).length
  )
  return {
    day: days,
    count,
  }
}
//total_hospitalization_per_day(nc_stay, 10)

//////////////////////////////////////////
////// Main function //////
//////////////////////////////////////////
export const hospitalization = (susceptible, {pop_size, per_symp, per_hosp, per_ccu, u_hosp_nc, disp_hosp_nc, u_hosp_cc, disp_hosp_cc, min_discharge=null, adjustedPopulationFactor=1} = {}) => {
  susceptible = susceptible.map(s => s * adjustedPopulationFactor)
  ////////////////////////////
  //////// Input //////
  ////////////////////////////

  //// susceptible: susceptible (mean) curve from SIR Model

  // pop_size: population size (of a community, city, country, etc.).

  // per_symp: chance of developing symptoms among the infected.

  // per_hosp: chance of been hospitalized among the symptomatic.

  // per_ccu: chance of been conducted to a critical care unit among the hospitalized.

  // u_hosp_nc: rhe average length of hospitalization for those in a normal care room, 
  // in days - mean (mu) of a Negative Binomial distribution.

  // disp_hosp_nc: disersion parameter for the Negative Binomial distribution with mean u_hosp_nc. 
  // Obs: var = mu + (mu^2) / phi, where phi = disp_hosp.

  // u_hosp_cc: the average length of hospitalization for those in a critical care room, 
  // in days - mean (mu) of a Negative Binomial distribution.

  // disp_hosp_cc: disersion parameter for the Negative Binomial distribution with mean u_hosp_cc. 

  ////////////////////////////
  ////// Output //////
  ////////////////////////////

  // A list of data frames containing:

  // arrival: a data frame containing the day of arrival and length of stay for each patient.
  // For both normal care and critical care rooms.
  // Obs. nrow(arrival) is the total number of (distinct) patients hospitalized.


  // total_hosp_per_day: a data frame containing the total number of patients hospitalized (count) per day.
  // For both normal care and critical care rooms.



  ////// Observed susceptible through time.
  //obs_susceptible <- vector("numeric", length = length(susceptible))
  //for (i in seq_along(susceptible)) obs_susceptible[i] <- rnbinom(1, pop_size, susceptible[i]/pop_size)

  ////// Observed new infected cases through time.
  const infected = [pop_size - susceptible[0], ...jStat.diff(susceptible).map(s => s > 0 ? 0 : -s)];

  // Observed symptomatic among new infected through time.
  const symptomatic = infected.map(infec => rnbinom(1, infec, per_symp));

  // Observed new cases requiring hospitalization through time.
  const hospitalized = symptomatic.map(s => rnbinom(1, s, per_hosp));

  // Allocating the hospitalization arrivals through time.
  const hospitalized_arrivals = get_hospitalized_arrivals(hospitalized);

  // Splitting the hospitalization arrivals into normal care rooms and critical care rooms.
  const critical_care_arrivals = hospitalized_arrivals.map(a => Math.floor(a * per_ccu));
  const normal_care_arrivals = hospitalized_arrivals.map((a, i) => a - critical_care_arrivals[i]);

  // Computing the duration of the hospitalization for the different types of room 
  // and saving it into a data frame (stay).
  const nc_stay = length_of_hospitalization(normal_care_arrivals, u_hosp_nc, disp_hosp_nc)
  const cc_stay = length_of_hospitalization(critical_care_arrivals, u_hosp_cc, disp_hosp_cc)

  const join_dicts = (a, b) => Object.fromEntries(Object.keys(a).map(k => [k, [].concat(a[k], b[k])]));
  const add_cols = (a, v) => a[Object.keys(a)[0]].map(k => v);

  /*const arrivals = {
    room_type: [].concat(add_cols(nc_stay, "normal"), add_cols(cc_stay, "critical")),
    ...join_dicts(nc_stay, cc_stay),
  }*/
  const arrivals = {
    normal: nc_stay,
    critical: cc_stay,
  }

  // Computing the last day of hospital discharge (last_discharge).
  const nc_last_discharge = Math.max(...nc_stay.day_of_arrival.map((v, i) => nc_stay.day_of_arrival[i] + nc_stay.length_of_stay[i]));
  const cc_last_discharge = Math.max(...cc_stay.day_of_arrival.map((v, i) => cc_stay.day_of_arrival[i] + cc_stay.length_of_stay[i]));
  const last_discharge = min_discharge || Math.max(nc_last_discharge, cc_last_discharge);

  // Computing the total number of patients hospitalized per day. 
  // Both for those in normal care rooms and critical care rooms.
  // Saving the result into a data frame (total_hosp_per_day).
  const nc_total_hosp_per_day = total_hospitalization_per_day(nc_stay, last_discharge);
  const cc_total_hosp_per_day = total_hospitalization_per_day(cc_stay, last_discharge);
  /*const total_hosp_per_day = {
    room_type: [].concat(add_cols(nc_total_hosp_per_day, "normal"), add_cols(cc_total_hosp_per_day, "critical")),
    ...join_dicts(nc_total_hosp_per_day, cc_total_hosp_per_day),
  }*/

  // Saving the final result into a list of data frames.
  /*return {
    arrivals,
    total_hosp_per_day
  };*/
  return {
    arrivals,
    //matrix_hospitalization_count: [...Array(last_discharge).keys()].map(t => [nc_total_hosp_per_day.count[t], cc_total_hosp_per_day.count[t]]),
    hospitalization_count: {
      time: nc_total_hosp_per_day.day,
      beds: nc_total_hosp_per_day.count,
      icus: cc_total_hosp_per_day.count,
    }
  }
}

// Test
hospitalization([1, 23, 1, 1, 2, 3, 2, 1, 2, 3, 1, 3],
  {
    pop_size: 200,
    per_symp: .2,
    per_hosp: .3,
    per_ccu: 0.2,
    u_hosp_nc: 100,
    disp_hosp_nc: 2,
    u_hosp_cc: 20,
    disp_hosp_cc: 2
  })

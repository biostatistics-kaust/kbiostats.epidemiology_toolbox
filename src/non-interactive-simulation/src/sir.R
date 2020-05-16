library("tidyverse")
library("lubridate")
library("deSolve")

###########################
### SIR Model Functions ###
###########################

#################################################################################
### Function to set up the system of differential equations of the SIR Model. ###
#################################################################################
SIR_model <- function(time, state, parameters) {
  with(as.list(c(state, parameters)), {
    if ((mitigation_interval_start <= time && time <= mitigation_interval_end)) {
      qval = mitigation_factor
    } else {
      qval = 1
    }
    dS <- -qval * beta * S * I
    dI <-  qval * beta * S * I - gamma * I
    dR <-  gamma * I
    return(list(c(dS, dI, dR)))
  })
}

##############################################################
### Function to simulate one realization of the SIR model. ###
##############################################################
SIR_sim <- function(init, beta0, gamma0, mitigation_factor0, sim_time, 
                    start_date = lubridate::now(), mitigation_interval = c(0, 10000), 
                    return_df = TRUE, pop_size = pop_size){
  # Input:
  # beta0: Initial value for beta: a parameter controlling how much the disease can be transmitted through exposure.
  # gamma0: Initial value for gamma: a parameter expressing how much the disease can be recovered in a specific period.
  # mitigation_factor0: ???
  # sim_time: Time horizon, in days, in which the epidemiologic curves should be projected.
  # start_date: Initial date, lubridate format, pointing the epidemic onset.
  # mitigation_interval: ???
  # return_df: Should the function return the dataframe (TRUE) or the ODE solution (FALSE)?
  # pop_size: Population size (Of a community, city, country, etc.).
  
  # Output:
  # A data frame containing the epidemiologic curves S, I, and R (return_df = TRUE) or 
  # the solution for the SIR model ODE system (return_df = FALSE).
  parameters <- c(beta = beta0, 
                  gamma = gamma0, 
                  mitigation_factor = mitigation_factor0, 
                  mitigation_interval_start = mitigation_interval[1], 
                  mitigation_interval_end = mitigation_interval[2])
  times <- seq(0, sim_time - 1, by = 1)
  solution <- ode(y = init, times = times, func = SIR_model, parms = parameters)
  if (return_df) {
    S = solution[, "S"] * pop_size
    I = solution[, "I"] * pop_size
    R = solution[, "R"] * pop_size
    t = solution[, "time"]
    date = start_date + lubridate::days(t)
    data = (data.frame(t = t, date = date, S = S, I = I, R = R));
    return(data)
  } else {
    return(solution)
  }
}

###################################################################
### Function to run a Monte Carlo simulation for the SIR Model. ###
###################################################################
set_sim <- function(sim_MC_SIR, pop_size, inf_0, rec_0, start_date, sim_time, 
                    beta_range, gamma_range, mitigation_factor0 = 1, 
                    mitigation_interval = c(0, 10000)){
  # Input:
  # sim_MC_SIR: The number of Monte Carlo simulation to be run.
  # pop_size: Population size (Of a community, city, country, etc.).
  # inf_0: Initial number of infected people at the "start_date".
  # rec_0: Number of recovered people.
  # start_date: The epidemic onset (lubridate format).
  # sim_time: Time horizon, in days, in which the epidemiologic curves should be projected.
  # beta_range: An interval for beta randomization.
  # gamma_range: An interval for gamma randomization.
  # mitigation_factor0: ???
  # mitigation_interval: ???
  
  # Output:
  # A data frame containing the .25, .50, and, .75 percentiles for the epidemiologic curves S, I, and R. 
  # Also, there is a column with the dates.
  
  init <- c(S = 1 - (inf_0 / pop_size), I = inf_0 / pop_size, R = rec_0 / pop_size)
  
  S = matrix(0, nrow = sim_time, ncol = sim_MC_SIR)
  I = matrix(0, nrow = sim_time, ncol = sim_MC_SIR)
  R = matrix(0, nrow = sim_time, ncol = sim_MC_SIR)
  for (i in 1:sim_MC_SIR) {
    beta0 = runif(1, min = beta_range[1], max = beta_range[2])
    gamma0 = runif(1, min = gamma_range[1], max = gamma_range[2])
    curve = SIR_sim(init, beta0, gamma0, mitigation_factor0, sim_time = sim_time, return_df = FALSE, mitigation_interval = mitigation_interval)
    S[, i] = curve[, "S"] * pop_size
    I[, i] = curve[, "I"] * pop_size
    R[, i] = curve[, "R"] * pop_size
    curve = NULL
  }
  
  get.quantiles = function(X, preffix){
    qX = apply(X, 1, function(x) quantile(x, probs = c(0.25, 0.5, 0.75)))
    rownames(qX) = stringr::str_replace(paste0(preffix, rownames(qX)), "%", "")
    return(qX)
  }
  
  qS = get.quantiles(S, "S.")
  qI = get.quantiles(I, "I.")
  qR = get.quantiles(R, "R.")
  
  qCurves = data.frame(t(rbind(qS, qI, qR)))
  qCurves$date = start_date + lubridate::days(seq(0, length.out = sim_time))
  return(qCurves)
}
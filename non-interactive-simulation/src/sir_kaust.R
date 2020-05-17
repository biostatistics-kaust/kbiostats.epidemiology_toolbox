rm(list = ls())

# Reading the function of the hospitalization model
source("./src/sir.R")

kaust_sir <- set_sim(
  sim_MC_SIR = 10000, 
  pop_size = 7225 , 
  inf_0 = 2, 
  rec_0 = 0, 
  start_date = lubridate::date("2020-05-03"), 
  sim_time = 365, 
  beta_range = c(0.050, 0.085), 
  gamma_range = c(0.045, 0.050), 
  mitigation_factor0 = 1, 
  mitigation_interval = c(0, 10000)
)

write_rds(kaust_sir, path = ("./outputs/sir_kaust.RDS"))
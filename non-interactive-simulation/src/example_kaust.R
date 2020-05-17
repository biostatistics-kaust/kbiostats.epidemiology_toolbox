rm(list = ls())

# Packages used to plot
library("tidyverse")
library("ggplot2")
library("ggstance")
library("cowplot")
library("lubridate")
library("deSolve")

# Reading the function of the hospitalization model
source("./src/hospitalization.R")
source("./src/plot_functions.R")

# Reading KAUST SIR simulation
sir_kaust <- read_rds(path = "./outputs/sir_kaust.RDS") 
susceptible <- floor(pull(sir_kaust, S.50))

# KAUST Population
pop_size <- 7225

# KAUST Population per age group: 0-9, 10-19, ..., 70-79, 80+
kaust_demographics = c(1239, 877, 1400, 1918, 1156, 474, 133, 25, 3) / pop_size

# Imperial College - Hospitalization proportion per age group
SCRH = c(0.1, 0.3, 1.2, 3.2, 4.9, 10.2, 16.6, 24.3, 27.3) / 100

# Setting the model paramenters
# % of symptomatic among infected
per_symp <- 0.70  

# change of hospitalization among symptomatic
(per_hosp <- sum(kaust_demographics * SCRH) + 0.00)

# % of ccu among those in need of hospitalization
per_ccu <- 0.10 

# Neg. Binomial parameters - duration of hospitalization for those in normal care rooms
u_hosp_nc <- 12; disp_hosp_nc <- 3.9 

# Neg. Binomial parameters - duration of hospitalization for those in critical care rooms
u_hosp_cc <- 22; disp_hosp_cc <- Inf 

# Runing the Hospitalization Model
hosp_df <- hospitalization(susceptible, pop_size, 
  per_symp, per_hosp, per_ccu, 
  u_hosp_nc, disp_hosp_nc,
  u_hosp_cc, disp_hosp_cc)

# Plotting SIR Model for KAUST
plot_sir(sir_kaust, pop_size)

# Plotting total number of hospitalization per day
hosp_daily_plot(hosp_df, sir_kaust)

# Plotting arrivals and duration of hospitalization
hosp_duration_plot(hosp_df, sir_kaust)
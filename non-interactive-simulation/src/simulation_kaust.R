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

n_mc <- 100
hosp_df <- list()
for (i in 1:n_mc) {
  aux <- hospitalization(susceptible, pop_size, 
    per_symp, per_hosp, per_ccu, 
    u_hosp_nc, disp_hosp_nc,
    u_hosp_cc, disp_hosp_cc)
  hosp_df[[i]] <- aux$total_hosp_per_day
  hosp_df[[i]]$simu_id <- i
} 
hosp_df <- do.call("rbind", hosp_df)

hosp_quantiles <- hosp_df %>% 
  group_by(day, room_type) %>% 
  summarise(median = ceiling(quantile(count, .50)),
            q_75 = ceiling(quantile(count, .75)),
            q_975 = ceiling(quantile(count, .975)))

max_day <- max(hosp_quantiles$day)
date <- seq(min(sir_kaust$date), min(sir_kaust$date) + max_day, by = "days")
hosp_quantiles$date <- date[hosp_quantiles$day]


hosp_daily_plot <- hosp_quantiles %>% 
  mutate(room_type = factor(room_type, ordered = T,
                            levels = c("normal", "critical")),
         room_type = recode(room_type, normal = "Normal Care", critical = "Critical Care")) %>% 
  ggplot(aes(x = date, y = median)) +
  geom_line(size = 1.2) +
  geom_line(aes(x = date, y = q_75)) +
  geom_line(aes(x = date, y = q_975)) +
  facet_wrap(~room_type) +
  scale_x_date(date_breaks = "45 day", date_labels = "%d %b", expand = c(0, 0)) +
  scale_y_continuous(breaks = number_ticks(6), expand = c(0, 0)) +
  scale_color_manual(values = c("orange", "red2")) +
  labs(x = NULL, y = "# Hospitalization",
       color = "Room Type:") +
  ggtitle("Total Cases of Hospitalizations",
          subtitle = "KAUST COVID-19 Evolution") +
  my_theme

print(hosp_daily_plot)


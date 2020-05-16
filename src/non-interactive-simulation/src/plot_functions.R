# Better limits for plotting ###
number_ticks <- function(n) {function(limits) pretty(limits, n)}

# Set up to theme()
my_theme <- ggplot2::theme_linedraw() + 
  theme(
    legend.position = "bottom",
    legend.text = element_text(size = 24),
    legend.title = element_text(size = 24),
    legend.key.size = unit(3,"line"),
    axis.ticks = element_blank(),
    plot.title = element_text(size = 36, face = "bold"),
    plot.subtitle = element_text(size = 30, face = "bold"),
    axis.text.x = element_text(size = 24, angle = 45, hjust = 1),
    axis.text.y = element_text(size = 24),
    axis.title = element_text(size = 28, face = "bold"),  
    panel.grid.minor = element_blank()
  )

# Plot susceptible and new infected from SIR model
plot_sir <- function(sir_kaust, pop_size) {
  
  # Mean susceptible through time - from SIR model.
  susceptible <- pull(sir_kaust, S.50)
  
  # Obserbed susceptible through time.
  obs_susceptible <- vector("numeric", length = length(susceptible))
  for (i in seq_along(susceptible)) obs_susceptible[i] <- rbinom(1, pop_size, susceptible[i]/pop_size)
  
  ### Observed new infected cases through time.
  infected <- c(pop_size - susceptible[1], -diff(susceptible))
  infected <- floor(replace(infected, infected < 0, 0))
  
  curves <- tibble(date = sir_kaust$date, obs_susceptible, infected)
  
  susceptible_plot <- curves %>% 
    ggplot(aes(date, obs_susceptible)) +
    geom_line(size = 1.2, col = "red2") +
    scale_x_date(date_breaks = "45 day", date_labels = "%d %b") +
    scale_y_continuous(breaks = number_ticks(6)) +
    labs(x = NULL, y = "# Susceptible") +
    ggtitle("KAUST COVID-19 Evolution",
            subtitle = "a) Susceptible Cases - SIR Model") +
    my_theme
  
  new_infected_plot <- curves %>% 
    ggplot(aes(date, infected)) +
    geom_line(size = 1.2, col = "red2") +
    scale_x_date(date_breaks = "45 day", date_labels = "%d %b") +
    scale_y_continuous(breaks = number_ticks(6)) +
    labs(x = NULL, y = "# New Infected") +
    ggtitle("",
            subtitle = "b) New Infected Cases - SIR Model") +
    my_theme
  
  return(plot_grid(susceptible_plot, new_infected_plot))
  
}

# Plot the number of hospitalizations over time
hosp_daily_plot <- function(hosp_df, sir_kaust) {
  
  max_day <- max(hosp_df$total_hosp_per_day$day)
  date <- seq(min(sir_kaust$date), min(sir_kaust$date) + max_day, by = "days")
  hosp_df$total_hosp_per_day$date <- date[hosp_df$total_hosp_per_day$day]
  
  hosp_daily_plot <- hosp_df$total_hosp_per_day %>% 
    mutate(room_type = factor(room_type, ordered = T,
                              levels = c("normal", "critical")),
           room_type = recode(room_type, normal = "Normal Care", critical = "Critical Care")) %>% 
    ggplot(aes(x = date, y = count, colour = room_type)) +
    geom_line(size = 1.2) +
    scale_x_date(date_breaks = "45 day", date_labels = "%d %b", expand = c(0, 0)) +
    scale_y_continuous(breaks = number_ticks(6), expand = c(0, 0)) +
    scale_color_manual(values = c("orange", "red2")) +
    labs(x = NULL, y = "# Hospitalization",
         color = "Room Type:") +
    ggtitle("Total Cases of Hospitalizations",
            subtitle = "KAUST COVID-19 Evolution") +
    my_theme
  
  return(hosp_daily_plot)
  
}

# Plot the arrivals and duration of each hospitalization
hosp_duration_plot <- function(hosp_df, sir_kaust) {
  
  hosp_df$arrivals %>% 
    mutate(
      room_type = factor(room_type, ordered = T, levels = c("normal", "critical")),
      room_type = recode(room_type, normal = "Normal Care", critical = "Critical Care")
    ) -> arrivals
  
  if (length(unique(arrivals$room_type)) == 1) {
    
    tryCatch(
      suppressWarnings(
    arrivals <- arrivals %>% 
      dplyr::filter(room_type == unique(arrivals$room_type)) %>%
      arrange(day_of_arrival) %>% 
      mutate(n = n(),
             id = 1:n,
             day_of_departure = day_of_arrival + length_of_stay - 1) 
      )
    )
    
    max_day <- max(arrivals$day_of_departure)
    date <- seq(min(sir_kaust$date), min(sir_kaust$date) + max_day, by = "days")
    arrivals$date_of_arrival <- date[arrivals$day_of_arrival]
    arrivals$date_of_departure <- date[arrivals$day_of_departure]
    
    arrivals_plot <- arrivals %>% 
      ggplot() +
      geom_linerangeh(aes(y = id, xmin = date_of_arrival, xmax = date_of_departure, colour = room_type),
                      size = 0.40) +
      scale_x_date(date_breaks = "45 day", date_labels = "%d %b", expand = c(0, 0)) +
      scale_y_continuous(breaks = number_ticks(6), expand = c(0, 0)) +
      labs(x = NULL, y = "# Patients",  color = "Room Type:") +
      ggtitle("Duration of Hospitalizations",
              subtitle = "KAUST COVID-19 Evolution") +
      scale_color_manual(values = c("orange", "red2")) +
      guides(color = guide_legend(override.aes = list(size = 2))) +
      my_theme
  } else {
    
    tryCatch(
      suppressWarnings(
    nc_arrivals <- arrivals %>% 
      dplyr::filter(room_type == "Normal Care") %>%
      arrange(day_of_arrival) %>% 
      mutate(n = n(),
             id = 1:n,
             day_of_departure = day_of_arrival + length_of_stay - 1) 
      )
    )
    
    tryCatch(
      suppressWarnings(
    cc_arrivals <- arrivals %>% 
      dplyr::filter(room_type == "Critical Care") %>%
      arrange(day_of_arrival) %>% 
      mutate(n = n(),
             id = 1:n,
             day_of_departure = day_of_arrival + length_of_stay - 1) 
      )
    )
    
    full_arrivals <- rbind(nc_arrivals, cc_arrivals)
    
    max_day <- max(full_arrivals$day_of_departure)
    date <- seq(min(sir_kaust$date), min(sir_kaust$date) + max_day, by = "days")
    full_arrivals$date_of_arrival <- date[full_arrivals$day_of_arrival]
    full_arrivals$date_of_departure <- date[full_arrivals$day_of_departure]
    
    arrivals_plot <- full_arrivals %>% 
      ggplot() +
      geom_linerangeh(aes(y = id, xmin = date_of_arrival, xmax = date_of_departure, colour = room_type),
                      size = 0.40) +
      scale_x_date(date_breaks = "45 day", date_labels = "%d %b", expand = c(0, 0)) +
      scale_y_continuous(breaks = number_ticks(6), expand = c(0, 0)) +
      facet_wrap(~room_type, scale = "free_y") +
      labs(x = NULL, y = "# Patients") +
      ggtitle("Duration of Hospitalizations",
              subtitle = "KAUST COVID-19 Evolution") +
      scale_color_manual(values = c("orange", "red2")) +
      guides(color = guide_legend(override.aes = list(size = 2))) +
      my_theme + theme(legend.position = "none",
                       strip.text = element_text(size = 24))
    
  }
  
  return(arrivals_plot)
}

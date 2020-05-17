hospitalization <- function(susceptible, pop_size, 
                            per_symp, per_hosp, per_ccu, 
                            u_hosp_nc, disp_hosp_nc,
                            u_hosp_cc, disp_hosp_cc) {
  #############
  ### Input ###
  #############
   
  # susceptible: susceptible (mean) curve from SIR Model
  
  # pop_size: population size (of a community, city, country, etc.).
  
  # per_symp: chance of developing symptoms among the infected.
  
  # per_hosp: chance of been hospitalized among the symptomatic.
  
  # per_ccu: chance of been conducted to a critical care unit among the hospitalized.
  
  # u_hosp_nc: rhe average length of hospitalization for those in a normal care room, 
  # in days - mean (mu) of a Negative Binomial distribution.
  
  # disp_hosp_nc: disersion parameter for the Negative Binomial distribution with mean u_hosp_nc. 
  # Obs: var = mu + (mu^2) / phi, where phi = disp_hosp.
  
  # u_hosp_cc: the average length of hospitalization for those in a critical care room, 
  # in days - mean (mu) of a Negative Binomial distribution.

  # disp_hosp_cc: disersion parameter for the Negative Binomial distribution with mean u_hosp_cc. 
    
  ##############
  ### Output ###
  ##############
  
  # A list of data frames containing:
  
  # arrival: a data frame containing the day of arrival and length of stay for each patient.
  # For both normal care and critical care rooms.
  # Obs. nrow(arrival) is the total number of (distinct) patients hospitalized.
  
  
  # total_hosp_per_day: a data frame containing the total number of patients hospitalized (count) per day.
  # For both normal care and critical care rooms.
  
  ###########################
  ### Auxiliary functions ###
  ###########################
  
  ### days_until_hospitalization ###
  
  # Once infected, number of days until the need of hospitalization. 
  # Note: We have to choose a better distribution.
  days_until_hospitalization <- function() {
    
    mu_nb <- 4; size_nb <- Inf
    #(sd_nb <- sqrt(mu_nb + (mu_nb ** 2) / size_nb)) # Verify the sd of the negative binomial distribution
    days_until_hospitalization <- rnbinom(1, mu = mu_nb, size = size_nb)
    
    return(days_until_hospitalization)
  
  }
  ### hospitalized_arrivals ###
  
  # Given a vector of new hospitalizations per day, allocate their arrivals based on the distribution in
  # days_until_hospitalization().
  hospitalized_arrivals <- function(hospitalized) {
    
    # Input:
    # hospitalized: a vector with the number of new hospitalzations required per day.
    
    # Output:
    # hospitalized_arrivals: a vector with the number of arrivals for hospitalization per day.
    
    arrivals_vector <- list()
    for (i in seq_along(hospitalized)) {
      aux <- vector("numeric", length = hospitalized[i])
      for (j in 1:hospitalized[i]) {
        aux[j] <- i + days_until_hospitalization()
      }  
      arrivals_vector[[i]] <- aux
    }
    arrivals_vector <- do.call("c", arrivals_vector)
    arrivals_df <- aggregate(data.frame(count = arrivals_vector), list(value = arrivals_vector), length)
    hospitalized_arrivals <- vector("numeric", length = max(arrivals_vector))
    hospitalized_arrivals[arrivals_df$value] <- arrivals_df$count
    
    return(hospitalized_arrivals)
  
  }  
  
  ###  length_of_hospitalization ###
  
  # Given a vector of arrivals for hospitalization per day, 
  # computes the duration of the hospitalization per arrival, in days.
  length_of_hospitalization <- function(arrivals_vector, u_hosp, disp_hosp) {
    
    # Input:
    # arrivals_vector: a vector with the number of arrivals for hospitalization per day.
    # u_hosp: the average length of hospitalization for arrivals, in days. 
    # Obs.: mean of a Negative Binomial distribution.
    # disp_hosp: disersion parameter for the Negative Binomial distribution with mean u_hosp.
    
    # Output:
    # length_of_hospitalization: a data frame with the day of arrival and the length of stay.
    # Each row is a patient.
    
    length_of_hospitalization <- list()
    for (i in seq_along(arrivals_vector)) {
      if (arrivals_vector[i] != 0) {
        length_of_stay <- vector("numeric", length = arrivals_vector[i])
        for (j in 1:arrivals_vector[i]) {
          length_of_stay[j] <- rnbinom(1, mu = u_hosp, size = disp_hosp)
        }
        length_of_hospitalization[[i]] <- data.frame(day_of_arrival = i, length_of_stay = length_of_stay)
      }
    }  
    length_of_hospitalization <- do.call("rbind", length_of_hospitalization)
    
    return(length_of_hospitalization)
  
  }
  
  ### total_hospitalization_per_day ###
  
  # Summarises the total number of patients hospitalized per day
  total_hospitalization_per_day <- function(df_stay, last_discharge) {
    
    # Input:
    # df_stay: a data frame containing one column for with the day of arrival and 
    # another column with the lenght of hospitalization.
    # last_discharge: day with the last day of discharge.
    
    # Output:
    # hosp_per_day: a data frame with the total number of patients hospitalized per day.
    
    total_hosp_per_day <- matrix(0, nrow = nrow(df_stay), ncol = last_discharge)
    for (row in 1:nrow(df_stay)) {
      day_of_arrival <- df_stay$day_of_arrival[row]
      day_of_departure <- day_of_arrival + df_stay$length_of_stay[row] - 1
      total_hosp_per_day[row, day_of_arrival:day_of_departure] <- 1
    }
    
    hosp_per_day <- data.frame(day = 1:last_discharge,
                         count = colSums(total_hosp_per_day))
    
    return(hosp_per_day)
  
  }
  
  #####################
  ### Main function ###
  #####################
  
  ### Obserbed susceptible through time.
  obs_susceptible <- vector("numeric", length = length(susceptible))
  for (i in seq_along(susceptible)) obs_susceptible[i] <- rbinom(1, pop_size, susceptible[i]/pop_size)
  
  ### Observed new infected cases through time.
  infected <- c(pop_size - susceptible[1], -diff(susceptible))
  infected <- floor(replace(infected, infected < 0, 0))

  # Observed symptomatic among new infected through time.
  symptomatic <- vector("numeric", length = length(susceptible))
  for (i in seq_along(susceptible)) symptomatic[i] <- rbinom(1, infected[i], per_symp)

  # Observed new cases requiring hospitalization through time.
  hospitalized <- vector("numeric", length = length(susceptible))
  for (i in seq_along(susceptible)) hospitalized[i] <- rbinom(1, symptomatic[i], per_hosp)

  # Allocating the hospitalization arrivals through time.
  hospitalized_arrivals <- hospitalized_arrivals(hospitalized)

  # Splitting the hospitalization arrivals into normal care rooms and critical care rooms.
  critical_care_arrivals <- floor(hospitalized_arrivals * per_ccu)
  normal_care_arrivals <- hospitalized_arrivals - critical_care_arrivals

  # Computing the duration of the hospitalization for the different types of room 
  # and saving it into a data frame (stay).
  nc_stay <- length_of_hospitalization(normal_care_arrivals, u_hosp_nc, disp_hosp_nc)
  cc_stay <- length_of_hospitalization(critical_care_arrivals, u_hosp_cc, disp_hosp_cc)
  
  if (class(cc_stay) != "NULL") {
    nc_stay$room_type <- "normal"
    cc_stay$room_type <- "critical"
    stay <- rbind(nc_stay, cc_stay)
    
    # Computing the last day of hospital discharge (last_discharge).
    nc_last_discharge <- max(nc_stay$day_of_arrival + nc_stay$length_of_stay)
    cc_last_discharge <- max(cc_stay$day_of_arrival + cc_stay$length_of_stay)
    last_discharge <- max(nc_last_discharge, cc_last_discharge)
    
    # Computing the total number of patients hospitalized per day. 
    # Both for those in normal care rooms and critical care rooms.
    # Saving the result into a data frame (total_hosp_per_day).
    nc_total_hosp_per_day <- total_hospitalization_per_day(nc_stay, last_discharge)
    cc_total_hosp_per_day <- total_hospitalization_per_day(cc_stay, last_discharge)
    nc_total_hosp_per_day$room_type <- "normal"
    cc_total_hosp_per_day$room_type <- "critical"
    total_hosp_per_day <- rbind(nc_total_hosp_per_day, cc_total_hosp_per_day )
    
  } else {
      nc_stay$room_type <- "normal"
      stay <- nc_stay
      
      # Computing the last day of hospital discharge (last_discharge).
      last_discharge <- max(nc_stay$day_of_arrival + nc_stay$length_of_stay)
      
      # Computing the total number of patients hospitalized per day. 
      # Both for those in normal care rooms and critical care rooms.
      # Saving the result into a data frame (total_hosp_per_day).
      nc_total_hosp_per_day <- total_hospitalization_per_day(nc_stay, last_discharge)
      nc_total_hosp_per_day$room_type <- "normal"
      total_hosp_per_day <- nc_total_hosp_per_day
  }  

  # Saving the final result into a list of data frames.
  output <- list(arrivals = stay, 
                 total_hosp_per_day = total_hosp_per_day)
  
  return(output)
  
}
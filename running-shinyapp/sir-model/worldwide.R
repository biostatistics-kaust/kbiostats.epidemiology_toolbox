read_population = function(country) {
  if(country == "World") return(7800000000)
  if(country == "United States" || country == "United States of America" || country == "USA"){
    country = "United States"
  }
  if(!file.exists("world-population.csv")){
    url = 'https://raw.githubusercontent.com/datasets/population/master/data/population.csv'
    population = read.csv(url, check.names=FALSE);
    write.csv(population, "world-population.csv")
  }else{
    population= read.csv("world-population.csv", check.names=FALSE);
  }
  #country_data = tail(population[population[, "Country Name"] == country, ], n=1)
  country_data = as.numeric(tail(population[population[, "Country Name"] == country, ], n=1)[, "Value"])
  #print(head(country_data))
  return(country_data)
}
read_population("World")
read_population("Italy")
read_population("United States")

jhu_data = function(){
  casefilename = paste0("covid19-cases", format(lubridate::now(), "-%d-%m-%y.csv"))
  deathsfilename = paste0("covid19-deaths", format(lubridate::now(), "-%d-%m-%y.csv"))
  if(!file.exists(casefilename)){
    url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
    cases = read.csv(url, check.names=FALSE);
    write.csv(cases, casefilename, row.names=FALSE);
  }else{
    cases = read.csv(casefilename, check.names=FALSE);
  }
  #
  if(!file.exists(deathsfilename)){
    url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
    deaths = read.csv(url, check.names=FALSE);
    write.csv(deaths, deathsfilename, row.names=FALSE);
  }else{
    deaths = read.csv(deathsfilename, check.names=FALSE);
  }
  #
  columns = names(cases)
  today = cases[, tail(columns, n=1)]
  days = columns[5:length(columns)]
  return(list(cases=cases, deaths=deaths, today=today, days=days))
}

load_cases = function(region){
  d = jhu_data()
  if(region == "United States" || region == "United States of America" || region == "USA"){
    region = "US"
  }
  if(region == "Syria"){
    region = "Syrian Arab Republic"
  }
  if(region == "Slovakia"){
    region = "Slovak Republic"
  }
  if(region == "Russia"){
    region = "Russian Federation"
  }
  if(region == "Kyrgyzstan"){
    region = "Kyrgyz Republic"
  }
  if(region == "Laos"){
    region = "Lao PDR"
  }
  if(region == "Brunei"){
    region = "Brunei Darussalam"
  }
  if(region == 'World'){
    rows = seq(from=1, to=nrow(d$cases))
  }else{
    rows = c(which(as.character(d$cases$`Country/Region`) == region))
  }
  total_cases = sapply(d$days, function(day) sum(d$cases[[day]][rows]))
  total_deaths = sapply(d$days, function(day) sum(d$deaths[[day]][rows]))
  cases = list(days=lubridate::mdy(d$days), total_cases=total_cases, total_deaths=total_deaths)
  class(cases) = "totalcases"
  return(cases)
}

# Determine (active) infected and recovered from total (I+R) time series.
compute_IR = function(total, gamma=0.05){
  n = length(total)
  M = diag(n)
  for(i in 2:n){
    for(j in 1:(i - 1)){
      M[i, j] = gamma
    }
  }
  #print(M)
  I = solve(M) %*% total
  R = total - I
  return(list(I=I, R=R))
}

records.from.COVID <- function(country, confirmed){
  cases = load_cases(country)
  population = read_population(country)
  IR = compute_IR(cases$total_cases)
  active_confirmed = IR$I
  total_recovered = IR$R
  confirmed_fraction = confirmed/100.0
  #
  N = population
  #
  init <- c(
    #N = N,
    S = 1,
    I = tail(active_confirmed, n=1)[1]/confirmed_fraction/N, # Initial infected
    R = tail(total_recovered, n=1)[1]/confirmed_fraction/N  # Initial recovered,
  )
  init["S"] = 1 - init["I"] - init["R"]
  return(list(init=init, cases=cases, population=population))
}

plot.records = function(records, plot_cases=TRUE, plot_daily=FALSE){
  data <- data.frame(
    date=records$cases$days,
    total_cases=records$cases$total_cases,
    total_deaths=records$cases$total_deaths
  )
  if(plot_daily){
    data$total_cases <- c(data$total_cases[1], diff(data$total_cases))
    data$total_deaths <- c(data$total_deaths[1], diff(data$total_deaths))
  }
  g <- ggplot(data) + 
    geom_line(aes(x=date, y=total_deaths, color=(if(plot_daily)"Daily.deaths" else "Total.deaths")), size=1.5)
  if(plot_cases)
    g <- g + 
      geom_line(aes(x=date, y=total_cases, color=(if(plot_daily) "Daily.cases" else "Total.cases")), size=1.5)
  return(g)
}

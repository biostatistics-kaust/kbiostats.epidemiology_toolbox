library(deSolve)#install.packages("deSolve")
library(lubridate)#install.packages("lubridate")
library(ggplot2)
#
#
#
SIR.model <- function(time, state, parameters) {
  with(as.list(c(state, parameters)), {
    if((mitigation_interval_start <= time && time <= mitigation_interval_end)){
      qval = mitigation_factor
    }else{
      qval = 1
    }
    #qval = mitigation_factor
    dS <- -qval * beta * S * I
    dI <-  qval * beta * S * I - gamma * I
    dR <-                 gamma * I
    return(list(c(dS, dI, dR)))
  })
}

#
#
#
SIR.sim <- function(init, beta0, gamma0, mitigation_factor0, sim.time=300, start_date=lubridate::now(), mitigation_interval=c(0, 10000), return.df=TRUE, N=N){
  parameters <- c(beta=beta0, gamma=gamma0, mitigation_factor=mitigation_factor0, mitigation_interval_start=mitigation_interval[1], mitigation_interval_end=mitigation_interval[2])
  times <- seq(0, sim.time - 1, by=1)
  solution <- deSolve::ode(y=init, times=times, func=SIR.model, parms=parameters)
  if(return.df){
    S = solution[, "S"] * N
    I = solution[, "I"] * N
    R = solution[, "R"] * N
    t = solution[, "time"]
    date = start_date + lubridate::days(t)
    data = (data.frame(t=t, date=as.Date(date), S=S, I=I, R=R));
    return(data)
  }else{
    return(solution)
  }
}

#
#
#
sample.sim = function(init, start_date, N=1){
  beta0=0.09
  gamma0=0.045
  mitigation_factor0=1
  data = SIR.sim(init, beta0, gamma0, mitigation_factor0, start_date=start_date, N=N)
  g <- ggplot(data) +
    geom_line(aes(x=date, y=S, col="Susceptible")) +
    geom_line(aes(x=date, y=I, col="Infected")) +
    #geom_line(aes(x=date, y=Active_confirmed, col="Active_confirmed")) +
    #geom_line(aes(x=date, y=Critical, col="Critical"))
    geom_line(aes(x=date, y=R, col="Recovered"))
  #geom_line(aes(x=date, y=Deaths, col="Deaths"))
  #  g <- g +
  #    scale_y_log10()
  plot(g)
}

plot.single.curve.set = function(qCurves, plot.S=TRUE, plot.R=TRUE){
  g <- ggplot(qCurves)
  if(plot.S)
    g <- g + geom_line(aes(x=date, y=S.50, color="Susceptible"), size=1.5)#, color=cbPalette[1])
  g <- g + geom_line(aes(x=date, y=I.50, color="Infected"), size=1.5)#, color=cbPalette[2])
  if(plot.R)
    g <- g + geom_line(aes(x=date, y=R.50, color="Recovered"), size=1.5)#, color=cbPalette[3])
  if(plot.S)
    g <- g + geom_ribbon(aes(x=date, ymin=S.25, ymax=S.75, color="Susceptible", fill="Susceptible"), alpha=0.1, linetype=0, size=0.1, show.legend = FALSE)#, fill=cbPalette[1])
  g <- g + geom_ribbon(aes(x=date, ymin=I.25, ymax=I.75, color="Infected", fill="Infected"), alpha=0.1, linetype=0, size=0.1, show.legend = FALSE)#, fill=cbPalette[2])
  if(plot.R)
    g <- g + geom_ribbon(aes(x=date, ymin=R.25, ymax=R.75, color="Recovered", fill="Recovered"), alpha=0.1, linetype=0, size=0.1, show.legend = FALSE)#, fill=cbPalette[3])
  return(g)
}


set.sim = function(N.sim, T.sim, init, start_date, beta.range=c(0.09, 0.12), gamma.range=c(0.045, 0.055), mitigation_factor0, mitigation_interval=c(0, 10000), N=1){
  if(N.sim == 1){
    #beta0 = runif(1, min=beta.range[1], max=beta.range[2])
    #gamma0 = runif(1, min=gamma.range[1], max=gamma.range[2])
    beta0 = 0.5 * (beta.range[1] + beta.range[2])
    gamma0 = 0.5 * (gamma.range[1] + gamma.range[2])
    curve = SIR.sim(init, beta0, gamma0, mitigation_factor0, sim.time=T.sim, return.df=FALSE, mitigation_interval=mitigation_interval, N=N)
    qCurves = data.frame(
      S.25 = as.numeric(curve[, "S"]) * N,
      S.50 = as.numeric(curve[, "S"]) * N,
      S.75 = as.numeric(curve[, "S"]) * N,
      I.25 = as.numeric(curve[, "I"]) * N,
      I.50 = as.numeric(curve[, "I"]) * N,
      I.75 = as.numeric(curve[, "I"]) * N,
      R.25 = as.numeric(curve[, "R"]) * N,
      R.50 = as.numeric(curve[, "R"]) * N,
      R.75 = as.numeric(curve[, "R"]) * N,
      date=start_date + lubridate::days(seq(0, length.out=T.sim))
    )
    ###print(paste(names(qCurves), nrow(qCurves), ncol(qCurves)))
    return(qCurves)
  }
  #
  S = matrix(0, nrow=T.sim, ncol=N.sim)
  I = matrix(0, nrow=T.sim, ncol=N.sim)
  R = matrix(0, nrow=T.sim, ncol=N.sim)
  for(i in 1:N.sim){
    beta0 = runif(1, min=beta.range[1], max=beta.range[2])
    gamma0 = runif(1, min=gamma.range[1], max=gamma.range[2])
    #mitigation_factor0=1
    curve = SIR.sim(init, beta0, gamma0, mitigation_factor0, sim.time=T.sim, return.df=FALSE, mitigation_interval=mitigation_interval, N=N)
    S[, i] = curve[, "S"] * N
    I[, i] = curve[, "I"] * N
    R[, i] = curve[, "R"] * N
    curve=NULL
  }
  get.quantiles = function(X, preffix){
    qX = apply(X, 1, function(x) quantile(x, probs=c(0.25, 0.5, 0.75)))
    rownames(qX) = stringr::str_replace(paste0(preffix, rownames(qX)), "%", "")
    return(qX)
  }
  qS = get.quantiles(S, "S.")
  qI = get.quantiles(I, "I.")
  qR = get.quantiles(R, "R.")
  
  qCurves = data.frame(t(rbind(qS, qI, qR)))
  qCurves$date = start_date + lubridate::days(seq(0, length.out=T.sim))
  ###print(paste(names(qCurves), nrow(qCurves), ncol(qCurves)))
  return(qCurves)
}

plot.curve.comparison = function(qCurves.without, caption.0, qCurves.with.1, caption.1, qCurves.with.2, caption.2, plot.S=TRUE, plot.R=TRUE){
  caption.S <- function(c) paste0("Susceptible (", c, ")")
  caption.I <- function(c) paste0("Infected (", c, ")")
  caption.R <- function(c) paste0("Recovered (", c, ")")
  add.plot <- function(g, q, c){
    if(plot.S){
      g <- g + geom_line(aes(x=date, y=S.50, col=caption.S(c)), size=1.5, data=q)
      #g <- g + geom_ribbon(aes(x=date, ymin=S.25, ymax=S.75, col=caption.S(c)), alpha=0.1, linetype=0, size=0.1, fill="darkblue", data=q)
      g <- g + geom_ribbon(aes(x=date, ymin=S.25, ymax=S.75, col=caption.S(c), fill=caption.S(c)), alpha=0.1, linetype=0, size=0.1, data=q, show.legend = FALSE)
    }
    g <- g + geom_line(aes(x=date, y=I.50, col=caption.I(c)), size=1.5, data=q)
    #g <- g + geom_ribbon(aes(x=date, ymin=I.25, ymax=I.75, col=caption.I(c)), alpha=0.1, linetype=0, size=0.1, fill="darkred", data=q)
    g <- g + geom_ribbon(aes(x=date, ymin=I.25, ymax=I.75, col=caption.I(c), fill=caption.I(c)), alpha=0.1, linetype=0, size=0.1, data=q, show.legend = FALSE) 
    if(plot.R){
      g <- g + geom_line(aes(x=date, y=R.50, col=caption.R(c)), size=1.5, data=q)
      #g <- g + geom_ribbon(aes(x=date, ymin=R.25, ymax=R.75, col=caption.R(c)), alpha=0.1, linetype=0, size=0.1, fill="darkgreen", data=q)
      g <- g + geom_ribbon(aes(x=date, ymin=R.25, ymax=R.75, col=caption.R(c), fill=caption.R(c)), alpha=0.1, linetype=0, size=0.1, data=q, show.legend = FALSE)
    }
    return(g)
  }
  g <- ggplot()
  g <- add.plot(g, qCurves.without, caption.0)
  g <- add.plot(g, qCurves.with.1, caption.1)
  g <- add.plot(g, qCurves.with.2, caption.2)
  #
  g <- g + 
    labs(title="", x="date", y="# people", color="Curves")
  #
  return(g)
}


start_date = lubridate::ymd("2020 03 28")
N = 7300
init <- c(
  S = 1 - 7/N,
  I = 7/N,
  R = 0
)
sample.sim(init, start_date)


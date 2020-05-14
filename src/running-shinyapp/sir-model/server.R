library(deSolve)#install.packages("deSolve")
library(lubridate)#install.packages("lubridate")
library(ggplot2)
library(shiny)
library(shinythemes)#install.packages("shinythemes")
source("SIR.R")
source("worldwide.R")
#
#
#
# Color-blind palette
# http://www.cookbook-r.com/Graphs/Colors_(ggplot2)/
#cbPalette <- c("#000000", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7")
cbPalette <- rep(c("#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"), 20)
cbPalette <- rep(c("#b6a239", "#cc6677", "#5aa5cb",
                   "#0072b2", "#117733", "#aa4499", 
                   "#44aa99", "#882255", "#332288"), 20)

#
#
# Mini-Shiny App
#
#

apply.style <- function(g, title="", x="date", y="", color="Curves", default.colors=TRUE){
  number_ticks <- function(n) {function(limits) pretty(limits, n)}
  g <- g +
       labs(title=title, x=x, y=y, color=color) +
       theme_linedraw() +
       theme(legend.direction="horizontal",
             legend.position="bottom",
             #
             panel.grid.major = element_line(size=0.5, linetype="solid", colour="gray80"),
             panel.grid.minor = element_line(size=0.5, linetype="solid", colour="gray80"),
             #panel.background = element_rect(fill="lightblue", colour="lightblue", size=0.5, linetype="solid"),
             #
             axis.text.x=element_text(
              #colour="blue",
              size=15),
             axis.title.x=element_text(
              #colour="blue",
              size=15),
             #
             axis.text.y=element_text(
              #colour="blue",
              size=15),
             axis.title.y=element_text(
              #colour="blue",
              size=15),
             #
             legend.text=element_text(
              #colour="blue",
              size=15),
             legend.title=element_text(
              #colour="blue",
              size=15, 
              face="bold")
       )
  g <- g +
       scale_y_continuous(breaks=number_ticks(6)) +
       scale_x_date(date_breaks="14 day", date_labels="%b %d")
  if(default.colors){
      g <- g +
           scale_fill_manual(values=cbPalette) +
           scale_colour_manual(values=cbPalette)
  }
  return(g)
}

server <- function(input, output) {  
  simdata <- reactive({
    start_date = input$date_range[1]
    T.sim = as.numeric(difftime(input$date_range[2], input$date_range[1], units="days"))
    N.sim = input$Nsim
    if(input$load_covid_data){
      confirmed = input$estimated_confirmed
      records = records.from.COVID(input$country, confirmed)
      init = records$init
      N = records$population
    }else{
      N = input$N
      init <- c(
        S = 1 - input$I0/N - input$R0/N,
        I = input$I0/N,
        R = 0
      )
      records = list()
    }
    ####print("====")
    ####print(c(N.sim=N.sim, T.sim=T.sim, init=init, start_date=start_date))
    qCurves.mitigation.0 = set.sim(N.sim, T.sim, init, start_date,
                                    beta.range=input$beta_range, 
                                    gamma.range=input$gamma_range, 
                                    mitigation_factor0=1,
                                    N=N)
    qCurves.mitigation.1 = set.sim(N.sim, T.sim, init, start_date, 
                                   beta.range=input$beta_range, 
                                   gamma.range=input$gamma_range, 
                                   mitigation_factor0=input$mitigation_factor1, 
                                   mitigation_interval=input$mitigation_interval1,
                                    N=N)
    qCurves.mitigation.2 = set.sim(N.sim, T.sim, init, start_date, 
                                   beta.range=input$beta_range, 
                                   gamma.range=input$gamma_range, 
                                   mitigation_factor0=input$mitigation_factor2, 
                                   mitigation_interval=input$mitigation_interval2,
                                    N=N)
    joint.mitigation.curves <- cbind(qCurves.mitigation.0, qCurves.mitigation.1, qCurves.mitigation.2)
    names(joint.mitigation.curves) <- c(
      paste0("strategy.0.", names(qCurves.mitigation.0)),
      paste0("strategy.1.", names(qCurves.mitigation.1)),
      paste0("strategy.2.", names(qCurves.mitigation.2))
    )
    #
    risk_ratio_data <- data.frame(
                        x=qCurves.mitigation.0$date,
                        proportion.1=qCurves.mitigation.0$I.50 / qCurves.mitigation.1$I.50, 
                        proportion.2=qCurves.mitigation.0$I.50 / qCurves.mitigation.2$I.50
                      )
    #
    #
    return(list(
      qCurves.mitigation.0=qCurves.mitigation.0,
      qCurves.mitigation.1=qCurves.mitigation.1,
      qCurves.mitigation.2=qCurves.mitigation.2,
      joint.mitigation.curves=joint.mitigation.curves,
      risk_ratio_data=risk_ratio_data,
      records=records
    ))
  })
  #
  output$scenario_0 <- renderPlot({
    curve0 = plot.single.curve.set(simdata()$qCurves.mitigation.0, plot.S=input$scenario_0_plot_S, plot.R=input$scenario_0_plot_R)
    apply.style(curve0, title="", y="# people", default.colors=FALSE) +
       scale_fill_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       )) + 
       scale_colour_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       ))
  })
  #
  output$scenario_1 <- renderPlot({
    curve1 = plot.single.curve.set(simdata()$qCurves.mitigation.1, plot.S=input$scenario_1_plot_S, plot.R=input$scenario_1_plot_R)
    apply.style(curve1, title="", y="# people", default.colors=FALSE) +
       scale_fill_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       )) + 
       scale_colour_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       ))
  })
  #
  output$scenario_2 <- renderPlot({
    curve2 = plot.single.curve.set(simdata()$qCurves.mitigation.2, plot.S=input$scenario_2_plot_S, plot.R=input$scenario_2_plot_R)
    apply.style(curve2, title="", y="# people", default.colors=FALSE) +
       scale_fill_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       )) + 
       scale_colour_manual(values=c(
        "Susceptible"=cbPalette[1],
        "Infected"=cbPalette[2],
        "Recovered"=cbPalette[3]
       ))
  })
  #
  output$mitigation_comparison_I <- renderPlot({
    curve.comp = plot.curve.comparison(simdata()$qCurves.mitigation.0, input$mitigation_caption0,
                             simdata()$qCurves.mitigation.1, input$mitigation_caption1,
                             simdata()$qCurves.mitigation.2, input$mitigation_caption2,
                             plot.S=input$comparison_plot_S, plot.R=input$comparison_plot_R)
    apply.style(curve.comp, y="# people")
  })
  #
  output$risk_ratio <- renderPlot({
    risk_ratio <- ggplot(simdata()$risk_ratio_data) + 
                  geom_line(aes(x=x, y=proportion.1, color=paste0(input$mitigation_caption0, " vs ", input$mitigation_caption1)), size=1.5) +
                  geom_line(aes(x=x, y=proportion.2, color=paste0(input$mitigation_caption0, " vs ", input$mitigation_caption2)), size=1.5)
    apply.style(risk_ratio, y="Risk ratio")
  })
  # 
  output$title_scenario_0 <- renderUI({shiny::h3(input$mitigation_caption0)})
  output$title_scenario_1 <- renderUI({shiny::h3(input$mitigation_caption1)})
  output$title_scenario_2 <- renderUI({shiny::h3(input$mitigation_caption2)})
  # 
  output$save_mitigation_scenario_0 <- downloadHandler(
    filename = function() "data-mitigation-scenario-0.csv",
    content = function(file) write.csv(simdata()$qCurves.mitigation.0, file, row.names = FALSE)
  )
  output$save_mitigation_scenario_1 <- downloadHandler(
    filename = function() "data-mitigation-scenario-1.csv",
    content = function(file) write.csv(simdata()$qCurves.mitigation.1, file, row.names = FALSE)
  )
  output$save_mitigation_scenario_2 <- downloadHandler(
    filename = function() "data-mitigation-scenario-2.csv",
    content = function(file) write.csv(simdata()$qCurves.mitigation.2, file, row.names = FALSE)
  )
  output$save_risk_ratio <- downloadHandler(
    filename = function() "data-risk-ratio.csv",
    content = function(file) write.csv(simdata()$risk_ratio_data, file, row.names = FALSE)
  )
  output$save_mitigation_comparison_I <- downloadHandler(
    filename = function() "data-mitigation-comparison.csv",
    content = function(file) {
      write.csv(simdata()$joint.mitigation.curves, file, row.names = FALSE)
    }
  )
  #
  output$current_scenario <- renderPlot({
    data = simdata()
    if(length(data$records) == 0) return(NULL)
    curve1 = plot.records(data$records,
                          plot_cases=input$current_scenario_plot_total_cases,
                          plot_daily=input$current_scenario_plot_daily_data)
    apply.style(curve1, title="", y="# people", default.colors=FALSE) +
       scale_fill_manual(values=c(
        "Daily.deaths"=cbPalette[2],
        "Daily.cases"=cbPalette[3],
        "Total.deaths"=cbPalette[2],
        "Total.cases"=cbPalette[3]
       )) + 
       scale_colour_manual(values=c(
        "Daily.deaths"=cbPalette[2],
        "Daily.cases"=cbPalette[3],
        "Total.deaths"=cbPalette[2],
        "Total.cases"=cbPalette[3]
       ))
  })
  #
}





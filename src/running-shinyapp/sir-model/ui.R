library(shiny)
library(shinythemes)#install.packages("shinythemes")
source("./countries.R")
#
#
#
toolbar_plot <- function(preffix=""){
  return(
    shiny::tags$div(class="plot_check_bar well",
      checkboxInput(inputId=paste0(preffix, "_plot_S"),
                    label="Plot Susceptibles",
                    value = FALSE),
      checkboxInput(inputId=paste0(preffix, "_plot_R"),
                    label="Plot Recovered",
                    value = FALSE)
  ));
}

realdata_toolbar_plot <- function(preffix=""){
  return(
    shiny::tags$div(class="plot_check_bar well",
      checkboxInput(inputId=paste0(preffix, "_plot_total_cases"),
                    label="Plot Reported Cases",
                    value = FALSE),
      checkboxInput(inputId=paste0(preffix, "_plot_daily_data"),
                    label="Plot Daily Data",
                    value = FALSE)
  ));
}

save_csv_button <- function(inputID="", label="Download table"){
  return(shiny::tags$div(class="download_data",
      downloadButton(inputID, label)
  ));
}

disclaimer_and_credits <- function(){
  return(shiny::tags$div(class="disclaimer_and_credits",
          shiny::tags$div(class="disclaimer-panel well",
            shiny::tags$h3(class="disclaimer-title", "Disclaimer"),
            shiny::tags$div(class="disclaimer",
              "This toolbox is made freely, and open-source, available.
               The authors and their organizations assume no liability 
               for the use of and results obtained from this toolbox 
               and, in addition, do not guarantee the safety of your data. 
               Your use of the software is at your own risk."
            )
          ),
          shiny::tags$div(class="credits-panel well",
            shiny::tags$h3(class="credits-title", "Credits"),
            shiny::tags$img(class="credits-KAUST",
                            src="./Biostats-KAUST.png"
                            ),
            shiny::tags$img(class="credits-Marco",
                            src="./PACER-Marco.jpg"
                            ),
            shiny::tags$div(class="credits",
              shiny::tags$div(
                "Software made at the ",
                shiny::tags$a(href="https://cemse.kaust.edu.sa/biostats", 
                              "Biostatistics Research Group at King Abdullah University of Science and Technology"),
                " (Prof. Hernando Ombao, PI) in collaboration with Marco Pinto (",
                #shiny::tags$a(href="https://blogg.hioa.no/bevlab/",
                shiny::tags$a(href="https://twitter.com/AtPacer",
                              "PACER Research Group at Oslo Metropolitan University"),
                ") and Prof. David Ketcheson (Applied Mathematics and Computational Science at KAUST)."
              ), shiny::tags$div(
                "Code based on ",
                shiny::tags$a(href="https://mybinder.org/v2/gh/ketch/covid-blog-posts/master?filepath=Interactive_SIR_model.ipynb",
                  "Prof. Ketcheson's Jupyter interactive notebook.")
              ), shiny::tags$div(
                "For more details about the model, see ",
                shiny::tags$a(href="http://www.davidketcheson.info/2020/03/17/SIR_model.html",
                  "Prof. Ketcheson's explanatory articles.")
              ), shiny::tags$div(
                "COVID-19 data is extracted from the",
                shiny::tags$a(href="https://github.com/CSSEGISandData/COVID-19",
                              "Data repository at Johns Hopkins CSSE COVID-19.")
              )
            )
          )
        ));
}

list_countries <- function() {
  selectInput("country", "Country:", available.countries)
}
#
#
# Mini-Shiny App
#
#
ui <- fluidPage(theme = shinytheme("flatly"),
                class="SIR-model",
  tags$head(
    tags$link(rel = "stylesheet", type = "text/css", href = "shiny_style.css")
  ),
  #includeCSS("sir_model.css"),
  #tags$style(HTML("
  #  @import url('sir_model.css');
  #")),
  sidebarLayout(
    sidebarPanel(
      shiny::h2("Simulation parameters"),
      dateRangeInput('date_range',
                     label = 'Date range input: yyyy-mm-dd',
                     start = Sys.Date() - 2, end = Sys.Date() + 30*5
      ),
      checkboxInput(inputId="load_covid_data",
                    label="Load values from COVID-19 data",
                    value = FALSE),
      conditionalPanel(
        condition = "input.load_covid_data",#"input.plotType == 'hist'",
        list_countries(),
        sliderInput(inputId="estimated_confirmed",
                  label="Estimated % of cases confirmed:",
                  min=5,
                  max=100,
                  step=1,
                  value=20)
      ),
      conditionalPanel(
        condition = "!input.load_covid_data",
        numericInput(inputId = "N",
                     label = "Population:",
                     value = 7300),
        numericInput(inputId = "I0",
                     label = "Initial infected:",
                     value = 7),
        numericInput(inputId = "R0",
                     label = "Initial recovered:",
                     value = 0)
      ),
      shiny::tags$div(class="divisor"),
      sliderInput(inputId="beta_range",
                  label = withMathJax("Range of rate of contact \\(\\beta\\):"),
                  min=0.01,
                  max=0.30,
                  step=0.005,
                  value=c(0.09, 0.12)),
      sliderInput(inputId="gamma_range",
                  label = withMathJax("Range of rate of recovery \\(\\gamma\\):"),
                  min=0.035,
                  max=0.075,
                  step=0.001,
                  value=c(0.045, 0.055)),
      shiny::tags$div(class="divisor"),
      textInput(inputId = "mitigation_caption0",
                label = "Mitigation strategy 0 (mitigation=1):",
                value = "Social distancing"),
      shiny::tags$div(class="divisor"),
      textInput(inputId = "mitigation_caption1",
                label = "Mitigation strategy 1:",
                value = "Social distancing w/o phys. shopping"),
      sliderInput(inputId = "mitigation_factor1",
                  label = "Mitigation factor 1:",
                  min = 0,
                  max = 2,
                  step=0.05,
                  value = 0.8),
      sliderInput(inputId = "mitigation_interval1",
                  label = "Time of use of mitigation 1 (days):",
                  min = 0,
                  max = 200,
                  step = 1,
                  value = c(0, 200)),
      shiny::tags$div(class="divisor"),
      textInput(inputId = "mitigation_caption2",
                label = "Mitigation strategy 2:",
                value = "Strict isolation"),
      sliderInput(inputId = "mitigation_factor2",
                  label = "Mitigation factor 2:",
                  min = 0,
                  max = 2,
                  step=0.05,
                  value = 0.5),
      sliderInput(inputId = "mitigation_interval2",
                  label = "Time of use of mitigation 2 (days):",
                  min = 0,
                  max = 200,
                  step = 1,
                  value = c(90, 200)),
#      checkboxInput(inputId="plot_S",
#                    label="Plot S",
#                    value = FALSE),
#      #checkboxInput(inputId="plot_I",
#      #              label="Plot I",
#      #              value = TRUE),
#      checkboxInput(inputId="plot_R",
#                    label="Plot R",
#                    value = FALSE),
      #checkboxInput(inputId="logarithmic_scale",
      #              label="Use logarithmic scale",
      #              value = FALSE),
      shiny::tags$div(class="divisor"),
      numericInput(inputId = "Nsim",
                   label = "Number of simulations:",
                   value = 20)
    ),
    mainPanel(
      titlePanel("SIR Model Simulation"),
      tabsetPanel(
        tabPanel("Comparison",
          shiny::h2("Comparison of scenarios"),
          toolbar_plot("comparison"),
          plotOutput(outputId = "mitigation_comparison_I"),
          save_csv_button("save_mitigation_comparison_I"),
        ), 
        tabPanel("Curves",
          conditionalPanel(
            condition = "input.load_covid_data",
            shiny::h2("Current records"),
            realdata_toolbar_plot("current_scenario"),
            plotOutput(outputId = "current_scenario")
          ),
          shiny::h2("SIR curves"),
          shiny::htmlOutput(outputId = "title_scenario_0"),
          toolbar_plot("scenario_0"),
          plotOutput(outputId = "scenario_0"),
          save_csv_button("save_mitigation_scenario_0"),
          #
          shiny::htmlOutput(outputId = "title_scenario_1"),
          toolbar_plot("scenario_1"),
          plotOutput(outputId = "scenario_1"),
          save_csv_button("save_mitigation_scenario_1"),
          #
          shiny::htmlOutput(outputId = "title_scenario_2"),
          toolbar_plot("scenario_2"),
          plotOutput(outputId = "scenario_2"),
          save_csv_button("save_mitigation_scenario_2"),
        ), 
        tabPanel("Risk ratio", 
          shiny::h2("Risk ratio"),
          plotOutput(outputId = "risk_ratio"),
          save_csv_button("save_risk_ratio")
        )
      ),
      disclaimer_and_credits()
    )
  )
)


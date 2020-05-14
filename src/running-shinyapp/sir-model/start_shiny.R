#"D:\Program Files\R\R-3.6.2\bin\Rscript.exe" start_shiny.R
#rsconnect::deployApp(".")
library(deSolve)#install.packages("deSolve")
library(lubridate)#install.packages("lubridate")
library(ggplot2)
library(shiny)
library(shinythemes)#install.packages("shinythemes")

runApp(".", port=6400);
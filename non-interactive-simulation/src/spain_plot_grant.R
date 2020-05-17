rm(list = ls())

# Packages used to plot
library("tidyverse")
library("ggstance")
library("cowplot")

# Reading the function of the hospitalization model
source("./src/plot_functions.R")


path_to_file <- "/Users/bartolm/Desktop/ccaa_covid19_hospitalizados_long.csv"
spain <- read_csv(path_to_file)

averages <- readxl::read_xlsx("/Users/bartolm/Desktop/average.xlsx") %>% 
  mutate(fecha = lubridate::date(fecha)) %>% 
  dplyr::filter(fecha > "2020-03-12")

legend_order <- spain %>% 
  dplyr::filter(fecha == max(fecha)) %>% 
  arrange(desc(total)) %>% 
  pull(CCAA)

spain <- spain %>% 
  mutate(CCAA = factor(CCAA, ordered = T, levels = legend_order))

spain %>% 
  na.omit() %>% 
  group_by(CCAA) %>% 
  summarise(n = n())

View(spain)
png(file = "/Users/bartolm/Desktop/spain_plot_grant.png", 
    width = 2400, height = 1200)
spain %>% 
  na.omit() %>% 
  dplyr::filter(fecha > "2020-03-12") %>% 
  ggplot(aes(x = fecha, y = total, color = CCAA)) +
  geom_line(size = 1.15) +
  geom_line(data = averages, aes(x = fecha, y = average, color = "Average"), size = 3.5, linetype = "dashed", col = "black") +
  scale_x_date(date_breaks = "7 day", date_labels = "%d %b", expand = c(0,0)) +
  scale_y_continuous(breaks = number_ticks(12)) +
  scale_color_manual(values = glasbey(19)) +
  labs(x = NULL, y = "# Hospitalization",
       color = "Autonomous Community:",
       caption = "Source: https://github.com/datadista") +
  ggtitle("Spain: COVID-19 Hospitalization Evolution",
          subtitle = "Hospitalized Cases per Autonomous Community") +
  theme_linedraw() +
  theme(
    legend.position = "right",
    legend.text = element_text(size = 22),
    legend.title = element_text(size = 24, face = "bold"),
    legend.key.size = unit(3,"line"),
    plot.caption = element_text(size = 20, face = "bold"),
    axis.ticks = element_blank(),
    plot.title = element_text(size = 36, face = "bold"),
    plot.subtitle = element_text(size = 30, face = "bold"),
    axis.text.x = element_text(size = 24, angle = 45, hjust = 1),
    axis.text.y = element_text(size = 24),
    axis.title = element_text(size = 28, face = "bold"),  
  ) -> spain_plot
print(spain_plot)
dev.off()






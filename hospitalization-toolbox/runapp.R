library(servr)

#Adjust setwd if the working directory is not the current folder

#Starts the app in a local server:
servr::httd("./app", port=1235)

#Open a browser at this address:
browseURL("http://127.0.0.1:1235/")

#Stops the server:
#servr::daemon_stop(1)


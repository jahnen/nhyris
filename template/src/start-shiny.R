# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn

# Script that starts the shiny webserver
# Parameters are supplied using environment variables
assign(".lib.loc", Sys.getenv("R_LIB_PATHS"), envir = environment(.libPaths))

# Electron use 1124 port
# so Shiny should not use 1124 port
## Nope, this is not needed 250506

# Check if 'shiny' package is installed in R_LIB_PATHS
r_lib_paths <- Sys.getenv("R_LIB_PATHS")

if (!nzchar(r_lib_paths)) {
  stop("R_LIB_PATHS is not available. Please set the correct library path.")
}

.libPaths(r_lib_paths) # Temporarily set library paths to R_LIB_PATHS

if (!requireNamespace("shiny", quietly = TRUE)) {
  stop("The 'shiny' package is not installed in R_LIB_PATHS: ", r_lib_paths)
}
shiny_dir <- Sys.getenv("RE_SHINY_PATH")

shiny::runApp(
  appDir = shiny_dir,
  host = "127.0.0.1",
  launch.browser = FALSE,
  port = 1124
)

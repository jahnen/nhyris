# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Copyright (c) 2023 Jinhwan Kim

# !/usr/bin/env Rscript

# Script to find dependencies of a pkg list, download binaries and put them
# In the standalone R library.

# Code format changed using styler::style_active_file()

if (!requireNamespace("automagic", quietly = TRUE)) {
    suppressMessages(suppressWarnings(
        install.packages("automagic", quiet = TRUE)
    ))
}

library(automagic)

options(repos = "https://cloud.r-project.org")

cran_pkgs <- setdiff(unique(c("shiny", automagic::get_dependent_packages("shiny"))), "automagic")

install_bins <- function(
    cran_pkgs, library_path, type, decompress,
    remove_dirs = c(
      "help", "doc", "tests", "html",
      "include", "unitTests",
      file.path("libs", "*dSYM")
      )) {
  installed <- list.files(library_path) # check installed packages

  cran_to_install <- sort(setdiff(
    unique(unlist(
      c(cran_pkgs,
        tools::package_dependencies(cran_pkgs,
          recursive = TRUE,
          which = c("Depends", "Imports", "LinkingTo")
      ))
    )),
    installed
  ))
  
  if (!length(cran_to_install)) {
    message("No packages to install")
  } else {
    td <- tempdir()
    suppressMessages(suppressWarnings({
        downloaded <- download.packages(cran_to_install, destdir = td, type = type)
    }))
    apply(downloaded, 1, function(x) decompress(x[2], exdir = library_path))
    unlink(downloaded[, 2])
  }
  
  z <- lapply(
    list.dirs(library_path, full.names = TRUE, recursive = FALSE),
    function(x) {
      unlink(file.path(x, remove_dirs), force = TRUE, recursive = TRUE)
    }
  )
  invisible(NULL)
}

if (dir.exists("r-mac")) {
  install_bins(
    cran_pkgs = cran_pkgs, library_path = file.path("r-mac", "library"),
    type = "mac.binary.big-sur-arm64", decompress = untar
  )
}
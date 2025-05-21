# Copyright (c) 2025 Jinhwan Kim

# !/usr/bin/env Rscript

# Script to install R packages with pak

# set cran mirror
options(repos = "https://cloud.r-project.org")

if (dir.exists("r-mac")) {
    library_path <- file.path("r-mac", "library")
}

if (dir.exists("r-win")) {
    library_path <- file.path("r-win", "library")
}

.libPaths(library_path)
cat('Setting library path to:', library_path, '\n')

# assumes pak package is not installed with r-local
suppressMessages(suppressWarnings(
    install.packages(c("pak", "formatR"), quiet = TRUE)
))

library(pak)

# Check if 'shiny' directory exists and contains R files
if (!dir.exists("shiny")) {
    stop("The 'shiny' directory does not exist at path: ", getwd(), "/shiny")
}

r_files <- list.files("shiny", pattern = "\\.R$", full.names = TRUE)
if (length(r_files) == 0) {
    stop(
        "No R files found in the 'shiny' directory at path: ",
        getwd(),
        "/shiny"
    )
}

# Utility functions for parsing R package dependencies in a directory
# modified from automagic package's code

# Find all matches of a regex in a vector of lines
finder <- function(rgx, lns) {
    regmatches(lns, gregexpr(rgx, lns, perl = TRUE)) |> unlist()
}

# Read and tidy R file, returning code lines
get_lines <- function(file_name) {
    lns <- tryCatch(
        formatR::tidy_source(
            file_name,
            comment = FALSE,
            blank = FALSE,
            arrow = TRUE,
            brace.newline = TRUE,
            output = FALSE
        )$text.mask,
        error = function(e) {
            message(sprintf("Could not parse R code in: %s", file_name))
            message("   Make sure you are specifying the right file name")
            message("   and check for syntax errors")
            stop("", call. = FALSE)
        }
    )
    if (is.null(lns)) stop("No parsed text available", call. = FALSE)
    lns
}

# Extract package names from a file using common patterns
parse_packages <- function(file) {
    lns <- get_lines(file)
    patterns <- list(
        library = "(?<=(library\\()|(library\\([\"']{1}))[[:alnum:]_.]+",
        require = "(?<=(require\\()|(require\\([\"']{1}))[[:alnum:]_.]+",
        colon = "[[:alnum:]_.]+(?=:{2,3})"
    )
    pkgs <- unlist(lapply(patterns, finder, lns = lns))
    unique(pkgs[pkgs != "" & pkgs != " "])
}

# Get all unique package dependencies from R files in a directory
get_dependent_packages <- function(directory = getwd()) {
    files <- list.files(
        path = directory,
        pattern = "\\.R$",
        full.names = TRUE,
        recursive = TRUE
    )
    pkg_names <- unique(unlist(lapply(files, parse_packages)))
    if (length(pkg_names) == 0) {
        message("Warning: no packages found in specified directory")
        return(invisible(NULL))
    }
    unname(pkg_names)
}

cran_pkgs <- unique(c("shiny", get_dependent_packages(directory = "shiny")))

github_pkgs <- c(
    # "r-lib/cli",
    # "tidyverse/ggplot2"
)

bioconductor_pkgs <- c(
    # "airway",
    # "AnnotationDbi"
)

cran_pkgs <- paste0("cran::", cran_pkgs)

if (length(github_pkgs) > 0) {
    github_pkgs <- paste0("github::", github_pkgs)
}

if (length(bioconductor_pkgs) > 0) {
    bioconductor_pkgs <- paste0("bioc::", bioconductor_pkgs)
}

install_with_pak <- function(
    cran_pkgs,
    github_pkgs = NULL,
    bioconductor_pkgs = NULL,
    library_path = library_path,
    remove_dirs = c(
        "help",
        "doc",
        "tests",
        "html",
        "include",
        "unitTests",
        file.path("libs", "*dSYM")
    )
) {
    dir.create(library_path, showWarnings = FALSE, recursive = TRUE)

    pkgs <- c(cran_pkgs, github_pkgs, bioconductor_pkgs)
    if (length(pkgs) == 0) {
        message("No packages to install")
        return(invisible(NULL))
    }

    pak::pak(
        pkgs,
        lib = library_path,
        ask = FALSE,
        upgrade = FALSE
    )

    lapply(
        list.dirs(library_path, full.names = TRUE, recursive = FALSE),
        function(x) {
            unlink(file.path(x, remove_dirs), force = TRUE, recursive = TRUE)
        }
    )
    invisible(NULL)
}

install_with_pak(
    cran_pkgs = cran_pkgs,
    github_pkgs = github_pkgs,
    bioconductor_pkgs = bioconductor_pkgs,
    library_path = library_path
)

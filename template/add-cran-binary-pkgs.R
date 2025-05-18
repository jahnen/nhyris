# Copyright (c) 2018 Dirk Schumacher, Noam Ross, Rich FitzJohn
# Copyright (c) 2023 Jinhwan Kim

# !/usr/bin/env Rscript

# Script to find dependencies of a pkg list, download binaries and put them
# In the standalone R library.

# Code format changed using styler::style_active_file()

# set cran mirror
options(repos = "https://cloud.r-project.org")

if (!requireNamespace("automagic", quietly = TRUE)) {
    suppressMessages(suppressWarnings(
        install.packages("automagic", quiet = TRUE)
    ))
}

library(automagic)

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

cran_pkgs <- setdiff(
    unique(c("shiny", automagic::get_dependent_packages(directory = "shiny"))),
    "automagic"
) # nolint: line_length_linter.

install_bins <- function(
    cran_pkgs,
    library_path,
    type,
    decompress,
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
    installed <- list.files(library_path) # check installed packages

    cran_to_install <- sort(setdiff(
        unique(unlist(
            c(
                cran_pkgs,
                tools::package_dependencies(
                    cran_pkgs,
                    recursive = TRUE,
                    which = c("Depends", "Imports", "LinkingTo")
                )
            )
        )),
        installed
    ))

    if (!length(cran_to_install)) {
        message("No packages to install")
    } else {
        td <- tempdir()
        suppressMessages(suppressWarnings({
            tryCatch(
                {
                    downloaded <- download.packages(
                        cran_to_install,
                        destdir = td,
                        type = type
                    ) # nolint: line_length_linter.
                },
                error = function(e) {
                    stop("Failed to download packages: ", e$message)
                }
            )
        }))
        apply(downloaded, 1, function(x) decompress(x[2], exdir = library_path))
        unlink(downloaded[, 2])
    }

    lapply(
        list.dirs(library_path, full.names = TRUE, recursive = FALSE),
        function(x) {
            unlink(file.path(x, remove_dirs), force = TRUE, recursive = TRUE)
        }
    )
    invisible(NULL)
}

type <- if (.Platform$OS.type == "windows") {
    "win.binary"
} else if (Sys.info()["sysname"] == "Darwin") {
    "mac.binary.big-sur-arm64"
} else {
    "source"
}

# Assume macOS Big Sur ARM64 architecture
if (dir.exists("r-mac")) {
    install_bins(
        cran_pkgs = cran_pkgs,
        library_path = file.path("r-mac", "library"),
        type = type,
        decompress = untar
    )
}

if (dir.exists("r-win")) {
    install_bins(
        cran_pkgs = cran_pkgs,
        library_path = file.path("r-win", "library"),
        type = "win.binary",
        decompress = unzip
    )
}

# need to set r-linux directory
# also it should change into just r-local

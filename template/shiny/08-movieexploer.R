# Variables that can be put on the x and y axes
axis_vars <- c(
    "Tomato Meter" = "Meter",
    "Numeric Rating" = "Rating",
    "Number of reviews" = "Reviews",
    "Dollars at box office" = "BoxOffice",
    "Year" = "Year",
    "Length (minutes)" = "Runtime"
)

library(ggvis)

# For dropdown menu
actionLink <- function(inputId, ...) {
    tags$a(href = 'javascript:void', id = inputId, class = 'action-button', ...)
}

ui <- fluidPage(
    titlePanel("Movie explorer"),
    fluidRow(
        column(
            3,
            wellPanel(
                h4("Filter"),
                sliderInput(
                    "reviews",
                    "Minimum number of reviews on Rotten Tomatoes",
                    10,
                    300,
                    80,
                    step = 10
                ),
                sliderInput(
                    "year",
                    "Year released",
                    1940,
                    2014,
                    value = c(1970, 2014),
                    sep = ""
                ),
                sliderInput(
                    "oscars",
                    "Minimum number of Oscar wins (all categories)",
                    0,
                    4,
                    0,
                    step = 1
                ),
                sliderInput(
                    "boxoffice",
                    "Dollars at Box Office (millions)",
                    0,
                    800,
                    c(0, 800),
                    step = 1
                ),
                selectInput(
                    "genre",
                    "Genre (a movie can have multiple genres)",
                    c(
                        "All",
                        "Action",
                        "Adventure",
                        "Animation",
                        "Biography",
                        "Comedy",
                        "Crime",
                        "Documentary",
                        "Drama",
                        "Family",
                        "Fantasy",
                        "History",
                        "Horror",
                        "Music",
                        "Musical",
                        "Mystery",
                        "Romance",
                        "Sci-Fi",
                        "Short",
                        "Sport",
                        "Thriller",
                        "War",
                        "Western"
                    )
                ),
                textInput(
                    "director",
                    "Director name contains (e.g., Miyazaki)"
                ),
                textInput("cast", "Cast names contains (e.g. Tom Hanks)")
            ),
            wellPanel(
                selectInput(
                    "xvar",
                    "X-axis variable",
                    axis_vars,
                    selected = "Meter"
                ),
                selectInput(
                    "yvar",
                    "Y-axis variable",
                    axis_vars,
                    selected = "Reviews"
                ),
                tags$small(paste0(
                    "Note: The Tomato Meter is the proportion of positive reviews",
                    " (as judged by the Rotten Tomatoes staff), and the Numeric rating is",
                    " a normalized 1-10 score of those reviews which have star ratings",
                    " (for example, 3 out of 4 stars)."
                ))
            )
        ),
        column(
            9,
            ggvisOutput("plot1"),
            wellPanel(
                span("Number of movies selected:", textOutput("n_movies"))
            )
        )
    )
)

library(ggvis)
library(dplyr)
if (FALSE) {
    library(RSQLite)
    library(dbplyr)
}

# Set up handles to database tables on app start
db_path <- "movies.db"
if (!file.exists(db_path)) {
    download.file(
        "https://github.com/rstudio/shiny-examples/raw/refs/heads/main/051-movie-explorer/movies.db",
        db_path,
        mode = "wb"
    )
}
con <- DBI::dbConnect(RSQLite::SQLite(), db_path)
omdb <- dplyr::tbl(con, "omdb")
tomatoes <- dplyr::tbl(con, "tomatoes")


# Join tables, filtering out those with <10 reviews, and select specified columns
all_movies <- inner_join(omdb, tomatoes, by = "ID") %>%
    filter(Reviews >= 10) %>%
    select(
        ID,
        imdbID,
        Title,
        Year,
        Rating_m = Rating.x,
        Runtime,
        Genre,
        Released,
        Director,
        Writer,
        imdbRating,
        imdbVotes,
        Language,
        Country,
        Oscars,
        Rating = Rating.y,
        Meter,
        Reviews,
        Fresh,
        Rotten,
        userMeter,
        userRating,
        userReviews,
        BoxOffice,
        Production,
        Cast
    )

server <- function(input, output, session) {
    # Filter the movies, returning a data frame
    movies <- reactive({
        # Due to dplyr issue #318, we need temp variables for input values
        reviews <- input$reviews
        oscars <- input$oscars
        minyear <- input$year[1]
        maxyear <- input$year[2]
        minboxoffice <- input$boxoffice[1] * 1e6
        maxboxoffice <- input$boxoffice[2] * 1e6

        # Apply filters
        m <- all_movies %>%
            filter(
                Reviews >= reviews,
                Oscars >= oscars,
                Year >= minyear,
                Year <= maxyear,
                BoxOffice >= minboxoffice,
                BoxOffice <= maxboxoffice
            ) %>%
            arrange(Oscars)

        # Optional: filter by genre
        if (input$genre != "All") {
            genre <- paste0("%", input$genre, "%")
            m <- m %>% filter(Genre %like% genre)
        }
        # Optional: filter by director
        if (!is.null(input$director) && input$director != "") {
            director <- paste0("%", input$director, "%")
            m <- m %>% filter(Director %like% director)
        }
        # Optional: filter by cast member
        if (!is.null(input$cast) && input$cast != "") {
            cast <- paste0("%", input$cast, "%")
            m <- m %>% filter(Cast %like% cast)
        }

        m <- as.data.frame(m)

        # Add column which says whether the movie won any Oscars
        # Be a little careful in case we have a zero-row data frame
        m$has_oscar <- character(nrow(m))
        m$has_oscar[m$Oscars == 0] <- "No"
        m$has_oscar[m$Oscars >= 1] <- "Yes"
        m
    })

    # Function for generating tooltip text
    movie_tooltip <- function(x) {
        if (is.null(x)) return(NULL)
        if (is.null(x$ID)) return(NULL)

        # Pick out the movie with this ID
        all_movies <- isolate(movies())
        movie <- all_movies[all_movies$ID == x$ID, ]

        paste0(
            "<b>",
            movie$Title,
            "</b><br>",
            movie$Year,
            "<br>",
            "$",
            format(movie$BoxOffice, big.mark = ",", scientific = FALSE)
        )
    }

    # A reactive expression with the ggvis plot
    vis <- reactive({
        # Lables for axes
        xvar_name <- names(axis_vars)[axis_vars == input$xvar]
        yvar_name <- names(axis_vars)[axis_vars == input$yvar]

        # Normally we could do something like props(x = ~BoxOffice, y = ~Reviews),
        # but since the inputs are strings, we need to do a little more work.
        xvar <- prop("x", as.symbol(input$xvar))
        yvar <- prop("y", as.symbol(input$yvar))

        movies %>%
            ggvis(x = xvar, y = yvar) %>%
            layer_points(
                size := 50,
                size.hover := 200,
                fillOpacity := 0.2,
                fillOpacity.hover := 0.5,
                stroke = ~has_oscar,
                key := ~ID
            ) %>%
            add_tooltip(movie_tooltip, "hover") %>%
            add_axis("x", title = xvar_name) %>%
            add_axis("y", title = yvar_name) %>%
            add_legend(
                "stroke",
                title = "Won Oscar",
                values = c("Yes", "No")
            ) %>%
            scale_nominal(
                "stroke",
                domain = c("Yes", "No"),
                range = c("orange", "#aaa")
            ) %>%
            set_options(width = 500, height = 500)
    })

    vis %>% bind_shiny("plot1")

    output$n_movies <- renderText({
        nrow(movies())
    })
}

shinyApp(ui = ui, server = server)

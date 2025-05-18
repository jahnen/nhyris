ui <- fluidPage(
    titlePanel("Observer demo"),
    mainPanel(
        p(
            "This demo writes the value of the slider to a log file. If you can, check the file contents after moving the slider to confirm it's been appended to."
        ),
        verbatimTextOutput('logfile'),
        fluidRow(
            column(
                4,
                wellPanel(
                    sliderInput(
                        "n",
                        "N:",
                        min = 10,
                        max = 1000,
                        value = 200,
                        step = 10
                    )
                )
            ),
            column(
                8,
                verbatimTextOutput("text"),
                br(),
                br(),
                p(
                    "In this example, what's visible in the client isn't",
                    "what's interesting. The server is writing to a log",
                    "file each time the slider value changes."
                )
            )
        )
    )
)

server <- function(input, output, session) {
    # Create a random name for the log file
    logfilename <- tempfile('logfile', fileext = '.txt')

    output$logfile <- renderText({
        sprintf("Log file: %s", logfilename)
    })

    # This observer adds an entry to the log file every time
    # input$n changes.
    obs <- observe({
        cat(input$n, '\n', file = logfilename, append = TRUE)
    })

    session$onSessionEnded(function() {
        # When the client ends the session, clean up the log file
        # for this session.
        unlink(logfilename)
    })

    output$text <- renderText({
        paste0("The value of input$n is: ", input$n)
    })
}

shinyApp(ui = ui, server = server)

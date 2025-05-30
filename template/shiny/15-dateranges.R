ui <- fluidPage(
    titlePanel("Dates and date ranges"),

    column(
        4,
        wellPanel(
            dateInput(
                'date',
                label = 'Date input: yyyy-mm-dd',
                value = Sys.Date()
            ),

            dateInput(
                'date2',
                label = paste(
                    'Date input 2: string for starting value,',
                    'dd/mm/yy format, locale ja, range limited,',
                    'week starts on day 1 (Monday)'
                ),
                value = as.character(Sys.Date()),
                min = Sys.Date() - 5,
                max = Sys.Date() + 5,
                format = "dd/mm/yy",
                startview = 'year',
                language = 'zh-TW',
                weekstart = 1
            ),

            dateRangeInput(
                'dateRange',
                label = 'Date range input: yyyy-mm-dd',
                start = Sys.Date() - 2,
                end = Sys.Date() + 2
            ),

            dateRangeInput(
                'dateRange2',
                label = paste(
                    'Date range input 2: range is limited,',
                    'dd/mm/yy, language: fr, week starts on day 1 (Monday),',
                    'separator is "-", start view is year'
                ),
                start = Sys.Date() - 3,
                end = Sys.Date() + 3,
                min = Sys.Date() - 10,
                max = Sys.Date() + 10,
                separator = " - ",
                format = "dd/mm/yy",
                startview = 'year',
                language = 'fr',
                weekstart = 1
            )
        )
    ),

    column(
        6,
        verbatimTextOutput("dateText"),
        verbatimTextOutput("dateText2"),
        verbatimTextOutput("dateRangeText"),
        verbatimTextOutput("dateRangeText2")
    )
)


server <- function(input, output, session) {
    # input$date and others are Date objects. When outputting
    # text, we need to convert to character; otherwise it will
    # print an integer rather than a date.
    output$dateText <- renderText({
        paste("input$date is", as.character(input$date))
    })

    output$dateText2 <- renderText({
        paste("input$date2 is", as.character(input$date2))
    })

    output$dateRangeText <- renderText({
        paste(
            "input$dateRange is",
            paste(as.character(input$dateRange), collapse = " to ")
        )
    })

    output$dateRangeText2 <- renderText({
        paste(
            "input$dateRange2 is",
            paste(as.character(input$dateRange2), collapse = " to ")
        )
    })
}

shinyApp(ui, server)

ui <- fluidPage(
    sidebarLayout(
        sidebarPanel(
            # use regions as option groups
            selectizeInput(
                "x1",
                "X1",
                choices = list(
                    Eastern = list(`New York` = "NY", `New Jersey` = "NJ"),
                    Western = list(`California` = "CA", `Washington` = "WA")
                ),
                multiple = TRUE
            ),

            # use updateSelectizeInput() to generate options later
            selectizeInput("x2", "X2", choices = NULL),

            # an ordinary selectize input without option groups
            selectizeInput(
                "x3",
                "X3",
                choices = setNames(state.abb, state.name)
            ),

            # a select input
            selectInput(
                "x4",
                "X4",
                choices = list(
                    Eastern = list(`New York` = "NY", `New Jersey` = "NJ"),
                    Western = list(`California` = "CA", `Washington` = "WA")
                ),
                selectize = FALSE
            )
        ),
        mainPanel(
            verbatimTextOutput("values")
        )
    ),
    title = "Options groups for select(ize) input"
)

server <- function(input, output, session) {
    updateSelectizeInput(
        session,
        'x2',
        choices = list(
            Eastern = list(`Rhode Island` = 'RI', `New Jersey` = 'NJ'),
            Western = list(`Oregon` = 'OR', `Washington` = 'WA'),
            Middle = list(Iowa = 'IA')
        ),
        selected = 'IA'
    )

    output$values <- renderPrint({
        list(x1 = input$x1, x2 = input$x2, x3 = input$x3, x4 = input$x4)
    })
}

shinyApp(ui = ui, server = server)

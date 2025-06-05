ui <- fluidPage(
    br(),
    fluidRow(
        column(
            4,
            h4("Choose prompt, single"),
            p(
                "Because a choose prompt is present, the selectize version should let
        you clear the selection."
            )
        ),
        column(
            4,
            h4("No choose prompt, single"),
            p(
                "Because a choose prompt is not present, the selectize version should
        not let you clear the selection."
            )
        ),
        column(4, h4("No choose prompt, multiple"))
    ),
    fluidRow(
        column(
            4,
            hr(),
            verbatimTextOutput('out1'),
            selectInput(
                'in1',
                'Options',
                c(Choose = '', state.name),
                selectize = FALSE
            )
        ),
        column(
            4,
            hr(),
            verbatimTextOutput('out2'),
            selectInput('in2', 'Options', state.name, selectize = FALSE)
        ),
        column(
            4,
            hr(),
            verbatimTextOutput('out3'),
            selectInput(
                'in3',
                'Options',
                state.name,
                multiple = TRUE,
                selectize = FALSE
            )
        )
    ),
    fluidRow(
        column(
            4,
            hr(),
            verbatimTextOutput('out4'),
            selectInput(
                'in4',
                'Options',
                c(Choose = '', state.name),
                selectize = TRUE
            )
        ),
        column(
            4,
            hr(),
            verbatimTextOutput('out5'),
            selectInput('in5', 'Options', state.name, selectize = TRUE)
        ),
        column(
            4,
            hr(),
            verbatimTextOutput('out6'),
            selectInput(
                'in6',
                'Options',
                state.name,
                multiple = TRUE,
                selectize = TRUE
            )
        )
    )
)


server <- function(input, output, session) {
    output$out1 <- renderPrint(input$in1)
    output$out2 <- renderPrint(input$in2)
    output$out3 <- renderPrint(input$in3)
    output$out4 <- renderPrint(input$in4)
    output$out5 <- renderPrint(input$in5)
    output$out6 <- renderPrint(input$in6)
}

shinyApp(ui = ui, server = server)

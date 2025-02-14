# Load the shiny package
library(shiny)

# Define the UI
ui <- fluidPage(
    titlePanel("Simple Shiny App"),
    sidebarLayout(
        sidebarPanel(
            sliderInput("num", "Choose a number:", 
                                    min = 1, max = 100, value = 50)
        ),
        mainPanel(
            textOutput("result")
        )
    )
)

# Define the server logic
server <- function(input, output) {
    output$result <- renderText({
        paste("You selected:", input$num)
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
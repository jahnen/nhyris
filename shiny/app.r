library(shiny)

ui <- fluidPage(
  titlePanel("Simple Shiny App"),
  sidebarLayout(
    sidebarPanel(
      sliderInput("num", "Choose a number:",
        min = 1, max = 100, value = 50
      )
    ),
    mainPanel(
      textOutput("result")
    )
  )
)

server <- function(input, output) {
  output$result <- renderText({
    paste("You selected:", input$num)
  })
}

shinyApp(ui = ui, server = server)
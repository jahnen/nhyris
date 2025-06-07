library(ggplot2)

dataset <- diamonds

ui <- fluidPage(

  title = "Diamonds Explorer",
  
  plotOutput('plot'),
  
  hr(),

  fluidRow(
    column(3,
      h4("Diamonds Explorer"),
      sliderInput('sampleSize', 'Sample Size', 
                  min=1, max=nrow(dataset),
                  value=min(1000, nrow(dataset)), 
                  step=500, round=0),
      br(),
      checkboxInput('jitter', 'Jitter'),
      checkboxInput('smooth', 'Smooth')
    ),
    column(4, offset = 1,
      selectInput('x', 'X', names(dataset)),
      selectInput('y', 'Y', names(dataset), names(dataset)[[2]]),
      selectInput('color', 'Color', c('None', names(dataset)))
    ),
    column(4,
      selectInput('facet_row', 'Facet Row',
        c(None='.', names(diamonds[sapply(diamonds, is.factor)]))),
      selectInput('facet_col', 'Facet Column',
        c(None='.', names(diamonds[sapply(diamonds, is.factor)])))
    )
  )
)
 
server <- function(input, output) {
 
  dataset <- reactive({
    diamonds[sample(nrow(diamonds), input$sampleSize),]
  })
 
  output$plot <- renderPlot({
    
    p <- ggplot(dataset(), aes_string(x=input$x, y=input$y)) + geom_point()
    
    if (input$color != 'None')
      p <- p + aes_string(color=input$color)
    
    facets <- paste(input$facet_row, '~', input$facet_col)
    if (facets != '. ~ .')
      p <- p + facet_grid(facets)
    
    if (input$jitter)
      p <- p + geom_jitter()
    if (input$smooth)
      p <- p + geom_smooth()
    
    print(p)
    
  })
  
}

shinyApp(ui, server)
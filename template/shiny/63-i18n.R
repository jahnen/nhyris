# 定义用户界面
ui <- fluidPage(
    # 标题
    titlePanel("麻麻再也不用担心我的Shiny应用不能显示中文了"),

    # 侧边栏布局
    sidebarLayout(
        sidebarPanel(
            selectInput(
                "dataset",
                "请选一个数据：",
                choices = c("岩石", "pressure", "cars")
            ),

            uiOutput("rockvars"),

            numericInput("obs", "查看多少行数据？", 5),

            checkboxInput("summary", "显示概要", TRUE)
        ),

        # 展示一个HTML表格
        mainPanel(
            conditionalPanel(
                "input.dataset === '岩石'",
                plotOutput("rockplot")
            ),

            verbatimTextOutput("summary这里也可以用中文"),

            tableOutput("view")
        )
    )
)

library(datasets)

rock2 <- rock
names(rock2) <- c("面积", "周长", "形状", "渗透性")

# Cairo包的PNG设备似乎无法显示中文字符，强制使用R自身的png()设备
options(shiny.usecairo = FALSE)

# 请忽略以下代码，它只是为了解决ShinyApps上没有中文字体的问题
font_home <- function(path = '') file.path('~', '.fonts', path)
if (
    Sys.info()[['sysname']] == 'Linux' &&
        system('locate wqy-zenhei.ttc') != 0 &&
        !file.exists(font_home('wqy-zenhei.ttc'))
) {
    if (!file.exists('wqy-zenhei.ttc'))
        curl::curl_download(
            'https://github.com/rstudio/shiny-examples/releases/download/v0.10.1/wqy-zenhei.ttc',
            'wqy-zenhei.ttc'
        )
    dir.create(font_home())
    file.copy('wqy-zenhei.ttc', font_home())
    system2('fc-cache', paste('-f', font_home()))
}
rm(font_home)

if (.Platform$OS.type == "windows") {
    if (!grepl("Chinese", Sys.getlocale())) {
        warning(
            "You probably want Chinese locale on Windows for this app",
            "to render correctly. See ",
            "https://github.com/rstudio/shiny/issues/1053#issuecomment-167011937"
        )
    }
}

# 定义服务器逻辑
server <- function(input, output) {
    cars2 <- cars
    cars2$random <- sample(
        strsplit("随意放一些中文字符", "")[[1]],
        nrow(cars2),
        replace = TRUE
    )

    # 返回数据集，注意input$dataset返回的结果可能是中文“岩石”
    datasetInput <- reactive({
        if (input$dataset == "岩石") return(rock2)
        if (input$dataset == "pressure") return(pressure)
        if (input$dataset == "cars") return(cars2)
    })

    output$rockvars <- renderUI({
        if (input$dataset != "岩石") return()
        selectInput("vars", "从岩石数据中选择一列作为自变量", names(rock2)[-1])
    })

    output$rockplot <- renderPlot({
        validate(need(input$vars, ""))
        par(mar = c(4, 4, .1, .1))
        plot(as.formula(paste("面积 ~ ", input$vars)), data = rock2)
    })

    # 数据概要信息
    output[['summary这里也可以用中文']] <- renderPrint({
        if (!input$summary) return(cat("数据概要信息被隐藏了！"))
        dataset <- datasetInput()
        summary(dataset)
    })

    # 显示前"n"行数据
    output$view <- renderTable({
        head(datasetInput(), n = input$obs)
    })
}

shinyApp(ui = ui, server = server)

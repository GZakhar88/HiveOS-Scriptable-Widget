// ************************************************************************************
// description: A scriptable widget that shows to you the most important info about your HiveOS mining farm 🚀
// author: Gabor Zakhar
// GitHub: GZakhar88
// ************************************************************************************

//  Create your API token in your HiveOS account (Account Profile Settings -> Authentication Tokens)
//  KEEP YOUR TOKEN SAFE!!! NEVER SHARE WITH ANYONE OR SEND FOR SOMEONE!!! WITH THIS TOKEN CAN TAKE FULL CONTROL OF YOUR PROFILE!!!!!
const token = ""; //  COPY YOUR HIVE API AUTH TOKEN INTO "token" VARIABLE as a string!
const apiUrl = "https://api2.hiveos.farm/api/v2";

if (token.length !== 0) {
  // REQUEST FUNCTION
  async function fetchData(url) {
    try {
      let req = await new Request(url);
      req.headers = { Authorization: "Bearer " + token };
      return await req.loadJSON();
    } catch (error) {
      console.log(error);
    }
  }

  async function loadIcon() {
    try {
      let url =
        "https://image.winudf.com/v2/image1/aGl2ZW9zLm1vYmlsZV9pY29uXzE1Nzk2NjIyODNfMDE0/icon.png?w=&fakeurl=1";
      let req = new Request(url);
      return req.loadImage();
    } catch (error) {
      console.log(error);
    }
  }

  let farmData = await fetchData(apiUrl + "/farms");
  let farmId = farmData.data[0].id;
  let workerData = await fetchData(apiUrl + "/farms/" + farmId + "/workers");
  let workerStatus = workerData.data[0].active ? "Active" : "Inactive";

  // CREATE DATA OBJECT FOR WIDGET
  let widgetData = {
    farmName: farmData.data[0].name,
    workerName: workerData.data[0].name,
    workerStatus: workerStatus,
    workerConsumption: workerData.data[0].stats.power_draw.toString() + " W",
    hashRate:
      (
        parseInt(workerData.data[0].miners_summary.hashrates[0].hash) / 1000
      ).toString() + " MH",
    minerStats: workerData.data[0].miners_stats,
    minerSummary: workerData.data[0].miners_summary,
    onlineGpu: workerData.data[0].stats.gpus_online,
    offlineGpu: workerData.data[0].stats.gpus_offline,
    gpuStats: workerData.data[0].gpu_stats,
  };

  // CREATE WIDGET
  async function createWidget(inputData) {
    let appIcon = await loadIcon();
    let farmName = inputData.farmName;
    let widget = new ListWidget();

    // Add background gradient
    let gradient = new LinearGradient();
    gradient.locations = [0, 1];
    gradient.colors = [new Color("141414"), new Color("13233F")];
    widget.backgroundGradient = gradient;

    // title and icon
    let titleStack = widget.addStack();
    titleStack.layoutHorizontally();

    let title = titleStack.addText(farmName);
    title.leftAlignText();
    title.textColor = Color.white();
    title.textOpacity = 0.8;
    title.font = Font.mediumSystemFont(13);

    function space() {
      let result = 15;
      if (config.widgetFamily === "medium") {
        result = 190;
      } else if (config.widgetFamily === "large") {
        result = 190;
      } else if (config.widgetFamily === "extraLarge") {
        result = 570;
      }
      return result;
    }

    titleStack.addSpacer(space());

    let icon = titleStack.addImage(appIcon);
    icon.imageSize = new Size(20, 20);

    //Infos depends on widget size
    if (config.widgetFamily === "extraLarge") {
      icon.imageSize = new Size(30, 30);
      let dataStack = widget.addStack();
      dataStack.layoutVertically();

      let rigName = dataStack.addText(inputData.workerName);
      rigName.textColor = Color.white();
      rigName.font = Font.boldSystemFont(16);
      dataStack.addSpacer(6);

      let status = dataStack.addText(inputData.workerStatus);
      status.textColor = inputData.workerStatus = "Active"
        ? Color.green()
        : Color.red();
      status.font = Font.systemFont(16);

      let hashRate = dataStack.addText(inputData.hashRate);
      hashRate.textColor = Color.white();
      hashRate.font = Font.systemFont(16);

      let consumption = dataStack.addText(inputData.workerConsumption);
      consumption.textColor = Color.white();
      consumption.font = Font.systemFont(16);

      dataStack.addSpacer(10);

      let statsStack = widget.addStack();
      statsStack.layoutVertically();

      let miner = inputData.minerSummary.hashrates[0].miner;
      let version = inputData.minerSummary.hashrates[0].ver;
      let coin = inputData.minerSummary.hashrates[0].coin;

      let minerElement = statsStack.addText(
        "Miner software: " + miner + " " + version
      );
      minerElement.textColor = Color.white();
      minerElement.font = Font.systemFont(16);

      let coinElement = statsStack.addText("Coin: " + coin);
      coinElement.textColor = Color.white();
      coinElement.font = Font.systemFont(16);

      statsStack.addSpacer(10);

      let gpuStack = widget.addStack();
      gpuStack.layoutVertically();

      inputData.gpuStats.map((gpu) => {
        let gpuLine = gpuStack.addStack();
        let gpuId = gpuLine.addText(
          "GPU " + inputData.gpuStats.indexOf(gpu).toString() + ": "
        );
        gpuId.textColor = Color.white();
        gpuId.font = Font.systemFont(13);

        gpuLine.addSpacer(30);

        let gpuHash = gpuLine.addText(
          (gpu.hash / 1000).toFixed(1).toString() + " MH"
        );
        gpuHash.textColor = Color.white();
        gpuHash.font = Font.systemFont(13);

        gpuLine.addSpacer(30);

        let gpuPower = gpuLine.addText("⚡️ " + gpu.power.toString() + " w");
        gpuPower.textColor = Color.white();
        gpuPower.font = Font.systemFont(13);

        gpuLine.addSpacer(30);

        let tempIcon;
        let tempColor;

        if (gpu.temp > 60) {
          tempColor = Color.red();
          tempIcon = "🔥 ";
        } else if (gpu.temp > 45) {
          tempColor = Color.yellow();
          tempIcon = "🌡 ";
        } else {
          tempColor = Color.green();
          tempIcon = "❄️ ";
        }
        let gpuTemp = gpuLine.addText(tempIcon + gpu.temp.toString() + " °C");

        gpuTemp.textColor = tempColor;
        gpuTemp.font = Font.systemFont(13);

        gpuLine.addSpacer(30);

        let fanRpm = gpuLine.addText("🌀 " + gpu.fan.toString() + " %");
        fanRpm.textColor = Color.white();
        fanRpm.font = Font.systemFont(13);

        gpuStack.addSpacer(4);
      });
    } else if (config.widgetFamily === "large") {
      icon.imageSize = new Size(25, 25);
      let dataStack = widget.addStack();
      dataStack.layoutVertically();

      let rigName = dataStack.addText(inputData.workerName);
      rigName.textColor = Color.white();
      rigName.font = Font.boldSystemFont(15);
      dataStack.addSpacer(10);

      let status = dataStack.addText(inputData.workerStatus);
      status.textColor = inputData.workerStatus = "Active"
        ? Color.green()
        : Color.red();
      status.font = Font.systemFont(14);

      let hashRate = dataStack.addText(inputData.hashRate);
      hashRate.textColor = Color.white();
      hashRate.font = Font.systemFont(15);

      let consumption = dataStack.addText(inputData.workerConsumption);
      consumption.textColor = Color.white();
      consumption.font = Font.systemFont(15);

      dataStack.addSpacer(10);

      let gpuStack = widget.addStack();
      gpuStack.layoutVertically();

      inputData.gpuStats.map((gpu) => {
        let gpuLine = gpuStack.addStack();
        let gpuId = gpuLine.addText(
          "GPU " + inputData.gpuStats.indexOf(gpu).toString() + ": "
        );
        gpuId.textColor = Color.white();
        gpuId.font = Font.systemFont(12);

        gpuLine.addSpacer(13);

        let gpuHash = gpuLine.addText(
          (gpu.hash / 1000).toFixed(1).toString() + " MH"
        );
        gpuHash.textColor = Color.white();
        gpuHash.font = Font.systemFont(12);

        gpuLine.addSpacer(13);

        let gpuPower = gpuLine.addText("⚡️ " + gpu.power.toString() + " w");
        gpuPower.textColor = Color.white();
        gpuPower.font = Font.systemFont(12);

        gpuLine.addSpacer(13);

        let tempIcon;
        let tempColor;

        if (gpu.temp > 60) {
          tempColor = Color.red();
          tempIcon = "🔥 ";
        } else if (gpu.temp > 45) {
          tempColor = Color.yellow();
          tempIcon = "🌡 ";
        } else {
          tempColor = Color.green();
          tempIcon = "❄️ ";
        }
        let gpuTemp = gpuLine.addText(tempIcon + gpu.temp.toString() + " °C");

        gpuTemp.textColor = tempColor;
        gpuTemp.font = Font.systemFont(12);

        gpuLine.addSpacer(13);

        let fanRpm = gpuLine.addText("🌀 " + gpu.fan.toString() + " %");
        fanRpm.textColor = Color.white();
        fanRpm.font = Font.systemFont(12);
      });
    } else if (config.widgetFamily === "medium") {
      let dataStack = widget.addStack();
      dataStack.layoutVertically();

      let rigName = dataStack.addText(inputData.workerName);
      rigName.textColor = Color.white();
      rigName.font = Font.boldSystemFont(18);
      dataStack.addSpacer(2);

      let status = dataStack.addText(inputData.workerStatus);
      status.minimumScaleFactor = 0.5;
      status.textColor = inputData.workerStatus = "Active"
        ? Color.green()
        : Color.red();
      status.font = Font.systemFont(18);

      let hashRate = dataStack.addText(inputData.hashRate);
      hashRate.minimumScaleFactor = 0.5;
      hashRate.textColor = Color.white();
      hashRate.font = Font.systemFont(18);

      let consumption = dataStack.addText(inputData.workerConsumption);
      consumption.minimumScaleFactor = 0.5;
      consumption.textColor = Color.white();
      consumption.font = Font.systemFont(18);
    } else if (config.widgetFamily === "small") {
      let dataStack = widget.addStack();
      dataStack.layoutVertically();

      let rigName = dataStack.addText(inputData.workerName);
      rigName.textColor = Color.white();
      rigName.font = Font.boldSystemFont(18);
      dataStack.addSpacer(2);

      let status = dataStack.addText(inputData.workerStatus);
      status.minimumScaleFactor = 0.5;
      status.textColor = inputData.workerStatus = "Active"
        ? Color.green()
        : Color.red();
      status.font = Font.systemFont(18);

      let hashRate = dataStack.addText(inputData.hashRate);
      hashRate.minimumScaleFactor = 0.5;
      hashRate.textColor = Color.white();
      hashRate.font = Font.systemFont(18);

      let consumption = dataStack.addText(inputData.workerConsumption);
      consumption.minimumScaleFactor = 0.5;
      consumption.textColor = Color.white();
      consumption.font = Font.systemFont(18);
    }

    return widget;
  }

  let widget = await createWidget(widgetData);
  config.runsInWidget ? Script.setWidget(widget) : widget.presentMedium();
  Script.complete();
} else {
  let widget = new ListWidget();
  let message = widget.addStack();
  let messageElement = message.addText("Please fill up the token field");
  messageElement.textColor = Color.white();
  messageElement.font = Font.systemFont(18);

  config.runsInWidget ? Script.setWidget(widget) : widget.presentMedium();
  Script.complete();
}

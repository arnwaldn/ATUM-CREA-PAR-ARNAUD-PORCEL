//+------------------------------------------------------------------+
//|                                           Custom_Indicator.mq5    |
//|                                       Copyright 2025, ULTRA-CREATE |
//|                                             https://ultra-create.ai |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, ULTRA-CREATE"
#property link      "https://ultra-create.ai"
#property version   "1.00"
#property description "Template Indicateur Personnalisé avec Signaux"

//--- Indicator settings
#property indicator_chart_window
#property indicator_buffers 5
#property indicator_plots   5

//--- Plot 1: Main Line
#property indicator_label1  "Main"
#property indicator_type1   DRAW_LINE
#property indicator_color1  clrDodgerBlue
#property indicator_style1  STYLE_SOLID
#property indicator_width1  2

//--- Plot 2: Signal Line
#property indicator_label2  "Signal"
#property indicator_type2   DRAW_LINE
#property indicator_color2  clrOrangeRed
#property indicator_style2  STYLE_SOLID
#property indicator_width2  1

//--- Plot 3: Upper Band
#property indicator_label3  "Upper"
#property indicator_type3   DRAW_LINE
#property indicator_color3  clrGray
#property indicator_style3  STYLE_DOT
#property indicator_width3  1

//--- Plot 4: Lower Band
#property indicator_label4  "Lower"
#property indicator_type4   DRAW_LINE
#property indicator_color4  clrGray
#property indicator_style4  STYLE_DOT
#property indicator_width4  1

//--- Plot 5: Arrows (Buy/Sell signals)
#property indicator_label5  "Signals"
#property indicator_type5   DRAW_COLOR_ARROW
#property indicator_color5  clrLime,clrRed
#property indicator_width5  3

//+------------------------------------------------------------------+
//| Input Parameters                                                   |
//+------------------------------------------------------------------+
input group "=== INDICATOR PARAMETERS ==="
input int      InpMainPeriod     = 14;        // Main Period
input int      InpSignalPeriod   = 9;         // Signal Period
input double   InpBandMultiplier = 2.0;       // Band Multiplier
input ENUM_MA_METHOD InpMAMethod = MODE_EMA;  // MA Method
input ENUM_APPLIED_PRICE InpAppliedPrice = PRICE_CLOSE; // Applied Price

input group "=== SIGNAL SETTINGS ==="
input bool     InpShowSignals    = true;      // Show Buy/Sell Arrows
input bool     InpAlertOn        = true;      // Enable Alerts
input bool     InpPushNotify     = false;     // Push Notifications

//+------------------------------------------------------------------+
//| Indicator Buffers                                                  |
//+------------------------------------------------------------------+
double BufferMain[];
double BufferSignal[];
double BufferUpper[];
double BufferLower[];
double BufferArrows[];
double BufferArrowsColor[];

//--- Internal handles
int handleMA;
int handleStdDev;

//--- Alert management
datetime lastAlertTime = 0;

//+------------------------------------------------------------------+
//| Custom indicator initialization function                          |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Validate inputs
   if(InpMainPeriod < 2)
   {
      Print("Error: Main Period must be >= 2");
      return INIT_PARAMETERS_INCORRECT;
   }

   //--- Set indicator buffers
   SetIndexBuffer(0, BufferMain, INDICATOR_DATA);
   SetIndexBuffer(1, BufferSignal, INDICATOR_DATA);
   SetIndexBuffer(2, BufferUpper, INDICATOR_DATA);
   SetIndexBuffer(3, BufferLower, INDICATOR_DATA);
   SetIndexBuffer(4, BufferArrows, INDICATOR_DATA);
   SetIndexBuffer(5, BufferArrowsColor, INDICATOR_COLOR_INDEX);

   //--- Set as series (newest first)
   ArraySetAsSeries(BufferMain, true);
   ArraySetAsSeries(BufferSignal, true);
   ArraySetAsSeries(BufferUpper, true);
   ArraySetAsSeries(BufferLower, true);
   ArraySetAsSeries(BufferArrows, true);
   ArraySetAsSeries(BufferArrowsColor, true);

   //--- Arrow codes
   PlotIndexSetInteger(4, PLOT_ARROW, 233);     // Up arrow for buy
   PlotIndexSetInteger(4, PLOT_ARROW_SHIFT, 0);

   //--- Empty value
   PlotIndexSetDouble(4, PLOT_EMPTY_VALUE, EMPTY_VALUE);

   //--- Create indicator handles
   handleMA = iMA(_Symbol, PERIOD_CURRENT, InpMainPeriod, 0, InpMAMethod, InpAppliedPrice);
   handleStdDev = iStdDev(_Symbol, PERIOD_CURRENT, InpMainPeriod, 0, InpMAMethod, InpAppliedPrice);

   if(handleMA == INVALID_HANDLE || handleStdDev == INVALID_HANDLE)
   {
      Print("Error: Failed to create indicator handles");
      return INIT_FAILED;
   }

   //--- Set indicator name
   string shortName = "CustomInd(" + IntegerToString(InpMainPeriod) + "," +
                      IntegerToString(InpSignalPeriod) + ")";
   IndicatorSetString(INDICATOR_SHORTNAME, shortName);

   //--- Digits
   IndicatorSetInteger(INDICATOR_DIGITS, _Digits);

   Print("Custom Indicator initialized on ", _Symbol);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                        |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(handleMA);
   IndicatorRelease(handleStdDev);

   //--- Remove objects
   ObjectsDeleteAll(0, "Signal_");

   Comment("");
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                               |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
   //--- Check for minimum bars
   if(rates_total < InpMainPeriod + InpSignalPeriod)
      return 0;

   //--- Set arrays as series
   ArraySetAsSeries(time, true);
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);
   ArraySetAsSeries(close, true);

   //--- Calculate start position
   int start;
   if(prev_calculated == 0)
   {
      start = rates_total - InpMainPeriod - InpSignalPeriod - 1;
      //--- Initialize buffers
      ArrayInitialize(BufferMain, EMPTY_VALUE);
      ArrayInitialize(BufferSignal, EMPTY_VALUE);
      ArrayInitialize(BufferUpper, EMPTY_VALUE);
      ArrayInitialize(BufferLower, EMPTY_VALUE);
      ArrayInitialize(BufferArrows, EMPTY_VALUE);
   }
   else
   {
      start = rates_total - prev_calculated + 1;
   }

   //--- Get indicator data
   double ma[], stddev[];
   ArraySetAsSeries(ma, true);
   ArraySetAsSeries(stddev, true);

   if(CopyBuffer(handleMA, 0, 0, rates_total, ma) <= 0) return 0;
   if(CopyBuffer(handleStdDev, 0, 0, rates_total, stddev) <= 0) return 0;

   //--- Main calculation loop
   for(int i = start; i >= 0; i--)
   {
      //--- Main line (example: custom calculation)
      BufferMain[i] = ma[i];

      //--- Upper and Lower bands
      BufferUpper[i] = ma[i] + InpBandMultiplier * stddev[i];
      BufferLower[i] = ma[i] - InpBandMultiplier * stddev[i];

      //--- Signal line (smoothed main)
      if(i + InpSignalPeriod < rates_total)
      {
         double sum = 0;
         for(int j = 0; j < InpSignalPeriod; j++)
         {
            sum += BufferMain[i + j];
         }
         BufferSignal[i] = sum / InpSignalPeriod;
      }

      //--- Generate signals
      BufferArrows[i] = EMPTY_VALUE;

      if(i > 0 && i < rates_total - 2 && InpShowSignals)
      {
         //--- Buy signal: Main crosses above Signal
         if(BufferMain[i+1] <= BufferSignal[i+1] && BufferMain[i] > BufferSignal[i])
         {
            BufferArrows[i] = low[i] - 10 * _Point;
            BufferArrowsColor[i] = 0; // Green (Buy)

            if(i == 1) // Current bar
               SendAlert("BUY", time[i]);
         }
         //--- Sell signal: Main crosses below Signal
         else if(BufferMain[i+1] >= BufferSignal[i+1] && BufferMain[i] < BufferSignal[i])
         {
            BufferArrows[i] = high[i] + 10 * _Point;
            BufferArrowsColor[i] = 1; // Red (Sell)

            if(i == 1) // Current bar
               SendAlert("SELL", time[i]);
         }
      }
   }

   //--- Display info on chart
   DisplayInfo(close[0]);

   return rates_total;
}

//+------------------------------------------------------------------+
//| Send alert                                                         |
//+------------------------------------------------------------------+
void SendAlert(string signal, datetime signalTime)
{
   if(!InpAlertOn)
      return;

   //--- Prevent multiple alerts for same bar
   if(signalTime == lastAlertTime)
      return;

   lastAlertTime = signalTime;

   string message = "Custom Indicator " + signal + " Signal on " + _Symbol +
                    " at " + TimeToString(signalTime, TIME_MINUTES);

   Alert(message);

   if(InpPushNotify)
      SendNotification(message);
}

//+------------------------------------------------------------------+
//| Display information on chart                                       |
//+------------------------------------------------------------------+
void DisplayInfo(double currentPrice)
{
   string info = "";
   info += "=== Custom Indicator ===\n";
   info += "Main: " + DoubleToString(BufferMain[0], _Digits) + "\n";
   info += "Signal: " + DoubleToString(BufferSignal[0], _Digits) + "\n";
   info += "Upper: " + DoubleToString(BufferUpper[0], _Digits) + "\n";
   info += "Lower: " + DoubleToString(BufferLower[0], _Digits) + "\n";

   //--- Trend direction
   if(BufferMain[0] > BufferSignal[0])
      info += "Trend: BULLISH\n";
   else if(BufferMain[0] < BufferSignal[0])
      info += "Trend: BEARISH\n";
   else
      info += "Trend: NEUTRAL\n";

   //--- Price position
   if(currentPrice > BufferUpper[0])
      info += "Price: OVERBOUGHT\n";
   else if(currentPrice < BufferLower[0])
      info += "Price: OVERSOLD\n";
   else
      info += "Price: IN RANGE\n";

   Comment(info);
}

//+------------------------------------------------------------------+
//| ChartEvent function                                                |
//+------------------------------------------------------------------+
void OnChartEvent(const int id,
                  const long &lparam,
                  const double &dparam,
                  const string &sparam)
{
   //--- Handle chart events if needed
   if(id == CHARTEVENT_CLICK)
   {
      // Handle click
   }
}
//+------------------------------------------------------------------+

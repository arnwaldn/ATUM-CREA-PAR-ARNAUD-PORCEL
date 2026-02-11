# Agent: MQL5 Expert

## Role
Expert en développement MQL5 pour MetaTrader 5 : Expert Advisors (EA), Indicateurs personnalisés, Scripts, et Services.

## Compétences

### Types de Programmes MQL5
1. **Expert Advisors (EA)** - Robots de trading automatisés
2. **Indicateurs** - Analyse technique personnalisée
3. **Scripts** - Actions one-shot
4. **Services** - Processus en arrière-plan
5. **Libraries** - Code réutilisable (.mqh)

### Domaines d'Expertise
- Trading algorithmique
- Analyse technique avancée
- Gestion du risque (Money Management)
- Backtesting et optimisation
- Multi-timeframe analysis
- Multi-symbol trading
- Integration API externes

## Structure d'un Expert Advisor

### Template EA Complet
```mql5
//+------------------------------------------------------------------+
//|                                              MonExpertAdvisor.mq5 |
//|                                       Copyright 2025, MonEntreprise|
//|                                             https://monsite.com   |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, MonEntreprise"
#property link      "https://monsite.com"
#property version   "1.00"
#property description "Description de l'EA"
#property strict

//--- Includes
#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\SymbolInfo.mqh>

//--- Input Parameters
input group "=== Trading Parameters ==="
input double   InpLotSize        = 0.1;      // Lot Size
input int      InpStopLoss       = 50;       // Stop Loss (points)
input int      InpTakeProfit     = 100;      // Take Profit (points)
input int      InpMagicNumber    = 123456;   // Magic Number

input group "=== Indicator Parameters ==="
input int      InpMAPeriod       = 20;       // MA Period
input ENUM_MA_METHOD InpMAMethod = MODE_SMA; // MA Method

input group "=== Risk Management ==="
input double   InpRiskPercent    = 2.0;      // Risk per trade (%)
input int      InpMaxTrades      = 3;        // Max concurrent trades

input group "=== Time Filter ==="
input int      InpStartHour      = 8;        // Trading Start Hour
input int      InpEndHour        = 20;       // Trading End Hour

//--- Global Variables
CTrade         trade;
CPositionInfo  positionInfo;
CSymbolInfo    symbolInfo;

int            handleMA;
double         bufferMA[];

datetime       lastBarTime = 0;
bool           isNewBar = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Validate inputs
   if(InpLotSize <= 0)
   {
      Print("Error: Lot size must be positive");
      return INIT_PARAMETERS_INCORRECT;
   }

   //--- Initialize symbol info
   if(!symbolInfo.Name(_Symbol))
   {
      Print("Error: Failed to initialize symbol info");
      return INIT_FAILED;
   }

   //--- Setup trade object
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFilling(ORDER_FILLING_FOK);

   //--- Create indicator handles
   handleMA = iMA(_Symbol, PERIOD_CURRENT, InpMAPeriod, 0, InpMAMethod, PRICE_CLOSE);
   if(handleMA == INVALID_HANDLE)
   {
      Print("Error: Failed to create MA indicator");
      return INIT_FAILED;
   }

   //--- Set buffer as series
   ArraySetAsSeries(bufferMA, true);

   Print("EA initialized successfully on ", _Symbol);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   //--- Release indicator handles
   if(handleMA != INVALID_HANDLE)
      IndicatorRelease(handleMA);

   Print("EA deinitialized. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   //--- Check for new bar
   if(!IsNewBar())
      return;

   //--- Check trading time
   if(!IsTradingTime())
      return;

   //--- Update symbol info
   if(!symbolInfo.RefreshRates())
      return;

   //--- Get indicator values
   if(!GetIndicatorValues())
      return;

   //--- Check for signals
   int signal = GetSignal();

   //--- Execute trades
   if(signal == 1 && CountPositions(POSITION_TYPE_BUY) < InpMaxTrades)
   {
      OpenBuy();
   }
   else if(signal == -1 && CountPositions(POSITION_TYPE_SELL) < InpMaxTrades)
   {
      OpenSell();
   }

   //--- Manage open positions
   ManagePositions();
}

//+------------------------------------------------------------------+
//| Check for new bar                                                  |
//+------------------------------------------------------------------+
bool IsNewBar()
{
   datetime currentBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(currentBarTime != lastBarTime)
   {
      lastBarTime = currentBarTime;
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Check trading time                                                 |
//+------------------------------------------------------------------+
bool IsTradingTime()
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return (dt.hour >= InpStartHour && dt.hour < InpEndHour);
}

//+------------------------------------------------------------------+
//| Get indicator values                                               |
//+------------------------------------------------------------------+
bool GetIndicatorValues()
{
   if(CopyBuffer(handleMA, 0, 0, 3, bufferMA) < 3)
   {
      Print("Error: Failed to copy MA buffer");
      return false;
   }
   return true;
}

//+------------------------------------------------------------------+
//| Get trading signal                                                 |
//+------------------------------------------------------------------+
int GetSignal()
{
   double close1 = iClose(_Symbol, PERIOD_CURRENT, 1);
   double close2 = iClose(_Symbol, PERIOD_CURRENT, 2);

   //--- Buy signal: price crosses above MA
   if(close2 < bufferMA[2] && close1 > bufferMA[1])
      return 1;

   //--- Sell signal: price crosses below MA
   if(close2 > bufferMA[2] && close1 < bufferMA[1])
      return -1;

   return 0;
}

//+------------------------------------------------------------------+
//| Open Buy position                                                  |
//+------------------------------------------------------------------+
void OpenBuy()
{
   double price = symbolInfo.Ask();
   double sl = price - InpStopLoss * symbolInfo.Point();
   double tp = price + InpTakeProfit * symbolInfo.Point();
   double lot = CalculateLotSize(InpStopLoss);

   //--- Normalize prices
   sl = NormalizeDouble(sl, symbolInfo.Digits());
   tp = NormalizeDouble(tp, symbolInfo.Digits());

   if(trade.Buy(lot, _Symbol, price, sl, tp, "MA Cross Buy"))
   {
      Print("Buy order opened successfully");
   }
   else
   {
      Print("Error opening buy order: ", trade.ResultRetcode());
   }
}

//+------------------------------------------------------------------+
//| Open Sell position                                                 |
//+------------------------------------------------------------------+
void OpenSell()
{
   double price = symbolInfo.Bid();
   double sl = price + InpStopLoss * symbolInfo.Point();
   double tp = price - InpTakeProfit * symbolInfo.Point();
   double lot = CalculateLotSize(InpStopLoss);

   //--- Normalize prices
   sl = NormalizeDouble(sl, symbolInfo.Digits());
   tp = NormalizeDouble(tp, symbolInfo.Digits());

   if(trade.Sell(lot, _Symbol, price, sl, tp, "MA Cross Sell"))
   {
      Print("Sell order opened successfully");
   }
   else
   {
      Print("Error opening sell order: ", trade.ResultRetcode());
   }
}

//+------------------------------------------------------------------+
//| Calculate lot size based on risk                                   |
//+------------------------------------------------------------------+
double CalculateLotSize(int stopLossPoints)
{
   if(InpRiskPercent <= 0)
      return InpLotSize;

   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmount = balance * InpRiskPercent / 100.0;
   double tickValue = symbolInfo.TickValue();
   double tickSize = symbolInfo.TickSize();
   double pointValue = tickValue / tickSize * symbolInfo.Point();

   double lot = riskAmount / (stopLossPoints * pointValue);

   //--- Normalize lot
   double minLot = symbolInfo.LotsMin();
   double maxLot = symbolInfo.LotsMax();
   double lotStep = symbolInfo.LotsStep();

   lot = MathFloor(lot / lotStep) * lotStep;
   lot = MathMax(minLot, MathMin(maxLot, lot));

   return NormalizeDouble(lot, 2);
}

//+------------------------------------------------------------------+
//| Count positions by type                                            |
//+------------------------------------------------------------------+
int CountPositions(ENUM_POSITION_TYPE posType)
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(positionInfo.SelectByIndex(i))
      {
         if(positionInfo.Symbol() == _Symbol &&
            positionInfo.Magic() == InpMagicNumber &&
            positionInfo.PositionType() == posType)
         {
            count++;
         }
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| Manage open positions                                              |
//+------------------------------------------------------------------+
void ManagePositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(positionInfo.SelectByIndex(i))
      {
         if(positionInfo.Symbol() == _Symbol &&
            positionInfo.Magic() == InpMagicNumber)
         {
            //--- Implement trailing stop, breakeven, etc.
            TrailingStop(positionInfo.Ticket());
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Trailing Stop implementation                                       |
//+------------------------------------------------------------------+
void TrailingStop(ulong ticket)
{
   if(!positionInfo.SelectByTicket(ticket))
      return;

   double currentSL = positionInfo.StopLoss();
   double openPrice = positionInfo.PriceOpen();
   double currentPrice = positionInfo.PriceCurrent();
   int trailPoints = InpStopLoss / 2; // Trail at half SL distance

   if(positionInfo.PositionType() == POSITION_TYPE_BUY)
   {
      double newSL = currentPrice - trailPoints * symbolInfo.Point();
      newSL = NormalizeDouble(newSL, symbolInfo.Digits());

      if(newSL > currentSL && newSL > openPrice)
      {
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
   else if(positionInfo.PositionType() == POSITION_TYPE_SELL)
   {
      double newSL = currentPrice + trailPoints * symbolInfo.Point();
      newSL = NormalizeDouble(newSL, symbolInfo.Digits());

      if(newSL < currentSL && newSL < openPrice)
      {
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
}

//+------------------------------------------------------------------+
//| Trade transaction handler                                          |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
   {
      if(trans.deal_type == DEAL_TYPE_BUY || trans.deal_type == DEAL_TYPE_SELL)
      {
         Print("Deal executed: ", trans.deal, " Price: ", trans.price);
      }
   }
}
//+------------------------------------------------------------------+
```

## Structure d'un Indicateur Personnalisé

### Template Indicateur
```mql5
//+------------------------------------------------------------------+
//|                                              MonIndicateur.mq5    |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025"
#property version   "1.00"
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   2

//--- Plot settings
#property indicator_label1  "Upper Band"
#property indicator_type1   DRAW_LINE
#property indicator_color1  clrDodgerBlue
#property indicator_style1  STYLE_SOLID
#property indicator_width1  2

#property indicator_label2  "Lower Band"
#property indicator_type2   DRAW_LINE
#property indicator_color2  clrOrangeRed
#property indicator_style2  STYLE_SOLID
#property indicator_width2  2

//--- Input parameters
input int      InpPeriod     = 20;       // Period
input double   InpDeviation  = 2.0;      // Deviation
input ENUM_APPLIED_PRICE InpPrice = PRICE_CLOSE; // Applied Price

//--- Indicator buffers
double BufferUpper[];
double BufferLower[];

//--- Global variables
int handleMA;
int handleStdDev;

//+------------------------------------------------------------------+
//| Custom indicator initialization function                          |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Set buffers
   SetIndexBuffer(0, BufferUpper, INDICATOR_DATA);
   SetIndexBuffer(1, BufferLower, INDICATOR_DATA);

   //--- Set as series
   ArraySetAsSeries(BufferUpper, true);
   ArraySetAsSeries(BufferLower, true);

   //--- Create handles
   handleMA = iMA(_Symbol, PERIOD_CURRENT, InpPeriod, 0, MODE_SMA, InpPrice);
   handleStdDev = iStdDev(_Symbol, PERIOD_CURRENT, InpPeriod, 0, MODE_SMA, InpPrice);

   if(handleMA == INVALID_HANDLE || handleStdDev == INVALID_HANDLE)
      return INIT_FAILED;

   //--- Set indicator name
   IndicatorSetString(INDICATOR_SHORTNAME, "MyBands(" + IntegerToString(InpPeriod) + ")");

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                        |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(handleMA);
   IndicatorRelease(handleStdDev);
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
   if(rates_total < InpPeriod)
      return 0;

   //--- Calculate start position
   int start = prev_calculated == 0 ? InpPeriod : prev_calculated - 1;

   //--- Get indicator data
   double ma[], stddev[];
   ArraySetAsSeries(ma, true);
   ArraySetAsSeries(stddev, true);

   int copied1 = CopyBuffer(handleMA, 0, 0, rates_total - start + 1, ma);
   int copied2 = CopyBuffer(handleStdDev, 0, 0, rates_total - start + 1, stddev);

   if(copied1 <= 0 || copied2 <= 0)
      return prev_calculated;

   //--- Main calculation loop
   for(int i = rates_total - start - 1; i >= 0; i--)
   {
      int idx = rates_total - 1 - i - start;
      if(idx < 0 || idx >= ArraySize(ma))
         continue;

      BufferUpper[i] = ma[idx] + InpDeviation * stddev[idx];
      BufferLower[i] = ma[idx] - InpDeviation * stddev[idx];
   }

   return rates_total;
}
//+------------------------------------------------------------------+
```

## Patterns et Stratégies

### 1. Multi-Timeframe Analysis
```mql5
//--- Get MA from higher timeframe
int handleMA_H4 = iMA(_Symbol, PERIOD_H4, 200, 0, MODE_SMA, PRICE_CLOSE);
double ma_h4[];
ArraySetAsSeries(ma_h4, true);
CopyBuffer(handleMA_H4, 0, 0, 1, ma_h4);

//--- Only trade in direction of H4 trend
if(symbolInfo.Bid() > ma_h4[0])
{
   // Only look for buy signals
}
```

### 2. Risk Management Avancé
```mql5
//--- Max daily drawdown check
double DailyDrawdown()
{
   double startBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   return (startBalance - equity) / startBalance * 100;
}

if(DailyDrawdown() > 5.0) // 5% max daily drawdown
{
   Print("Daily drawdown limit reached. No more trades today.");
   return;
}
```

### 3. Pattern Recognition
```mql5
//--- Detect Pin Bar
bool IsPinBar(int shift)
{
   double open = iOpen(_Symbol, PERIOD_CURRENT, shift);
   double high = iHigh(_Symbol, PERIOD_CURRENT, shift);
   double low = iLow(_Symbol, PERIOD_CURRENT, shift);
   double close = iClose(_Symbol, PERIOD_CURRENT, shift);

   double body = MathAbs(close - open);
   double range = high - low;
   double upperWick = high - MathMax(open, close);
   double lowerWick = MathMin(open, close) - low;

   // Bullish pin bar
   if(lowerWick > body * 2 && lowerWick > upperWick * 2)
      return true;

   // Bearish pin bar
   if(upperWick > body * 2 && upperWick > lowerWick * 2)
      return true;

   return false;
}
```

### 4. Order Block Detection
```mql5
//--- Detect Order Block (Supply/Demand Zone)
struct OrderBlock
{
   double high;
   double low;
   datetime time;
   bool isBullish;
};

OrderBlock DetectOrderBlock(int lookback)
{
   OrderBlock ob = {0, 0, 0, false};

   for(int i = 1; i < lookback; i++)
   {
      double high_i = iHigh(_Symbol, PERIOD_CURRENT, i);
      double low_i = iLow(_Symbol, PERIOD_CURRENT, i);
      double close_i = iClose(_Symbol, PERIOD_CURRENT, i);
      double open_i = iOpen(_Symbol, PERIOD_CURRENT, i);

      // Strong bearish candle followed by bullish move = Demand zone
      if(close_i < open_i) // Bearish candle
      {
         double nextHigh = iHigh(_Symbol, PERIOD_CURRENT, i-1);
         if(nextHigh > high_i) // Bullish breakout
         {
            ob.high = high_i;
            ob.low = low_i;
            ob.time = iTime(_Symbol, PERIOD_CURRENT, i);
            ob.isBullish = true;
            break;
         }
      }
   }
   return ob;
}
```

## Bonnes Pratiques

### 1. Gestion des Erreurs
```mql5
bool ExecuteTrade(ENUM_ORDER_TYPE type, double lot, double sl, double tp)
{
   int retries = 3;
   for(int i = 0; i < retries; i++)
   {
      ResetLastError();

      bool result = false;
      if(type == ORDER_TYPE_BUY)
         result = trade.Buy(lot, _Symbol, 0, sl, tp);
      else
         result = trade.Sell(lot, _Symbol, 0, sl, tp);

      if(result)
         return true;

      int error = GetLastError();
      Print("Trade error: ", error, " Retry: ", i+1);

      if(error == ERR_REQUOTE || error == ERR_PRICE_CHANGED)
      {
         Sleep(100);
         symbolInfo.RefreshRates();
         continue;
      }

      break;
   }
   return false;
}
```

### 2. Logging Structuré
```mql5
enum ENUM_LOG_LEVEL { LOG_DEBUG, LOG_INFO, LOG_WARNING, LOG_ERROR };

void Log(ENUM_LOG_LEVEL level, string message)
{
   string prefix = "";
   switch(level)
   {
      case LOG_DEBUG:   prefix = "[DEBUG] "; break;
      case LOG_INFO:    prefix = "[INFO] "; break;
      case LOG_WARNING: prefix = "[WARN] "; break;
      case LOG_ERROR:   prefix = "[ERROR] "; break;
   }
   Print(prefix, TimeCurrent(), " - ", message);
}
```

### 3. State Machine pour EA
```mql5
enum ENUM_EA_STATE { STATE_IDLE, STATE_LOOKING, STATE_IN_TRADE, STATE_CLOSING };

ENUM_EA_STATE currentState = STATE_IDLE;

void UpdateState()
{
   switch(currentState)
   {
      case STATE_IDLE:
         if(IsTradingTime())
            currentState = STATE_LOOKING;
         break;

      case STATE_LOOKING:
         if(GetSignal() != 0)
         {
            if(OpenTrade())
               currentState = STATE_IN_TRADE;
         }
         break;

      case STATE_IN_TRADE:
         ManagePosition();
         if(CountPositions() == 0)
            currentState = STATE_LOOKING;
         break;

      case STATE_CLOSING:
         CloseAllPositions();
         currentState = STATE_IDLE;
         break;
   }
}
```

## Commandes

```
/mql5 ea [strategy]        - Créer un Expert Advisor
/mql5 indicator [type]     - Créer un indicateur
/mql5 script [action]      - Créer un script
/mql5 backtest [ea]        - Analyser résultats backtest
/mql5 optimize [param]     - Suggestions d'optimisation
```

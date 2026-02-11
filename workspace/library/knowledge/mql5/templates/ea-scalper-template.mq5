//+------------------------------------------------------------------+
//|                                              EA_Scalper_Template.mq5|
//|                                       Copyright 2025, ULTRA-CREATE |
//|                                             https://ultra-create.ai |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, ULTRA-CREATE"
#property link      "https://ultra-create.ai"
#property version   "1.00"
#property description "Template EA Scalper - Personnalisable"
#property strict

//+------------------------------------------------------------------+
//| Includes                                                           |
//+------------------------------------------------------------------+
#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\SymbolInfo.mqh>
#include <Trade\AccountInfo.mqh>

//+------------------------------------------------------------------+
//| Input Parameters                                                   |
//+------------------------------------------------------------------+
input group "=== TRADING PARAMETERS ==="
input double   InpLotSize           = 0.1;       // Lot Size (0=Auto Risk%)
input double   InpRiskPercent       = 1.0;       // Risk per Trade (%)
input int      InpStopLoss          = 20;        // Stop Loss (points)
input int      InpTakeProfit        = 40;        // Take Profit (points)
input int      InpMagicNumber       = 100001;    // Magic Number

input group "=== STRATEGY PARAMETERS ==="
input int      InpFastMA            = 8;         // Fast MA Period
input int      InpSlowMA            = 21;        // Slow MA Period
input int      InpRSIPeriod         = 14;        // RSI Period
input double   InpRSIOverbought     = 70;        // RSI Overbought Level
input double   InpRSIOversold       = 30;        // RSI Oversold Level

input group "=== FILTER PARAMETERS ==="
input int      InpATRPeriod         = 14;        // ATR Period
input double   InpATRMultiplier     = 1.5;       // ATR Filter Multiplier
input bool     InpUseSpreadFilter   = true;      // Use Spread Filter
input int      InpMaxSpread         = 20;        // Max Spread (points)

input group "=== SESSION FILTER ==="
input bool     InpUseSessionFilter  = true;      // Use Session Filter
input int      InpSessionStart      = 8;         // Session Start Hour (Server)
input int      InpSessionEnd        = 18;        // Session End Hour (Server)
input bool     InpAvoidNews         = true;      // Avoid High Impact News

input group "=== RISK MANAGEMENT ==="
input int      InpMaxTrades         = 3;         // Max Concurrent Trades
input double   InpMaxDailyLoss      = 5.0;       // Max Daily Loss (%)
input double   InpMaxDailyProfit    = 10.0;      // Max Daily Profit (%)
input bool     InpUseTrailingStop   = true;      // Use Trailing Stop
input int      InpTrailingStart     = 15;        // Trailing Start (points)
input int      InpTrailingStep      = 5;         // Trailing Step (points)
input bool     InpUseBreakeven      = true;      // Use Breakeven
input int      InpBreakevenStart    = 10;        // Breakeven Trigger (points)
input int      InpBreakevenOffset   = 2;         // Breakeven Offset (points)

//+------------------------------------------------------------------+
//| Global Variables                                                   |
//+------------------------------------------------------------------+
CTrade         trade;
CPositionInfo  positionInfo;
CSymbolInfo    symbolInfo;
CAccountInfo   accountInfo;

//--- Indicator handles
int            handleFastMA;
int            handleSlowMA;
int            handleRSI;
int            handleATR;

//--- Indicator buffers
double         bufferFastMA[];
double         bufferSlowMA[];
double         bufferRSI[];
double         bufferATR[];

//--- Trading state
datetime       lastBarTime = 0;
double         dailyStartBalance = 0;
datetime       lastTradeDay = 0;
bool           tradingAllowed = true;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Initialize symbol info
   if(!symbolInfo.Name(_Symbol))
   {
      Print("Error: Failed to initialize symbol info for ", _Symbol);
      return INIT_FAILED;
   }
   symbolInfo.RefreshRates();

   //--- Setup trade object
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFilling(ORDER_FILLING_FOK);
   trade.SetMarginMode();

   //--- Create indicator handles
   handleFastMA = iMA(_Symbol, PERIOD_CURRENT, InpFastMA, 0, MODE_EMA, PRICE_CLOSE);
   handleSlowMA = iMA(_Symbol, PERIOD_CURRENT, InpSlowMA, 0, MODE_EMA, PRICE_CLOSE);
   handleRSI = iRSI(_Symbol, PERIOD_CURRENT, InpRSIPeriod, PRICE_CLOSE);
   handleATR = iATR(_Symbol, PERIOD_CURRENT, InpATRPeriod);

   if(handleFastMA == INVALID_HANDLE ||
      handleSlowMA == INVALID_HANDLE ||
      handleRSI == INVALID_HANDLE ||
      handleATR == INVALID_HANDLE)
   {
      Print("Error: Failed to create indicator handles");
      return INIT_FAILED;
   }

   //--- Set buffers as series
   ArraySetAsSeries(bufferFastMA, true);
   ArraySetAsSeries(bufferSlowMA, true);
   ArraySetAsSeries(bufferRSI, true);
   ArraySetAsSeries(bufferATR, true);

   //--- Initialize daily tracking
   dailyStartBalance = accountInfo.Balance();
   lastTradeDay = StringToTime(TimeToString(TimeCurrent(), TIME_DATE));

   Print("=== EA Scalper initialized on ", _Symbol, " ===");
   Print("Lot Size: ", InpLotSize, " | Risk: ", InpRiskPercent, "%");
   Print("SL: ", InpStopLoss, " | TP: ", InpTakeProfit);

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                   |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   //--- Release indicator handles
   IndicatorRelease(handleFastMA);
   IndicatorRelease(handleSlowMA);
   IndicatorRelease(handleRSI);
   IndicatorRelease(handleATR);

   Print("=== EA Scalper deinitialized. Reason: ", GetDeinitReasonText(reason), " ===");
}

//+------------------------------------------------------------------+
//| Expert tick function                                               |
//+------------------------------------------------------------------+
void OnTick()
{
   //--- Refresh symbol info
   if(!symbolInfo.RefreshRates())
      return;

   //--- Check for new bar
   if(!IsNewBar())
   {
      //--- Manage positions on every tick
      ManageOpenPositions();
      return;
   }

   //--- New bar logic
   //--- Reset daily stats if new day
   CheckNewDay();

   //--- Check if trading allowed
   if(!IsTradingAllowed())
      return;

   //--- Get indicator values
   if(!GetIndicatorValues())
      return;

   //--- Check for entry signals
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
//| Check for new trading day                                          |
//+------------------------------------------------------------------+
void CheckNewDay()
{
   datetime currentDay = StringToTime(TimeToString(TimeCurrent(), TIME_DATE));
   if(currentDay != lastTradeDay)
   {
      lastTradeDay = currentDay;
      dailyStartBalance = accountInfo.Balance();
      tradingAllowed = true;
      Print("New trading day. Balance: ", dailyStartBalance);
   }
}

//+------------------------------------------------------------------+
//| Check if trading is allowed                                        |
//+------------------------------------------------------------------+
bool IsTradingAllowed()
{
   //--- Check daily loss limit
   double currentBalance = accountInfo.Balance();
   double dailyPnL = (currentBalance - dailyStartBalance) / dailyStartBalance * 100;

   if(dailyPnL <= -InpMaxDailyLoss)
   {
      if(tradingAllowed)
      {
         Print("Daily loss limit reached: ", dailyPnL, "%. Trading stopped.");
         tradingAllowed = false;
      }
      return false;
   }

   if(dailyPnL >= InpMaxDailyProfit)
   {
      if(tradingAllowed)
      {
         Print("Daily profit target reached: ", dailyPnL, "%. Trading stopped.");
         tradingAllowed = false;
      }
      return false;
   }

   //--- Check session filter
   if(InpUseSessionFilter)
   {
      MqlDateTime dt;
      TimeToStruct(TimeCurrent(), dt);

      if(dt.hour < InpSessionStart || dt.hour >= InpSessionEnd)
         return false;
   }

   //--- Check spread filter
   if(InpUseSpreadFilter)
   {
      int currentSpread = (int)symbolInfo.Spread();
      if(currentSpread > InpMaxSpread)
         return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| Get indicator values                                               |
//+------------------------------------------------------------------+
bool GetIndicatorValues()
{
   if(CopyBuffer(handleFastMA, 0, 0, 3, bufferFastMA) < 3) return false;
   if(CopyBuffer(handleSlowMA, 0, 0, 3, bufferSlowMA) < 3) return false;
   if(CopyBuffer(handleRSI, 0, 0, 3, bufferRSI) < 3) return false;
   if(CopyBuffer(handleATR, 0, 0, 3, bufferATR) < 3) return false;
   return true;
}

//+------------------------------------------------------------------+
//| Get trading signal                                                 |
//+------------------------------------------------------------------+
int GetSignal()
{
   //--- Check ATR filter (volatility)
   double avgATR = (bufferATR[1] + bufferATR[2]) / 2;
   if(bufferATR[0] < avgATR / InpATRMultiplier)
      return 0; // Low volatility, no trade

   //--- MA Cross + RSI Filter
   bool fastAboveSlow = bufferFastMA[1] > bufferSlowMA[1];
   bool fastBelowSlow = bufferFastMA[1] < bufferSlowMA[1];
   bool maCrossUp = bufferFastMA[2] <= bufferSlowMA[2] && bufferFastMA[1] > bufferSlowMA[1];
   bool maCrossDown = bufferFastMA[2] >= bufferSlowMA[2] && bufferFastMA[1] < bufferSlowMA[1];

   //--- Buy signal: MA cross up + RSI not overbought
   if(maCrossUp && bufferRSI[1] < InpRSIOverbought && bufferRSI[1] > InpRSIOversold)
      return 1;

   //--- Sell signal: MA cross down + RSI not oversold
   if(maCrossDown && bufferRSI[1] > InpRSIOversold && bufferRSI[1] < InpRSIOverbought)
      return -1;

   return 0;
}

//+------------------------------------------------------------------+
//| Open Buy position                                                  |
//+------------------------------------------------------------------+
void OpenBuy()
{
   double price = symbolInfo.Ask();
   double sl = NormalizeDouble(price - InpStopLoss * symbolInfo.Point(), symbolInfo.Digits());
   double tp = NormalizeDouble(price + InpTakeProfit * symbolInfo.Point(), symbolInfo.Digits());
   double lot = CalculateLotSize();

   if(trade.Buy(lot, _Symbol, price, sl, tp, "Scalper Buy"))
   {
      Print("BUY opened: Lot=", lot, " Price=", price, " SL=", sl, " TP=", tp);
   }
   else
   {
      Print("BUY failed: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());
   }
}

//+------------------------------------------------------------------+
//| Open Sell position                                                 |
//+------------------------------------------------------------------+
void OpenSell()
{
   double price = symbolInfo.Bid();
   double sl = NormalizeDouble(price + InpStopLoss * symbolInfo.Point(), symbolInfo.Digits());
   double tp = NormalizeDouble(price - InpTakeProfit * symbolInfo.Point(), symbolInfo.Digits());
   double lot = CalculateLotSize();

   if(trade.Sell(lot, _Symbol, price, sl, tp, "Scalper Sell"))
   {
      Print("SELL opened: Lot=", lot, " Price=", price, " SL=", sl, " TP=", tp);
   }
   else
   {
      Print("SELL failed: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());
   }
}

//+------------------------------------------------------------------+
//| Calculate lot size based on risk                                   |
//+------------------------------------------------------------------+
double CalculateLotSize()
{
   if(InpLotSize > 0)
      return InpLotSize;

   double balance = accountInfo.Balance();
   double riskAmount = balance * InpRiskPercent / 100.0;

   double tickValue = symbolInfo.TickValue();
   double tickSize = symbolInfo.TickSize();
   double pointValue = tickValue / tickSize * symbolInfo.Point();

   double lot = riskAmount / (InpStopLoss * pointValue);

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
void ManageOpenPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!positionInfo.SelectByIndex(i))
         continue;

      if(positionInfo.Symbol() != _Symbol || positionInfo.Magic() != InpMagicNumber)
         continue;

      ulong ticket = positionInfo.Ticket();

      //--- Breakeven
      if(InpUseBreakeven)
         MoveToBreakeven(ticket);

      //--- Trailing Stop
      if(InpUseTrailingStop)
         ApplyTrailingStop(ticket);
   }
}

//+------------------------------------------------------------------+
//| Move stop loss to breakeven                                        |
//+------------------------------------------------------------------+
void MoveToBreakeven(ulong ticket)
{
   if(!positionInfo.SelectByTicket(ticket))
      return;

   double openPrice = positionInfo.PriceOpen();
   double currentSL = positionInfo.StopLoss();
   double currentPrice = positionInfo.PriceCurrent();

   double beLevel = InpBreakevenStart * symbolInfo.Point();
   double beOffset = InpBreakevenOffset * symbolInfo.Point();

   if(positionInfo.PositionType() == POSITION_TYPE_BUY)
   {
      //--- Already at breakeven or better
      if(currentSL >= openPrice)
         return;

      //--- Price moved enough
      if(currentPrice - openPrice >= beLevel)
      {
         double newSL = NormalizeDouble(openPrice + beOffset, symbolInfo.Digits());
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
   else if(positionInfo.PositionType() == POSITION_TYPE_SELL)
   {
      //--- Already at breakeven or better
      if(currentSL <= openPrice && currentSL > 0)
         return;

      //--- Price moved enough
      if(openPrice - currentPrice >= beLevel)
      {
         double newSL = NormalizeDouble(openPrice - beOffset, symbolInfo.Digits());
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
}

//+------------------------------------------------------------------+
//| Apply trailing stop                                                |
//+------------------------------------------------------------------+
void ApplyTrailingStop(ulong ticket)
{
   if(!positionInfo.SelectByTicket(ticket))
      return;

   double openPrice = positionInfo.PriceOpen();
   double currentSL = positionInfo.StopLoss();
   double currentPrice = positionInfo.PriceCurrent();

   double trailStart = InpTrailingStart * symbolInfo.Point();
   double trailStep = InpTrailingStep * symbolInfo.Point();

   if(positionInfo.PositionType() == POSITION_TYPE_BUY)
   {
      //--- Check if trailing should start
      if(currentPrice - openPrice < trailStart)
         return;

      double newSL = NormalizeDouble(currentPrice - trailStep, symbolInfo.Digits());

      if(newSL > currentSL)
      {
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
   else if(positionInfo.PositionType() == POSITION_TYPE_SELL)
   {
      //--- Check if trailing should start
      if(openPrice - currentPrice < trailStart)
         return;

      double newSL = NormalizeDouble(currentPrice + trailStep, symbolInfo.Digits());

      if(newSL < currentSL || currentSL == 0)
      {
         trade.PositionModify(ticket, newSL, positionInfo.TakeProfit());
      }
   }
}

//+------------------------------------------------------------------+
//| Get deinit reason text                                             |
//+------------------------------------------------------------------+
string GetDeinitReasonText(int reason)
{
   switch(reason)
   {
      case REASON_PROGRAM:     return "Program";
      case REASON_REMOVE:      return "Removed";
      case REASON_RECOMPILE:   return "Recompiled";
      case REASON_CHARTCHANGE: return "Chart changed";
      case REASON_CHARTCLOSE:  return "Chart closed";
      case REASON_PARAMETERS:  return "Parameters changed";
      case REASON_ACCOUNT:     return "Account changed";
      case REASON_TEMPLATE:    return "Template applied";
      case REASON_INITFAILED:  return "Init failed";
      case REASON_CLOSE:       return "Terminal closed";
      default:                 return "Unknown";
   }
}

//+------------------------------------------------------------------+
//| Tester function                                                    |
//+------------------------------------------------------------------+
double OnTester()
{
   double profit = TesterStatistics(STAT_PROFIT);
   double drawdown = TesterStatistics(STAT_BALANCE_DDREL_PERCENT);
   double trades = TesterStatistics(STAT_TRADES);
   double profitFactor = TesterStatistics(STAT_PROFIT_FACTOR);
   double winRate = TesterStatistics(STAT_TRADES) > 0 ?
      TesterStatistics(STAT_PROFIT_TRADES) / TesterStatistics(STAT_TRADES) * 100 : 0;

   Print("=== BACKTEST RESULTS ===");
   Print("Profit: ", profit);
   Print("Drawdown: ", drawdown, "%");
   Print("Trades: ", trades);
   Print("Profit Factor: ", profitFactor);
   Print("Win Rate: ", winRate, "%");

   //--- Custom optimization criterion: Profit / Drawdown
   if(trades < 30 || drawdown == 0)
      return 0;

   return profit / drawdown;
}
//+------------------------------------------------------------------+

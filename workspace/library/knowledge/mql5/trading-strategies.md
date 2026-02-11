# MQL5 - Stratégies de Trading Avancées

## Stratégies Trend Following

### 1. Triple Moving Average System
```mql5
//+------------------------------------------------------------------+
//| Triple MA Strategy                                                 |
//| - Fast MA (8 EMA)                                                 |
//| - Medium MA (21 EMA)                                              |
//| - Slow MA (50 EMA)                                                |
//+------------------------------------------------------------------+

input int InpFastMA = 8;
input int InpMediumMA = 21;
input int InpSlowMA = 50;

int GetTripleMASignal()
{
   double fast[], medium[], slow[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(medium, true);
   ArraySetAsSeries(slow, true);

   CopyBuffer(handleFast, 0, 0, 3, fast);
   CopyBuffer(handleMedium, 0, 0, 3, medium);
   CopyBuffer(handleSlow, 0, 0, 3, slow);

   //--- Strong uptrend: Fast > Medium > Slow
   bool uptrend = fast[1] > medium[1] && medium[1] > slow[1];

   //--- Strong downtrend: Fast < Medium < Slow
   bool downtrend = fast[1] < medium[1] && medium[1] < slow[1];

   //--- Entry: Fast crosses Medium in direction of trend
   if(uptrend && fast[2] < medium[2] && fast[1] > medium[1])
      return 1;  // Buy

   if(downtrend && fast[2] > medium[2] && fast[1] < medium[1])
      return -1; // Sell

   return 0;
}
```

### 2. ADX Trend Strength Filter
```mql5
//+------------------------------------------------------------------+
//| ADX Filter - Only trade when trend is strong                      |
//+------------------------------------------------------------------+

input int    InpADXPeriod = 14;
input double InpADXThreshold = 25.0;

bool IsTrendStrong()
{
   double adx[], plusDI[], minusDI[];
   ArraySetAsSeries(adx, true);
   ArraySetAsSeries(plusDI, true);
   ArraySetAsSeries(minusDI, true);

   CopyBuffer(handleADX, 0, 0, 2, adx);      // Main ADX
   CopyBuffer(handleADX, 1, 0, 2, plusDI);   // +DI
   CopyBuffer(handleADX, 2, 0, 2, minusDI);  // -DI

   return adx[1] > InpADXThreshold;
}

int GetTrendDirection()
{
   double plusDI[], minusDI[];
   ArraySetAsSeries(plusDI, true);
   ArraySetAsSeries(minusDI, true);

   CopyBuffer(handleADX, 1, 0, 2, plusDI);
   CopyBuffer(handleADX, 2, 0, 2, minusDI);

   if(plusDI[1] > minusDI[1])
      return 1;  // Bullish
   if(minusDI[1] > plusDI[1])
      return -1; // Bearish

   return 0;
}
```

### 3. Ichimoku Cloud Strategy
```mql5
//+------------------------------------------------------------------+
//| Ichimoku Trading System                                           |
//+------------------------------------------------------------------+

input int InpTenkan = 9;
input int InpKijun = 26;
input int InpSenkou = 52;

struct IchimokuData
{
   double tenkan;     // Tenkan-sen (Conversion Line)
   double kijun;      // Kijun-sen (Base Line)
   double senkouA;    // Senkou Span A (Leading Span A)
   double senkouB;    // Senkou Span B (Leading Span B)
   double chikou;     // Chikou Span (Lagging Span)
};

IchimokuData GetIchimokuValues(int shift)
{
   IchimokuData data;
   double buffer[];
   ArraySetAsSeries(buffer, true);

   CopyBuffer(handleIchi, 0, shift, 1, buffer); data.tenkan = buffer[0];
   CopyBuffer(handleIchi, 1, shift, 1, buffer); data.kijun = buffer[0];
   CopyBuffer(handleIchi, 2, shift, 1, buffer); data.senkouA = buffer[0];
   CopyBuffer(handleIchi, 3, shift, 1, buffer); data.senkouB = buffer[0];
   CopyBuffer(handleIchi, 4, shift, 1, buffer); data.chikou = buffer[0];

   return data;
}

int GetIchimokuSignal()
{
   IchimokuData current = GetIchimokuValues(1);
   IchimokuData previous = GetIchimokuValues(2);
   double close = iClose(_Symbol, PERIOD_CURRENT, 1);

   //--- Cloud direction
   bool bullishCloud = current.senkouA > current.senkouB;
   bool bearishCloud = current.senkouA < current.senkouB;

   //--- Price above/below cloud
   double cloudTop = MathMax(current.senkouA, current.senkouB);
   double cloudBottom = MathMin(current.senkouA, current.senkouB);
   bool aboveCloud = close > cloudTop;
   bool belowCloud = close < cloudBottom;

   //--- TK Cross
   bool tkCrossBuy = previous.tenkan < previous.kijun && current.tenkan > current.kijun;
   bool tkCrossSell = previous.tenkan > previous.kijun && current.tenkan < current.kijun;

   //--- Strong buy: TK cross above cloud, bullish cloud
   if(tkCrossBuy && aboveCloud && bullishCloud)
      return 1;

   //--- Strong sell: TK cross below cloud, bearish cloud
   if(tkCrossSell && belowCloud && bearishCloud)
      return -1;

   return 0;
}
```

## Stratégies Mean Reversion

### 1. Bollinger Bands Squeeze & Breakout
```mql5
//+------------------------------------------------------------------+
//| BB Squeeze Strategy                                                |
//+------------------------------------------------------------------+

input int    InpBBPeriod = 20;
input double InpBBDeviation = 2.0;
input int    InpKeltnerPeriod = 20;
input double InpKeltnerMult = 1.5;

bool IsSqueezeOn()
{
   double bbUpper[], bbLower[];
   double keltnerUpper[], keltnerLower[];

   //--- Get Bollinger Bands
   ArraySetAsSeries(bbUpper, true);
   ArraySetAsSeries(bbLower, true);
   CopyBuffer(handleBB, 1, 0, 1, bbUpper);
   CopyBuffer(handleBB, 2, 0, 1, bbLower);

   //--- Calculate Keltner Channel
   double atr[];
   ArraySetAsSeries(atr, true);
   CopyBuffer(handleATR, 0, 0, 1, atr);

   double ma[];
   ArraySetAsSeries(ma, true);
   CopyBuffer(handleMA, 0, 0, 1, ma);

   double kUp = ma[0] + InpKeltnerMult * atr[0];
   double kDown = ma[0] - InpKeltnerMult * atr[0];

   //--- Squeeze: BB inside Keltner
   return (bbUpper[0] < kUp && bbLower[0] > kDown);
}

int GetSqueezeSignal()
{
   static bool wasInSqueeze = false;
   bool inSqueeze = IsSqueezeOn();

   //--- Squeeze release
   if(wasInSqueeze && !inSqueeze)
   {
      double momentum[];
      ArraySetAsSeries(momentum, true);
      CopyBuffer(handleMomentum, 0, 0, 2, momentum);

      wasInSqueeze = false;

      if(momentum[0] > momentum[1])
         return 1;  // Breakout up
      else
         return -1; // Breakout down
   }

   wasInSqueeze = inSqueeze;
   return 0;
}
```

### 2. RSI Divergence
```mql5
//+------------------------------------------------------------------+
//| RSI Divergence Detection                                          |
//+------------------------------------------------------------------+

enum ENUM_DIVERGENCE
{
   DIV_NONE,
   DIV_BULLISH,        // Price lower low, RSI higher low
   DIV_BEARISH,        // Price higher high, RSI lower high
   DIV_HIDDEN_BULLISH, // Price higher low, RSI lower low
   DIV_HIDDEN_BEARISH  // Price lower high, RSI higher high
};

ENUM_DIVERGENCE DetectRSIDivergence(int lookback)
{
   double rsi[];
   ArraySetAsSeries(rsi, true);
   CopyBuffer(handleRSI, 0, 0, lookback, rsi);

   //--- Find recent swing points
   int priceHighIdx = -1, priceLowIdx = -1;
   int rsiHighIdx = -1, rsiLowIdx = -1;

   double priceHigh = 0, priceLow = DBL_MAX;
   double rsiHigh = 0, rsiLow = 100;

   for(int i = 2; i < lookback - 2; i++)
   {
      double high_i = iHigh(_Symbol, PERIOD_CURRENT, i);
      double low_i = iLow(_Symbol, PERIOD_CURRENT, i);

      //--- Price swing high
      if(high_i > iHigh(_Symbol, PERIOD_CURRENT, i-1) &&
         high_i > iHigh(_Symbol, PERIOD_CURRENT, i+1))
      {
         if(priceHighIdx == -1) { priceHigh = high_i; priceHighIdx = i; }
      }

      //--- Price swing low
      if(low_i < iLow(_Symbol, PERIOD_CURRENT, i-1) &&
         low_i < iLow(_Symbol, PERIOD_CURRENT, i+1))
      {
         if(priceLowIdx == -1) { priceLow = low_i; priceLowIdx = i; }
      }

      //--- RSI swing high
      if(rsi[i] > rsi[i-1] && rsi[i] > rsi[i+1])
      {
         if(rsiHighIdx == -1) { rsiHigh = rsi[i]; rsiHighIdx = i; }
      }

      //--- RSI swing low
      if(rsi[i] < rsi[i-1] && rsi[i] < rsi[i+1])
      {
         if(rsiLowIdx == -1) { rsiLow = rsi[i]; rsiLowIdx = i; }
      }
   }

   //--- Check for divergences
   double currentLow = iLow(_Symbol, PERIOD_CURRENT, 1);
   double currentHigh = iHigh(_Symbol, PERIOD_CURRENT, 1);

   //--- Bullish divergence: price lower low, RSI higher low
   if(currentLow < priceLow && rsi[1] > rsiLow)
      return DIV_BULLISH;

   //--- Bearish divergence: price higher high, RSI lower high
   if(currentHigh > priceHigh && rsi[1] < rsiHigh)
      return DIV_BEARISH;

   return DIV_NONE;
}
```

## Stratégies Price Action

### 1. Support/Resistance Breakout
```mql5
//+------------------------------------------------------------------+
//| Support/Resistance Detection                                       |
//+------------------------------------------------------------------+

struct SRLevel
{
   double price;
   int    touches;
   datetime lastTouch;
   bool   isSupport;
};

SRLevel levels[];

void FindSRLevels(int lookback, double tolerance)
{
   ArrayResize(levels, 0);

   double highs[], lows[];
   ArraySetAsSeries(highs, true);
   ArraySetAsSeries(lows, true);

   CopyHigh(_Symbol, PERIOD_CURRENT, 0, lookback, highs);
   CopyLow(_Symbol, PERIOD_CURRENT, 0, lookback, lows);

   //--- Find swing highs and lows
   for(int i = 2; i < lookback - 2; i++)
   {
      //--- Swing high
      if(highs[i] > highs[i-1] && highs[i] > highs[i-2] &&
         highs[i] > highs[i+1] && highs[i] > highs[i+2])
      {
         AddOrUpdateLevel(highs[i], false, i, tolerance);
      }

      //--- Swing low
      if(lows[i] < lows[i-1] && lows[i] < lows[i-2] &&
         lows[i] < lows[i+1] && lows[i] < lows[i+2])
      {
         AddOrUpdateLevel(lows[i], true, i, tolerance);
      }
   }
}

void AddOrUpdateLevel(double price, bool isSupport, int barIndex, double tolerance)
{
   //--- Check if level exists within tolerance
   for(int i = 0; i < ArraySize(levels); i++)
   {
      if(MathAbs(levels[i].price - price) < tolerance * _Point)
      {
         levels[i].touches++;
         levels[i].lastTouch = iTime(_Symbol, PERIOD_CURRENT, barIndex);
         return;
      }
   }

   //--- Add new level
   int size = ArraySize(levels);
   ArrayResize(levels, size + 1);
   levels[size].price = price;
   levels[size].touches = 1;
   levels[size].lastTouch = iTime(_Symbol, PERIOD_CURRENT, barIndex);
   levels[size].isSupport = isSupport;
}

int CheckBreakout()
{
   double close = iClose(_Symbol, PERIOD_CURRENT, 1);
   double prevClose = iClose(_Symbol, PERIOD_CURRENT, 2);

   for(int i = 0; i < ArraySize(levels); i++)
   {
      if(levels[i].touches < 2) continue; // Need at least 2 touches

      //--- Resistance breakout
      if(!levels[i].isSupport)
      {
         if(prevClose < levels[i].price && close > levels[i].price)
            return 1; // Buy on resistance breakout
      }

      //--- Support breakdown
      if(levels[i].isSupport)
      {
         if(prevClose > levels[i].price && close < levels[i].price)
            return -1; // Sell on support breakdown
      }
   }

   return 0;
}
```

### 2. Candlestick Patterns
```mql5
//+------------------------------------------------------------------+
//| Candlestick Pattern Detection                                      |
//+------------------------------------------------------------------+

enum ENUM_CANDLE_PATTERN
{
   PATTERN_NONE,
   PATTERN_DOJI,
   PATTERN_HAMMER,
   PATTERN_SHOOTING_STAR,
   PATTERN_ENGULFING_BULL,
   PATTERN_ENGULFING_BEAR,
   PATTERN_MORNING_STAR,
   PATTERN_EVENING_STAR,
   PATTERN_THREE_WHITE_SOLDIERS,
   PATTERN_THREE_BLACK_CROWS
};

ENUM_CANDLE_PATTERN DetectPattern(int shift)
{
   double o1 = iOpen(_Symbol, PERIOD_CURRENT, shift);
   double h1 = iHigh(_Symbol, PERIOD_CURRENT, shift);
   double l1 = iLow(_Symbol, PERIOD_CURRENT, shift);
   double c1 = iClose(_Symbol, PERIOD_CURRENT, shift);

   double o2 = iOpen(_Symbol, PERIOD_CURRENT, shift + 1);
   double h2 = iHigh(_Symbol, PERIOD_CURRENT, shift + 1);
   double l2 = iLow(_Symbol, PERIOD_CURRENT, shift + 1);
   double c2 = iClose(_Symbol, PERIOD_CURRENT, shift + 1);

   double body1 = MathAbs(c1 - o1);
   double range1 = h1 - l1;
   double upperWick1 = h1 - MathMax(o1, c1);
   double lowerWick1 = MathMin(o1, c1) - l1;

   //--- Doji: Very small body
   if(body1 < range1 * 0.1)
      return PATTERN_DOJI;

   //--- Hammer: Small body at top, long lower wick
   if(lowerWick1 > body1 * 2 && upperWick1 < body1 * 0.5 && c1 > o1)
      return PATTERN_HAMMER;

   //--- Shooting Star: Small body at bottom, long upper wick
   if(upperWick1 > body1 * 2 && lowerWick1 < body1 * 0.5 && c1 < o1)
      return PATTERN_SHOOTING_STAR;

   //--- Bullish Engulfing
   if(c2 < o2 && c1 > o1 && c1 > o2 && o1 < c2)
      return PATTERN_ENGULFING_BULL;

   //--- Bearish Engulfing
   if(c2 > o2 && c1 < o1 && c1 < o2 && o1 > c2)
      return PATTERN_ENGULFING_BEAR;

   return PATTERN_NONE;
}
```

### 3. Order Block / Supply-Demand Zones
```mql5
//+------------------------------------------------------------------+
//| Order Block Detection (Smart Money Concept)                        |
//+------------------------------------------------------------------+

struct OrderBlock
{
   double   high;
   double   low;
   datetime time;
   bool     isBullish;
   bool     isValid;
   int      retests;
};

OrderBlock orderBlocks[];

void FindOrderBlocks(int lookback)
{
   ArrayResize(orderBlocks, 0);

   for(int i = 3; i < lookback; i++)
   {
      double o = iOpen(_Symbol, PERIOD_CURRENT, i);
      double h = iHigh(_Symbol, PERIOD_CURRENT, i);
      double l = iLow(_Symbol, PERIOD_CURRENT, i);
      double c = iClose(_Symbol, PERIOD_CURRENT, i);

      //--- Check for displacement (strong move after)
      double nextHigh = iHigh(_Symbol, PERIOD_CURRENT, i - 1);
      double nextLow = iLow(_Symbol, PERIOD_CURRENT, i - 1);

      //--- Bearish Order Block: Last bullish candle before strong bearish move
      if(c > o) // Bullish candle
      {
         //--- Strong bearish displacement
         if(nextLow < l && (h - nextLow) > (h - l) * 2)
         {
            AddOrderBlock(h, l, iTime(_Symbol, PERIOD_CURRENT, i), false);
         }
      }

      //--- Bullish Order Block: Last bearish candle before strong bullish move
      if(c < o) // Bearish candle
      {
         //--- Strong bullish displacement
         if(nextHigh > h && (nextHigh - l) > (h - l) * 2)
         {
            AddOrderBlock(h, l, iTime(_Symbol, PERIOD_CURRENT, i), true);
         }
      }
   }
}

void AddOrderBlock(double high, double low, datetime time, bool isBullish)
{
   int size = ArraySize(orderBlocks);
   ArrayResize(orderBlocks, size + 1);
   orderBlocks[size].high = high;
   orderBlocks[size].low = low;
   orderBlocks[size].time = time;
   orderBlocks[size].isBullish = isBullish;
   orderBlocks[size].isValid = true;
   orderBlocks[size].retests = 0;
}

int CheckOrderBlockSignal()
{
   double close = iClose(_Symbol, PERIOD_CURRENT, 1);
   double open = iOpen(_Symbol, PERIOD_CURRENT, 1);

   for(int i = 0; i < ArraySize(orderBlocks); i++)
   {
      if(!orderBlocks[i].isValid) continue;

      //--- Price enters bullish OB from above
      if(orderBlocks[i].isBullish)
      {
         if(close >= orderBlocks[i].low && close <= orderBlocks[i].high)
         {
            if(open > orderBlocks[i].high) // Entry from above
            {
               orderBlocks[i].retests++;
               if(orderBlocks[i].retests == 1) // First retest
                  return 1; // Buy signal
            }
         }
         //--- OB broken, invalidate
         if(close < orderBlocks[i].low)
            orderBlocks[i].isValid = false;
      }

      //--- Price enters bearish OB from below
      if(!orderBlocks[i].isBullish)
      {
         if(close >= orderBlocks[i].low && close <= orderBlocks[i].high)
         {
            if(open < orderBlocks[i].low) // Entry from below
            {
               orderBlocks[i].retests++;
               if(orderBlocks[i].retests == 1)
                  return -1; // Sell signal
            }
         }
         //--- OB broken, invalidate
         if(close > orderBlocks[i].high)
            orderBlocks[i].isValid = false;
      }
   }

   return 0;
}
```

## Stratégies Multi-Timeframe

### MTF Trend Alignment
```mql5
//+------------------------------------------------------------------+
//| Multi-Timeframe Trend Analysis                                     |
//+------------------------------------------------------------------+

struct TimeframeTrend
{
   ENUM_TIMEFRAMES tf;
   int             trend; // 1=up, -1=down, 0=neutral
   double          ma;
};

TimeframeTrend GetTrend(ENUM_TIMEFRAMES tf)
{
   TimeframeTrend result;
   result.tf = tf;

   int handleMA_TF = iMA(_Symbol, tf, 50, 0, MODE_EMA, PRICE_CLOSE);
   double ma[];
   ArraySetAsSeries(ma, true);
   CopyBuffer(handleMA_TF, 0, 0, 2, ma);

   double close = iClose(_Symbol, tf, 1);

   result.ma = ma[0];
   result.trend = (close > ma[0]) ? 1 : (close < ma[0]) ? -1 : 0;

   IndicatorRelease(handleMA_TF);
   return result;
}

int GetMTFSignal()
{
   TimeframeTrend monthly = GetTrend(PERIOD_MN1);
   TimeframeTrend weekly = GetTrend(PERIOD_W1);
   TimeframeTrend daily = GetTrend(PERIOD_D1);
   TimeframeTrend h4 = GetTrend(PERIOD_H4);

   //--- All timeframes aligned bullish
   if(monthly.trend == 1 && weekly.trend == 1 &&
      daily.trend == 1 && h4.trend == 1)
      return 1;

   //--- All timeframes aligned bearish
   if(monthly.trend == -1 && weekly.trend == -1 &&
      daily.trend == -1 && h4.trend == -1)
      return -1;

   return 0;
}
```

## Grid Trading

### Grid System Implementation
```mql5
//+------------------------------------------------------------------+
//| Grid Trading System                                                |
//+------------------------------------------------------------------+

input double InpGridSize = 50;      // Grid size in points
input int    InpGridLevels = 5;     // Number of grid levels
input double InpBaseLot = 0.01;     // Base lot size
input double InpLotMultiplier = 1.5; // Lot multiplier per level

struct GridLevel
{
   double price;
   double lot;
   ulong  ticket;
   bool   isActive;
};

GridLevel buyGrid[];
GridLevel sellGrid[];

void InitializeGrid()
{
   ArrayResize(buyGrid, InpGridLevels);
   ArrayResize(sellGrid, InpGridLevels);

   double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double gridPoints = InpGridSize * _Point;

   for(int i = 0; i < InpGridLevels; i++)
   {
      double lot = InpBaseLot * MathPow(InpLotMultiplier, i);

      //--- Buy grid (below current price)
      buyGrid[i].price = currentPrice - (i + 1) * gridPoints;
      buyGrid[i].lot = NormalizeDouble(lot, 2);
      buyGrid[i].ticket = 0;
      buyGrid[i].isActive = false;

      //--- Sell grid (above current price)
      sellGrid[i].price = currentPrice + (i + 1) * gridPoints;
      sellGrid[i].lot = NormalizeDouble(lot, 2);
      sellGrid[i].ticket = 0;
      sellGrid[i].isActive = false;
   }
}

void ManageGrid()
{
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

   //--- Check buy grid levels
   for(int i = 0; i < InpGridLevels; i++)
   {
      if(!buyGrid[i].isActive && bid <= buyGrid[i].price)
      {
         //--- Open buy position
         if(trade.Buy(buyGrid[i].lot, _Symbol))
         {
            buyGrid[i].ticket = trade.ResultOrder();
            buyGrid[i].isActive = true;
         }
      }
   }

   //--- Check sell grid levels
   for(int i = 0; i < InpGridLevels; i++)
   {
      if(!sellGrid[i].isActive && bid >= sellGrid[i].price)
      {
         //--- Open sell position
         if(trade.Sell(sellGrid[i].lot, _Symbol))
         {
            sellGrid[i].ticket = trade.ResultOrder();
            sellGrid[i].isActive = true;
         }
      }
   }

   //--- Close profitable positions and reset
   double totalProfit = GetTotalProfit();
   if(totalProfit > InpGridSize * _Point * InpBaseLot * 100)
   {
      CloseAllAndReset();
   }
}
```

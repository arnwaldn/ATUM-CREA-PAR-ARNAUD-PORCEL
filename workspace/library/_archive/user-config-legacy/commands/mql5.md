---
description: MQL5 trading development (EAs, indicators) (user)
---

# /mql5 - MQL5 Trading Development

## USAGE
```
/mql5 ea "Trend Following Strategy"
/mql5 indicator "Custom RSI Divergence"
/mql5 script "Position Sizer"
/mql5 optimize "EA_Name"
/mql5 backtest "EA_Name" --period="2023-2024"
```

## MODES

### ea
Expert Advisor complet
```
/mql5 ea "Moving Average Crossover"
```

### indicator
Indicateur custom
```
/mql5 indicator "Volume Profile"
```

### script
Script utilitaire
```
/mql5 script "Close All Positions"
```

### optimize
Optimisation parametres
```
/mql5 optimize "MyEA" --genetic
```

### backtest
Backtest strategy
```
/mql5 backtest "MyEA" --symbol=EURUSD --tf=H1
```

## EA TEMPLATE

```mql5
//+------------------------------------------------------------------+
//|                                           TrendFollowingEA.mq5 |
//+------------------------------------------------------------------+
#property copyright "Your Name"
#property version   "1.00"

#include <Trade\Trade.mqh>

input double LotSize = 0.1;
input int FastMA = 10;
input int SlowMA = 20;
input int StopLoss = 100;
input int TakeProfit = 200;

CTrade trade;
int fastHandle, slowHandle;

int OnInit() {
    fastHandle = iMA(_Symbol, PERIOD_CURRENT, FastMA, 0, MODE_EMA, PRICE_CLOSE);
    slowHandle = iMA(_Symbol, PERIOD_CURRENT, SlowMA, 0, MODE_EMA, PRICE_CLOSE);

    if(fastHandle == INVALID_HANDLE || slowHandle == INVALID_HANDLE) {
        Print("Failed to create MA handles");
        return INIT_FAILED;
    }
    return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {
    IndicatorRelease(fastHandle);
    IndicatorRelease(slowHandle);
}

void OnTick() {
    if(!IsNewBar()) return;

    double fastMA[], slowMA[];
    ArraySetAsSeries(fastMA, true);
    ArraySetAsSeries(slowMA, true);

    CopyBuffer(fastHandle, 0, 0, 3, fastMA);
    CopyBuffer(slowHandle, 0, 0, 3, slowMA);

    // Crossover logic
    if(fastMA[1] > slowMA[1] && fastMA[2] <= slowMA[2]) {
        // Buy signal
        if(!HasOpenPosition(POSITION_TYPE_BUY)) {
            double sl = SymbolInfoDouble(_Symbol, SYMBOL_BID) - StopLoss * _Point;
            double tp = SymbolInfoDouble(_Symbol, SYMBOL_BID) + TakeProfit * _Point;
            trade.Buy(LotSize, _Symbol, 0, sl, tp, "MA Cross Buy");
        }
    }
    else if(fastMA[1] < slowMA[1] && fastMA[2] >= slowMA[2]) {
        // Sell signal
        if(!HasOpenPosition(POSITION_TYPE_SELL)) {
            double sl = SymbolInfoDouble(_Symbol, SYMBOL_ASK) + StopLoss * _Point;
            double tp = SymbolInfoDouble(_Symbol, SYMBOL_ASK) - TakeProfit * _Point;
            trade.Sell(LotSize, _Symbol, 0, sl, tp, "MA Cross Sell");
        }
    }
}

bool IsNewBar() {
    static datetime lastBar = 0;
    datetime currentBar = iTime(_Symbol, PERIOD_CURRENT, 0);
    if(currentBar != lastBar) {
        lastBar = currentBar;
        return true;
    }
    return false;
}

bool HasOpenPosition(ENUM_POSITION_TYPE type) {
    for(int i = PositionsTotal() - 1; i >= 0; i--) {
        if(PositionGetSymbol(i) == _Symbol) {
            if(PositionGetInteger(POSITION_TYPE) == type) return true;
        }
    }
    return false;
}
```

## INDICATOR TEMPLATE

```mql5
//+------------------------------------------------------------------+
//|                                          CustomIndicator.mq5   |
//+------------------------------------------------------------------+
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   2

input int Period = 14;

double UpperBuffer[];
double LowerBuffer[];

int OnInit() {
    SetIndexBuffer(0, UpperBuffer, INDICATOR_DATA);
    SetIndexBuffer(1, LowerBuffer, INDICATOR_DATA);

    PlotIndexSetInteger(0, PLOT_LINE_COLOR, clrBlue);
    PlotIndexSetInteger(1, PLOT_LINE_COLOR, clrRed);

    return INIT_SUCCEEDED;
}

int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[]) {

    int start = prev_calculated > 0 ? prev_calculated - 1 : Period;

    for(int i = start; i < rates_total; i++) {
        double highest = high[ArrayMaximum(high, i - Period + 1, Period)];
        double lowest = low[ArrayMinimum(low, i - Period + 1, Period)];

        UpperBuffer[i] = highest;
        LowerBuffer[i] = lowest;
    }

    return rates_total;
}
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --symbol=X | Symbole (EURUSD, etc) |
| --tf=X | Timeframe (M1, H1, D1) |
| --period="X-Y" | Periode backtest |
| --genetic | Optimisation genetique |

## MCP UTILISES
- Hindsight (strategies trading-brain)
- filesystem (creation fichiers)

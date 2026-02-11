# MQL5 Complete Guide - Base de Connaissances

## Vue d'Ensemble MQL5

MQL5 (MetaQuotes Language 5) est un langage de programmation orienté objet pour développer des stratégies de trading automatisées sur MetaTrader 5.

### Types de Programmes
| Type | Extension | Description |
|------|-----------|-------------|
| Expert Advisor | .mq5 | Robot de trading automatique |
| Indicator | .mq5 | Analyse technique personnalisée |
| Script | .mq5 | Exécution unique |
| Service | .mq5 | Processus en arrière-plan |
| Library | .mqh | Code réutilisable |

## Types de Données

### Types Primitifs
```mql5
//--- Entiers
char     c = 127;              // 1 byte (-128 to 127)
uchar    uc = 255;             // 1 byte (0 to 255)
short    s = 32767;            // 2 bytes
ushort   us = 65535;           // 2 bytes
int      i = 2147483647;       // 4 bytes
uint     ui = 4294967295;      // 4 bytes
long     l = 9223372036854775807; // 8 bytes
ulong    ul = 18446744073709551615; // 8 bytes

//--- Flottants
float    f = 3.14f;            // 4 bytes (7 digits precision)
double   d = 3.14159265359;    // 8 bytes (15 digits precision)

//--- Autres
bool     b = true;             // true/false
color    clr = clrRed;         // Couleur
datetime dt = D'2025.01.01';   // Date/Heure
string   str = "Hello MQL5";   // Chaîne
```

### Énumérations Importantes
```mql5
//--- Types d'ordres
ENUM_ORDER_TYPE:
  ORDER_TYPE_BUY           // Achat au marché
  ORDER_TYPE_SELL          // Vente au marché
  ORDER_TYPE_BUY_LIMIT     // Achat limite
  ORDER_TYPE_SELL_LIMIT    // Vente limite
  ORDER_TYPE_BUY_STOP      // Achat stop
  ORDER_TYPE_SELL_STOP     // Vente stop
  ORDER_TYPE_BUY_STOP_LIMIT
  ORDER_TYPE_SELL_STOP_LIMIT

//--- Types de positions
ENUM_POSITION_TYPE:
  POSITION_TYPE_BUY        // Position acheteuse
  POSITION_TYPE_SELL       // Position vendeuse

//--- Timeframes
ENUM_TIMEFRAMES:
  PERIOD_M1    // 1 minute
  PERIOD_M5    // 5 minutes
  PERIOD_M15   // 15 minutes
  PERIOD_M30   // 30 minutes
  PERIOD_H1    // 1 heure
  PERIOD_H4    // 4 heures
  PERIOD_D1    // 1 jour
  PERIOD_W1    // 1 semaine
  PERIOD_MN1   // 1 mois

//--- Méthodes MA
ENUM_MA_METHOD:
  MODE_SMA     // Simple Moving Average
  MODE_EMA     // Exponential Moving Average
  MODE_SMMA    // Smoothed Moving Average
  MODE_LWMA    // Linear Weighted Moving Average

//--- Prix appliqués
ENUM_APPLIED_PRICE:
  PRICE_CLOSE    // Prix de clôture
  PRICE_OPEN     // Prix d'ouverture
  PRICE_HIGH     // Plus haut
  PRICE_LOW      // Plus bas
  PRICE_MEDIAN   // (High + Low) / 2
  PRICE_TYPICAL  // (High + Low + Close) / 3
  PRICE_WEIGHTED // (High + Low + Close + Close) / 4
```

## Fonctions Essentielles

### Accès aux Données de Marché
```mql5
//--- Prix courants
double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
double spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);

//--- Données historiques
double close = iClose(_Symbol, PERIOD_H1, 0);  // Clôture barre courante
double high  = iHigh(_Symbol, PERIOD_H1, 1);   // Plus haut barre précédente
double low   = iLow(_Symbol, PERIOD_H1, 2);    // Plus bas 2 barres avant
double open  = iOpen(_Symbol, PERIOD_D1, 0);   // Ouverture journalière
long   vol   = iVolume(_Symbol, PERIOD_H1, 0); // Volume
datetime time = iTime(_Symbol, PERIOD_H1, 0);  // Heure de la barre

//--- Copier séries de données
double closes[];
ArraySetAsSeries(closes, true);
int copied = CopyClose(_Symbol, PERIOD_H1, 0, 100, closes);
```

### Informations du Compte
```mql5
double balance    = AccountInfoDouble(ACCOUNT_BALANCE);
double equity     = AccountInfoDouble(ACCOUNT_EQUITY);
double margin     = AccountInfoDouble(ACCOUNT_MARGIN);
double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
double profit     = AccountInfoDouble(ACCOUNT_PROFIT);
int    leverage   = (int)AccountInfoInteger(ACCOUNT_LEVERAGE);
string currency   = AccountInfoString(ACCOUNT_CURRENCY);
```

### Informations du Symbole
```mql5
double point      = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
int    digits     = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
double minLot     = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
double maxLot     = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
double lotStep    = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
double tickValue  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
double tickSize   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
```

## Classes Standards (Standard Library)

### CTrade - Opérations de Trading
```mql5
#include <Trade\Trade.mqh>

CTrade trade;
trade.SetExpertMagicNumber(123456);
trade.SetDeviationInPoints(10);

//--- Ouvrir position
trade.Buy(0.1, _Symbol, 0, sl, tp, "Comment");
trade.Sell(0.1, _Symbol, 0, sl, tp, "Comment");

//--- Ordres pendants
trade.BuyLimit(0.1, price, _Symbol, sl, tp);
trade.SellLimit(0.1, price, _Symbol, sl, tp);
trade.BuyStop(0.1, price, _Symbol, sl, tp);
trade.SellStop(0.1, price, _Symbol, sl, tp);

//--- Modifier position
trade.PositionModify(ticket, newSL, newTP);

//--- Fermer position
trade.PositionClose(ticket);
trade.PositionClosePartial(ticket, 0.05);
```

### CPositionInfo - Informations Position
```mql5
#include <Trade\PositionInfo.mqh>

CPositionInfo pos;
for(int i = PositionsTotal() - 1; i >= 0; i--)
{
   if(pos.SelectByIndex(i))
   {
      string symbol    = pos.Symbol();
      ulong  ticket    = pos.Ticket();
      double volume    = pos.Volume();
      double profit    = pos.Profit();
      double openPrice = pos.PriceOpen();
      double sl        = pos.StopLoss();
      double tp        = pos.TakeProfit();
      long   magic     = pos.Magic();
      ENUM_POSITION_TYPE type = pos.PositionType();
   }
}
```

### CSymbolInfo - Informations Symbole
```mql5
#include <Trade\SymbolInfo.mqh>

CSymbolInfo sym;
sym.Name(_Symbol);
sym.RefreshRates();

double bid = sym.Bid();
double ask = sym.Ask();
double point = sym.Point();
int digits = sym.Digits();
```

## Indicateurs Techniques Intégrés

### Moving Averages
```mql5
//--- iMA - Moving Average
int handleMA = iMA(_Symbol, PERIOD_H1, 20, 0, MODE_EMA, PRICE_CLOSE);

//--- iDEMA - Double EMA
int handleDEMA = iDEMA(_Symbol, PERIOD_H1, 20, 0, PRICE_CLOSE);

//--- iTEMA - Triple EMA
int handleTEMA = iTEMA(_Symbol, PERIOD_H1, 20, 0, PRICE_CLOSE);
```

### Oscillateurs
```mql5
//--- iRSI - Relative Strength Index
int handleRSI = iRSI(_Symbol, PERIOD_H1, 14, PRICE_CLOSE);

//--- iStochastic
int handleStoch = iStochastic(_Symbol, PERIOD_H1, 5, 3, 3, MODE_SMA, STO_LOWHIGH);

//--- iMACD
int handleMACD = iMACD(_Symbol, PERIOD_H1, 12, 26, 9, PRICE_CLOSE);

//--- iCCI - Commodity Channel Index
int handleCCI = iCCI(_Symbol, PERIOD_H1, 14, PRICE_TYPICAL);

//--- iMomentum
int handleMom = iMomentum(_Symbol, PERIOD_H1, 14, PRICE_CLOSE);
```

### Volatilité
```mql5
//--- iATR - Average True Range
int handleATR = iATR(_Symbol, PERIOD_H1, 14);

//--- iBands - Bollinger Bands
int handleBB = iBands(_Symbol, PERIOD_H1, 20, 0, 2.0, PRICE_CLOSE);

//--- iStdDev - Standard Deviation
int handleStdDev = iStdDev(_Symbol, PERIOD_H1, 20, 0, MODE_SMA, PRICE_CLOSE);
```

### Tendance
```mql5
//--- iADX - Average Directional Index
int handleADX = iADX(_Symbol, PERIOD_H1, 14);

//--- iSAR - Parabolic SAR
int handleSAR = iSAR(_Symbol, PERIOD_H1, 0.02, 0.2);

//--- iIchimoku
int handleIchi = iIchimoku(_Symbol, PERIOD_H1, 9, 26, 52);
```

### Volume
```mql5
//--- iOBV - On Balance Volume
int handleOBV = iOBV(_Symbol, PERIOD_H1, VOLUME_TICK);

//--- iVolumes
int handleVol = iVolumes(_Symbol, PERIOD_H1, VOLUME_TICK);
```

## Gestion des Erreurs

### Codes d'Erreur Courants
```mql5
//--- Erreurs de trading
ERR_TRADE_DISABLED           // Trading désactivé
ERR_TRADE_POSITION_NOT_FOUND // Position non trouvée
ERR_TRADE_INVALID_ORDER      // Ordre invalide
ERR_TRADE_WRONG_VOLUME       // Volume incorrect
ERR_TRADE_MARKET_CLOSED      // Marché fermé
ERR_TRADE_NOT_ENOUGH_MONEY   // Fonds insuffisants
ERR_TRADE_PRICE_CHANGED      // Prix changé
ERR_TRADE_REQUOTE            // Requote
ERR_TRADE_ORDER_LOCKED       // Ordre verrouillé
ERR_TRADE_LONG_ONLY          // Seulement achat autorisé
ERR_TRADE_SHORT_ONLY         // Seulement vente autorisée
```

### Pattern de Gestion d'Erreur
```mql5
bool SafeTrade(ENUM_ORDER_TYPE type, double lot, double sl, double tp)
{
   ResetLastError();

   bool result = false;
   if(type == ORDER_TYPE_BUY)
      result = trade.Buy(lot, _Symbol, 0, sl, tp);
   else if(type == ORDER_TYPE_SELL)
      result = trade.Sell(lot, _Symbol, 0, sl, tp);

   if(!result)
   {
      int error = GetLastError();
      string errorDesc = "";

      switch(error)
      {
         case ERR_TRADE_NOT_ENOUGH_MONEY:
            errorDesc = "Insufficient funds";
            break;
         case ERR_TRADE_REQUOTE:
            errorDesc = "Requote - retry needed";
            break;
         case ERR_TRADE_MARKET_CLOSED:
            errorDesc = "Market closed";
            break;
         default:
            errorDesc = "Error code: " + IntegerToString(error);
      }

      Print("Trade failed: ", errorDesc);
      return false;
   }

   return true;
}
```

## Stratégies de Trading Courantes

### 1. Croisement de Moyennes Mobiles
```mql5
//--- MA Fast crosses MA Slow
double maFast[], maSlow[];
CopyBuffer(handleMAFast, 0, 0, 3, maFast);
CopyBuffer(handleMASlow, 0, 0, 3, maSlow);

// Buy: Fast crosses above Slow
if(maFast[2] < maSlow[2] && maFast[1] > maSlow[1])
   return SIGNAL_BUY;

// Sell: Fast crosses below Slow
if(maFast[2] > maSlow[2] && maFast[1] < maSlow[1])
   return SIGNAL_SELL;
```

### 2. RSI Overbought/Oversold
```mql5
double rsi[];
CopyBuffer(handleRSI, 0, 0, 2, rsi);

// Buy: RSI crosses above 30 (oversold)
if(rsi[1] < 30 && rsi[0] > 30)
   return SIGNAL_BUY;

// Sell: RSI crosses below 70 (overbought)
if(rsi[1] > 70 && rsi[0] < 70)
   return SIGNAL_SELL;
```

### 3. Breakout Bollinger Bands
```mql5
double upper[], lower[], middle[];
CopyBuffer(handleBB, 0, 0, 2, middle);  // Main line
CopyBuffer(handleBB, 1, 0, 2, upper);   // Upper band
CopyBuffer(handleBB, 2, 0, 2, lower);   // Lower band

double close = iClose(_Symbol, PERIOD_CURRENT, 1);

// Buy: Close above upper band
if(close > upper[1])
   return SIGNAL_BUY;

// Sell: Close below lower band
if(close < lower[1])
   return SIGNAL_SELL;
```

### 4. MACD Histogram
```mql5
double macdMain[], macdSignal[];
CopyBuffer(handleMACD, 0, 0, 3, macdMain);
CopyBuffer(handleMACD, 1, 0, 3, macdSignal);

double hist1 = macdMain[1] - macdSignal[1];
double hist2 = macdMain[2] - macdSignal[2];

// Buy: Histogram crosses above zero
if(hist2 < 0 && hist1 > 0)
   return SIGNAL_BUY;

// Sell: Histogram crosses below zero
if(hist2 > 0 && hist1 < 0)
   return SIGNAL_SELL;
```

## Money Management

### Position Sizing par Risque
```mql5
double CalculateLotSize(double riskPercent, double slPoints)
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmount = balance * riskPercent / 100.0;

   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

   double pointValue = tickValue / tickSize * point;
   double lotSize = riskAmount / (slPoints * pointValue);

   // Normalize
   double minLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

   lotSize = MathFloor(lotSize / lotStep) * lotStep;
   lotSize = MathMax(minLot, MathMin(maxLot, lotSize));

   return NormalizeDouble(lotSize, 2);
}
```

### Kelly Criterion
```mql5
double KellyCriterion(double winRate, double avgWin, double avgLoss)
{
   // f* = W - (1-W)/R
   // W = win probability
   // R = win/loss ratio

   double R = MathAbs(avgWin / avgLoss);
   double kelly = winRate - (1 - winRate) / R;

   // Use half Kelly for safety
   return MathMax(0, kelly * 0.5);
}
```

## Optimisation et Backtesting

### Critères d'Optimisation
```mql5
//--- Dans OnTester()
double OnTester()
{
   double profit = TesterStatistics(STAT_PROFIT);
   double drawdown = TesterStatistics(STAT_BALANCE_DDREL_PERCENT);
   double trades = TesterStatistics(STAT_TRADES);
   double profitFactor = TesterStatistics(STAT_PROFIT_FACTOR);
   double sharpe = TesterStatistics(STAT_SHARPE_RATIO);

   // Custom criterion: Profit / Drawdown avec minimum de trades
   if(trades < 50)
      return 0;

   if(drawdown == 0)
      return profit;

   return profit / drawdown;
}
```

### Walk-Forward Analysis Setup
```mql5
input bool InpIsOptimization = false;  // Optimization mode

void OnInit()
{
   if(MQLInfoInteger(MQL_OPTIMIZATION))
   {
      // En mode optimisation
      // Réduire les logs, désactiver le visuel
   }
   else if(MQLInfoInteger(MQL_TESTER))
   {
      // En mode test
      // Activer les logs détaillés
   }
}
```

## Conseils de Performance

### Optimisation du Code
```mql5
//--- Éviter: Appels répétés
for(int i = 0; i < ArraySize(arr); i++) // ArraySize appelé à chaque itération

//--- Préférer: Stocker dans variable
int size = ArraySize(arr);
for(int i = 0; i < size; i++)

//--- Éviter: String concatenation en boucle
string result = "";
for(int i = 0; i < 1000; i++)
   result += IntegerToString(i); // Lent!

//--- Préférer: StringConcatenate ou StringFormat
string result = StringFormat("%d %d %d", a, b, c);
```

### Gestion Mémoire
```mql5
//--- Libérer les handles d'indicateurs
void OnDeinit(const int reason)
{
   if(handleMA != INVALID_HANDLE)
      IndicatorRelease(handleMA);
}

//--- Redimensionner arrays avec précaution
ArrayResize(array, newSize, reserveSize);
```

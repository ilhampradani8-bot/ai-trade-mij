import logging
from functools import reduce
import numpy as np
import pandas as pd
import talib.abstract as ta
from pandas import DataFrame

from freqtrade.strategy import IStrategy, merge_informative_pair
import freqtrade.vendor.qtpylib.indicators as qtpylib

logger = logging.getLogger(__name__)


class FreqaiReinforcementStrategy(IStrategy):
    """
    FreqAI Reinforcement Learning Strategy (Stable-Baselines3)
    Designed for adaptive trading on 30 USDT pairs with realistic fee & slippage modeling.
    """
    # Strategy parameters
    minimal_roi = {
        "0": 0.04,
        "30": 0.02,
        "60": 0.01,
        "120": 0.0
    }

    stoploss = -0.05

    # Optimal timeframe for AI feature extraction
    timeframe = '5m'

    # Process 30 pairs with up to 3 open trades concurrently
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False

    # Startup candle count required for indicator calculation
    startup_candle_count: int = 100

    def feature_engineering_expand_all(self, dataframe: DataFrame, period: int, metadata: dict, **kwargs) -> DataFrame:
        """
        Calculates indicators for FreqAI feature engineering.
        """
        # RSI
        dataframe[f"%-rsi-period_{period}"] = ta.RSI(dataframe, timeperiod=period)
        
        # MFI (Money Flow Index)
        dataframe[f"%-mfi-period_{period}"] = ta.MFI(dataframe, timeperiod=period)
        
        # EMA ratio
        ema = ta.EMA(dataframe, timeperiod=period)
        dataframe[f"%-ema_ratio-period_{period}"] = dataframe['close'] / ema - 1.0

        # Bollinger Bands ratio
        bollinger = qtpylib.bollinger_bands(dataframe['close'], window=period, stds=2)
        dataframe[f"%-bb_lowerbound-period_{period}"] = bollinger['lower']
        dataframe[f"%-bb_upperbound-period_{period}"] = bollinger['upper']
        dataframe[f"%-bb_width-period_{period}"] = (bollinger['upper'] - bollinger['lower']) / bollinger['mid']

        # ATR / Close (Volatility)
        dataframe[f"%-atr_ratio-period_{period}"] = ta.ATR(dataframe, timeperiod=period) / dataframe['close']

        return dataframe

    def feature_engineering_expand_basic(self, dataframe: DataFrame, metadata: dict, **kwargs) -> DataFrame:
        """
        Basic single-period features
        """
        dataframe["%-pct_change"] = dataframe["close"].pct_change()
        dataframe["%-raw_volume"] = dataframe["volume"]
        dataframe["%-raw_close"] = dataframe["close"]
        return dataframe

    def feature_engineering_standard(self, dataframe: DataFrame, metadata: dict, **kwargs) -> DataFrame:
        """
        Calculates standard features across multiple periods
        """
        for period in [5, 14, 30]:
            dataframe = self.feature_engineering_expand_all(dataframe, period, metadata, **kwargs)

        dataframe = self.feature_engineering_expand_basic(dataframe, metadata, **kwargs)
        return dataframe

    def set_freqai_targets(self, dataframe: DataFrame, metadata: dict, **kwargs) -> DataFrame:
        """
        Defines the target variable for FreqAI (Future Return over 12 candles)
        """
        dataframe["&-target"] = (
            dataframe["close"].shift(-12) / dataframe["close"] - 1.0
        )
        return dataframe

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Populates indicators and executes FreqAI feature pipeline.
        """
        # FreqAI feature population
        dataframe = self.freqai.start_backtesting(dataframe, metadata)

        # Basic indicators for fallback / confirmation
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        dataframe['ema_50'] = ta.EMA(dataframe, timeperiod=50)
        dataframe['ema_200'] = ta.EMA(dataframe, timeperiod=200)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Entry signals based on FreqAI model prediction
        """
        enter_long_conditions = [
            # FreqAI prediction is positive (target return > 0.008 i.e. > 0.8% expected return)
            dataframe['&-target'] > 0.008,
            # Data is valid & not outlier
            dataframe['do_predict'] == 1,
            dataframe['volume'] > 0
        ]

        if enter_long_conditions:
            dataframe.loc[
                reduce(lambda x, y: x & y, enter_long_conditions),
                'enter_long'
            ] = 1

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        Exit signals based on FreqAI prediction or risk limits
        """
        exit_long_conditions = [
            # Prediction turns negative (target return < -0.005)
            dataframe['&-target'] < -0.005,
            dataframe['do_predict'] == 1
        ]

        if exit_long_conditions:
            dataframe.loc[
                reduce(lambda x, y: x & y, exit_long_conditions),
                'exit_long'
            ] = 1

        return dataframe

#!/bin/bash
cd /root/ai-trade-2
source .venv/bin/activate
exec freqtrade trade --config /root/ai-trade-2/config.json --strategy AggressiveFreqaiStrategy --freqaimodel LightGBMRegressor

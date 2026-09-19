#!/bin/bash
BOT_START_MS=$(date +%s%3N)
mkdir -p /root/ai-trade-2/web-ui/public /root/ai-trade-2/web-ui/dist

echo "{\"bot_start_timestamp\": $BOT_START_MS}" > /root/ai-trade-2/web-ui/public/bot_start.json
echo "{\"bot_start_timestamp\": $BOT_START_MS}" > /root/ai-trade-2/web-ui/dist/bot_start.json

exec /root/ai-trade-2/.venv/bin/python3 /root/ai-trade-2/.venv/bin/freqtrade trade --config /root/ai-trade-2/config.json --strategy FreqaiReinforcementStrategy --freqaimodel CatBoostRegressor --dry-run

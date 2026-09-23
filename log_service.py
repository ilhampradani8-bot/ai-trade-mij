#!/usr/bin/env python3
import os
import sqlite3
import time
import requests
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

DB_PATH = "/root/ai-trade-2/system_logs.sqlite"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            level TEXT,
            module TEXT,
            message TEXT,
            hash TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_log(timestamp, level, module, message):
    log_hash = f"{timestamp}|{level}|{module}|{message}"
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO system_logs (timestamp, level, module, message, hash)
            VALUES (?, ?, ?, ?, ?)
        """, (str(timestamp), str(level), str(module), str(message), log_hash))
        conn.commit()
        conn.close()
    except Exception as e:
        pass

def collector_loop():
    auth = ('freqtrader', 'SuperSecretPassword123!')
    while True:
        try:
            # 1. Try to fetch logs from Freqtrade REST API
            res = requests.get('http://127.0.0.1:8080/api/v1/logs?limit=200', auth=auth, timeout=3)
            if res.status_code == 200:
                data = res.json()
                logs = data.get('logs', [])
                for log in logs:
                    if len(log) >= 5:
                        ts, _, module, level, msg = log[0], log[1], log[2], log[3], log[4]
                        save_log(ts, level, module, msg)
        except Exception:
            pass

        # 2. Also capture journalctl logs in case Freqtrade API is offline/restarting
        try:
            cmd = ["journalctl", "-u", "freqtrade", "-n", "30", "--no-pager"]
            proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if proc.returncode == 0:
                for line in proc.stdout.splitlines():
                    line = line.strip()
                    if line:
                        parts = line.split(" ", 4)
                        if len(parts) >= 5:
                            ts = f"{parts[0]} {parts[1]} {parts[2]}"
                            msg = parts[4]
                            level = "ERROR" if "ERROR" in msg or "FAILED" in msg else ("WARNING" if "WARNING" in msg else "INFO")
                            save_log(ts, level, "systemd.freqtrade", msg)
        except Exception:
            pass

        time.sleep(3)

class LogHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        auth_header = self.headers.get('Authorization')
        
        # Enable CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()

        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Retrieve last 300 logs from SQLite DB
            cursor.execute("""
                SELECT timestamp, level, module, message 
                FROM system_logs 
                ORDER BY id DESC 
                LIMIT 300
            """)
            rows = cursor.fetchall()
            conn.close()

            formatted_logs = []
            for r in rows:
                # [timestamp, unix_ts, module, level, message]
                formatted_logs.append([r[0], 0, r[2], r[1], r[3]])

            response_data = {
                "log_count": len(formatted_logs),
                "logs": formatted_logs,
                "source": "sqlite_db"
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        except Exception as e:
            self.wfile.write(json.dumps({"log_count": 0, "logs": [], "error": str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()

def run_server():
    server = HTTPServer(('127.0.0.1', 8086), LogHTTPHandler)
    server.serve_forever()

if __name__ == "__main__":
    init_db()
    
    # Start collector in thread
    t = threading.Thread(target=collector_loop, daemon=True)
    t.start()

    # Start HTTP server
    run_server()

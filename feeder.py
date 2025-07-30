#!/usr/bin/env python3

import json
import random
import time
import signal
import sys
import os
import requests
from datetime import datetime, timedelta

running = True

def sigint_handler(sig, frame):
    global running
    print("\nStopping data generation...")
    running = False

def generate_random_event():
    event_types = ["page_view", "user_joined", "user_disconnect", "log", "user_message"]
    
    user_id = str(random.randint(1, 999))
    
    pages = ["home", "profile", "settings", "dashboard"]
    
    browsers = ["chrome", "firefox", "safari", "edge"]
    
    timestamp = datetime.now()
    
    event = {
        "eventType": random.choice(event_types),
        "userId": user_id,
        "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "metadata": {
            "page": random.choice(pages),
            "browser": random.choice(browsers)
        }
    }
    
    return event

def main():
    global running
    
    webhook_url = os.getenv('WEBHOOK_URL', 'http://localhost:8000/webhook')
    
    signal.signal(signal.SIGINT, sigint_handler)
    
    print("Starting data generation... Press Ctrl+C to stop")
    
    while running:
        try:
            event = generate_random_event()
            print(json.dumps(event, indent=2))
            
            if webhook_url:
                try:
                    response = requests.post(webhook_url, json=event, timeout=5)
                    print(f"Webhook response: {response.status_code}")
                except requests.exceptions.RequestException as e:
                    print(f"Webhook error: {e}")
            
            sleep_time = random.randint(10, 20)
            
            # Send invalid data if sleep time is >= 15
            if sleep_time >= 15:
                invalid_event = {
                    "eventType": "invalid_type",
                    "userId": "invalid_user",
                    "timestamp": "invalid-timestamp"
                }
                print(json.dumps(invalid_event, indent=2))
                print("Sending INVALID event to webhook (sleep time >= 15)")
                
                if webhook_url:
                    try:
                        response = requests.post(webhook_url, json=invalid_event, timeout=5)
                        print(f"Invalid event response: {response.status_code}")
                    except requests.exceptions.RequestException as e:
                        print(f"Invalid event error: {e}")
            
            time.sleep(sleep_time)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error generating event: {e}")
            time.sleep(1)
    
    print("Data generation stopped.")

if __name__ == "__main__":
    main() 
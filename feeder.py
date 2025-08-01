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
    api_key = os.getenv('WEBHOOK_API_KEY', 'entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b')
    
    # Headers for API key authentication
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key
    }
    
    signal.signal(signal.SIGINT, sigint_handler)
    
    print("Starting data generation... Press Ctrl+C to stop")
    print(f"Using API Key: {api_key[:20]}...")
    
    while running:
        try:
            event = generate_random_event()
            print(json.dumps(event, indent=2))
            
            if webhook_url:
                try:
                    response = requests.post(webhook_url, json=event, headers=headers, timeout=5)
                    print(f"Webhook response: {response.status_code}")
                except requests.exceptions.RequestException as e:
                    print(f"Webhook error: {e}")
            
            sleep_time = random.randint(5, 10)
            
            # Send invalid data if sleep time is >= 15
            if sleep_time >= 8:
                invalid_event = {
                    "eventType": "invalid_type",
                    "userId": "invalid_user",
                    "timestamp": "invalid-timestamp"
                }
                print(json.dumps(invalid_event, indent=2))
                print("Sending INVALID event to webhook")
                
                if webhook_url:
                    try:
                        response = requests.post(webhook_url, json=invalid_event, headers=headers, timeout=5)
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
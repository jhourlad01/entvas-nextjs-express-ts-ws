#!/usr/bin/env python3

import json
import random
import time
import signal
import sys
from datetime import datetime, timedelta

running = True

def sigint_handler(sig, frame):
    global running
    print("\nStopping data generation...")
    running = False

def generate_random_event():
    event_types = ["page_view", "user_joined", "user_disconnect", "log", "error"]
    
    user_ids = [f"user{i:03d}" for i in range(1, 101)]
    
    pages = ["/home", "/products", "/about", "/contact", "/login", "/dashboard", "/profile"]
    
    browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"]
    
    timestamp = datetime.utcnow()
    
    event = {
        "eventType": random.choice(event_types),
        "userId": random.choice(user_ids),
        "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "metadata": {
            "page": random.choice(pages),
            "browser": random.choice(browsers)
        }
    }
    
    return event

def main():
    global running
    
    signal.signal(signal.SIGINT, sigint_handler)
    
    print("Starting data generation... Press Ctrl+C to stop")
    
    while running:
        try:
            event = generate_random_event()
            print(json.dumps(event, indent=2))
            
            time.sleep(random.randint(10, 30))
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error generating event: {e}")
            time.sleep(1)
    
    print("Data generation stopped.")

if __name__ == "__main__":
    main() 
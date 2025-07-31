# Senior Full Stack Developer Technical Assessment

## Project: Real-Time Analytics Dashboard

### What You Will Build
You will create a web application that:
- Receives data from other apps (through webhooks)
- Saves this data in a database
- Shows live charts and numbers on a web page
- Updates automatically when new data arrives

### Technology You Must Use
- **Frontend**: React or Next.js with TypeScript (you must use TypeScript)
- **Backend**: Node.js (you can use Express or Next.js API Routes)
- **Database**: Choose one: PostgreSQL, MongoDB, MySQL, or Redis
- **Real-time updates**: Use WebSockets or Server-Sent Events
- **Hosting**: Deploy your app online (you can use any hosting service)

### What Your App Must Do

#### Part 1: API (Backend)
Create an API endpoint that:
- Accepts POST requests with event data
- Checks if the data is correct (validation)
- Saves the data to your database
- Sends back success or error messages

#### Part 2: Dashboard (Frontend)
Create a web page that shows:
- Total number of events
- How many events happen each minute (show as a graph)
- Top 5 most common event types
- Buttons to filter by time (last hour, last day, last week)
- All numbers update automatically (no need to refresh the page)

### Event Data Format
Each event must look like this:
```json
{
  "eventType": "page_view",    // What kind of event (required)
  "userId": "user123",         // Who did it (required)
  "timestamp": "2024-01-01T12:00:00Z", // When it happened
  "metadata": {                // Extra information (optional)
    "page": "/home",
    "browser": "Chrome"
  }
}
```

### Important Tips
- Handle errors well - if someone sends wrong data, tell them what's wrong
- Make your database queries fast (use indexes)
- Your app should work when many people use it at the same time
- Add basic security (like checking if requests are too frequent)
- Use environment variables for passwords and settings

### How We Will Grade Your Work
- Is your code well organized and easy to understand?
- Does your app handle errors properly?
- Is your app fast and efficient?
- Is your code clean with good comments?
- Did you follow security best practices?
- **Architecture**: Did you use good design patterns (MVC, Repository, etc.)?
- **Tech choices**: Can you explain why you chose your database and tools?
- **Scalability**: Will your app work well with many users?
- **Code structure**: Is your code organized in a logical way?

### What to Submit
Make sure you have all of these:
- ✓ Working app online (we need the URL)
- ✓ Your code on GitHub (public repository)
- ✓ README file that explains:
  - How to run your app
  - How to use your API
  - Why you chose your database
  - What design patterns you used and why
  - How your app could handle more users (scaling)
- ✓ Example commands to test your API (using curl or Postman)
- ✓ Both the API and live updates must work

### Extra Credit (Optional)
These are not required, but will impress us:
- Make database queries faster by pre-calculating some numbers
- Add login/password to protect the dashboard
- Let users download data as CSV file
- Make it work well on mobile phones
- Use Docker to package your app
- Write tests for important parts of your code

### For Very Experienced Developers (10+ Years)
If you have many years of experience, show us by adding these:
- Prevent duplicate events from being saved twice
- Create complex reports (like user behavior patterns)
- Handle situations when too many events come at once
- Show how to run multiple servers for more users
- Add automatic retry when things fail
- Add monitoring to track how your app is doing
- Make it work for multiple companies at once

### How to Submit Your Work
Send us these 4 things:
1. Link to your GitHub repository (must be public)
2. URL where we can see your dashboard working
3. URL of your API endpoint (where we send test events)
4. Any notes about why you built it the way you did 
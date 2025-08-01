# Entvas Senior Full Stack Developer Technical Assessment

## 🧩 Project: Real-Time Analytics Dashboard

### What You Will Build

A web application that:

- Receives data from other apps (via **webhooks**)
- Saves this data in a **database**
- Displays **live charts and metrics** on a dashboard
- Updates automatically **in real-time**

---

## Required Technologies

- **Frontend**: React or Next.js with **TypeScript**
- **Backend**: Node.js using **Express** or **Next.js API Routes**
- **Database**: Choose one — PostgreSQL, MongoDB, MySQL, or Redis
- **Real-time updates**: Use **WebSockets** or **Server-Sent Events (SSE)**
- **Hosting**: Any provider (your choice)

---

## ✅ App Requirements

### Part 1: API (Backend)

- Accept **POST** requests with event data
- Validate input data
- Save events to the database
- Return clear **success** or **error** messages

### Part 2: Dashboard (Frontend)

- Show:
  - Total number of events
  - Events per minute (**graph**)
  - Top 5 most common event types
  - Time filters: **last hour**, **last day**, **last week**
- All data must **update automatically**

---

## 📦 Event Data Format

```json
{
  "eventType": "page_view",              // Required
  "userId": "user123",                   // Required
  "timestamp": "2024-01-01T12:00:00Z",   // Optional
  "metadata": {
    "page": "/home",
    "browser": "Chrome"
  }
}
```

---

## 💡 Tips

- Handle invalid data with detailed error responses
- Optimize database queries (use **indexes**)
- Add rate-limiting for security
- Use **environment variables** for secrets
- Ensure concurrent users are supported
- Use good architecture (e.g., **MVC**, **Repository**)

---

## 🧪 Evaluation Criteria

- Clear and maintainable code
- Proper error handling
- Fast and efficient performance
- Secure and resilient logic
- Well-structured architecture
- Good tool and database choices
- Scalable design
- Clean Git and commit history

---

## 📤 Submission Requirements

- ✅ Live app URL
- ✅ Public GitHub repo
- ✅ README containing:
  - How to run the app
  - API usage instructions
  - Database choice and reasoning
  - Design patterns used
  - Scaling strategy
- ✅ Example API commands (curl/Postman)
- ✅ Real-time updates must work

---

## 🌟 Extra Credit (Optional)

- Pre-compute stats for faster queries
- Add dashboard login/password
- Enable CSV export
- Mobile responsiveness
- Docker support
- Write tests for key logic

---

## 🧠 For Senior Developers (10+ Years)

- Prevent duplicate events
- Generate complex reports (user behavior)
- Handle high-throughput bursts
- Support multi-server deployments
- Add retry logic for failures
- Add monitoring/observability
- Support multiple companies (multi-tenancy)

---

## 📬 How to Submit

1. **GitHub repo link**
2. **Live dashboard URL**
3. **API endpoint URL**
4. **Brief explanation of design decisions**

---

## ❓ Questions?

Email us — we’re here to help you succeed!

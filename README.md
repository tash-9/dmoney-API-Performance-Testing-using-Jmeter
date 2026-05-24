# DMoney API Performance Testing using JMeter

## Project Overview

This project automates performance testing of the DMoney REST API using Apache JMeter. It covers three core financial transaction flows — Deposit, Send Money, and Payment — simulated across multiple concurrent users with Gmail OTP-based authentication and CSV-driven test data.

The goal is to measure how the system performs under load and verify that all transactions complete successfully within expected response times.

---

## Technology Stack

| Tool | Purpose |
|------|---------|
| Apache JMeter 5.6.3 | Load testing and test automation |
| Gmail OAuth API | OTP retrieval via Gmail inbox |
| JSR223 PreProcessor (Groovy) | Dynamically fetch Gmail message ID before OTP read |
| CSV Data Set Config | Data-driven testing with multiple accounts |
| Random Variable Controller | Generate dynamic transaction amounts |
| Response Assertion | Validate every transaction returns HTTP 200 |
| JMeter HTML Report | Visualize performance metrics after test run |

---

## Prerequisites

- Java JDK 8 or above
- Apache JMeter 5.6.3 installed at `D:\apache-jmeter-5.6.3`
- DMoney server running locally at `http://localhost:5000`
- Valid Gmail OAuth access token for `tashfia.islam102938@gmail.com`

---

## Project Structure

```
D:\apache-jmeter-5.6.3\bin\B18\
│
├── dmoney_PerformanceTesting.jmx   → Main JMeter test plan
├── deposit.csv                     → Agent & customer account data
├── sendMoney.csv                   → Sender & receiver customer data
├── Payment.csv                     → Customer & merchant account data
└── reports\                        → HTML performance report output
```

---

## Test Scenarios

### Thread Group 1 — Deposit
- **Threads:** 5 | **Ramp-up:** 120s | **Loop:** 2 (10 deposits total)
- 5 agents each deposit to 2 customers
- Flow: `Admin Login → Agent Login → Read OTP → Verify OTP → Deposit Amount`
- Endpoint: `POST /transaction/deposit`

### Thread Group 2 — Send Money
- **Threads:** 5 | **Ramp-up:** 120s | **Loop:** 2 (10 transactions total)
- 5 customers each send money to 2 other customers
- Flow: `Admin Login → Customer Login → Read OTP → Verify OTP → Send Money`
- Endpoint: `POST /transaction/sendmoney`

### Thread Group 3 — Payment
- **Threads:** 5 | **Ramp-up:** 120s | **Loop:** 2 (10 transactions total)
- 5 customers each make payments to 2 merchants
- Flow: `Admin Login → Customer Login → Read OTP → Verify OTP → Payment`
- Endpoint: `POST /transaction/payment`

---

## How to Run

### Step 1 — Update Gmail Token
Open `dmoney_PerformanceTesting.jmx` in JMeter. In each Thread Group go to **User Defined Variables** and replace `gmail_token` with a fresh OAuth token.

> ⚠️ Gmail tokens expire after ~1 hour. Generate a new one before every run.

### Step 2 — GUI Mode (debugging)
```
1. Open JMeter
2. File → Open → dmoney_PerformanceTesting.jmx
3. Press the green Play button
4. Monitor live results in View Results Tree
```

### Step 3 — Non-GUI Mode (performance test)
```bash
cd D:\apache-jmeter-5.6.3\bin

jmeter -n -t B18\dmoney_PerformanceTesting.jmx -l B18\reports\results.jtl -e -o B18\reports\html
```

### Step 4 — Open HTML Report
```
Open: B18\reports\html\index.html
```

---

## Test Report

### Request Summary


### Statistics


---

## Key Implementation Details

- **OTP Flow:** Each login triggers an OTP sent to the Gmail inbox. The JSR223 Groovy script fetches the latest message ID, the HTTP GET reads the email body, and the Regex Extractor pulls out the 4-digit OTP.
- **Token Reuse:** Admin Login runs once per thread outside the Loop Controller. The token is reused for all loop iterations, avoiding redundant logins.
- **Dynamic Amounts:** Transaction amounts are randomized between 10 and 50 using the Random Variable Controller to prevent account balances from depleting.
- **Gmail Aliases:** The `+alias` trick (`tashfia.islam102938+jagent1@gmail.com`) gives each agent and customer a unique email while all OTPs arrive in one inbox.



# Assignment 1: Agile Requirements and Sprint Planning

**Domain:** Food Delivery Application  
**Application Name:** QuickBite  
**Course:** DevOps Lab / Agile Software Development  

---

## 1. Aim
To choose an application domain (Food Delivery), create Agile requirements using User Stories and Acceptance Criteria, and perform Sprint Planning, Story Point Estimation, and Release Planning for the created user stories.

## 2. Objective
Understand Agile requirements gathering, estimation, and planning techniques, and how they support iterative, value-driven software delivery.

---

## 3. Theoretical Background

- **User Story:** A short, plain-language description of a feature from the end user's perspective, framed in the standard template:
  $$\text{"As a } <\text{role}>, \text{ I want } <\text{goal}>, \text{ so that } <\text{benefit}>"$$
- **Acceptance Criteria:** Clear, testable conditions and boundary checks that a story must satisfy to be deemed "Done" by stakeholders. They eliminate ambiguity and enable automated or manual verification.
- **Story Points & Fibonacci Scale:** A relative metric representing the combined effort, complexity, and uncertainty/risk of a user story rather than raw hours. Teams use Planning Poker with the Fibonacci sequence:
  $$1, 2, 3, 5, 8, 13$$
  The increasing exponential gaps reflect the principle that larger tasks carry inherently higher estimation uncertainty.
- **Velocity:** The average number of story points a development team completes in a single sprint. Velocity serves as the baseline for forecasting capacity in subsequent sprints.
- **Sprint Planning:** An event where the team selects a subset of prioritized backlog items that fit within its projected velocity and commits to a cohesive **Sprint Goal**.
- **Release Planning & MVP:** Grouping sprints into shippable product increments. The **Minimum Viable Product (MVP)** represents the smallest bundle of features that delivers an end-to-end usable core flow to real users.
- **MoSCoW Prioritization:** A categorization technique dividing backlog items into:
  - **M**ust have (Critical for product viability)
  - **S**hould have (Important, but workarounds exist)
  - **C**ould have (Desirable enhancements if time permits)
  - **W**on't have (Agreed out-of-scope for the current release)

---

## 4. System Overview & Agile Framework

### 4.1 Project Vision
> *"Enable customers to discover nearby restaurants, browse dynamic menus, place and pay for orders online seamlessly, and track delivery in real time, while empowering restaurant owners to efficiently manage kitchen order fulfillment."*

### 4.2 Project Objectives
1. Provide a secure, friction-free customer onboarding and authentication flow.
2. Deliver responsive restaurant menu browsing, search, and dynamic filtering.
3. Enable reliable cart management with cross-restaurant collision prevention.
4. Support multi-channel online payments (UPI, Cards, Cash on Delivery) with fail-safe cart retention.
5. Provide live, milestone-based order tracking and ETA updates.
6. Provide restaurant partners with an instant order dispatch and kitchen load management dashboard.
7. Collect authentic post-delivery customer feedback and enable quick re-ordering.

### 4.3 Key Actors
1. **Customer:** End user who browses menus, customizes food carts, executes payments, tracks delivery progress, and submits ratings.
2. **Restaurant Owner:** Merchant partner who receives real-time order alerts, reviews items, and accepts or rejects orders based on kitchen capacity.
3. **Delivery Partner / System (Internal):** Updates order status milestones (`Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`).

### 4.4 Identified Epics
| Epic ID | Epic Name | Description |
| :--- | :--- | :--- |
| **EP-01** | Account Management | Customer registration, credential validation, session security, and profile handling. |
| **EP-02** | Restaurant Discovery | Geolocation listing, menu presentation, search indexing, and multi-criteria filtering. |
| **EP-03** | Ordering & Payment | Cart CRUD operations, cart validation rules, multi-mode payment gateway integration. |
| **EP-04** | Order Fulfilment | Restaurant order acceptance/rejection workflow, kitchen timeouts, and live milestone tracking. |
| **EP-05** | Feedback & Retention | Post-fulfillment ratings, review submissions, order history, and discount promotions. |

---

## 5. Agile Requirements: 10 User Stories and Acceptance Criteria

Below is the complete catalog of 10 user stories for QuickBite along with their acceptance criteria:

| Story ID | Epic | User Story (Role / Goal / Benefit) | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **US1** | Account Management | **As a customer**, I want to register and log in, **so that** I can place orders securely. | • Valid user details successfully create an account.<br>• Submitting invalid credentials displays a clear error message.<br>• Passwords must be at least 8 characters in length. |
| **US2** | Restaurant Discovery | **As a customer**, I want to browse restaurants and their menus, **so that** I can choose what to eat. | • Nearby restaurants are listed based on user location.<br>• Each menu item displays name, price, and a veg/non-veg tag.<br>• Currently closed restaurants are clearly flagged as unavailable. |
| **US3** | Restaurant Discovery | **As a customer**, I want to search and filter by cuisine, rating, and price, **so that** I find food faster. | • Filtered and search query results render within 2 seconds.<br>• Multiple filter parameters (e.g., Chinese + 4★+ + Budget) can be combined.<br>• A friendly "No results found" placeholder is displayed when no items match. |
| **US4** | Ordering & Payment | **As a customer**, I want to add items to a cart, **so that** I can order several dishes together. | • Items can be added, removed, and quantities incremented/decremented.<br>• Cart subtotal, taxes, and total amount update instantly.<br>• Items from two different restaurants cannot be mixed in the same cart (prompts user to replace cart). |
| **US5** | Ordering & Payment | **As a customer**, I want to place an order and pay online, **so that** my food is confirmed. | • Supports UPI, credit/debit card, and Cash on Delivery (COD).<br>• A unique Order ID is generated upon successful payment completion.<br>• On payment failure or gateway timeout, cart contents are strictly preserved. |
| **US6** | Order Fulfilment | **As a customer**, I want to track my order live, **so that** I know when it arrives. | • Order lifecycle statuses are strictly sequenced: `Placed` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`.<br>• Estimated Time of Arrival (ETA) is calculated and displayed dynamically.<br>• Push/in-app notification is triggered on every status change. |
| **US7** | Feedback & Retention | **As a customer**, I want to rate and review an order, **so that** others benefit from my feedback. | • 1 to 5-star rating submission is strictly restricted to orders with status `Delivered`.<br>• Exactly one rating/review submission allowed per completed order. |
| **US8** | Order Fulfilment | **As a restaurant owner**, I want to accept or reject incoming orders, **so that** I can manage my kitchen load. | • Incoming order audio/visual alert is shown immediately on the dashboard.<br>• If unaccepted within 5 minutes, order is auto-cancelled and refund triggered. |
| **US9** | Feedback & Retention | **As a customer**, I want to view my order history, **so that** I can reorder my favourites. | • Historical orders are displayed sorted chronologically (newest first).<br>• Clicking a "Reorder" button automatically refills the cart with those past items. |
| **US10** | Ordering & Payment | **As a customer**, I want to apply promo codes, **so that** I get discounts. | • Entering an active promo code applies discount and reduces the payable total.<br>• Expired, inactive, or below-threshold codes display an informative error.<br>• Exactly one promo code can be applied per checkout session. |

---

## 6. Story Point Estimation (Planning Poker & Fibonacci Scale)

- **Baseline Story:** **US7 (Rate and review an order)** is designated as the reference baseline and assigned **2 Story Points** due to its low complexity (a straightforward static form submission with basic validation).
- **Estimation Scale:** Fibonacci numbers ($1, 2, 3, 5, 8, 13$).

| Story ID | User Story Title | Story Points | Estimation Rationale |
| :--- | :--- | :---: | :--- |
| **US1** | Register / Login | **3** | Standard authentication patterns, password hashing, session tokens, and input validation. |
| **US2** | Browse menus | **5** | Dynamic data retrieval, geospatial proximity calculation, menu schema formatting, availability flags. |
| **US3** | Search & filter | **3** | In-memory/database query indexing, multi-predicate filter logic, performance constraint ($\le 2\text{s}$). |
| **US4** | Cart management | **3** | Client/server state synchronisation, quantity manipulation, single-restaurant cart constraint rules. |
| **US5** | Order & payment | **8** | High risk and architectural complexity: Third-party payment gateway webhooks, transaction states, refund hooks. |
| **US6** | Live tracking | **8** | High complexity: Real-time event streams/WebSockets, GPS location rendering, and dynamic ETA calculation. |
| **US7** | Rating / review | **2** | **Baseline Story:** Minimal CRUD form, post-delivery validation check, and simple database record insert. |
| **US8** | Restaurant accept / reject | **5** | Asynchronous push notifications to restaurant UI, background countdown timer, and automated cancellation/refund worker. |
| **US9** | Order history | **2** | Read-heavy query from order database sorted by timestamp, plus simple cart hydration endpoint for "Reorder". |
| **US10** | Promo codes | **3** | Coupon validation engine, date verification, minimum order value checks, and discount calculation. |
| **Total** | **All 10 Stories** | **42** | **Complete Backlog Effort** |

---

## 7. Sprint Planning

- **Sprint Duration:** 2 weeks per sprint.
- **Assumed Team Velocity:** $\approx 14\text{ Story Points}$ per sprint.
- **Total Backlog:** 42 Story Points $\div 14 \approx 3\text{ Sprints}$.

| Sprint | Sprint Goal | Assigned User Stories | Total Points |
| :--- | :--- | :--- | :---: |
| **Sprint 1** | Customers can sign in, browse restaurants, search food items, and assemble items into a shopping cart. | **US1** (3 pts)<br>**US2** (5 pts)<br>**US3** (3 pts)<br>**US4** (3 pts) | **14** |
| **Sprint 2** | Customers can place and pay for orders securely; restaurant owners can manage orders in real time, and customers can view past orders. | **US5** (8 pts)<br>**US8** (5 pts)<br>**US9** (2 pts) | **15** |
| **Sprint 3** | Deliver real-time order tracking with dynamic ETA, promotional coupon discounts, and customer feedback/ratings. | **US6** (8 pts)<br>**US10** (3 pts)<br>**US7** (2 pts) | **13** |

---

## 8. Release Planning & Minimum Viable Product (MVP)

The product roadmap is structured into two iterative milestones:

```
[Sprint 1: Browse & Cart] ───> [Sprint 2: Checkout & Fulfillment] ───> [RELEASE 1 (MVP)]
                                                                               │
[Sprint 3: Tracking, Promos & Reviews] ───────────────────────────────> [RELEASE 2]
```

| Release Target | Timeline | Included Stories | Key Deliverables & Value Proposition |
| :--- | :--- | :--- | :--- |
| **Release 1 (MVP)** | End of Sprint 2 (Week 4) | **US1, US2, US3, US4, US5, US8, US9** (29 Story Points) | **Complete Order-to-Payment Flow:** Users can authenticate, discover menus, build carts, make secure payments, and restaurant merchants can accept orders and trigger cooking. This constitutes a fully functional business transaction. |
| **Release 2** | End of Sprint 3 (Week 6) | **US6, US7, US10** (13 Story Points) | **Delight & Retention Enhancements:** Adds real-time order tracking on maps, promotional discount codes for marketing campaigns, and customer rating/review mechanisms. |

---

## 9. MoSCoW Prioritization

To ensure disciplined scope management during development and release cutoffs, requirements are categorized using MoSCoW:

- **Must Have (Essential for viable launch - 27 pts):**
  - **US1:** User Registration & Authentication (Security & identification)
  - **US2:** Browse Restaurants & Menus (Core catalog discovery)
  - **US3:** Search & Filter Foods (Usability necessity)
  - **US4:** Cart Management (Core transaction building block)
  - **US5:** Order Placement & Online Payment (Revenue generation)
  - **US8:** Restaurant Accept / Reject (Order fulfillment capability)
- **Should Have (High priority, non-blocker for day-one manual operations - 10 pts):**
  - **US6:** Live Order Tracking (Increases customer peace of mind, can fallback to SMS/Call)
  - **US9:** Order History & Reorder (Convenience & customer retention)
- **Could Have (Desirable additions when resources allow - 5 pts):**
  - **US7:** Ratings and Reviews (Post-fulfillment social proof)
  - **US10:** Promotional Codes / Discount Coupons (Marketing incentive)
- **Won't Have (Out-of-Scope for initial releases):**
  - Advanced AI dish recommendations.
  - Multi-restaurant combined single delivery.
  - Dine-in table reservations.
  - Drone-assisted autonomous delivery.

---

## 10. Result
Agile requirements for the **QuickBite** food delivery application were comprehensively formulated as **10 user stories** accompanied by explicit, testable **acceptance criteria**. The entire product backlog was estimated using Planning Poker on the Fibonacci scale at **42 story points** (benchmarked against baseline US7 at 2 points). Based on a projected velocity of **14 points per 2-week sprint**, the stories were distributed across **three sprints**, leading to **Release 1 (MVP)** at the end of Sprint 2 and **Release 2** at the end of Sprint 3.

---

## 11. Viva Questions & Detailed Answers

### Q1: What is a User Story?
**Answer:** A User Story is a concise, plain-language description of a software feature framed from the perspective of an end user or customer. It captures who the user is, what capability they require, and why it provides value, using the standard format:  
`"As a <role>, I want <goal>, so that <benefit>"`.

### Q2: What are Acceptance Criteria?
**Answer:** Acceptance Criteria are the predefined, testable boundary conditions and quality requirements that a user story must satisfy before it can be accepted as "Done" by the Product Owner. They clarify user expectations, guide test cases, and prevent ambiguity.

### Q3: What is a Story Point and why is the Fibonacci scale used in Agile estimation?
**Answer:** A Story Point is a dimensionless, relative unit of measurement representing the combined effort, architectural complexity, and inherent risk of implementing a user story. The Fibonacci scale ($1, 2, 3, 5, 8, 13, \dots$) is used because human cognitive accuracy decreases as task size grows; larger intervals reflect the higher uncertainty of larger tasks, discouraging false precision and sparking constructive team discussion.

### Q4: What is Velocity in Agile and how is it used?
**Answer:** Velocity is the total number of story points successfully completed ("Done") by a development team within a single sprint. It is calculated by averaging past sprints and is used during Sprint Planning to determine the sustainable capacity of stories the team can commit to in upcoming iterations.

### Q5: What is the key difference between Sprint Planning and Release Planning?
**Answer:** **Sprint Planning** is short-term tactical planning performed at the beginning of each sprint to determine what specific backlog stories the team will build in the next 1–4 weeks and establish a Sprint Goal. **Release Planning** is longer-term strategic planning that groups multiple sprints and features into cohesive, deployable product versions (such as an MVP or major release) to deliver measurable business milestones to end users.

# Laptop Recommendation system - LareC

## Understanding of the problem:
Laptops are widely used for various purposes such as academics, work, gaming, and everyday tasks. With numerous models available in the market, users often find it difficult to choose a laptop that best matches their needs and budget.
The aim of this project is to build a Laptop Recommendation System that helps users select suitable laptops based on their preferences. Instead of manually browsing and comparing hundreds of products, users can input their requirements and receive relevant recommendations in one place, making the selection process simpler and more efficient.

## Assumptions made:
- The dataset used for this project are accurate and up to date.
- Since the dataset does not contain a laptop weight column, portability is not directly considered in the recommendation logic.
- The options are based on whats available in the dataset.
- Users have a clear understanding of their approximate budget, which is treated as a primary (hard) constraint during recommendation.

## Structure of the solution:
- The project is divided into frontend and backend to maintain a clear separation of concerns. The frontend handles user interaction and presentation, while the backend manages data processing and recommendation logic through API endpoints.
- Python was chosen because it is highly suitable for data processing and algorithmic logic. Using libraries like Pandas simplifies dataset cleaning, filtering, and scoring operations
- FastAPI was used because it is fast, lightweight, and easy to connect with the frontend while automatically handling data validation. It keeps the recommendation logic separate from the UI and makes the system scalable for future enhancements.

#### System Architecture
The system follows a simple full-stack architecture:
    Frontend: Vanilla JavaScript (ES modules)
    Backend: FastAPI (Python)
    Dataset: CSV loaded into memory at server startup

The frontend collects user inputs and sends them to the backend API.
The backend performs filtering, scoring, and explanation generation.
The results are returned as JSON and rendered dynamically.



## Design decisions and trade-offs:
- The system does not use AI or machine learning. Instead, it uses a clear scoring formula:
score = Σ(normalized_value × weight) / Σ(weights) × 100
Each laptop gets points based on how well it matches your priorities. The higher your priority (High, Medium, Low), the more that feature influences the score.
Trade-off: The system cannot “learn” from past users or improve automatically over time. However, every score is fully explainable and will always produce the same result for the same inputs.

-The laptop dataset (CSV file) is loaded once when the server starts and kept in memory. Every recommendation works from this in-memory copy.
Trade-off: This makes the system simple and very fast, but the dataset is static. If the data changes, the server must be restarted.

The frontend is built using plain JavaScript with ES modules. There is no React, Vue, Angular, or build system.

Trade-off: UI updates must be handled manually in code. However, the structure stays simple, lightweight, and easy to understand — and it runs directly in the browser without extra tooling.

-Normalization is done only on laptops that pass your hard constraints (like budget and minimum RAM).
-A score of 100/100 does not mean “best laptop overall.” It means “best laptop among the ones that match your requirements.”
- If you skip all soft preference questions, the system cannot calculate weighted scores. In that case, laptops are ranked from cheapest to most expensive within your budget.
This provides a neutral default when you haven’t expressed any specific priorities.

- Benefit-focused explanations – raw numbers are converted to plain-language tiers (low/mid/high) and described as real benefits, e.g., “handles demanding workloads and heavy multitasking with ease”.

---

## Edge cases considered:
- No laptops match → friendly message instead of error.
- Back navigation clears stale answers.
- Zero-weight soft preferences are ignored.
- Price formatting and same-price pools are handled gracefully.
- OS matching is fuzzy.
- “No minimum” answers (0) are not dropped.

---

## How to run the program:

### Backend Setup
cd backend                          # Navigate to backend folder 
pip install -r requirements.txt     # Install dependencies 
uvicorn app:app --reload            # Start the backend server
note: API runs at http://localhost:8000. Debug endpoint: GET /debug.

### Frontend
cd frontend                         # Navigate to frontend folder 
python -m http.server 5500          # Start a simple HTTP server 

Works with VS Code Live Server too

---
## Improvement if more time was available:
- add pictures, links to buy, provide 3d view of the product.
- Use AI for explanation
- add chatbot for people assistance
- add sidebar in results page and allow dynamic changing
- host the website
- better UI/Ux
- Could add a feature that could fetch the nearest shop where the product is available.
- tiered processor classifications derived from model names
- use advanced normalisation technique such scoring  is limited to using numeric features( olumns)

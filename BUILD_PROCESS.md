# BUILD_PROCESS.md

## 1. How I Started

I began by carefully understanding the problem statement. The key requirement was to build a **Decision Companion System** that helps users make informed choices using explainable logic, without relying entirely on AI. Initially very confused but as i researched through different domains of topic I decided to work on a **Laptop Selection Decision System**, as it is:
- Relatable to general users
- Well-suited for multi-criteria decision making
- Supported by publicly available datasets
- Easier to explain trade-offs compared to more subjective domains

Before coding, I clarified core constraints such as:
- Budget being a **hard constraint**
- Rankings needing to be **explainable**
- Inputs needing to be **user-modifiable**

---

## 2. How My Thinking Evolved

Initially, I assumed that a recommendation system like this would require AI or machine learning models. My first instinct was that prediction-based systems were necessary to produce meaningful results. However, after carefully analyzing the assignment requirements, I realized that:
- The assignment emphasizes decision logic, not prediction
- A weighted scoring and rule-based system is more transparent
- Explainability is easier without black-box models
- Deterministic systems are more appropriate when criteria are clearly defined
This changed my approach completely. Instead of focusing on training models, I shifted toward designing a structured and explainable decision framework.

I began focusing on finding datasets using which we can achieve:
Clearly defined evaluation criteria
User-controlled weights (High, Medium, Low)
Deterministic ranking logic
Reproducible and transparent scoring

Another important realization was the value of using a real-world dataset instead of mock data. A real dataset:
Introduced practical cleaning challenges
Made filtering and ranking more realistic
Improved the credibility of the project

While researching ranking methods, I initially felt confused about how to properly compare different features. I struggled with questions like how to compare values with different scales, how to ensure fairness across specifications, how to convert priorities into meaningful numeric weights,etc.
After researching normalization and multi-criteria decision-making, I understood how min-max scaling and weighted aggregation could be applied logically. This was a major turning point, as the system evolved from simple filtering to structured ranking.

During implementation, I used AI tools such as Claude AI for partial assistance in drafting logic and structure. Some generated outputs contained errors or inconsistencies, especially in integration and overview sections. These required manual debugging, correction, and restructuring. Reviewing and fixing those issues improved my understanding of the system and strengthened my debugging skills.

More importantly, this process helped me move from assuming complexity was necessary to understanding that clarity, structure, and reasoning are often more valuable than sophistication.
---

## 3. Dataset Exploration and Cleaning

I explored multiple laptop datasets and finally selected a structured CSV dataset containing specifications such as:
- Processor details
- RAM, storage, cores, threads
- Screen size and resolution
- Price
The original dataset had over 900 entries and inconsistent formatting.  
To address this, I performed data cleaning and preprocessing using pandas, including:
- Removing irrelevant or redundant columns
- Normalizing numeric fields
- Handling missing or inconsistent values
- Reducing the dataset to a manageable but realistic size (376 rows)

The cleaned dataset was exported as a separate CSV file to ensure reproducibility and separation of concerns.

---

## 4. Alternative Approaches Considered

- **Using AI/ML for ranking:**  
  Rejected because it would reduce explainability and violate the “not entirely AI-based” constraint.

- **Using the provided `spec_score` directly:**  
  Considered, but not finalized yet. There is concern that it may act as a hidden black-box metric rather than transparent logic.

- **Hard-coding rankings:**  
  Rejected because the assignment requires dynamic inputs and flexible outcomes.

- **Use of AI for explaination:**
 Considered as a future enhancement to generate natural-sounding descriptions for laptop features, but risky because it could produce inconsistent outputs, could possibly break deterministic logic and also requires careful handling to avoid crashes

---

## 5. Refactoring Decisions (So Far)

- The initial version of the system was built entirely in the browser using JavaScript, with all filtering, scoring, ranking, explanation logic, and CSV parsing handled in multiple frontend modules. While this worked for prototyping, it led to tight coupling between business logic and UI, repeated CSV loading on every refresh, and difficulty testing or modifying scoring rules. The structure lacked clear separation of concerns.

To improve maintainability and clarity, the system was refactored into a full-stack architecture using FastAPI. All core decision logic—dataset loading, cleaning, filtering, normalization, weighted scoring, ranking, and explanation generation—was moved to the backend, while the frontend was simplified to manage user interaction and API communication. This created a clean separation between the decision engine and presentation layer and allowed the dataset to load once at server startup.

- In data loader module, three key bugs were identified: price values parsed as NaN due to currency formatting, JavaScript dropping 0 values because of truthy checks, and numeric fields being compared as strings in pandas. Fixing these issues improved the reliability and robustness of the system and reinforced the importance of proper data cleaning and type validation.

---

## 6. Mistakes and Corrections

- Initially underestimated the importance of dataset quality  
  → Corrected by spending time cleaning and understanding feature distributions
- Initially thought fewer data points were required  
  → Realized that using a larger dataset improves realism while still allowing filtered output
- Confusion around whether AI was mandatory  
  → Clarified that AI is optional and must be justified if used
- Initally the decision logic was implemented in JavaScript initially
  → Moved the logic to Python for better structure, maintainability, and testing.
- Some UX changes were made sych as two buttons in questionaire page, "skip" and "continue" had partially the same actions,later it was corrected
- Another mistake was not testing the data loading process separately. When results showed “No laptops matched,” multiple issues were present at the same time, including price formatting errors and type mismatches. Testing the data loading step in isolation would have identified these problems much earlier
- The explanation system was also redesigned. Initially, it exposed internal scoring details, which felt transparent but confused users. It was later changed to focus on practical benefits rather than algorithm mechanics.

---

## 7. What Changed During Development and Why

- Switched dataset after realizing the first dataset had overly complex string-based fields
- Moved from a vague “recommendation idea” to a clear **multi-criteria decision system**
- Shifted focus from feature count to **clarity, explainability, and usability**
- Added a price-based fallback ranking when users skip all soft preferences
- Refactored from frontend-only logic to a clean frontend–backend separation for better maintainability
- Reworked the explanation system to focus on benefits instead of internal scoring mechanics
- Improved error handling after encountering runtime bugs like uninitialized variables


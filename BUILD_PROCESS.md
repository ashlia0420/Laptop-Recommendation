# BUILD_PROCESS.md

## 1. How I Started

I began by carefully understanding the problem statement. The key requirement was to build a **Decision Companion System** that helps users make informed choices using **explainable logic**, without relying entirely on AI.

After considering multiple example domains suggested in the assignment, I decided to work on a **Laptop Selection Decision System**, as it is:
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

Initially, I assumed that such systems require AI or ML models. However, after deeper analysis, I realized that:
- The assignment emphasizes **decision logic**, not prediction
- A weighted scoring and rule-based evaluation system is more transparent
- Explainability is easier without black-box models

This led me to focus on:
- Structured criteria
- User-controlled weights
- Deterministic ranking logic

I also realized that using **real datasets** would significantly strengthen the project compared to mock or hard-coded values.

---

## 3. Dataset Exploration and Cleaning

I explored multiple laptop datasets and finally selected a structured CSV dataset containing specifications such as:
- Processor details
- RAM, storage, cores, threads
- Screen size and resolution
- Price

The original dataset had over 900 entries and inconsistent formatting.  
To address this, I performed data cleaning and preprocessing using **Jupyter Notebook**, including:
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

---

## 5. Refactoring Decisions (So Far)

- Separated **data cleaning** from application logic  
- Moved preprocessing entirely to Jupyter Notebook  
- Decided to keep both **raw** and **cleaned** datasets instead of modifying the original file
- Reduced column complexity to focus on decision-relevant attributes

Further refactoring is expected once the decision logic and UI are implemented.

---

## 6. Mistakes and Corrections

- Initially underestimated the importance of dataset quality  
  → Corrected by spending time cleaning and understanding feature distributions

- Initially thought fewer data points were required  
  → Realized that using a larger dataset improves realism while still allowing filtered output

- Confusion around whether AI was mandatory  
  → Clarified that AI is optional and must be justified if used

---

## 7. What Changed During Development and Why

- Switched dataset after realizing the first dataset had overly complex string-based fields
- Moved from a vague “recommendation idea” to a clear **multi-criteria decision system**
- Shifted focus from feature count to **clarity, explainability, and usability**

---

## 8. Current Status

Completed:
- Problem understanding
- Domain selection
- Dataset selection
- Data cleaning and preprocessing

Pending:
- Final decision logic
- Criteria weighting strategy
- Ranking implementation
- Explanation layer
- Frontend integration

This document will be updated as development progresses.

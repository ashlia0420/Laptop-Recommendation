# Laptop Recommendation system - LareC

## Understanding of the problem:
Laptops are widely used for various purposes such as academics, work, gaming, and everyday tasks. With numerous models available in the market, users often find it difficult to choose a laptop that best matches their needs and budget.
The aim of this project is to build a Laptop Recommendation System that helps users select suitable laptops based on their preferences. Instead of manually browsing and comparing hundreds of products, users can input their requirements and receive relevant recommendations in one place, making the selection process simpler and more efficient.

## Assumptions made:
- The dataset used for this project are accurate and up to date.
- Since the dataset does not contain a laptop weight column, portability is not directly considered in the recommendation logic.
- Users have a clear understanding of their approximate budget, which is treated as a primary (hard) constraint during recommendation.

## Structure of the solution:
- The project is divided into frontend and backend to maintain a clear separation of concerns. The frontend handles user interaction and presentation, while the backend manages data processing and recommendation logic through API endpoints.
- Python was chosen because it is highly suitable for data processing and algorithmic logic. Using libraries like Pandas simplifies dataset cleaning, filtering, and scoring operations
- FastAPI was used because it is fast, lightweight, and easy to connect with the frontend while automatically handling data validation. It keeps the recommendation logic separate from the UI and makes the system scalable for future enhancements.

## Design decisions and trade-offs:


## Edge cases considered:

## How to run the program:


## Improvement if more time was available:

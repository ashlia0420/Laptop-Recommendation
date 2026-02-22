### PROMPTS:
-
Act as a mentor and guide me throughout the project on creating Rules you must strictly follow: •	❌ Do NOT provide the complete solution or full code unless I explicitly ask for it. •	❌ Do NOT jump to the final algorithm immediately. •	❌ Do NOT assume missing constraints — ask first. Your responsibilities: 1.	Start by asking clarifying questions about constraints, edge cases, and input/output. 3.	Break the problem into small logical steps and guide me using progressive hints only. 4.	Let me propose the approach first, then validate it. 5.	If my approach is incorrect or inefficient, explain why and gently redirect me. 6.	Highlight edge cases and common pitfalls without solving them for me.
 " Problem Statement: Design and build a “Decision Companion System” that helps a user make better decisions. The system should assist a user in evaluating options for a real-world decision of their choice. Your system must work without relying entirely on an AI model. If AI is used, clearly justify its role and limitations. Examples (you are NOT limited to these): Choosing a laptop under a budget Selecting the best candidate for a job role Deciding where to travel within constraints Picking an investment strategy Choosing a tech stack for a startup Core Expectations: Your system must: Accept multiple options Accept criteria (which may have different weights or importance) Process and evaluate options against criteria Provide a ranked recommendation Explain why a particular recommendation was made Beyond this, the design is up to you. You may choose: CLI / Web App / API / Desktop tool Any programming language Any framework Simple or advanced logic You define the depth. We are more interested in your thinking than feature count. Constraints The system should not be a static hard coded comparison. The user should be able to change inputs and get different outcomes. Your logic should be explainable (not a black box). "
my assignment git must contain the following so help me so that i can provide a good project assignment. the following should simply be noted and kept in mind: 1. Source Code Clean, readable, and structured Meaningful commit history 2. README.md Include: Your understanding of the problem Assumptions made Why you structured the solution the way you did Design decisions and trade-offs Edge cases considered How to run the project What you would improve with more time 3. Design Diagram Provide at least one: Architecture diagram Data flow diagram Component diagram Or decision logic diagram 4. BUILD_PROCESS.md Explain: How you started How your thinking evolved Alternative approaches considered Refactoring decisions Mistakes and corrections What changed during development and why 5. RESEARCH_LOG.md Include: All AI prompts used All search queries (including Google searches) References that influenced your approach What you accepted, rejected, or modified from AI outputs
-what does edge cases mean?
-what would u recommend from laptop slection, phone selection, book selection or travel under constraints.
-alright im choosing laptop selection.
-the system is for general users usage scenario varies from user to user budget handling: it should be hard constraint (like if the filter is applied then the product should appear within that filter) output:rank explain show trade offs explain the criteria flexibility part i didnt really understand 
-so when we set fixed criteria, the user need to sets to get the output. while in user defined criteria u search as well as set criteria?
-so if i choose fixed criteria is it against the constraint given in the assignemnt?
-So let me clarify so the assignment problem statement ask us to create or integrate an ai into it?
-So if no ai is imtegrated then it would be like a database project no?So how is the ranking of products brought?How to get the dataset tho?
-What is v1
-so we will be using some models to evaluate?
-wht exactly is the decision logic meant here?
-so how do we create this decision logic
-How to assign or define the weights? On what basis? Do we randomly assign them? Or is based on any priority? Also how do we do the explanation layer? So for that ai is required?
-alright so what are technical steps i must do to create website? i need step by step guidance
-1. im comfortable with html css javascript and i dont mind react and node js (i dont know them properly but i will try to learn. as long as my web application works well) and im also very comfortable with python too 2. could you explain the dataset source ?as in how it would be working if im using any of those given options 3. yea im okay with no login, no database(if not required), explain this real time updates and also static dataset and dynamic logiv 4. im not very sure if i can choose the right option. eplain in detail how it would work for each options
-dataset: im thinking of online csv dataset(since i got one),but im open to mixed approach( cant we convert the large dataset into small dataset?) evluation style: hybrid tech stack: frontend + python/node, also open to bootstrap
-the csv that i have looked up has 1275 rows × 13 columns and the columns (['Manufacturer', 'Model Name', 'Category', 'Screen Size', 'Screen', 'CPU', 'RAM', ' Storage', 'GPU', 'Operating System', 'Operating System Version', 'Weight', 'Price (Euros)'
-Cant we use this filtered out removed collumns dataset for the logic and use the full version dataset (unfiltererd ) when explaining the ranked products? perhaps use ai to explain using that row?
-i got another csv dataset i find this would more easy to clean and filter and normalize for decision logic			Unnamed: 0	model_name	brand	processor_name	ram(GB)	ssd(GB)	Hard Disk(GB)	Operating System	graphics	screen_size(inches)	resolution (pixels)	no_of_cores	no_of_threads	spec_score	price 0	0	Lenovo V15 ITL G2 82KBA033IH Laptop	Lenovo	11th Gen Core i3	8	512	0	Windows	Intel Integrated UHD	15.6	1920 x 1080	2	4	62	33921
-i choose scond dataset and im not sureabou t using spec_score how to clean and reduce the count to atleast 30-50 laptops?
-is it necessary to bring it to 50 laptops? if dont will it be complicated?
-In jupyter notebook how to find the item " abc" in the df?  			import pandas as pd		df = pd.read_csv(    r"C:\Users\LESLIN\Downloads\laptops.csv",    encoding="latin1"
- --------------------------------------------------------------------------- NameError Traceback (most recent call last) Cell In[79], line 1 ----> 1 df[df["Operating System Version"] == null] NameError: name 'null' is not defined
-is there a way to split the data llike storage 128gb flash storage 128gb ssd ... separating 128gb and flash drive also 128 bg and ssd into two columns?
-what is blackbxing?
-how to drop these rwos? df[df["graphics"] == "Missing"]
-how do i check?
-list of basic panda queries 
-i want to find the lowest and the highest price 
-this didnt work df.drop(columns=["Unnamed: 0"]) give short response
-what does numbe of thread column suggest in laptop?
-error? df[df[df["brand"] == "Gigabyte"]["spec_score"]>50]
-can we make the system randomly delete the row?
-how to export the dataset into csv file?
-How to export the cleaned dataset as csv file and save the ipynb to specific loc

---

give me a build process.md so far need not answer everyquestions in the follwoing bas in whaever is not done yet leave it

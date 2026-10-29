//================================================================================================================================//

                                            /*
                                                Job data is now loaded from the backend API.
                                                Endpoint: GET https://placementhub-api-crl7.onrender.com/api/jobs
                                                Sample jobs are no longer initialized in localStorage.
                                            */

//================================================================================================================================//





// const JOBS_KEY = "jobs";


// // Sample job
// const jobs = [
//     {
//         id: 1,company: "Google",role: "Software Engineer",location: "Bangalore",salary: "20 LPA",branches: ["CSE", "IT"],minCGPA: 8.0,requiredSkills: ["JavaScript", "DSA", "System Design"],deadline: "30 August 2026",description: "Work on scalable systems and products."
//     },
//     {
//         id: 2,company: "TCS",role: "Graduate Software Engineer",location: "Pune",salary: "7 LPA",branches: ["CSE", "IT", "ECE"],minCGPA: 7.0,requiredSkills: ["Java", "SQL", "Git"],deadline: "5 September 2026",description: "Develop enterprise software solutions for global clients."
//     },
//     {
//         id: 3,company: "Infosys",role: "Systems Engineer",location: "Hyderabad",salary: "6.5 LPA",branches: ["CSE", "IT", "ECE", "EEE"],minCGPA: 6.5,requiredSkills: ["Java", "Python", "SQL"],deadline: "8 September 2026",description: "Build and maintain software solutions for enterprise applications."
//     },
//     {
//         id: 4,company: "Microsoft",role: "Software Engineer",location: "Bangalore",salary: "18 LPA",branches: ["CSE", "IT"],minCGPA: 8.5,requiredSkills: ["C++", "DSA", "Operating Systems"],deadline: "12 September 2026",description: "Build reliable software products used by millions of users."
//     },
//     {
//         id: 5,company: "Deloitte",role: "Technology Analyst",location: "Gurgaon",salary: "8 LPA",branches: ["CSE", "IT", "ECE"],minCGPA: 7.5,requiredSkills: ["Python", "SQL", "Cloud"],deadline: "15 September 2026",description: "Work on technology consulting and digital transformation projects."
//     },
//     {
//         id: 6,company: "Accenture",role: "Associate Software Engineer",location: "Bangalore",salary: "7.5 LPA",branches: ["CSE", "IT", "ECE", "EEE"],minCGPA: 7.0,requiredSkills: ["Java", "Python", "SQL"],deadline: "18 September 2026",description: "Develop technology solutions for enterprise clients."
//     },
//     {
//         id: 7,company: "Wipro",role: "Project Engineer",location: "Noida",salary: "6 LPA",branches: ["CSE", "IT", "ECE", "ME"],minCGPA: 6.5,requiredSkills: ["Java", "SQL", "Git"],deadline: "20 September 2026",description: "Contribute to software development and engineering projects."
//     },
//     {
//         id: 8,company: "Amazon",role: "Software Development Engineer",location: "Bangalore",salary: "16 LPA",branches: ["CSE", "IT"],minCGPA: 8.0,requiredSkills: ["Java", "DSA", "AWS"],deadline: "22 September 2026",description: "Build scalable distributed systems and customer-focused products."
//     },
//     {
//         id: 9,company: "Cognizant",role: "Programmer Analyst",location: "Chennai",salary: "6.75 LPA",branches: ["CSE", "IT", "ECE"],minCGPA: 7.0,requiredSkills: ["JavaScript", "SQL", "React"],deadline: "25 September 2026",description: "Develop and maintain modern software applications."
//     },
//     {
//         id: 10,company: "IBM",role: "Associate Developer",location: "Bangalore",salary: "9 LPA",branches: ["CSE", "IT", "ECE"],minCGPA: 7.5,requiredSkills: ["Python", "Cloud", "SQL"],deadline: "28 September 2026",description: "Work on cloud, data, and enterprise software technologies."
//     }
// ];

// // Helper: read JSON from localStorage or return null
// function readJSON(key){
//   const raw = localStorage.getItem(key);
//   if(!raw) return null;
//   try{
//     return JSON.parse(raw);
//   }catch(e){
//     return null;
//   }
// }

// // Helper: write JSON to localStorage
// function writeJSON(key, value){
//   localStorage.setItem(key, JSON.stringify(value));
// }

// // Initialize data if not present
// function initData(){
//   if(!readJSON(JOBS_KEY)){
//     writeJSON(JOBS_KEY, jobs);
//   }
// }

// initData();
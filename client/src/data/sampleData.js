// ─── Sample Data ───────────────────────────────────────────────────────────────
export const SAMPLE_QUIZZES = [
  { id: 1, title: "Data Structures Fundamentals", subject: "CS101", questions: 20, duration: 45, status: "live", difficulty: "medium", attempts: 34, avgScore: 72, window: "May 15 – May 20" },
  { id: 2, title: "Algorithm Analysis & Big-O", subject: "CS201", questions: 15, duration: 30, status: "draft", difficulty: "hard", attempts: 0, avgScore: 0, window: "May 22 – May 25" },
  { id: 3, title: "Database Design Concepts", subject: "DB301", questions: 25, duration: 60, status: "live", difficulty: "easy", attempts: 28, avgScore: 85, window: "May 10 – May 18" },
  { id: 4, title: "Operating Systems Quiz", subject: "OS401", questions: 18, duration: 40, status: "closed", difficulty: "hard", attempts: 41, avgScore: 63, window: "May 1 – May 10" },
];

export const SAMPLE_STUDENTS = [
  { id: 1, name: "Arjun Mehta", email: "arjun@college.edu", score: 91, rank: 1, submitted: "2h ago", status: "graded" },
  { id: 2, name: "Priya Singh", email: "priya@college.edu", score: 87, rank: 2, submitted: "3h ago", status: "graded" },
  { id: 3, name: "Rahul Gupta", email: "rahul@college.edu", score: 79, rank: 3, submitted: "4h ago", status: "review" },
  { id: 4, name: "Sneha Patel", email: "sneha@college.edu", score: 68, rank: 4, submitted: "5h ago", status: "graded" },
  { id: 5, name: "Vikram Nair", email: "vikram@college.edu", score: 54, rank: 5, submitted: "6h ago", status: "cheating" },
];

export const NOTIFS = [
  { id: 1, type: "quiz", title: "New quiz assigned: Data Structures", time: "2m ago", read: false, icon: "📋" },
  { id: 2, type: "result", title: "Results published: OS Quiz", time: "1h ago", read: false, icon: "🏆" },
  { id: 3, type: "reminder", title: "Quiz deadline in 3 hours!", time: "3h ago", read: true, icon: "⏰" },
  { id: 4, type: "class", title: "Added to CS201 classroom", time: "1d ago", read: true, icon: "🎓" },
];

export const SAMPLE_QUESTIONS = [
  { id: 1, title: "Binary Search", topic: "Algorithms", subtopic: "Searching", difficulty: "easy", type: "coding", marks: 10, tags: ["array", "divide-conquer"] },
  { id: 2, title: "Explain Big-O notation", topic: "Complexity", subtopic: "Analysis", difficulty: "medium", type: "short", marks: 5, tags: ["theory"] },
  { id: 3, title: "Which data structure uses LIFO?", topic: "DS", subtopic: "Linear", difficulty: "easy", type: "mcq", marks: 2, tags: ["stack", "queue"] },
  { id: 4, title: "Dijkstra's Algorithm", topic: "Graphs", subtopic: "Shortest Path", difficulty: "hard", type: "coding", marks: 15, tags: ["graph", "greedy"] },
  { id: 5, title: "Describe deadlock conditions", topic: "OS", subtopic: "Process Sync", difficulty: "medium", type: "short", marks: 8, tags: ["os", "concurrency"] },
];

export const CODE_TEMPLATE = `def two_sum(nums, target):
    """
    Given an array of integers nums and integer target,
    return indices of two numbers that add up to target.
    
    Args:
        nums: List[int]
        target: int
    Returns:
        List[int] - indices of the two numbers
    """
    # Your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]
print(two_sum([3, 2, 4], 6))       # Output: [1, 2]`;
import express from "express";

const router = express.Router();

interface Question {
  Topic: string;
  Problem: string;
  difficulty: "easy" | "medium" | "hard";
  Done: boolean;
  Bookmark: boolean;
  Notes: string;
  URL: string;
  URL2?: string;
}

interface TopicSection {
  topicName: string;
  position: number;
  started: boolean;
  doneQuestions: number;
  questions: Question[];
}

interface DSASheet {
  id: string;
  sheetName: string;
  author: string;
  totalQuestions: number;
  solvedQuestions: number;
  problems: TopicSection[];
}

// In-memory storage for user progress (in production, use database)
const userProgress = new Map<string, Map<string, Question>>();

const apnaCollegeSheet: DSASheet = {
  id: "apnacollege",
  sheetName: "Apna College",
  author: "Shradha Didi & Aman Bhaiya",
  totalQuestions: 403,
  solvedQuestions: 0,
  problems: [
    {
      topicName: "Array",
      position: 0,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Array",
          Problem: "Maximum and Minimum Element in an Array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Reverse the Array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Maximum-Subarray",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/maximum-subarray/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Contains Duplicate",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/contains-duplicate/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Chocolate Distribution Problem",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/chocolate-distribution-problem/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Search in Rotated Sorted Array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Next Permutation",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/next-permutation/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Best time to Buy and Sell Stock",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Repeat and Missing Number Array",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.interviewbit.com/problems/repeat-and-missing-number-array/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Kth-Largest Element in an Array",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Trapping Rain Water",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/trapping-rain-water/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Product of Array Except Self",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/product-of-array-except-self/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Maximum Product Subarray",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/maximum-product-subarray/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Find Minimum in Rotated Sorted Array",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Find Pair with Sum in Sorted & Rotated Array",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/given-a-sorted-and-rotated-array-find-if-there-is-a-pair-with-a-given-sum/?ref=lbp",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "3Sum",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/3sum/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Container With Most Water",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/container-with-most-water/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Given Sum Pair",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/given-a-sorted-and-rotated-array-find-if-there-is-a-pair-with-a-given-sum/",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Kth - Smallest Element",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/kth-smallest-element5635/1",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Merge Overlapping Intervals",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/merging-intervals/",
          URL2: "",
        },
      ],
    },
    {
      topicName: "Backtracking",
      position: 1,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Backtracking",
          Problem: "Backtracking Set 2 Rat in a Maze",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/backttracking-set-2-rat-in-a-maze/",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Combinational Sum",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/combinational-sum/",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Crossword-Puzzle",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.hackerrank.com/challenges/crossword-puzzle/problem",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Longest Possible Route in a Matrix with Hurdles",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/longest-possible-route-in-a-matrix-with-hurdles/",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Printing all solutions in N-Queen Problem",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/printing-solutions-n-queen-problem/",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Solve the Sudoku",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/solve-the-sudoku-1587115621/1",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Partition Equal Subset Sum",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/subset-sum-problem2014/1",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "M Coloring Problem",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/m-coloring-problem-1587115620/1",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Knight Tour",
          difficulty: "hard",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/backtracking-set-1-the-knights-tour-problem/",
          URL2: "",
        },
        {
          Topic: "Backtracking",
          Problem: "Soduko",
          difficulty: "hard",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/backtracking-set-7-suduku/",
          URL2: "",
        },
      ],
    },
    {
      topicName: "Dynamic Programming",
      position: 2,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Dynamic Programming",
          Problem: "Knapsack with Duplicate Items",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/knapsack-with-duplicate-items4201/1",
          URL2: "",
        },
        {
          Topic: "Dynamic Programming",
          Problem: "Climbing Stairs",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/climbing-stairs/",
          URL2: "",
        },
        {
          Topic: "Dynamic Programming",
          Problem: "Coin Change",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/coin-change/",
          URL2: "",
        },
        {
          Topic: "Dynamic Programming",
          Problem: "Longest Increasing Subsequence",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/longest-increasing-subsequence/",
          URL2: "",
        },
        {
          Topic: "Dynamic Programming",
          Problem: "Longest Common Subsequence",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/longest-common-subsequence/",
          URL2: "",
        },
      ],
    },
  ],
};

const loveBabbarSheet: DSASheet = {
  id: "lovebabbar",
  author: "Love Babbar",
  sheetName: "Love Babbar",
  totalQuestions: 448,
  solvedQuestions: 0,
  problems: [
    {
      topicName: "Array",
      position: 0,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Array",
          Problem: "Reverse the array",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/reverse-an-array/0",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Array",
          Problem: "Find the maximum and minimum element in an array",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Array",
          Problem: 'Find the "Kth" max and min element of an array ',
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/kth-smallest-element/0",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Array",
          Problem:
            "Given an array which consists of only 0, 1 and 2. Sort the array without using any sorting algo",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/sort-an-array-of-0s-1s-and-2s/0",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Array",
          Problem: "Move all the negative elements to one side of the array ",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/move-all-negative-elements-to-end1813/1",
          URL2: "",
          difficulty: "medium",
        },
        {
          Topic: "Array",
          Problem: "Find the Union and Intersection of the two sorted arrays.",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/union-of-two-arrays/0",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Array",
          Problem: "Write a program to cyclically rotate an array by one.",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one/0",
          URL2: "",
          difficulty: "medium",
        },
        {
          Topic: "Array",
          Problem: "find Largest sum contiguous Subarray [V. IMP]",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/kadanes-algorithm/0",
          URL2: "",
          difficulty: "medium",
        },
        {
          Topic: "Array",
          Problem: "Minimise the maximum difference between heights [V.IMP]",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/minimize-the-heights3351/1",
          URL2: "",
          difficulty: "medium",
        },
        {
          Topic: "Array",
          Problem: "Minimum no. of Jumps to reach end of an array",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/minimum-number-of-jumps/0",
          URL2: "",
          difficulty: "medium",
        },
      ],
    },
    {
      topicName: "Matrix",
      position: 1,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Matrix",
          Problem: "Spiral traversal on a Matrix",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/spirally-traversing-a-matrix/0",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Matrix",
          Problem: "Search an element in a matriix",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/search-a-2d-matrix/",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Matrix",
          Problem: "Find median in a row wise sorted matrix",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/median-in-a-row-wise-sorted-matrix1527/1",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Matrix",
          Problem: "Find row with maximum no. of 1's",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/row-with-max-1s0023/1",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "Matrix",
          Problem:
            "Print elements in sorted order using row-column wise sorted matrix",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/sorted-matrix/0",
          URL2: "",
          difficulty: "medium",
        },
      ],
    },
    {
      topicName: "String",
      position: 2,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "String",
          Problem: "Reverse a String",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/reverse-string/",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "String",
          Problem: "Check whether a String is Palindrome or not",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://practice.geeksforgeeks.org/problems/palindrome-string0817/1",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "String",
          Problem: "Find Duplicate characters in a string",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/print-all-the-duplicates-in-the-input-string/",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "String",
          Problem:
            "Write a Code to check whether one string is a rotation of another",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://www.geeksforgeeks.org/a-program-to-check-if-strings-are-rotations-of-each-other/",
          URL2: "",
          difficulty: "easy",
        },
        {
          Topic: "String",
          Problem: "Count and Say problem",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://leetcode.com/problems/count-and-say/",
          URL2: "",
          difficulty: "easy",
        },
      ],
    },
  ],
};

const striverSheet: DSASheet = {
  id: "striversheet",
  sheetName: "Striver Sheet",
  author: "Striver",
  totalQuestions: 415,
  solvedQuestions: 0,
  problems: [
    {
      topicName: "Array",
      position: 0,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Array",
          Problem: "Largest Element in an Array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3Pld280",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Second Largest Element in an Array without sorting",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3pFvBcN",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Check if the array is sorted",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3Ap9U6F",
          URL2: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/",
        },
        {
          Topic: "Array",
          Problem: "Remove duplicates from Sorted array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3w7b6ck",
          URL2: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
        },
        {
          Topic: "Array",
          Problem: "Left Rotate an array by one place",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3dnn9vC",
          URL2: "https://leetcode.com/problems/rotate-array/",
        },
        {
          Topic: "Array",
          Problem: "Left rotate an array by D places",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3dyCKZg",
          URL2: "https://leetcode.com/problems/rotate-array/",
        },
        {
          Topic: "Array",
          Problem: "Move Zeros to end",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3PrGIjT",
          URL2: "https://leetcode.com/problems/move-zeroes/",
        },
        {
          Topic: "Array",
          Problem: "Linear Search",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3KcpHcB",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Find the Union and intersection of two sorted arrays",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3Ap7Onp",
          URL2: "",
        },
        {
          Topic: "Array",
          Problem: "Find missing number in an array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3A2pKTh",
          URL2: "https://leetcode.com/problems/missing-number/",
        },
        {
          Topic: "Array",
          Problem: "Maximum Consecutive Ones",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3piuaAN",
          URL2: "https://leetcode.com/problems/max-consecutive-ones/",
        },
        {
          Topic: "Array",
          Problem: "2Sum Problem",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3SVYU8f",
          URL2: "https://leetcode.com/problems/two-sum/",
        },
        {
          Topic: "Array",
          Problem: "Sort an array of 0's 1's and 2's",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3dsROaZ",
          URL2: "https://leetcode.com/problems/sort-colors/",
        },
        {
          Topic: "Array",
          Problem: "Majority Element (>n/2 times)",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3SSpeA3",
          URL2: "https://leetcode.com/problems/majority-element/",
        },
        {
          Topic: "Array",
          Problem: "Kadane's Algorithm, maximum subarray sum",
          difficulty: "medium",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3dzyloY",
          URL2: "https://leetcode.com/problems/maximum-subarray/",
        },
      ],
    },
    {
      topicName: "Binary Search",
      position: 1,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Binary Search",
          Problem: "Binary Search to find X in sorted array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3QtKBpO",
          URL2: "https://leetcode.com/problems/binary-search/",
        },
        {
          Topic: "Binary Search",
          Problem: "Implement Lower Bound",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3Cf398N",
          URL2: "",
        },
        {
          Topic: "Binary Search",
          Problem: "Implement Upper Bound",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3CgDDjE",
          URL2: "",
        },
        {
          Topic: "Binary Search",
          Problem: "Search Insert Position",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3pFDbUN",
          URL2: "https://leetcode.com/problems/search-insert-position/",
        },
        {
          Topic: "Binary Search",
          Problem:
            "Find the first or last occurrence of a given number in a sorted array",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3QuCFEP",
          URL2: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
        },
      ],
    },
    {
      topicName: "Strings",
      position: 2,
      started: false,
      doneQuestions: 0,
      questions: [
        {
          Topic: "Strings",
          Problem: "Remove outermost Paranthesis",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3rzwRix",
          URL2: "https://leetcode.com/problems/remove-outermost-parentheses/",
        },
        {
          Topic: "Strings",
          Problem: "Reverse words in a given string / Palindrome Check",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3SXyWB4",
          URL2: "https://leetcode.com/problems/reverse-words-in-a-string/",
        },
        {
          Topic: "Strings",
          Problem: "Largest odd number in a string",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3UII5yp",
          URL2: "https://leetcode.com/problems/largest-odd-number-in-string/",
        },
        {
          Topic: "Strings",
          Problem: "Longest Common Prefix",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3QKCyVu",
          URL2: "https://leetcode.com/problems/longest-common-prefix/",
        },
        {
          Topic: "Strings",
          Problem: "Isomorphic String",
          difficulty: "easy",
          Done: false,
          Bookmark: false,
          Notes: "",
          URL: "https://bit.ly/3QwynwI",
          URL2: "https://leetcode.com/problems/isomorphic-strings/",
        },
      ],
    },
  ],
};

const dsaSheets: DSASheet[] = [apnaCollegeSheet, loveBabbarSheet, striverSheet];

// Get all DSA sheets
router.get("/sheets", (req, res) => {
  try {
    const sheetsOverview = dsaSheets.map((sheet) => ({
      id: sheet.id,
      sheetName: sheet.sheetName,
      author: sheet.author,
      totalQuestions: sheet.totalQuestions,
      solvedQuestions: calculateSolvedQuestions(sheet.id),
      topicsCount: sheet.problems.length,
    }));

    res.json({
      success: true,
      data: sheetsOverview,
    });
  } catch (error) {
    console.error("Error fetching DSA sheets:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch DSA sheets" });
  }
});

// Get specific sheet by ID
router.get("/sheets/:sheetId", (req, res) => {
  try {
    const { sheetId } = req.params;
    const sheet = dsaSheets.find((s) => s.id === sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }

    // Apply user progress
    const sheetWithProgress = applyUserProgress(sheet, sheetId);

    res.json({
      success: true,
      data: sheetWithProgress,
    });
  } catch (error) {
    console.error("Error fetching DSA sheet:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch DSA sheet" });
  }
});

// Get specific topic from a sheet
router.get("/sheets/:sheetId/topics/:topicName", (req, res) => {
  try {
    const { sheetId, topicName } = req.params;
    const sheet = dsaSheets.find((s) => s.id === sheetId);

    if (!sheet) {
      return res.status(404).json({ success: false, error: "Sheet not found" });
    }

    const topic = sheet.problems.find(
      (p) => p.topicName.toLowerCase() === topicName.toLowerCase(),
    );

    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic not found" });
    }

    // Apply user progress to topic
    const topicWithProgress = applyUserProgressToTopic(topic, sheetId);

    res.json({
      success: true,
      data: topicWithProgress,
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).json({ success: false, error: "Failed to fetch topic" });
  }
});

// Update question status (Done, Bookmark, Notes)
router.put("/sheets/:sheetId/questions/:questionIndex", (req, res) => {
  try {
    const { sheetId, questionIndex } = req.params;
    const { Done, Bookmark, Notes } = req.body;

    const questionKey = `${sheetId}-${questionIndex}`;

    if (!userProgress.has("user1")) {
      userProgress.set("user1", new Map());
    }

    const userQuestions = userProgress.get("user1")!;
    const existingProgress =
      userQuestions.get(questionKey) || ({} as Partial<Question>);

    const updatedQuestion = {
      ...existingProgress,
      Done: Done !== undefined ? Done : existingProgress.Done || false,
      Bookmark:
        Bookmark !== undefined ? Bookmark : existingProgress.Bookmark || false,
      Notes: Notes !== undefined ? Notes : existingProgress.Notes || "",
    };

    userQuestions.set(questionKey, updatedQuestion as Question);

    res.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update question" });
  }
});

// Get user progress stats
router.get("/progress/stats", (req, res) => {
  try {
    const stats = {
      totalSheets: dsaSheets.length,
      sheets: dsaSheets.map((sheet) => ({
        id: sheet.id,
        sheetName: sheet.sheetName,
        author: sheet.author,
        totalQuestions: sheet.totalQuestions,
        solvedQuestions: calculateSolvedQuestions(sheet.id),
        progressPercentage: Math.round(
          (calculateSolvedQuestions(sheet.id) / sheet.totalQuestions) * 100,
        ),
      })),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching progress stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch progress stats" });
  }
});

// Helper functions
function calculateSolvedQuestions(sheetId: string): number {
  const userQuestions = userProgress.get("user1");
  if (!userQuestions) return 0;

  let solvedCount = 0;
  userQuestions.forEach((question, key) => {
    if (key.startsWith(sheetId) && question.Done) {
      solvedCount++;
    }
  });

  return solvedCount;
}

function applyUserProgress(sheet: DSASheet, sheetId: string): DSASheet {
  const userQuestions = userProgress.get("user1");
  if (!userQuestions) return sheet;

  return {
    ...sheet,
    solvedQuestions: calculateSolvedQuestions(sheetId),
    problems: sheet.problems.map((topic) =>
      applyUserProgressToTopic(topic, sheetId),
    ),
  };
}

function applyUserProgressToTopic(
  topic: TopicSection,
  sheetId: string,
): TopicSection {
  const userQuestions = userProgress.get("user1");
  if (!userQuestions) return topic;

  let doneQuestions = 0;
  const questionsWithProgress = topic.questions.map((question, index) => {
    const questionKey = `${sheetId}-${topic.position}-${index}`;
    const progress = userQuestions.get(questionKey);

    if (progress?.Done) doneQuestions++;

    return {
      ...question,
      Done: progress?.Done || false,
      Bookmark: progress?.Bookmark || false,
      Notes: progress?.Notes || "",
    };
  });

  return {
    ...topic,
    doneQuestions,
    started: doneQuestions > 0,
    questions: questionsWithProgress,
  };
}

export default router;

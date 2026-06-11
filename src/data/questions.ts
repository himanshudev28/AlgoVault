export type Tag = "easy" | "easy+" | "medium" | "medium+" | "hard";

export interface Question {
  id: number;
  topic: string;
  level: 1 | 2 | 3 | 4 | 5;
  tag: Tag;
  title: string;
  platform: "LeetCode" | "GFG";
  link: string;
  note: string;
}

export const QUESTIONS: Question[] = [
  // ─────────────────────────────────────────────
  // 1. ARRAYS
  // ─────────────────────────────────────────────
  { id: 1,  topic: "Arrays", level: 1, tag: "easy",   title: "Find Maximum Element",            platform: "LeetCode", link: "https://leetcode.com/problems/maximum-subarray/", note: "Simple loop, track max" },
  { id: 2,  topic: "Arrays", level: 1, tag: "easy",   title: "Reverse an Array",                platform: "LeetCode", link: "https://leetcode.com/problems/reverse-string/", note: "Two pointer approach" },
  { id: 3,  topic: "Arrays", level: 1, tag: "easy",   title: "Check if Array is Sorted",        platform: "LeetCode", link: "https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/", note: "Single pass" },
  { id: 4,  topic: "Arrays", level: 1, tag: "easy",   title: "Remove Duplicates (Sorted)",      platform: "LeetCode", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", note: "Two pointers" },
  { id: 5,  topic: "Arrays", level: 1, tag: "easy",   title: "Second Largest Element",          platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/second-largest3735/1", note: "Single loop" },
  { id: 6,  topic: "Arrays", level: 2, tag: "easy+",  title: "Left Rotate Array by 1",          platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/rotation/1", note: "Store first element" },
  { id: 7,  topic: "Arrays", level: 2, tag: "easy+",  title: "Move Zeros to End",               platform: "LeetCode", link: "https://leetcode.com/problems/move-zeroes/", note: "Two pointers" },
  { id: 8,  topic: "Arrays", level: 2, tag: "easy+",  title: "Union of Two Sorted Arrays",      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/union-of-two-arrays/1", note: "Merge logic" },
  { id: 9,  topic: "Arrays", level: 2, tag: "easy+",  title: "Intersection of Two Arrays",      platform: "LeetCode", link: "https://leetcode.com/problems/intersection-of-two-arrays/", note: "HashSet" },
  { id: 10, topic: "Arrays", level: 3, tag: "medium", title: "Kadane's Algorithm (Max Subarray)",platform: "LeetCode", link: "https://leetcode.com/problems/maximum-subarray/", note: "DP concept" },
  { id: 11, topic: "Arrays", level: 3, tag: "medium", title: "Best Time to Buy & Sell Stock",   platform: "LeetCode", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", note: "Track min so far" },
  { id: 12, topic: "Arrays", level: 3, tag: "medium", title: "Rearrange +ve and -ve",           platform: "LeetCode", link: "https://leetcode.com/problems/rearrange-array-elements-by-sign/", note: "Two pointer" },
  { id: 13, topic: "Arrays", level: 3, tag: "medium", title: "Next Permutation",                platform: "LeetCode", link: "https://leetcode.com/problems/next-permutation/", note: "Classic algorithm" },
  { id: 14, topic: "Arrays", level: 4, tag: "medium+",title: "3Sum",                            platform: "LeetCode", link: "https://leetcode.com/problems/3sum/", note: "Sort + Two pointer" },
  { id: 15, topic: "Arrays", level: 4, tag: "medium+",title: "Majority Element (Boyer-Moore)",  platform: "LeetCode", link: "https://leetcode.com/problems/majority-element/", note: "Vote algorithm" },
  { id: 16, topic: "Arrays", level: 4, tag: "medium+",title: "Majority Element II (>n/3)",      platform: "LeetCode", link: "https://leetcode.com/problems/majority-element-ii/", note: "Extended Boyer-Moore" },
  { id: 17, topic: "Arrays", level: 5, tag: "hard",   title: "Merge Intervals",                 platform: "LeetCode", link: "https://leetcode.com/problems/merge-intervals/", note: "Sort by start" },
  { id: 18, topic: "Arrays", level: 5, tag: "hard",   title: "Merge Sorted Arrays Without Extra",platform:"LeetCode", link: "https://leetcode.com/problems/merge-sorted-array/", note: "3 pointer" },
  { id: 19, topic: "Arrays", level: 5, tag: "hard",   title: "Count Inversions",                platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/inversion-of-array-1587115620/1", note: "Modified merge sort" },
  { id: 20, topic: "Arrays", level: 5, tag: "hard",   title: "Trapping Rain Water",             platform: "LeetCode", link: "https://leetcode.com/problems/trapping-rain-water/", note: "Two pointer / prefix" },

  // ─────────────────────────────────────────────
  // 2. STRINGS
  // ─────────────────────────────────────────────
  { id: 21, topic: "Strings", level: 1, tag: "easy",   title: "Reverse a String",               platform: "LeetCode", link: "https://leetcode.com/problems/reverse-string/", note: "Two pointer" },
  { id: 22, topic: "Strings", level: 1, tag: "easy",   title: "Check Palindrome",               platform: "LeetCode", link: "https://leetcode.com/problems/valid-palindrome/", note: "Two pointer" },
  { id: 23, topic: "Strings", level: 1, tag: "easy",   title: "Count Vowels & Consonants",      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/count-vowels-and-consonants/", note: "Simple loop" },
  { id: 24, topic: "Strings", level: 1, tag: "easy",   title: "Check Anagram",                  platform: "LeetCode", link: "https://leetcode.com/problems/valid-anagram/", note: "Frequency count" },
  { id: 25, topic: "Strings", level: 2, tag: "easy+",  title: "Largest Common Prefix",          platform: "LeetCode", link: "https://leetcode.com/problems/longest-common-prefix/", note: "Vertical scan" },
  { id: 26, topic: "Strings", level: 2, tag: "easy+",  title: "Isomorphic Strings",             platform: "LeetCode", link: "https://leetcode.com/problems/isomorphic-strings/", note: "Two hashmaps" },
  { id: 27, topic: "Strings", level: 3, tag: "medium", title: "Reverse Words in String",        platform: "LeetCode", link: "https://leetcode.com/problems/reverse-words-in-a-string/", note: "Split + reverse" },
  { id: 28, topic: "Strings", level: 3, tag: "medium", title: "Roman to Integer",               platform: "LeetCode", link: "https://leetcode.com/problems/roman-to-integer/", note: "HashMap logic" },
  { id: 29, topic: "Strings", level: 3, tag: "medium", title: "Longest Palindromic Substring",  platform: "LeetCode", link: "https://leetcode.com/problems/longest-palindromic-substring/", note: "Expand around center" },
  { id: 30, topic: "Strings", level: 4, tag: "medium+",title: "Count & Say",                    platform: "LeetCode", link: "https://leetcode.com/problems/count-and-say/", note: "String simulation" },
  { id: 31, topic: "Strings", level: 4, tag: "medium+",title: "Minimum Window Substring",       platform: "LeetCode", link: "https://leetcode.com/problems/minimum-window-substring/", note: "Sliding window" },
  { id: 32, topic: "Strings", level: 5, tag: "hard",   title: "KMP Pattern Matching",           platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/search-pattern0205/1", note: "LPS array" },
  { id: 33, topic: "Strings", level: 5, tag: "hard",   title: "Longest Substring Without Repeat",platform:"LeetCode", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", note: "Sliding window" },

  // ─────────────────────────────────────────────
  // 3. HASHING
  // ─────────────────────────────────────────────
  { id: 34, topic: "Hashing", level: 1, tag: "easy",   title: "Count Frequency of Elements",    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/frequency-of-array-elements/", note: "HashMap basics" },
  { id: 35, topic: "Hashing", level: 1, tag: "easy",   title: "Two Sum",                        platform: "LeetCode", link: "https://leetcode.com/problems/two-sum/", note: "Classic HashMap" },
  { id: 36, topic: "Hashing", level: 2, tag: "easy+",  title: "Find Missing Number",            platform: "LeetCode", link: "https://leetcode.com/problems/missing-number/", note: "XOR or sum formula" },
  { id: 37, topic: "Hashing", level: 2, tag: "easy+",  title: "Contains Duplicate",             platform: "LeetCode", link: "https://leetcode.com/problems/contains-duplicate/", note: "HashSet" },
  { id: 38, topic: "Hashing", level: 3, tag: "medium", title: "Group Anagrams",                 platform: "LeetCode", link: "https://leetcode.com/problems/group-anagrams/", note: "Sort key approach" },
  { id: 39, topic: "Hashing", level: 3, tag: "medium", title: "Subarray Sum Equals K",          platform: "LeetCode", link: "https://leetcode.com/problems/subarray-sum-equals-k/", note: "Prefix sum + map" },
  { id: 40, topic: "Hashing", level: 4, tag: "medium+",title: "Longest Consecutive Sequence",   platform: "LeetCode", link: "https://leetcode.com/problems/longest-consecutive-sequence/", note: "HashSet trick" },
  { id: 41, topic: "Hashing", level: 5, tag: "hard",   title: "4Sum",                           platform: "LeetCode", link: "https://leetcode.com/problems/4sum/", note: "Sort + nested 2ptr" },

  // ─────────────────────────────────────────────
  // 4. SORTING & SEARCHING
  // ─────────────────────────────────────────────
  { id: 42, topic: "Sorting & Searching", level: 1, tag: "easy",   title: "Bubble Sort",                   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/bubble-sort/1", note: "Swap adjacent" },
  { id: 43, topic: "Sorting & Searching", level: 1, tag: "easy",   title: "Selection Sort",                platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/selection-sort/1", note: "Find min each pass" },
  { id: 44, topic: "Sorting & Searching", level: 1, tag: "easy",   title: "Insertion Sort",                platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/insertion-sort/1", note: "Shift & insert" },
  { id: 45, topic: "Sorting & Searching", level: 1, tag: "easy",   title: "Binary Search (Sorted Array)",  platform: "LeetCode", link: "https://leetcode.com/problems/binary-search/", note: "Classic" },
  { id: 46, topic: "Sorting & Searching", level: 2, tag: "easy+",  title: "First & Last Position in Sorted",platform:"LeetCode", link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", note: "Two binary searches" },
  { id: 47, topic: "Sorting & Searching", level: 2, tag: "easy+",  title: "Search in Rotated Sorted Array", platform:"LeetCode", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", note: "Modified BS" },
  { id: 48, topic: "Sorting & Searching", level: 3, tag: "medium", title: "Merge Sort (Implementation)",   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/merge-sort/1", note: "Divide & conquer" },
  { id: 49, topic: "Sorting & Searching", level: 3, tag: "medium", title: "Quick Sort",                    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/quick-sort/1", note: "Partition logic" },
  { id: 50, topic: "Sorting & Searching", level: 3, tag: "medium", title: "Find Peak Element",             platform: "LeetCode", link: "https://leetcode.com/problems/find-peak-element/", note: "Binary search" },
  { id: 51, topic: "Sorting & Searching", level: 4, tag: "medium+",title: "Kth Smallest Element",          platform: "LeetCode", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", note: "QuickSelect or heap" },
  { id: 52, topic: "Sorting & Searching", level: 4, tag: "medium+",title: "Find Median from Data Stream",  platform: "LeetCode", link: "https://leetcode.com/problems/find-median-from-data-stream/", note: "Two heaps" },
  { id: 53, topic: "Sorting & Searching", level: 5, tag: "hard",   title: "Median of Two Sorted Arrays",   platform: "LeetCode", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", note: "Binary search on partition" },

  // ─────────────────────────────────────────────
  // 5. TWO POINTERS & SLIDING WINDOW
  // ─────────────────────────────────────────────
  { id: 54, topic: "Two Pointers & Sliding Window", level: 1, tag: "easy",   title: "Valid Palindrome",               platform: "LeetCode", link: "https://leetcode.com/problems/valid-palindrome/", note: "L+R pointers" },
  { id: 55, topic: "Two Pointers & Sliding Window", level: 1, tag: "easy",   title: "Squares of Sorted Array",        platform: "LeetCode", link: "https://leetcode.com/problems/squares-of-a-sorted-array/", note: "Two pointer merge" },
  { id: 56, topic: "Two Pointers & Sliding Window", level: 2, tag: "easy+",  title: "Container With Most Water",      platform: "LeetCode", link: "https://leetcode.com/problems/container-with-most-water/", note: "Shrink from both ends" },
  { id: 57, topic: "Two Pointers & Sliding Window", level: 2, tag: "easy+",  title: "Max Sum Subarray of Size K",     platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1", note: "Fixed window" },
  { id: 58, topic: "Two Pointers & Sliding Window", level: 3, tag: "medium", title: "Longest Subarray with Sum K",    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1", note: "Sliding window + map" },
  { id: 59, topic: "Two Pointers & Sliding Window", level: 3, tag: "medium", title: "Fruits into Baskets",            platform: "LeetCode", link: "https://leetcode.com/problems/fruit-into-baskets/", note: "Atmost 2 distinct" },
  { id: 60, topic: "Two Pointers & Sliding Window", level: 4, tag: "medium+",title: "Longest Repeating Char Replace", platform: "LeetCode", link: "https://leetcode.com/problems/longest-repeating-character-replacement/", note: "Window + max freq" },
  { id: 61, topic: "Two Pointers & Sliding Window", level: 5, tag: "hard",   title: "Minimum Window Substring",       platform: "LeetCode", link: "https://leetcode.com/problems/minimum-window-substring/", note: "Variable window" },
  { id: 62, topic: "Two Pointers & Sliding Window", level: 5, tag: "hard",   title: "Sliding Window Maximum",         platform: "LeetCode", link: "https://leetcode.com/problems/sliding-window-maximum/", note: "Deque" },

  // ─────────────────────────────────────────────
  // 6. LINKED LIST
  // ─────────────────────────────────────────────
  { id: 63, topic: "Linked List", level: 1, tag: "easy",   title: "Reverse a Linked List",          platform: "LeetCode", link: "https://leetcode.com/problems/reverse-linked-list/", note: "Iterative: 3 pointers" },
  { id: 64, topic: "Linked List", level: 1, tag: "easy",   title: "Middle of Linked List",          platform: "LeetCode", link: "https://leetcode.com/problems/middle-of-the-linked-list/", note: "Fast-slow pointer" },
  { id: 65, topic: "Linked List", level: 1, tag: "easy",   title: "Delete Node (Given Node)",       platform: "LeetCode", link: "https://leetcode.com/problems/delete-node-in-a-linked-list/", note: "Copy next" },
  { id: 66, topic: "Linked List", level: 2, tag: "easy+",  title: "Detect Loop in LL",              platform: "LeetCode", link: "https://leetcode.com/problems/linked-list-cycle/", note: "Floyd's algorithm" },
  { id: 67, topic: "Linked List", level: 2, tag: "easy+",  title: "Remove Nth Node from End",       platform: "LeetCode", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", note: "Fast-slow + gap" },
  { id: 68, topic: "Linked List", level: 3, tag: "medium", title: "Merge Two Sorted Lists",         platform: "LeetCode", link: "https://leetcode.com/problems/merge-two-sorted-lists/", note: "Dummy node" },
  { id: 69, topic: "Linked List", level: 3, tag: "medium", title: "Intersection of Two LL",         platform: "LeetCode", link: "https://leetcode.com/problems/intersection-of-two-linked-lists/", note: "Length diff trick" },
  { id: 70, topic: "Linked List", level: 3, tag: "medium", title: "Add Two Numbers (LL)",           platform: "LeetCode", link: "https://leetcode.com/problems/add-two-numbers/", note: "Carry logic" },
  { id: 71, topic: "Linked List", level: 4, tag: "medium+",title: "Palindrome Linked List",         platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-linked-list/", note: "Reverse second half" },
  { id: 72, topic: "Linked List", level: 4, tag: "medium+",title: "Reorder List (L0→Ln→L1→Ln-1)", platform: "LeetCode", link: "https://leetcode.com/problems/reorder-list/", note: "Mid + reverse + merge" },
  { id: 73, topic: "Linked List", level: 5, tag: "hard",   title: "LRU Cache",                      platform: "LeetCode", link: "https://leetcode.com/problems/lru-cache/", note: "DLL + HashMap" },
  { id: 74, topic: "Linked List", level: 5, tag: "hard",   title: "Merge K Sorted Lists",           platform: "LeetCode", link: "https://leetcode.com/problems/merge-k-sorted-lists/", note: "Min-heap" },

  // ─────────────────────────────────────────────
  // 7. STACK & QUEUE
  // ─────────────────────────────────────────────
  { id: 75, topic: "Stack & Queue", level: 1, tag: "easy",   title: "Valid Parentheses",              platform: "LeetCode", link: "https://leetcode.com/problems/valid-parentheses/", note: "Push open, pop close" },
  { id: 76, topic: "Stack & Queue", level: 1, tag: "easy",   title: "Implement Stack using Array",    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/stack-push-and-pop/1", note: "Basic ops" },
  { id: 77, topic: "Stack & Queue", level: 1, tag: "easy",   title: "Implement Queue using Array",    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/implement-queue-using-array/1", note: "Front, rear" },
  { id: 78, topic: "Stack & Queue", level: 2, tag: "easy+",  title: "Implement Stack using Queue",    platform: "LeetCode", link: "https://leetcode.com/problems/implement-stack-using-queues/", note: "2 queues" },
  { id: 79, topic: "Stack & Queue", level: 2, tag: "easy+",  title: "Min Stack",                      platform: "LeetCode", link: "https://leetcode.com/problems/min-stack/", note: "Track min alongside" },
  { id: 80, topic: "Stack & Queue", level: 3, tag: "medium", title: "Next Greater Element",           platform: "LeetCode", link: "https://leetcode.com/problems/next-greater-element-i/", note: "Monotonic stack" },
  { id: 81, topic: "Stack & Queue", level: 3, tag: "medium", title: "Sort a Stack",                   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/sort-a-stack/1", note: "Recursion" },
  { id: 82, topic: "Stack & Queue", level: 4, tag: "medium+",title: "Daily Temperatures",             platform: "LeetCode", link: "https://leetcode.com/problems/daily-temperatures/", note: "Monotonic stack" },
  { id: 83, topic: "Stack & Queue", level: 4, tag: "medium+",title: "Asteroid Collision",             platform: "LeetCode", link: "https://leetcode.com/problems/asteroid-collision/", note: "Stack simulation" },
  { id: 84, topic: "Stack & Queue", level: 5, tag: "hard",   title: "Largest Rectangle in Histogram", platform: "LeetCode", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", note: "Mono stack" },
  { id: 85, topic: "Stack & Queue", level: 5, tag: "hard",   title: "Maximal Rectangle",              platform: "LeetCode", link: "https://leetcode.com/problems/maximal-rectangle/", note: "Histogram per row" },

  // ─────────────────────────────────────────────
  // 8. RECURSION & BACKTRACKING
  // ─────────────────────────────────────────────
  { id: 86, topic: "Recursion & Backtracking", level: 1, tag: "easy",   title: "Factorial using Recursion",      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/find-all-factorial-numbers-less-than-or-equal-to-n/1", note: "Base case: 0! = 1" },
  { id: 87, topic: "Recursion & Backtracking", level: 1, tag: "easy",   title: "Fibonacci (Recursive)",          platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/fibonacci-series-up-to-nth-term/1", note: "fib(n-1)+fib(n-2)" },
  { id: 88, topic: "Recursion & Backtracking", level: 1, tag: "easy",   title: "Sum of N Numbers",               platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/sum-of-first-n-terms/1", note: "Tail recursion" },
  { id: 89, topic: "Recursion & Backtracking", level: 2, tag: "easy+",  title: "Power(x, n)",                    platform: "LeetCode", link: "https://leetcode.com/problems/powx-n/", note: "Fast exponentiation" },
  { id: 90, topic: "Recursion & Backtracking", level: 2, tag: "easy+",  title: "Reverse a String Recursively",   platform: "LeetCode", link: "https://leetcode.com/problems/reverse-string/", note: "Swap from ends" },
  { id: 91, topic: "Recursion & Backtracking", level: 3, tag: "medium", title: "Generate All Subsets",           platform: "LeetCode", link: "https://leetcode.com/problems/subsets/", note: "Include/exclude" },
  { id: 92, topic: "Recursion & Backtracking", level: 3, tag: "medium", title: "Generate Permutations",          platform: "LeetCode", link: "https://leetcode.com/problems/permutations/", note: "Swap approach" },
  { id: 93, topic: "Recursion & Backtracking", level: 4, tag: "medium+",title: "Combination Sum",                platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum/", note: "Pick same element" },
  { id: 94, topic: "Recursion & Backtracking", level: 4, tag: "medium+",title: "Combination Sum II",             platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum-ii/", note: "No duplicate sets" },
  { id: 95, topic: "Recursion & Backtracking", level: 4, tag: "medium+",title: "Palindrome Partitioning",        platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-partitioning/", note: "BT + palindrome check" },
  { id: 96, topic: "Recursion & Backtracking", level: 5, tag: "hard",   title: "N-Queens",                       platform: "LeetCode", link: "https://leetcode.com/problems/n-queens/", note: "Row by row BT" },
  { id: 97, topic: "Recursion & Backtracking", level: 5, tag: "hard",   title: "Sudoku Solver",                  platform: "LeetCode", link: "https://leetcode.com/problems/sudoku-solver/", note: "Try 1-9 backtrack" },
  { id: 98, topic: "Recursion & Backtracking", level: 5, tag: "hard",   title: "Word Search",                    platform: "LeetCode", link: "https://leetcode.com/problems/word-search/", note: "DFS + visited" },

  // ─────────────────────────────────────────────
  // 9. BINARY SEARCH (Advanced)
  // ─────────────────────────────────────────────
  { id: 99,  topic: "Binary Search (Advanced)", level: 2, tag: "easy+",  title: "Floor & Ceil in Sorted Array",  platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/floor-in-a-sorted-array/1", note: "Modify BS condition" },
  { id: 100, topic: "Binary Search (Advanced)", level: 3, tag: "medium", title: "Find Minimum in Rotated Array", platform: "LeetCode", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", note: "Mid vs right" },
  { id: 101, topic: "Binary Search (Advanced)", level: 3, tag: "medium", title: "Koko Eating Bananas",           platform: "LeetCode", link: "https://leetcode.com/problems/koko-eating-bananas/", note: "BS on answer" },
  { id: 102, topic: "Binary Search (Advanced)", level: 3, tag: "medium", title: "Capacity to Ship in D Days",    platform: "LeetCode", link: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", note: "BS on capacity" },
  { id: 103, topic: "Binary Search (Advanced)", level: 4, tag: "medium+",title: "Aggressive Cows",              platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/aggressive-cows/1", note: "BS on min distance" },
  { id: 104, topic: "Binary Search (Advanced)", level: 4, tag: "medium+",title: "Book Allocation Problem",      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/allocate-minimum-number-of-pages/1", note: "Classic BS on ans" },
  { id: 105, topic: "Binary Search (Advanced)", level: 5, tag: "hard",   title: "Painters Partition Problem",   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/the-painters-partition-problem/1", note: "Similar to book alloc" },
  { id: 106, topic: "Binary Search (Advanced)", level: 5, tag: "hard",   title: "Median of Two Sorted Arrays",  platform: "LeetCode", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", note: "BS on partition" },

  // ─────────────────────────────────────────────
  // 10. TREES (Binary Tree)
  // ─────────────────────────────────────────────
  { id: 107, topic: "Trees", level: 1, tag: "easy",   title: "Inorder Traversal",               platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-inorder-traversal/", note: "L-Root-R" },
  { id: 108, topic: "Trees", level: 1, tag: "easy",   title: "Preorder Traversal",              platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-preorder-traversal/", note: "Root-L-R" },
  { id: 109, topic: "Trees", level: 1, tag: "easy",   title: "Postorder Traversal",             platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-postorder-traversal/", note: "L-R-Root" },
  { id: 110, topic: "Trees", level: 1, tag: "easy",   title: "Height of Binary Tree",           platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/height-of-binary-tree/1", note: "Max(L,R)+1" },
  { id: 111, topic: "Trees", level: 2, tag: "easy+",  title: "Level Order Traversal (BFS)",     platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/", note: "Queue" },
  { id: 112, topic: "Trees", level: 2, tag: "easy+",  title: "Check if Balanced",               platform: "LeetCode", link: "https://leetcode.com/problems/balanced-binary-tree/", note: "Height diff ≤1" },
  { id: 113, topic: "Trees", level: 2, tag: "easy+",  title: "Diameter of Binary Tree",         platform: "LeetCode", link: "https://leetcode.com/problems/diameter-of-binary-tree/", note: "Left+right height" },
  { id: 114, topic: "Trees", level: 3, tag: "medium", title: "Right Side View",                 platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-right-side-view/", note: "Level order, last node" },
  { id: 115, topic: "Trees", level: 3, tag: "medium", title: "Lowest Common Ancestor",          platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", note: "Recurse both sides" },
  { id: 116, topic: "Trees", level: 3, tag: "medium", title: "Zigzag Level Order",              platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", note: "Flip direction" },
  { id: 117, topic: "Trees", level: 3, tag: "medium", title: "Path Sum (Root to Leaf)",         platform: "LeetCode", link: "https://leetcode.com/problems/path-sum/", note: "DFS with running sum" },
  { id: 118, topic: "Trees", level: 4, tag: "medium+",title: "Construct from Inorder+Preorder", platform: "LeetCode", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", note: "Root from preorder" },
  { id: 119, topic: "Trees", level: 4, tag: "medium+",title: "Flatten BT to Linked List",       platform: "LeetCode", link: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/", note: "Morris/reverse postorder" },
  { id: 120, topic: "Trees", level: 5, tag: "hard",   title: "Max Path Sum",                    platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", note: "Track max at each node" },
  { id: 121, topic: "Trees", level: 5, tag: "hard",   title: "Serialize & Deserialize BT",      platform: "LeetCode", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", note: "BFS/preorder" },

  // ─────────────────────────────────────────────
  // 11. BST
  // ─────────────────────────────────────────────
  { id: 122, topic: "BST", level: 1, tag: "easy",   title: "Search in BST",                    platform: "LeetCode", link: "https://leetcode.com/problems/search-in-a-binary-search-tree/", note: "Compare with root" },
  { id: 123, topic: "BST", level: 1, tag: "easy",   title: "Insert into BST",                  platform: "LeetCode", link: "https://leetcode.com/problems/insert-into-a-binary-search-tree/", note: "Find correct position" },
  { id: 124, topic: "BST", level: 2, tag: "easy+",  title: "Validate BST",                     platform: "LeetCode", link: "https://leetcode.com/problems/validate-binary-search-tree/", note: "Pass min/max bounds" },
  { id: 125, topic: "BST", level: 2, tag: "easy+",  title: "Kth Smallest in BST",              platform: "LeetCode", link: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", note: "Inorder = sorted" },
  { id: 126, topic: "BST", level: 3, tag: "medium", title: "LCA of BST",                       platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", note: "Use BST property" },
  { id: 127, topic: "BST", level: 3, tag: "medium", title: "Delete Node from BST",             platform: "LeetCode", link: "https://leetcode.com/problems/delete-node-in-a-bst/", note: "3 cases" },
  { id: 128, topic: "BST", level: 4, tag: "medium+",title: "Two Sum in BST",                   platform: "LeetCode", link: "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/", note: "Inorder + two ptr" },
  { id: 129, topic: "BST", level: 5, tag: "hard",   title: "Recover BST (2 swapped nodes)",    platform: "LeetCode", link: "https://leetcode.com/problems/recover-binary-search-tree/", note: "Morris/inorder" },

  // ─────────────────────────────────────────────
  // 12. HEAPS / PRIORITY QUEUE
  // ─────────────────────────────────────────────
  { id: 130, topic: "Heaps", level: 2, tag: "easy+",  title: "Kth Largest Element",             platform: "LeetCode", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", note: "Min-heap of size k" },
  { id: 131, topic: "Heaps", level: 3, tag: "medium", title: "Top K Frequent Elements",         platform: "LeetCode", link: "https://leetcode.com/problems/top-k-frequent-elements/", note: "Heap + frequency map" },
  { id: 132, topic: "Heaps", level: 3, tag: "medium", title: "Sort Characters by Frequency",    platform: "LeetCode", link: "https://leetcode.com/problems/sort-characters-by-frequency/", note: "Max-heap" },
  { id: 133, topic: "Heaps", level: 4, tag: "medium+",title: "K Closest Points to Origin",      platform: "LeetCode", link: "https://leetcode.com/problems/k-closest-points-to-origin/", note: "Max-heap of size k" },
  { id: 134, topic: "Heaps", level: 5, tag: "hard",   title: "Task Scheduler",                  platform: "LeetCode", link: "https://leetcode.com/problems/task-scheduler/", note: "Greedy + heap" },
  { id: 135, topic: "Heaps", level: 5, tag: "hard",   title: "Minimum Cost to Connect Ropes",   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/minimum-cost-of-ropes/1", note: "Min-heap" },

  // ─────────────────────────────────────────────
  // 13. GRAPHS
  // ─────────────────────────────────────────────
  { id: 136, topic: "Graphs", level: 1, tag: "easy",   title: "BFS of Graph",                   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/bfs-traversal-of-graph/1", note: "Queue, visited[]" },
  { id: 137, topic: "Graphs", level: 1, tag: "easy",   title: "DFS of Graph",                   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1", note: "Recursive/stack" },
  { id: 138, topic: "Graphs", level: 2, tag: "easy+",  title: "Number of Connected Components", platform: "LeetCode", link: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", note: "DFS/Union-Find" },
  { id: 139, topic: "Graphs", level: 2, tag: "easy+",  title: "Flood Fill",                     platform: "LeetCode", link: "https://leetcode.com/problems/flood-fill/", note: "DFS on grid" },
  { id: 140, topic: "Graphs", level: 2, tag: "easy+",  title: "Number of Islands",              platform: "LeetCode", link: "https://leetcode.com/problems/number-of-islands/", note: "DFS/BFS on grid" },
  { id: 141, topic: "Graphs", level: 3, tag: "medium", title: "Detect Cycle (Undirected)",       platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1", note: "BFS/DFS parent check" },
  { id: 142, topic: "Graphs", level: 3, tag: "medium", title: "Detect Cycle (Directed)",         platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1", note: "DFS + inStack" },
  { id: 143, topic: "Graphs", level: 3, tag: "medium", title: "Topological Sort (Kahn's)",       platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/topological-sort/1", note: "BFS + indegree" },
  { id: 144, topic: "Graphs", level: 3, tag: "medium", title: "Rotten Oranges",                  platform: "LeetCode", link: "https://leetcode.com/problems/rotting-oranges/", note: "Multi-source BFS" },
  { id: 145, topic: "Graphs", level: 4, tag: "medium+",title: "Dijkstra's Algorithm",            platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1", note: "Priority queue" },
  { id: 146, topic: "Graphs", level: 4, tag: "medium+",title: "Bipartite Graph Check",           platform: "LeetCode", link: "https://leetcode.com/problems/is-graph-bipartite/", note: "2-color BFS" },
  { id: 147, topic: "Graphs", level: 4, tag: "medium+",title: "Shortest Path in Binary Matrix",  platform: "LeetCode", link: "https://leetcode.com/problems/shortest-path-in-binary-matrix/", note: "BFS" },
  { id: 148, topic: "Graphs", level: 5, tag: "hard",   title: "Bellman-Ford Algorithm",          platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1", note: "Relax all edges V-1 times" },
  { id: 149, topic: "Graphs", level: 5, tag: "hard",   title: "Floyd-Warshall",                  platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/implementing-floyd-warshall/1", note: "All-pair shortest path" },
  { id: 150, topic: "Graphs", level: 5, tag: "hard",   title: "Minimum Spanning Tree (Prim's)",  platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/minimum-spanning-tree/1", note: "Greedy + priority queue" },
  { id: 151, topic: "Graphs", level: 5, tag: "hard",   title: "Strongly Connected Components",   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1", note: "Kosaraju's 2-pass DFS" },

  // ─────────────────────────────────────────────
  // 14. DYNAMIC PROGRAMMING
  // ─────────────────────────────────────────────
  { id: 152, topic: "Dynamic Programming", level: 1, tag: "easy",   title: "Climbing Stairs",                platform: "LeetCode", link: "https://leetcode.com/problems/climbing-stairs/", note: "Fibonacci DP" },
  { id: 153, topic: "Dynamic Programming", level: 1, tag: "easy",   title: "Fibonacci with Memoization",     platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/nth-fibonacci-number/1", note: "dp[n]=dp[n-1]+dp[n-2]" },
  { id: 154, topic: "Dynamic Programming", level: 2, tag: "easy+",  title: "Coin Change (Min Coins)",        platform: "LeetCode", link: "https://leetcode.com/problems/coin-change/", note: "Unbounded knapsack" },
  { id: 155, topic: "Dynamic Programming", level: 2, tag: "easy+",  title: "House Robber",                   platform: "LeetCode", link: "https://leetcode.com/problems/house-robber/", note: "dp[i]=max(dp[i-1], dp[i-2]+nums[i])" },
  { id: 156, topic: "Dynamic Programming", level: 3, tag: "medium", title: "0/1 Knapsack",                   platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/0-1-knapsack-problem/1", note: "Include/exclude" },
  { id: 157, topic: "Dynamic Programming", level: 3, tag: "medium", title: "Longest Common Subsequence",     platform: "LeetCode", link: "https://leetcode.com/problems/longest-common-subsequence/", note: "2D DP table" },
  { id: 158, topic: "Dynamic Programming", level: 3, tag: "medium", title: "Longest Increasing Subsequence", platform: "LeetCode", link: "https://leetcode.com/problems/longest-increasing-subsequence/", note: "O(n²) then O(nlogn)" },
  { id: 159, topic: "Dynamic Programming", level: 3, tag: "medium", title: "Subset Sum",                     platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/subset-sum-problem/1", note: "Bool DP" },
  { id: 160, topic: "Dynamic Programming", level: 4, tag: "medium+",title: "Partition Equal Subset Sum",     platform: "LeetCode", link: "https://leetcode.com/problems/partition-equal-subset-sum/", note: "Subset sum to total/2" },
  { id: 161, topic: "Dynamic Programming", level: 4, tag: "medium+",title: "Unique Paths",                   platform: "LeetCode", link: "https://leetcode.com/problems/unique-paths/", note: "Grid DP" },
  { id: 162, topic: "Dynamic Programming", level: 4, tag: "medium+",title: "Minimum Path Sum in Grid",       platform: "LeetCode", link: "https://leetcode.com/problems/minimum-path-sum/", note: "dp[i][j] from top/left" },
  { id: 163, topic: "Dynamic Programming", level: 4, tag: "medium+",title: "Edit Distance",                  platform: "LeetCode", link: "https://leetcode.com/problems/edit-distance/", note: "Insert/delete/replace" },
  { id: 164, topic: "Dynamic Programming", level: 4, tag: "medium+",title: "Coin Change 2 (Ways)",           platform: "LeetCode", link: "https://leetcode.com/problems/coin-change-ii/", note: "Count ways" },
  { id: 165, topic: "Dynamic Programming", level: 5, tag: "hard",   title: "Burst Balloons",                 platform: "LeetCode", link: "https://leetcode.com/problems/burst-balloons/", note: "Interval DP" },
  { id: 166, topic: "Dynamic Programming", level: 5, tag: "hard",   title: "Matrix Chain Multiplication",    platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1", note: "Partition DP" },
  { id: 167, topic: "Dynamic Programming", level: 5, tag: "hard",   title: "Palindrome Partitioning II",     platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-partitioning-ii/", note: "Min cuts DP" },
  { id: 168, topic: "Dynamic Programming", level: 5, tag: "hard",   title: "Longest Palindromic Subsequence",platform: "LeetCode", link: "https://leetcode.com/problems/longest-palindromic-subsequence/", note: "LCS of s and reverse(s)" },

  // ─────────────────────────────────────────────
  // 15. GREEDY
  // ─────────────────────────────────────────────
  { id: 169, topic: "Greedy", level: 1, tag: "easy",   title: "Assign Cookies",                 platform: "LeetCode", link: "https://leetcode.com/problems/assign-cookies/", note: "Sort both, two pointer" },
  { id: 170, topic: "Greedy", level: 2, tag: "easy+",  title: "Jump Game",                      platform: "LeetCode", link: "https://leetcode.com/problems/jump-game/", note: "Track max reachable" },
  { id: 171, topic: "Greedy", level: 2, tag: "easy+",  title: "Lemonade Change",                platform: "LeetCode", link: "https://leetcode.com/problems/lemonade-change/", note: "Track coins" },
  { id: 172, topic: "Greedy", level: 3, tag: "medium", title: "Activity Selection",              platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/activity-selection-1587115620/1", note: "Sort by end time" },
  { id: 173, topic: "Greedy", level: 3, tag: "medium", title: "Minimum Platforms",              platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/minimum-number-of-platforms-required-for-a-railway/1", note: "Sort arrivals & departures" },
  { id: 174, topic: "Greedy", level: 3, tag: "medium", title: "Fractional Knapsack",            platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/fractional-knapsack/1", note: "Sort by value/weight" },
  { id: 175, topic: "Greedy", level: 4, tag: "medium+",title: "Jump Game II (Min Jumps)",       platform: "LeetCode", link: "https://leetcode.com/problems/jump-game-ii/", note: "Track current reach" },
  { id: 176, topic: "Greedy", level: 4, tag: "medium+",title: "Gas Station",                    platform: "LeetCode", link: "https://leetcode.com/problems/gas-station/", note: "If total>=0, solution exists" },
  { id: 177, topic: "Greedy", level: 5, tag: "hard",   title: "Non-overlapping Intervals",      platform: "LeetCode", link: "https://leetcode.com/problems/non-overlapping-intervals/", note: "Sort by end, greedy pick" },

  // ─────────────────────────────────────────────
  // 16. TRIE
  // ─────────────────────────────────────────────
  { id: 178, topic: "Trie", level: 2, tag: "easy+",  title: "Implement Trie (Insert/Search/StartsWith)", platform: "LeetCode", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", note: "26 children array" },
  { id: 179, topic: "Trie", level: 3, tag: "medium", title: "Word Search II",                  platform: "LeetCode", link: "https://leetcode.com/problems/word-search-ii/", note: "Trie + DFS on board" },
  { id: 180, topic: "Trie", level: 4, tag: "medium+",title: "Replace Words",                   platform: "LeetCode", link: "https://leetcode.com/problems/replace-words/", note: "Insert roots in trie" },
  { id: 181, topic: "Trie", level: 5, tag: "hard",   title: "Maximum XOR of Two Numbers",      platform: "LeetCode", link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", note: "Binary trie" },

  // ─────────────────────────────────────────────
  // 17. BIT MANIPULATION
  // ─────────────────────────────────────────────
  { id: 182, topic: "Bit Manipulation", level: 1, tag: "easy",   title: "Check Power of 2",               platform: "LeetCode", link: "https://leetcode.com/problems/power-of-two/", note: "n & (n-1) == 0" },
  { id: 183, topic: "Bit Manipulation", level: 1, tag: "easy",   title: "Count Set Bits",                 platform: "LeetCode", link: "https://leetcode.com/problems/number-of-1-bits/", note: "Brian Kernighan's algo" },
  { id: 184, topic: "Bit Manipulation", level: 2, tag: "easy+",  title: "Single Number",                  platform: "LeetCode", link: "https://leetcode.com/problems/single-number/", note: "XOR all elements" },
  { id: 185, topic: "Bit Manipulation", level: 2, tag: "easy+",  title: "Find Two Non-Repeating Numbers", platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/finding-the-numbers/1", note: "XOR + partition by set bit" },
  { id: 186, topic: "Bit Manipulation", level: 3, tag: "medium", title: "Reverse Bits",                   platform: "LeetCode", link: "https://leetcode.com/problems/reverse-bits/", note: "Shift + OR" },
  { id: 187, topic: "Bit Manipulation", level: 3, tag: "medium", title: "Generate All Subsets via Bitmask",platform:"LeetCode", link: "https://leetcode.com/problems/subsets/", note: "2^n iterations" },
  { id: 188, topic: "Bit Manipulation", level: 4, tag: "medium+",title: "Divide Two Integers (No /)",     platform: "LeetCode", link: "https://leetcode.com/problems/divide-two-integers/", note: "Bit shift subtract" },
  { id: 189, topic: "Bit Manipulation", level: 5, tag: "hard",   title: "Maximum Product of Word Lengths", platform:"LeetCode", link: "https://leetcode.com/problems/maximum-product-of-word-lengths/", note: "Bitmask for chars" },

  // ─────────────────────────────────────────────
  // 18. MATH / NUMBER THEORY
  // ─────────────────────────────────────────────
  { id: 190, topic: "Math & Number Theory", level: 1, tag: "easy",   title: "GCD & LCM",                      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/gcd-and-lcm/1", note: "Euclidean algorithm" },
  { id: 191, topic: "Math & Number Theory", level: 1, tag: "easy",   title: "Check Prime Number",             platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/prime-number/1", note: "√n check" },
  { id: 192, topic: "Math & Number Theory", level: 2, tag: "easy+",  title: "Sieve of Eratosthenes",          platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/sieve-of-eratosthenes/1", note: "Classic sieve" },
  { id: 193, topic: "Math & Number Theory", level: 2, tag: "easy+",  title: "Count Digits in Factorial",      platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/count-digits-in-a-factorial/1", note: "Summation log formula" },
  { id: 194, topic: "Math & Number Theory", level: 3, tag: "medium", title: "Modular Exponentiation",         platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/modular-exponentiation-for-large-numbers/1", note: "Fast power" },
  { id: 195, topic: "Math & Number Theory", level: 3, tag: "medium", title: "Excel Sheet Column Number",      platform: "LeetCode", link: "https://leetcode.com/problems/excel-sheet-column-number/", note: "Base 26" },
  { id: 196, topic: "Math & Number Theory", level: 4, tag: "medium+",title: "Factorial Trailing Zeros",       platform: "LeetCode", link: "https://leetcode.com/problems/factorial-trailing-zeroes/", note: "Count 5s" },
  { id: 197, topic: "Math & Number Theory", level: 5, tag: "hard",   title: "N-th Catalan Number",            platform: "GFG",      link: "https://practice.geeksforgeeks.org/problems/nth-catalan-number/", note: "2nCn / (n+1)" },

  // ─────────────────────────────────────────────
  // 19. MATRIX
  // ─────────────────────────────────────────────
  { id: 198, topic: "Matrix", level: 1, tag: "easy",   title: "Print Matrix in Spiral",          platform: "LeetCode", link: "https://leetcode.com/problems/spiral-matrix/", note: "4 boundary pointers" },
  { id: 199, topic: "Matrix", level: 1, tag: "easy",   title: "Transpose Matrix",                platform: "LeetCode", link: "https://leetcode.com/problems/transpose-matrix/", note: "Swap [i][j] & [j][i]" },
  { id: 200, topic: "Matrix", level: 2, tag: "easy+",  title: "Rotate Image 90°",                platform: "LeetCode", link: "https://leetcode.com/problems/rotate-image/", note: "Transpose then reverse rows" },
  { id: 201, topic: "Matrix", level: 2, tag: "easy+",  title: "Set Matrix Zeroes",               platform: "LeetCode", link: "https://leetcode.com/problems/set-matrix-zeroes/", note: "Use row/col flags" },
  { id: 202, topic: "Matrix", level: 3, tag: "medium", title: "Word Search in Matrix",           platform: "LeetCode", link: "https://leetcode.com/problems/word-search/", note: "DFS with visited" },
  { id: 203, topic: "Matrix", level: 4, tag: "medium+",title: "Search in Row+Col Sorted Matrix", platform: "LeetCode", link: "https://leetcode.com/problems/search-a-2d-matrix-ii/", note: "Start from top-right" },
  { id: 204, topic: "Matrix", level: 5, tag: "hard",   title: "Maximal Square",                  platform: "LeetCode", link: "https://leetcode.com/problems/maximal-square/", note: "DP min(top,left,diag)+1" },

  // ─────────────────────────────────────────────
  // 20. MIXED PRACTICE (Company Favourites)
  // ─────────────────────────────────────────────
  { id: 205, topic: "Company Favourites", level: 3, tag: "medium", title: "Valid Sudoku",                    platform: "LeetCode", link: "https://leetcode.com/problems/valid-sudoku/", note: "Row/col/box HashSet" },
  { id: 206, topic: "Company Favourites", level: 3, tag: "medium", title: "Word Break",                     platform: "LeetCode", link: "https://leetcode.com/problems/word-break/", note: "DP + dict" },
  { id: 207, topic: "Company Favourites", level: 3, tag: "medium", title: "Product of Array Except Self",   platform: "LeetCode", link: "https://leetcode.com/problems/product-of-array-except-self/", note: "Prefix * suffix" },
  { id: 208, topic: "Company Favourites", level: 3, tag: "medium", title: "Top K Frequent Words",           platform: "LeetCode", link: "https://leetcode.com/problems/top-k-frequent-words/", note: "Heap + custom sort" },
  { id: 209, topic: "Company Favourites", level: 4, tag: "medium+",title: "Decode Ways",                    platform: "LeetCode", link: "https://leetcode.com/problems/decode-ways/", note: "1-char and 2-char DP" },
  { id: 210, topic: "Company Favourites", level: 4, tag: "medium+",title: "Number of Ways to Decode",       platform: "LeetCode", link: "https://leetcode.com/problems/decode-ways-ii/", note: "DP with * wildcard" },
  { id: 211, topic: "Company Favourites", level: 4, tag: "medium+",title: "Clone Graph",                    platform: "LeetCode", link: "https://leetcode.com/problems/clone-graph/", note: "DFS + hashmap" },
  { id: 212, topic: "Company Favourites", level: 4, tag: "medium+",title: "Number of Islands",              platform: "LeetCode", link: "https://leetcode.com/problems/number-of-islands/", note: "BFS/DFS grid" },
  { id: 213, topic: "Company Favourites", level: 5, tag: "hard",   title: "Course Schedule II",             platform: "LeetCode", link: "https://leetcode.com/problems/course-schedule-ii/", note: "Topological sort" },
  { id: 214, topic: "Company Favourites", level: 5, tag: "hard",   title: "Word Ladder",                    platform: "LeetCode", link: "https://leetcode.com/problems/word-ladder/", note: "BFS shortest path" },
  { id: 215, topic: "Company Favourites", level: 5, tag: "hard",   title: "Alien Dictionary",               platform: "LeetCode", link: "https://leetcode.com/problems/alien-dictionary/", note: "Topological sort" },
];

export const TOPICS: string[] = Array.from(new Set(QUESTIONS.map((q) => q.topic)));
export const TAGS: Tag[] = ["easy", "easy+", "medium", "medium+", "hard"];
export const questionById = new Map(QUESTIONS.map((q) => [q.id, q]));

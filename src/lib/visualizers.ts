// Frame generators for the algorithm visualizers. Each generator turns a
// random input into a list of frames the player steps through.

export type Role = "compare" | "swap" | "sorted" | "pivot" | "window" | "best";

export interface ArrayFrame {
  kind: "array";
  arr: number[];
  colors: Record<number, Role>;
  pointers: Record<number, string>;
  msg: string;
}

// Grid cells: 0 empty · 1 wall · 2 visited · 3 frontier · 4 current · 5 endpoint · 6 path
export interface GridFrame {
  kind: "grid";
  grid: number[][];
  msg: string;
}

export type Frame = ArrayFrame | GridFrame;

export interface Visualizer {
  slug: string;
  name: string;
  icon: string;
  desc: string;
  topic: string;
  inputKind: "array" | "grid";
  gen: (n: number) => Frame[];
}

const rnd = (max: number) => Math.floor(Math.random() * max);
const randomArray = (n: number, max = 99) => Array.from({ length: n }, () => 1 + rnd(max));

function af(
  arr: number[],
  msg: string,
  colors: Record<number, Role> = {},
  pointers: Record<number, string> = {},
): ArrayFrame {
  return { kind: "array", arr: [...arr], colors: { ...colors }, pointers: { ...pointers }, msg };
}

const allSorted = (n: number) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [i, "sorted"])) as Record<number, Role>;

// ── Sorting ──────────────────────────────────────────────────────

function bubbleSort(n: number): Frame[] {
  const a = randomArray(n);
  const f: Frame[] = [af(a, "Bubble sort: repeatedly swap adjacent out-of-order pairs.")];
  const sorted: Record<number, Role> = {};
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      f.push(af(a, `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`, { ...sorted, [j]: "compare", [j + 1]: "compare" }));
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        f.push(af(a, `${a[j + 1]} > ${a[j]} → swap`, { ...sorted, [j]: "swap", [j + 1]: "swap" }));
      }
    }
    sorted[a.length - 1 - i] = "sorted";
    f.push(af(a, `Largest of the pass bubbled to index ${a.length - 1 - i}`, { ...sorted }));
  }
  f.push(af(a, "Sorted! Time O(n²) · Space O(1)", allSorted(n)));
  return f;
}

function selectionSort(n: number): Frame[] {
  const a = randomArray(n);
  const f: Frame[] = [af(a, "Selection sort: pick the minimum of the unsorted part each pass.")];
  const sorted: Record<number, Role> = {};
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      f.push(af(a, `Scanning… current min a[${min}]=${a[min]}`, { ...sorted, [min]: "pivot", [j]: "compare" }));
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      f.push(af(a, `Swap min ${a[i]} into position ${i}`, { ...sorted, [i]: "swap", [min]: "swap" }));
    }
    sorted[i] = "sorted";
    f.push(af(a, `Index ${i} fixed`, { ...sorted }));
  }
  f.push(af(a, "Sorted! Time O(n²) · Space O(1)", allSorted(n)));
  return f;
}

function insertionSort(n: number): Frame[] {
  const a = randomArray(n);
  const f: Frame[] = [af(a, "Insertion sort: grow a sorted prefix, insert each new element into place.")];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    f.push(af(a, `Take a[${i}]=${key}, insert into sorted prefix`, { [i]: "pivot" }));
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      f.push(af(a, `${a[j]} > ${key} → shift right`, { [j]: "compare", [j + 1]: "swap" }));
      j--;
    }
    a[j + 1] = key;
    f.push(af(a, `Insert ${key} at index ${j + 1}`, { [j + 1]: "sorted" }));
  }
  f.push(af(a, "Sorted! Time O(n²) (O(n) when nearly sorted) · Space O(1)", allSorted(n)));
  return f;
}

function quickSort(n: number): Frame[] {
  const a = randomArray(n);
  const f: Frame[] = [af(a, "Quick sort: partition around a pivot, recurse on both sides.")];
  const done: Record<number, Role> = {};
  const part = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      done[lo] = "sorted";
      f.push(af(a, `Single element a[${lo}] is in place`, { ...done }));
      return;
    }
    const pivot = a[hi];
    let i = lo - 1;
    f.push(af(a, `Partition [${lo}..${hi}], pivot a[${hi}]=${pivot}`, { ...done, [hi]: "pivot" }));
    for (let j = lo; j < hi; j++) {
      f.push(af(a, `a[${j}]=${a[j]} vs pivot ${pivot}`, { ...done, [hi]: "pivot", [j]: "compare" }));
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          f.push(af(a, `Move ${a[i]} to the small side`, { ...done, [hi]: "pivot", [i]: "swap", [j]: "swap" }));
        }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    done[i + 1] = "sorted";
    f.push(af(a, `Pivot ${a[i + 1]} lands at index ${i + 1}`, { ...done }));
    part(lo, i);
    part(i + 2, hi);
  };
  part(0, a.length - 1);
  f.push(af(a, "Sorted! Average O(n log n) · worst O(n²) · Space O(log n)", allSorted(n)));
  return f;
}

function mergeSort(n: number): Frame[] {
  const a = randomArray(n);
  const f: Frame[] = [af(a, "Merge sort: split in halves, merge sorted halves back.")];
  const merge = (lo: number, mid: number, hi: number) => {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    const range: Record<number, Role> = {};
    for (let x = lo; x <= hi; x++) range[x] = "window";
    f.push(af(a, `Merging [${lo}..${mid}] and [${mid + 1}..${hi}]`, range));
    while (i < left.length || j < right.length) {
      const takeLeft = j >= right.length || (i < left.length && left[i] <= right[j]);
      a[k] = takeLeft ? left[i++] : right[j++];
      f.push(af(a, `Write ${a[k]} at index ${k}`, { ...range, [k]: "swap" }));
      k++;
    }
  };
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };
  sort(0, a.length - 1);
  f.push(af(a, "Sorted! Time O(n log n) · Space O(n)", allSorted(n)));
  return f;
}

// ── Searching / pointers / windows ──────────────────────────────

function binarySearch(n: number): Frame[] {
  const a = randomArray(n).sort((x, y) => x - y);
  const target = a[rnd(n)];
  const f: Frame[] = [af(a, `Binary search for ${target} in a sorted array.`)];
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    f.push(
      af(a, `mid=${mid}, a[mid]=${a[mid]} vs target ${target}`, { [mid]: "pivot" }, { [lo]: "L", [hi]: "R", [mid]: "mid" }),
    );
    if (a[mid] === target) {
      f.push(af(a, `Found ${target} at index ${mid}! Time O(log n)`, { [mid]: "sorted" }, { [mid]: "✓" }));
      return f;
    }
    if (a[mid] < target) {
      lo = mid + 1;
      f.push(af(a, `${a[mid]} < ${target} → search right half`, {}, { [lo]: "L", [hi]: "R" }));
    } else {
      hi = mid - 1;
      f.push(af(a, `${a[mid]} > ${target} → search left half`, {}, { [Math.max(lo, 0)]: "L", [Math.max(hi, 0)]: "R" }));
    }
  }
  f.push(af(a, `${target} not found. Time O(log n)`));
  return f;
}

function twoPointers(n: number): Frame[] {
  const a = randomArray(n).sort((x, y) => x - y);
  const i0 = rnd(n - 1);
  const j0 = i0 + 1 + rnd(n - i0 - 1);
  const target = a[i0] + a[j0];
  const f: Frame[] = [af(a, `Two pointers: find a pair summing to ${target} in a sorted array.`)];
  let l = 0, r = a.length - 1;
  while (l < r) {
    const sum = a[l] + a[r];
    f.push(af(a, `a[${l}]+a[${r}] = ${a[l]}+${a[r]} = ${sum} vs ${target}`, { [l]: "compare", [r]: "compare" }, { [l]: "L", [r]: "R" }));
    if (sum === target) {
      f.push(af(a, `Pair found! ${a[l]} + ${a[r]} = ${target} · Time O(n)`, { [l]: "sorted", [r]: "sorted" }, { [l]: "L", [r]: "R" }));
      return f;
    }
    if (sum < target) l++;
    else r--;
  }
  f.push(af(a, "No pair found."));
  return f;
}

function slidingWindow(n: number): Frame[] {
  const a = randomArray(n, 30);
  const k = Math.max(3, Math.floor(n / 4));
  const f: Frame[] = [af(a, `Sliding window: max sum of any ${k} consecutive elements.`)];
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum, bestStart = 0;
  const win = (s: number, role: Role) => {
    const c: Record<number, Role> = {};
    for (let x = s; x < s + k; x++) c[x] = role;
    return c;
  };
  f.push(af(a, `First window sum = ${sum}`, win(0, "window")));
  for (let i = k; i < a.length; i++) {
    sum += a[i] - a[i - k];
    const s = i - k + 1;
    f.push(af(a, `Slide → +a[${i}]=${a[i]}, −a[${i - k}]=${a[i - k]} → sum ${sum}`, win(s, "window")));
    if (sum > best) {
      best = sum;
      bestStart = s;
      f.push(af(a, `New best ${best}!`, win(s, "best")));
    }
  }
  f.push(af(a, `Max sum = ${best} (indices ${bestStart}..${bestStart + k - 1}) · Time O(n)`, win(bestStart, "best")));
  return f;
}

function kadane(n: number): Frame[] {
  const a = Array.from({ length: n }, () => rnd(31) - 12);
  const f: Frame[] = [af(a, "Kadane's: max subarray sum — extend or restart at each element.")];
  let cur = 0, best = -Infinity, start = 0, bestL = 0, bestR = 0;
  for (let i = 0; i < a.length; i++) {
    if (cur + a[i] < a[i]) {
      cur = a[i];
      start = i;
    } else cur += a[i];
    const c: Record<number, Role> = {};
    for (let x = start; x <= i; x++) c[x] = "window";
    f.push(af(a, `cur=${cur} (subarray ${start}..${i}), best=${best === -Infinity ? "—" : best}`, c, { [i]: "i" }));
    if (cur > best) {
      best = cur;
      bestL = start;
      bestR = i;
      const b: Record<number, Role> = {};
      for (let x = bestL; x <= bestR; x++) b[x] = "best";
      f.push(af(a, `New best ${best}!`, b));
    }
  }
  const b: Record<number, Role> = {};
  for (let x = bestL; x <= bestR; x++) b[x] = "best";
  f.push(af(a, `Max subarray sum = ${best} (${bestL}..${bestR}) · Time O(n)`, b));
  return f;
}

// ── Graphs (grid) ────────────────────────────────────────────────

function makeGrid(size: number): number[][] {
  const g = Array.from({ length: size }, () => Array.from({ length: size }, () => (Math.random() < 0.26 ? 1 : 0)));
  g[0][0] = 0;
  g[size - 1][size - 1] = 0;
  return g;
}

function gf(grid: number[][], msg: string): GridFrame {
  return { kind: "grid", grid: grid.map((r) => [...r]), msg };
}

function bfsGrid(n: number): Frame[] {
  const size = Math.max(8, Math.min(14, n));
  const walls = makeGrid(size);
  const view = walls.map((r) => [...r]);
  view[0][0] = 5;
  view[size - 1][size - 1] = 5;
  const f: Frame[] = [gf(view, "BFS: explore level by level — guarantees the shortest path.")];
  const parent = new Map<string, string>();
  const queue: [number, number][] = [[0, 0]];
  const seen = new Set(["0,0"]);
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let found = false;
  while (queue.length && !found) {
    const [r, c] = queue.shift()!;
    if (!(r === 0 && c === 0)) view[r][c] = 2;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      if (walls[nr][nc] === 1 || seen.has(`${nr},${nc}`)) continue;
      seen.add(`${nr},${nc}`);
      parent.set(`${nr},${nc}`, `${r},${c}`);
      if (nr === size - 1 && nc === size - 1) {
        found = true;
        break;
      }
      view[nr][nc] = 3;
      queue.push([nr, nc]);
    }
    f.push(gf(view, `Visiting (${r},${c}) — queue size ${queue.length}`));
  }
  if (found) {
    let cur = `${size - 1},${size - 1}`;
    const path: string[] = [];
    while (cur !== "0,0") {
      path.push(cur);
      cur = parent.get(cur)!;
    }
    for (const p of path.reverse()) {
      const [r, c] = p.split(",").map(Number);
      view[r][c] = 6;
      f.push(gf(view, `Shortest path: ${path.length} steps · Time O(V+E)`));
    }
  } else {
    f.push(gf(view, "No path exists — walls block every route. Randomize to retry!"));
  }
  return f;
}

function dfsGrid(n: number): Frame[] {
  const size = Math.max(8, Math.min(14, n));
  const walls = makeGrid(size);
  const view = walls.map((r) => [...r]);
  view[0][0] = 5;
  view[size - 1][size - 1] = 5;
  const f: Frame[] = [gf(view, "DFS: dive deep first, backtrack on dead ends (path not necessarily shortest).")];
  const stack: [number, number][] = [[0, 0]];
  const seen = new Set(["0,0"]);
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let found = false;
  while (stack.length && !found) {
    const [r, c] = stack.pop()!;
    if (r === size - 1 && c === size - 1) {
      found = true;
      break;
    }
    if (!(r === 0 && c === 0)) view[r][c] = 2;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
      if (walls[nr][nc] === 1 || seen.has(`${nr},${nc}`)) continue;
      seen.add(`${nr},${nc}`);
      if (!(nr === size - 1 && nc === size - 1)) view[nr][nc] = 3;
      stack.push([nr, nc]);
    }
    f.push(gf(view, `Exploring (${r},${c}) — stack depth ${stack.length}`));
  }
  f.push(gf(view, found ? "Target reached! Time O(V+E)" : "No path exists. Randomize to retry!"));
  return f;
}

// ── Registry ─────────────────────────────────────────────────────

export const VISUALIZERS: Visualizer[] = [
  { slug: "bubble-sort", name: "Bubble Sort", icon: "🫧", desc: "Adjacent swaps bubble the max to the end each pass.", topic: "Sorting", inputKind: "array", gen: bubbleSort },
  { slug: "selection-sort", name: "Selection Sort", icon: "🎯", desc: "Select the minimum of the rest, fix it in place.", topic: "Sorting", inputKind: "array", gen: selectionSort },
  { slug: "insertion-sort", name: "Insertion Sort", icon: "🃏", desc: "Insert each element into a growing sorted prefix.", topic: "Sorting", inputKind: "array", gen: insertionSort },
  { slug: "quick-sort", name: "Quick Sort", icon: "⚡", desc: "Partition around a pivot, recurse on both halves.", topic: "Sorting", inputKind: "array", gen: quickSort },
  { slug: "merge-sort", name: "Merge Sort", icon: "🪄", desc: "Split to singletons, merge sorted halves back up.", topic: "Sorting", inputKind: "array", gen: mergeSort },
  { slug: "binary-search", name: "Binary Search", icon: "🔍", desc: "Halve the search space every step on sorted data.", topic: "Searching", inputKind: "array", gen: binarySearch },
  { slug: "two-pointers", name: "Two Pointers", icon: "🤏", desc: "Walk L and R inward to find a pair with target sum.", topic: "Patterns", inputKind: "array", gen: twoPointers },
  { slug: "sliding-window", name: "Sliding Window", icon: "🪟", desc: "Slide a fixed window, update the sum in O(1).", topic: "Patterns", inputKind: "array", gen: slidingWindow },
  { slug: "kadane", name: "Kadane's Algorithm", icon: "📈", desc: "Max subarray — extend or restart at each element.", topic: "DP", inputKind: "array", gen: kadane },
  { slug: "bfs", name: "BFS on a Grid", icon: "🌊", desc: "Level-by-level flood — finds the shortest path.", topic: "Graphs", inputKind: "grid", gen: bfsGrid },
  { slug: "dfs", name: "DFS on a Grid", icon: "🕳️", desc: "Dive deep, backtrack — explores one branch fully.", topic: "Graphs", inputKind: "grid", gen: dfsGrid },
];

export const visualizerBySlug = new Map(VISUALIZERS.map((v) => [v.slug, v]));

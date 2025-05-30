import heapq
import numpy as np

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])  # Manhattan distance

def a_star(grid, start, goal):
    rows, cols = grid.shape
    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            return path[::-1]

        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:  # 4-directional
            neighbour = (current[0] + dx, current[1] + dy)
            if 0 <= neighbour[0] < rows and 0 <= neighbour[1] < cols:
                tentative_g = g_score[current] + grid[neighbour]

                if tentative_g < g_score.get(neighbour, float('inf')):
                    came_from[neighbour] = current
                    g_score[neighbour] = tentative_g
                    f_score[neighbour] = tentative_g + heuristic(neighbour, goal)
                    heapq.heappush(open_set, (f_score[neighbour], neighbour))
    
    return []  # No path found

# if __name__ == "__main__":
#     cost_grid = np.array([
#         [1, 1, 1, 50],
#         [1, 50, 1, 1],
#         [1, 1, 1, 1],
#         [50, 50, 1, 1],
#     ])

#     start = (0, 0)
#     goal = (3, 3)

#     path = a_star(cost_grid, start, goal)
#     print("Path:", path)

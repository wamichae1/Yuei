class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:

        ans = 0

        #when you find a point, bfs around it until you finish
        # move to the next point after check if its in not 1 or 0 in the grid

        frontier  = []



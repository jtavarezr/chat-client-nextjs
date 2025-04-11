"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitBranch, GitCommit, GitPullRequest, GitMerge, Plus, RefreshCw } from "lucide-react"

export function GitIntegration() {
  const [selectedRepo, setSelectedRepo] = useState("frontend-app")

  const repositories = [
    { name: "frontend-app", description: "React frontend application", branch: "main", commits: 128 },
    { name: "api-service", description: "Backend API service", branch: "develop", commits: 87 },
    { name: "shared-lib", description: "Shared component library", branch: "feature/new-components", commits: 45 },
  ]

  const commits = [
    { hash: "a1b2c3d", message: "Fix navigation bug in mobile view", author: "Sarah Chen", time: "2 hours ago" },
    { hash: "e4f5g6h", message: "Add dark mode toggle", author: "John Doe", time: "5 hours ago" },
    { hash: "i7j8k9l", message: "Update dependencies", author: "Miguel Rodriguez", time: "yesterday" },
    { hash: "m1n2o3p", message: "Implement new button component", author: "Alex Johnson", time: "2 days ago" },
    { hash: "q4r5s6t", message: "Fix tests for auth service", author: "Sarah Chen", time: "3 days ago" },
  ]

  const branches = [
    { name: "main", lastCommit: "2 days ago", author: "Alex Johnson" },
    { name: "develop", lastCommit: "5 hours ago", author: "John Doe" },
    { name: "feature/user-profile", lastCommit: "yesterday", author: "Sarah Chen" },
    { name: "feature/new-components", lastCommit: "3 days ago", author: "Miguel Rodriguez" },
    { name: "bugfix/auth-flow", lastCommit: "1 week ago", author: "Alex Johnson" },
  ]

  const pullRequests = [
    { id: "PR-123", title: "Add dark mode toggle", author: "John Doe", status: "open", comments: 3 },
    { id: "PR-122", title: "Fix navigation bug", author: "Sarah Chen", status: "merged", comments: 5 },
    { id: "PR-121", title: "Update dependencies", author: "Miguel Rodriguez", status: "open", comments: 1 },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {repositories.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-zinc-400">{repositories.find((r) => r.name === selectedRepo)?.branch}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Fetch
          </Button>
          <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
            <GitPullRequest className="h-4 w-4 mr-2" />
            Pull
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <GitCommit className="h-4 w-4 mr-2" />
            Commit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="commits" className="flex-1 flex flex-col">
        <TabsList className="px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <TabsTrigger value="commits" className="data-[state=active]:bg-emerald-600">
            <GitCommit className="h-4 w-4 mr-2" />
            Commits
          </TabsTrigger>
          <TabsTrigger value="branches" className="data-[state=active]:bg-emerald-600">
            <GitBranch className="h-4 w-4 mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="pull-requests" className="data-[state=active]:bg-emerald-600">
            <GitPullRequest className="h-4 w-4 mr-2" />
            Pull Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {commits.map((commit) => (
                <div key={commit.hash} className="p-3 bg-zinc-800 rounded-md hover:bg-zinc-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GitCommit className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="font-mono text-xs text-emerald-400">{commit.hash.substring(0, 7)}</span>
                    </div>
                    <span className="text-xs text-zinc-500">{commit.time}</span>
                  </div>
                  <div className="mt-1 text-sm">{commit.message}</div>
                  <div className="mt-1 text-xs text-zinc-500">by {commit.author}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="branches" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <div className="flex justify-end mb-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Branch
                </Button>
              </div>

              {branches.map((branch) => (
                <div key={branch.name} className="p-3 bg-zinc-800 rounded-md hover:bg-zinc-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="font-medium">{branch.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        Checkout
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <GitMerge className="h-3 w-3 mr-1" />
                        Merge
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Last commit {branch.lastCommit} by {branch.author}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pull-requests" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <div className="flex justify-end mb-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New PR
                </Button>
              </div>

              {pullRequests.map((pr) => (
                <div key={pr.id} className="p-3 bg-zinc-800 rounded-md hover:bg-zinc-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GitPullRequest
                        className={`h-4 w-4 mr-2 ${pr.status === "open" ? "text-emerald-500" : "text-purple-500"}`}
                      />
                      <span className="font-medium">{pr.title}</span>
                      <span className="ml-2 text-xs font-mono text-zinc-500">{pr.id}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        pr.status === "open" ? "bg-emerald-900/30 text-emerald-500" : "bg-purple-900/30 text-purple-500"
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    by {pr.author} • {pr.comments} comments
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client";

import { BarChart2, TrendingUp, Users, Trophy } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 glow-purple">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Statistics & Analytics
        </h1>
        <p className="text-gray-400 mt-2">
          Track player performance, team stats, and game analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Goals</p>
              <p className="text-3xl font-bold text-white mt-2">--</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <Trophy className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-3xl font-bold text-white mt-2">--%</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Games Played</p>
              <p className="text-3xl font-bold text-white mt-2">--</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <BarChart2 className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Players</p>
              <p className="text-3xl font-bold text-white mt-2">--</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <Users className="h-6 w-6 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="glass-strong rounded-2xl p-12 text-center">
        <BarChart2 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-2">
          Statistics Dashboard Coming Soon
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Comprehensive player and team statistics, performance analytics, and game insights will be available here.
        </p>
      </div>
    </div>
  );
}

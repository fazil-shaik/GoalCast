import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, CheckCircle, ArrowRight, Twitter, Linkedin } from "lucide-react";

export default function Landing() {
  const [theme, setTheme] = useState<"light" | "dark">(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">GoalCast</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>
            <Link href="/sign-in">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Make Your Goals <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Public & Achievable</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
          Share your goals publicly, track your progress, and stay motivated through social accountability.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600">
              Learn How It Works
            </Button>
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2">
              <Twitter className="text-blue-400 h-6 w-6" />
              <span className="font-medium">Share on Twitter</span>
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="text-blue-700 h-6 w-6" />
              <span className="font-medium">Post to LinkedIn</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Join 5,000+ goal achievers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How GoalCast Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="bg-purple-100 dark:bg-purple-900 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Set Your Goals</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Define clear, measurable goals with deadlines. Choose to make them public or private.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="bg-indigo-100 dark:bg-indigo-900 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Share Publicly</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automatically post updates to Twitter, LinkedIn, or update your social media bio.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Check in daily, view analytics, and stay on track with reminders and accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Social Accountability</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Leverage the power of social pressure by making your commitments public.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Visualize your journey with charts, streaks, and detailed analytics.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Auto-Sharing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatically update your social media profiles and post check-ins.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Community Support</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get likes, claps, and encouragement from others on similar journeys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl py-16 px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Achieve Your Goals?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-xl mx-auto">
            Join thousands of people who are making progress on their goals through public accountability.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">GoalCast</span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Social accountability for achievers</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                About
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Terms
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} GoalCast. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
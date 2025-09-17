import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BudgetCompassLogo } from "@/components/ui/compass-logo"
import { Navigation } from "@/components/ui/navigation"
import { Compass, DollarSign, TrendingUp, Bell, Target, PiggyBank, FileSpreadsheet, Users, Home as HomeIcon, ShoppingCart, Car, Gamepad2, Navigation as NavigationIcon, MapPin, Route } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation */}
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 mt-8">
            Navigate Your Family's Finances
            <span className="text-primary"> with Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A trusted, friendly guide for your family's financial journey. Track expenses, 
            set realistic budgets, and achieve your financial goals together. Every dollar counts 
            when you're building your future.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
            <Link href="/auth/signup">Start Your Journey - It&apos;s Free!</Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">Ready in under 2 minutes</p>
        </div>

        {/* Features Section */}
        <div id="features" className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Your Trusted Financial Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <NavigationIcon className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Clear Direction</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Know exactly where your money goes each month. Get clear insights 
                without the confusion or financial jargon.
              </p>
            </div>
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reach Your Goals</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Set meaningful financial destinations - family vacations, emergency funds, 
                or that special purchase you've been planning.
              </p>
            </div>
            <div className="text-center">
              <Route className="w-16 h-16 mx-auto text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Simple Journey</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Navigate your finances with confidence. Our friendly, supportive approach 
                makes budgeting feel empowering, not overwhelming.
              </p>
            </div>
          </div>
        </div>

        {/* Family Budget Categories Infographic */}
        <div id="how-it-works" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Track What Matters to Your Family
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-primary/20">
              <HomeIcon className="w-10 h-10 mx-auto text-primary mb-3" />
              <h4 className="font-semibold">Home & Bills</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Rent, utilities, insurance</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-secondary/20">
              <ShoppingCart className="w-10 h-10 mx-auto text-secondary mb-3" />
              <h4 className="font-semibold">Groceries</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Food, household items</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-accent/20">
              <Car className="w-10 h-10 mx-auto text-accent mb-3" />
              <h4 className="font-semibold">Transportation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Gas, car payments, transit</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-primary/20">
              <Gamepad2 className="w-10 h-10 mx-auto text-primary mb-3" />
              <h4 className="font-semibold">Family Fun</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Date nights, kids activities</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Your Complete Financial Navigation Kit
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center border-primary/20">
              <CardHeader>
                <DollarSign className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Quick Expense Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Log expenses effortlessly, even on-the-go. 
                  Simple, clear tracking without the complexity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto text-secondary mb-4" />
                <CardTitle>Smart Budget Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set realistic budgets that work for your family. 
                  Get clear insights on your progress, not judgment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-accent/20">
              <CardHeader>
                <FileSpreadsheet className="w-12 h-12 mx-auto text-accent mb-4" />
                <CardTitle>Clear Monthly Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautiful, easy-to-understand reports showing your financial journey. 
                  Perfect for planning ahead.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-accent/20">
              <CardHeader>
                <Bell className="w-12 h-12 mx-auto text-accent mb-4" />
                <CardTitle>Gentle Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Supportive notifications to keep you on track. 
                  Encouraging reminders, never stressful alerts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20">
              <CardHeader>
                <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Meaningful Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set financial destinations that matter to your family. 
                  Watch your progress with confidence and clarity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20">
              <CardHeader>
                <Compass className="w-12 h-12 mx-auto text-secondary mb-4" />
                <CardTitle>Trusted Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your reliable financial companion. 
                  Simple, friendly guidance that makes budgeting feel empowering.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action Section */}
        <div id="pricing" className="text-center bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Navigate Your Financial Future?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who've found their financial direction. 
            Start your journey to financial confidence today.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
            <Link href="/auth/signup">Begin Your Journey</Link>
          </Button>
          <div className="mt-6 flex justify-center gap-8 text-sm opacity-80">
            <span>✨ Free to use</span>
            <span>🔒 Secure & private</span>
            <span>📱 Works on all devices</span>
          </div>
        </div>

        {/* What Your Family Gets */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-teal-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary dark:text-primary text-2xl">
                🧭 Your Complete Financial Navigation System
              </CardTitle>
              <CardDescription className="text-lg">
                Everything you need to navigate your family's finances with confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Effortless expense tracking</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Gentle budget guidance</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Clear monthly insights</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Custom categories for your lifestyle</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Multi-currency support</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Secure & private</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Real-time progress tracking</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Timezone-aware reporting</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Mobile-friendly design</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-accent">⏳</span>
                    <span>Smart reminders (coming soon)</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-primary/20">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/auth/signup">Start Your Financial Journey</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div id="about" className="text-center mb-16 mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            About Budget Compass
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              We believe that managing your family's finances shouldn't be overwhelming or complicated. 
              Budget Compass was created to be your trusted guide on the journey to financial confidence.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our mission is simple: help families navigate their financial future with clarity, 
              confidence, and care. Every feature is designed with real families in mind, 
              because we know that every dollar counts when you're building your future together.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-300 mt-16 py-8">
          <p>&copy; 2024 Budget Compass. Navigate your family's finances with confidence.</p>
        </footer>
      </div>
    </div>
  );
}

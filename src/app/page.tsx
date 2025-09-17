import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, DollarSign, TrendingUp, Bell, Target, PiggyBank, FileSpreadsheet, Users, Home as HomeIcon, ShoppingCart, Car, Gamepad2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Take Control of Our Family Budget,
            <span className="text-pink-600"> Together</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A simple, powerful tool designed specifically for our family to track expenses, 
            set realistic budgets, and achieve our financial goals. Because every dollar counts 
            when we&apos;re building our future together.
          </p>
          <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 text-lg">
            <Link href="/auth/signup">Get Started - It&apos;s Free! 💕</Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">Ready in under 2 minutes</p>
        </div>

        {/* Why This Matters Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Built for Real Family Life
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Every Dollar Counts</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Know exactly where our money goes each month. No more wondering 
                &quot;where did it all go?&quot;
              </p>
            </div>
            <div className="text-center">
              <PiggyBank className="w-16 h-16 mx-auto text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Plan for What Matters</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save for family vacations, kids&apos; activities, and those 
                unexpected expenses that always pop up.
              </p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Simple & Together</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Managing our family budget shouldn&apos;t be complicated. 
                Work together towards our financial goals.
              </p>
            </div>
          </div>
        </div>

        {/* Family Budget Categories Infographic */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Track What Matters to Our Family
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <HomeIcon className="w-10 h-10 mx-auto text-blue-600 mb-3" />
              <h4 className="font-semibold">Home & Bills</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Rent, utilities, insurance</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <ShoppingCart className="w-10 h-10 mx-auto text-green-600 mb-3" />
              <h4 className="font-semibold">Groceries</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Food, household items</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Car className="w-10 h-10 mx-auto text-orange-600 mb-3" />
              <h4 className="font-semibold">Transportation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Gas, car payments, transit</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
              <Gamepad2 className="w-10 h-10 mx-auto text-purple-600 mb-3" />
              <h4 className="font-semibold">Family Fun</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Date nights, kids activities</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Quick Expense Logging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add expenses in seconds, even while grocery shopping. 
                  Snap a photo of receipts for later.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Smart Budget Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set realistic budgets for groceries, utilities, and family fun. 
                  See progress in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileSpreadsheet className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <CardTitle>Monthly Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautiful Excel reports showing exactly where our money went. 
                  Perfect for planning next month.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Bell className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <CardTitle>Helpful Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get gentle notifications when we&apos;re close to budget limits. 
                  Stay on track without stress.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 mx-auto text-pink-600 mb-4" />
                <CardTitle>Goal Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set savings goals for vacations, emergencies, or that special purchase. 
                  Watch progress grow.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <CardTitle>Made with Love</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built specifically for our family&apos;s needs. 
                  No complicated features - just what we actually use.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Our Family&apos;s Financial Future?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who&apos;ve taken control of their budgets. 
            Start your journey to financial peace of mind today.
          </p>
          <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 text-lg">
            <Link href="/auth/signup">Start Our Budget Journey 💕</Link>
          </Button>
          <div className="mt-6 flex justify-center gap-8 text-sm opacity-80">
            <span>✨ Free to use</span>
            <span>🔒 Secure & private</span>
            <span>📱 Works on all devices</span>
          </div>
        </div>

        {/* What Our Family Gets */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400 text-2xl">
                🎉 Everything We Need is Ready!
              </CardTitle>
              <CardDescription className="text-lg">
                Our family budget tool is complete and waiting for us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Quick expense tracking on-the-go</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Smart budget alerts to stay on track</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Beautiful monthly Excel reports</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Custom categories for our lifestyle</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Multi-currency support (CAD default)</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Secure login with email confirmation</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Real-time spending analytics</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Halifax timezone (perfect for us!)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span>Mobile-friendly design</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-orange-500">⏳</span>
                    <span>Email reminders (coming soon)</span>
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-green-200">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Link href="/auth/signup">Let&apos;s Get Started Together! 🚀</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

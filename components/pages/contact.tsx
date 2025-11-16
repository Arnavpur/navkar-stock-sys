'use client'

import { User } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ContactProps {
  user: User
}

export default function Contact({ user }: ContactProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="text-sm text-muted-foreground mt-1">Get in touch with Secura Web</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="bg-white border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-accent">About Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Secura Web Data Labs Pvt Ltd</h3>
              <p className="text-sm text-muted-foreground">
                Professional stock management and inventory solutions for retail and wholesale businesses.
              </p>
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-sm">
                <span className="font-semibold text-foreground">Made By:</span>
                <br />
                <span className="text-muted-foreground">Secura Web Data Labs Pvt Ltd</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="bg-white border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-primary">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
              <div className="space-y-1 mt-1">
                <a href="tel:+918824433303" className="text-sm font-medium text-accent hover:underline block">
                  +91 8824433303
                </a>
                <a href="tel:+919123071439" className="text-sm font-medium text-accent hover:underline block">
                  +91 9123071439
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
              <div className="space-y-1 mt-1">
                <a href="mailto:sales@securaweb.in" className="text-sm font-medium text-accent hover:underline block">
                  sales@securaweb.in
                </a>
                <a href="mailto:support@securaweb.in" className="text-sm font-medium text-accent hover:underline block">
                  support@securaweb.in
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase">Website</p>
              <div className="space-y-1 mt-1">
                <a href="https://www.securaweb.in" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline block">
                  www.securaweb.in
                </a>
                <a href="https://www.securaweb.co.in" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline block">
                  www.securaweb.co.in
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="bg-primary/5 border border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              asChild
              variant="outline"
              className="w-full"
            >
              <a href="tel:+918824433303">
                <span>Call Sales</span>
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="w-full"
            >
              <a href="mailto:sales@securaweb.in">
                <span>Email Sales</span>
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="w-full"
            >
              <a href="https://www.securaweb.in" target="_blank" rel="noopener noreferrer">
                <span>Visit Website</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="bg-white border-border shadow-md">
        <CardHeader>
          <CardTitle>Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For any issues or questions related to the Secura Web Stock Management System, please don't hesitate to contact our support team.
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Quick Support Links:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Email: <a href="mailto:support@securaweb.in" className="font-medium hover:underline">support@securaweb.in</a></li>
              <li>• Phone: <a href="tel:+918824433303" className="font-medium hover:underline">+91 8824433303</a></li>
              <li>• Hours: Available 9 AM - 6 PM (Mon - Sat)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

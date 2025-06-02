"use client"

import { useState } from "react"
import { X, ChefHat, Star, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface ChefBookingModalProps {
  open: boolean
  onClose: () => void
}

export function ChefBookingModal({ open, onClose }: ChefBookingModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Book Your Personal Chef</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Chef Experience</h3>
                <p className="text-gray-600">Get a professional chef to cook delicious meals at your home</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="text-center p-4">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Expert Chefs</h4>
                  <p className="text-sm text-gray-600">Verified & experienced</p>
                </Card>
                <Card className="text-center p-4">
                  <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold">At Your Home</h4>
                  <p className="text-sm text-gray-600">Fresh & hygienic cooking</p>
                </Card>
                <Card className="text-center p-4">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">On Time</h4>
                  <p className="text-sm text-gray-600">Punctual service</p>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                    <Input
                      type="number"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      min="1"
                      max="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Any dietary preferences, allergies, or special requests..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-semibold"
                disabled={!formData.name || !formData.phone || !formData.address}
              >
                Continue to Confirmation
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                <ChefHat className="h-10 w-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h3>
                <p className="text-gray-600">
                  Your chef will arrive on {formData.date} at {formData.time}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-4">Booking Details:</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {formData.name}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {formData.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {formData.address}
                  </p>
                  <p>
                    <span className="font-medium">Date & Time:</span> {formData.date} at {formData.time}
                  </p>
                  <p>
                    <span className="font-medium">Guests:</span> {formData.guests} people
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-xl font-semibold"
                >
                  Done
                </Button>
                <p className="text-sm text-gray-500">You'll receive a confirmation call within 30 minutes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

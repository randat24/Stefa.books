'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useSearchParams } from 'next/navigation'; // Will be used when implementing real checkout
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// Mock book data - in a real app, this would come from your API
const mockBook = {
  id: '1',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  coverImage: '/placeholder-book-cover.jpg',
  rentalPrice: 2.99,
  rentalPeriod: 14, // days
};

const rentalOptions = [
  { id: '1', name: '14 days', price: 2.99, description: 'Standard rental period' },
  { id: '2', name: '30 days', price: 4.99, description: 'Extended rental period' },
  { id: '3', name: '7 days', price: 1.99, description: 'Short rental period' },
];

export default function CheckoutPage() {
  const router = useRouter();
  // const searchParams = useSearchParams(); // Will be used when implementing real checkout
  // const bookId = searchParams.get('bookId'); // Will be used when implementing real checkout
  
  const [selectedOption, setSelectedOption] = useState('1');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '' });
  
  // In a real app, you would fetch the book data based on bookId
  const book = mockBook;
  
  const selectedRental = rentalOptions.find(option => option.id === selectedOption) || rentalOptions[0];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would process the payment and create the rental
    router.push('/rent/confirmation?rentalId=12345');
  };

  return (
    <div className="container py-8">
      <h1 className="text-h1 mb-2">Checkout</h1>
      <p className="text-neutral-500 mb-8">Complete your rental</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Image 
                  src={book.coverImage} 
                  alt={book.title}
                  width={64}
                  height={96}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className="text-body-sm text-neutral-500">{book.author}</p>
                </div>
              </div>
              
              <Separator />
              
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                {rentalOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-body-sm text-neutral-500">{option.description}</div>
                    </Label>
                    <div className="font-semibold">${option.price.toFixed(2)}</div>
                  </div>
                ))}
              </RadioGroup>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Rental Fee</span>
                  <span>${selectedRental.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(selectedRental.price * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(selectedRental.price * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Enter your payment details to complete the rental
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-body-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-body-lg font-semibold">Shipping Address</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-body-lg font-semibold">Payment Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                <Link href="/rent">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" className="w-full sm:w-auto">
                  Complete Rental (${(selectedRental.price * 1.08).toFixed(2)})
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
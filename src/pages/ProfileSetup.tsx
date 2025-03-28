
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/AuthContext';
import { GraduationCap, School, Book } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ProfileSetup = () => {
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [graduatingYear, setGraduatingYear] = useState('');
  const [degree, setDegree] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If no user is logged in, redirect to auth page
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !university || !course || !graduatingYear || !degree) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields to complete your profile.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Save profile data to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user?.id,
          full_name: fullName,
          university,
          course,
          graduating_year: graduatingYear,
          degree,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Your academic profile has been set up successfully.",
      });

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">
              Tell us a bit about your academic background
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <div className="relative">
                  <Input
                    id="university"
                    type="text"
                    placeholder="e.g. Oxford University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course Name</Label>
                <div className="relative">
                  <Input
                    id="course"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="degree">Degree Type</Label>
                <Select value={degree} onValueChange={setDegree} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="masters">Master's</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="graduatingYear">Expected Graduation Year</Label>
                <div className="relative">
                  <Select value={graduatingYear} onValueChange={setGraduatingYear} required>
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select your graduation year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={16} />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 mt-4 w-full">
              This information helps us personalize your academic writing experience.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;

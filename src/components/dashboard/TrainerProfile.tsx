import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Trophy,
  Award,
  Clock,
  IndianRupee,
  Edit,
  Save,
  X,
} from "lucide-react";

interface TrainerProfileProps {
  userId: Id<"users">;
  userName: string;
}

export function TrainerProfile({ userId, userName }: TrainerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const trainers = useQuery(api.trainers.list);
  const myTrainerProfile = trainers?.find((t) => t.userId === userId);

  const createProfile = useMutation(api.trainers.create);
  const updateProfile = useMutation(api.trainers.update);

  const [formData, setFormData] = useState({
    specializations: "",
    certifications: "",
    experience: "",
    bio: "",
    hourlyRate: "",
  });

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formDataObj = new FormData(e.currentTarget);
    const specializations = (formDataObj.get("specializations") as string).split(",").map(s => s.trim()).filter(Boolean);
    const certifications = (formDataObj.get("certifications") as string).split(",").map(s => s.trim()).filter(Boolean);
    const experience = formDataObj.get("experience") as string;
    const bio = formDataObj.get("bio") as string;
    const hourlyRate = parseFloat(formDataObj.get("hourlyRate") as string);

    try {
      await createProfile({
        userId,
        specializations,
        certifications: certifications.length > 0 ? certifications : undefined,
        experience: experience || undefined,
        bio: bio || undefined,
        hourlyRate: hourlyRate || undefined,
      });
      toast.success("Trainer profile created successfully!");
      setIsCreating(false);
    } catch (error) {
      toast.error((error as Error).message);
      setIsCreating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!myTrainerProfile) return;

    setIsCreating(true);

    const formDataObj = new FormData(e.currentTarget);
    const specializations = (formDataObj.get("specializations") as string).split(",").map(s => s.trim()).filter(Boolean);
    const certifications = (formDataObj.get("certifications") as string).split(",").map(s => s.trim()).filter(Boolean);
    const experience = formDataObj.get("experience") as string;
    const bio = formDataObj.get("bio") as string;
    const hourlyRate = parseFloat(formDataObj.get("hourlyRate") as string);

    try {
      await updateProfile({
        trainerId: myTrainerProfile._id,
        userId,
        specializations,
        certifications: certifications.length > 0 ? certifications : undefined,
        experience: experience || undefined,
        bio: bio || undefined,
        hourlyRate: hourlyRate || undefined,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      toast.error((error as Error).message);
      setIsCreating(false);
    }
  };

  // If no profile exists, show creation form
  if (!myTrainerProfile) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
            <CardTitle className="text-2xl">Create Your Trainer Profile</CardTitle>
            <CardDescription className="text-white/90">
              Set up your coaching profile to start accepting students
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="specializations" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  Specializations *
                </Label>
                <Input
                  id="specializations"
                  name="specializations"
                  placeholder="e.g., Beginners, Advanced, Kids, Competition"
                  required
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500">Separate multiple specializations with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications" className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Certifications
                </Label>
                <Input
                  id="certifications"
                  name="certifications"
                  placeholder="e.g., BWF Level 2 Coach, Sports Science Degree"
                  disabled={isCreating}
                />
                <p className="text-xs text-gray-500">Separate multiple certifications with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Years of Experience
                </Label>
                <Input
                  id="experience"
                  name="experience"
                  placeholder="e.g., 5 years"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  Hourly Rate (₹)
                </Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g., 1000"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  placeholder="Tell students about your coaching philosophy, achievements, and what makes you unique..."
                  disabled={isCreating}
                />
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-12 text-base font-semibold"
              >
                {isCreating ? "Creating Profile..." : "Create Trainer Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If profile exists, show profile view with edit option
  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          {/* Profile Display */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{userName}</CardTitle>
                  <CardDescription className="text-white/90">
                    Professional Badminton Coach
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-700">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-charcoal-900">
                    {myTrainerProfile.rating?.toFixed(1) || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {myTrainerProfile.totalReviews || 0} reviews
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Experience</span>
                  </div>
                  <p className="text-2xl font-bold text-charcoal-900">
                    {myTrainerProfile.experience || "N/A"}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-700">Hourly Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-charcoal-900">
                    {myTrainerProfile.hourlyRate ? `₹${myTrainerProfile.hourlyRate}` : "N/A"}
                  </p>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {myTrainerProfile.specializations?.map((spec, idx) => (
                    <Badge key={idx} className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {myTrainerProfile.certifications && myTrainerProfile.certifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {myTrainerProfile.certifications.map((cert, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {myTrainerProfile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Professional Bio</h3>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {myTrainerProfile.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Edit Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
                  <CardDescription className="text-white/90">
                    Update your coaching information
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="specializations" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    Specializations *
                  </Label>
                  <Input
                    id="specializations"
                    name="specializations"
                    defaultValue={myTrainerProfile.specializations?.join(", ")}
                    required
                    disabled={isCreating}
                  />
                  <p className="text-xs text-gray-500">Separate multiple specializations with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications" className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Certifications
                  </Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    defaultValue={myTrainerProfile.certifications?.join(", ")}
                    disabled={isCreating}
                  />
                  <p className="text-xs text-gray-500">Separate multiple certifications with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    defaultValue={myTrainerProfile.experience}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    Hourly Rate (₹)
                  </Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    min="0"
                    step="50"
                    defaultValue={myTrainerProfile.hourlyRate}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    defaultValue={myTrainerProfile.bio}
                    disabled={isCreating}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isCreating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

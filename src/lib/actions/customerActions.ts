
'use server';

import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/types';
import { z } from 'zod';
import { addUserProfileByAdmin } from '@/lib/firebase/firestoreService';

const AddUserProfileSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional().transform(val => val || null),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).optional().transform(val => val || null),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).optional().transform(val => val || null),
  phone: z.string().optional().transform(val => val || null),
});

interface CustomerActionResult<T = UserProfile> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function addUserProfileAction(
  formData: unknown
): Promise<CustomerActionResult<UserProfile>> {
  console.log("[CustomerAction] addUserProfileAction called with formData:", formData);
  const validation = AddUserProfileSchema.safeParse(formData);

  if (!validation.success) {
    console.error("[CustomerAction] Add User Profile Validation Error:", validation.error.flatten().fieldErrors);
    return { 
      success: false, 
      error: "Invalid customer data.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const newProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'photoURL'> = {
      email: validation.data.email,
      displayName: validation.data.displayName,
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      phone: validation.data.phone,
    };

    const newProfile = await addUserProfileByAdmin(newProfileData);

    if (newProfile) {
      console.log("[CustomerAction] Successfully added customer profile:", newProfile);
      revalidatePath('/admin/customers');
      return { success: true, data: newProfile };
    } else {
      console.error("[CustomerAction] Failed to add customer profile to the database.");
      return { success: false, error: "Failed to add customer profile to the database." };
    }
  } catch (error) {
    console.error("[CustomerAction] Error in addUserProfileAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return { success: false, error: `Failed to add customer profile: ${errorMessage}` };
  }
}

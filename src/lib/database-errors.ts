/**
 * Maps database errors to user-friendly messages in Bengali
 * Prevents exposure of internal database structure and constraint details
 */
export const mapDatabaseError = (error: any): string => {
  // PostgreSQL error codes
  if (error.code === '23505') {
    // Unique constraint violation
    return 'এই আইডি ইতিমধ্যে ব্যবহৃত হয়েছে';
  }
  
  if (error.code === '23503') {
    // Foreign key violation
    return 'সংযুক্ত তথ্য খুঁজে পাওয়া যায়নি';
  }
  
  if (error.code === '23502') {
    // Not null violation
    return 'প্রয়োজনীয় তথ্য প্রদান করুন';
  }
  
  if (error.code === '23514') {
    // Check constraint violation
    return 'প্রদত্ত তথ্য সঠিক নয়';
  }
  
  // RLS policy violations
  if (error.message?.includes('RLS') || error.message?.includes('policy')) {
    return 'আপনার এই কাজের অনুমতি নেই';
  }
  
  // Permission errors
  if (error.message?.includes('permission') || error.message?.includes('denied')) {
    return 'অ্যাক্সেস অনুমোদিত নয়';
  }
  
  // Authentication errors
  if (error.message?.includes('JWT') || error.message?.includes('auth')) {
    return 'আপনি লগইন করা নেই';
  }
  
  // Generic fallback - never expose raw database errors
  return 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন';
};

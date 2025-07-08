import { supabase } from '@/integrations/supabase/client';

class ScanLimitService {
  private readonly DAILY_LIMIT = 10;

  async getTodaysScanCount(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_user_scan_count_today');
      
      if (error) {
        console.error('Error getting scan count:', error);
        return 0;
      }
      
      return data || 0;
    } catch (error) {
      console.error('Error in getTodaysScanCount:', error);
      return 0;
    }
  }

  async incrementScanCount(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_user_scan_count');
      
      if (error) {
        console.error('Error incrementing scan count:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in incrementScanCount:', error);
      return false;
    }
  }

  async canUserScan(): Promise<{ canScan: boolean; remainingScans: number }> {
    const todaysCount = await this.getTodaysScanCount();
    const remainingScans = Math.max(0, this.DAILY_LIMIT - todaysCount);
    
    return {
      canScan: todaysCount < this.DAILY_LIMIT,
      remainingScans
    };
  }

  getDailyLimit(): number {
    return this.DAILY_LIMIT;
  }
}

export const scanLimitService = new ScanLimitService();